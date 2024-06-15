import express, { Express, Request, Response, NextFunction } from "express"
import multer from 'multer'
import path from "path"
import os from 'os'
import * as db from "./dbController"
import { CheckMasterPin } from "./settingsController"
import { buildFakeOrder, buildOrder, confirmOrder } from "./orderController"
import * as pc from "./printerController"
import { mkdirSync, rm, writeFile } from "fs"
import http from "http"
import WebSocket from "ws"


// Express config
const app: Express = express()
const port = 3000
// Configure multer to store files in memory
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
const appDir = path.join(os.homedir(), '.sagraPOS')
// Web Socket config
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

let clientCount = 0;

initBackend() // TODO consider removing function

// Complete init 
function initBackend() {
  // Create application folder
  mkdirSync(appDir, { recursive: true })
  // Static file serve
  app.use(express.static(path.join(__dirname, 'angular')))
  // Use JSON to exchange data in APIs
  app.use(express.json({ limit: '50mb' }));
  // Init other modules
  db.initDB(appDir)
  pc.reloadPrintersAndData()
}

// Error handling middleware
// TODO Use this in each API to send different status codes depending on exception thrown
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

/*
 * Web Sockets
 */
const broadcastClientCount = () => {
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'clientCount', data: clientCount }));
    }
  });
};

const broadcastInventory = () => {
  const inventory = db.GetInventory()
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify({ type: 'inventory', data: inventory }));
    }
  });
};

wss.on('connection', (ws) => {
  clientCount++
  broadcastClientCount()
  console.log(`Client connected. Total clients: ${clientCount}`)

  // Send initial inventory data
  ws.send(JSON.stringify({ type: 'inventory', data: db.GetInventory() }))

  ws.on('close', () => {
    clientCount--;
    broadcastClientCount()
    console.log(`Client disconnected. Total clients: ${clientCount}`)
  })
});

// Send Inventory and Client Count every second
setInterval(()=> {
  broadcastClientCount()
  broadcastInventory()
}, 1000)

/*
 * PRINTER MANAGE
 */
app.get('/GetPrinters', (req: Request, res: Response) => {
  res.send(db.GetPrinters())
})

app.post('/InsertPrinter', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.InsertPrinter)
  pc.reloadPrintersAndData()
})

app.put('/UpdatePrinter', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.UpdatePrinter)
  pc.reloadPrintersAndData()
})

app.delete('/DeletePrinter', (req: Request, res: Response) => {
  withPinAndID(req, res, db.DeletePrinter)
  pc.reloadPrintersAndData()
})

app.get('/ScanPrinters', async (req: Request, res: Response) => {
  let port = parseInt(req.query.port as string, 10)
  if (isNaN(port))
    res.send(await pc.scanPrinters())
  else
    res.send(await pc.scanPrinters(port))
})

/*
 * PRINTER ACTUALLY PRINT STUFF
 */
app.post('/ConfirmOrder', async (req: Request, res: Response) => {
  const toPrint = buildOrder(req.body)
  try {
    const printerID = parseInt(req.query.printerID as string)
    await pc.printOrder(printerID, toPrint)
    confirmOrder(toPrint)
    res.status(201).send()
  } catch (error) {
    res.status(500).send(error)
  }
})

app.get('/PrintFakeOrder', async (req: Request, res: Response) => {
  const toPrint = buildFakeOrder()
  try {
    const printerID = parseInt(req.query.printerID as string)
    await pc.printOrder(printerID, toPrint)
    res.status(201).send()
  } catch (error) {
    res.status(500).send(error)
  }
})

app.post('/PokePrinter', async (req: Request, res: Response) => { // TODO make it a get with 3 query params?
  // TODO add master pin
  try {
    await pc.pokePrinter(req.body)
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
})

app.get('/PrintOrdersInfo', async (req: Request, res: Response) => {
  try {
    await pc.printInfo(parseInt(req.query.printerID as string), db.GatherOrdersInfo())
    res.status(201).send();
  } catch (error) {
    res.status(500).send(error);
  }
})

/*
 * MENU ENTRIES
 */
app.get('/GetMenuEntries', (req: Request, res: Response) => {
  res.send(db.GetMenuEntries())
})

app.post('/InsertMenuEntry', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.InsertMenuEntry)
})

app.put('/UpdateMenuEntry', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.UpdateMenuEntry)
})

app.delete('/DeleteMenuEntry', (req: Request, res: Response) => {
  withPinAndID(req, res, db.DeleteMenuEntry)
})

app.get('/GetImage', (req: Request, res: Response) => {
  const idParam = req.query.id
  const id = parseInt(idParam as string, 10)
  if (isNaN(id)) {
    res.status(400).send('Missing integer parameter id')
  }
  else {
    let img: Buffer = db.GetImage(id)
    if (img) {
      res.writeHead(200, {
        'Content-Type': 'image/jpeg',
        'Content-Length': img.length
      })
      res.end(img)
    } else {
      res.status(404).send('Not Found')
    }
  }
})

app.put('/UpdateImage', upload.single('image'), async (req, res) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  const id = parseInt(req.query.id as string)
  if (isNaN(id)) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "Missing integer parameter id"
  }
  if (!req.file) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "No image uploaded"
  }
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else { // If every check is OK enter here
    if (db.UpdateImage(id, req.file!.buffer) > 0) // TODO image should be resized to 300x300 before saving. See printerController.
    {
      res.status(201)
      pc.reloadPrintersAndData()
    }
  }
})

/*
 * MENU CATEGORIES
 */
app.get('/GetCategories', (req: Request, res: Response) => {
  res.send(db.GetCategories())
})

app.post('/InsertCategory', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.InsertCategory)
})

app.put('/UpdateCategory', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.UpdateCategory)
})

app.delete('/DeleteCategory', (req: Request, res: Response) => {
  withPinAndID(req, res, db.DeleteCategory)
})

/*
 * PRINT CATEGORIES
 */
app.get('/GetPrintCategories', (req: Request, res: Response) => {
  res.send(db.GetPrintCategories()) // TODO use pin on selected?
})

app.post('/InsertPrintCategory', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.InsertPrintCategory)
})

app.put('/UpdatePrintCategory', (req: Request, res: Response) => {
  withPinAndBody(req, res, db.UpdatePrintCategory)
})

app.delete('/DeletePrintCategory', (req: Request, res: Response) => {
  withPinAndID(req, res, db.DeletePrintCategory)
})


/*
 * INFO
 */
app.get('/GetOrdersInfo', (req: Request, res: Response) => {
  res.send(db.GatherOrdersInfo())
})

app.delete('/ResetOrdersInfo', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.send(db.ResetOrdersLog())
  }
})

/*
 * INVENTORY
 */
app.get('/GetQuantities', (req: Request, res: Response) => {
  res.send(db.GetInventory())
})

app.put('/SetQuantity', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  const entryID = parseInt(req.query.entryID as string) // TODO uniform to "id"
  if (isNaN(entryID)) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "Missing integer parameter entryID"
  }
  let quantity: number | null = parseInt(req.query.quantity as string)
  if (isNaN(quantity)) {
    quantity = null
  }
  // If all params are ok, process request
  if (masterPinCheck.statusCode === 200) {
    if (db.UpdateInventory(entryID, quantity)) {
      res.sendStatus(201)
      return // Everything OK exit point
    } else {
      masterPinCheck.statusCode = 404
      masterPinCheck.message = `Menu entry ${entryID} ID not found`
    }
  }
  // Something bad exit point
  res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
})


/*
 * SETTINGS
 */
app.get('/CheckPIN', function (req, res) {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode == 200)
    res.send(true) // Focus on sending if the pin is valid or not, avoid errors
  else if (masterPinCheck.statusCode == 401)
    res.send(false)
  else // Essentially a bad request
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
})

app.get('/GetAllSettings', (req: Request, res: Response) => {
  res.send(db.GetAllSettings())
})

app.get('/GetSettingByKey', (req: Request, res: Response) => {
  res.send(db.GetSettingByKey(req.query.key as string))
})

app.put('/ChangeSetting', function (req, res) {
  withPinAndBody(req, res, db.SetSettingValueByKey)
  pc.reloadPrintersAndData()
})



// TODO add pin to these two
app.get('/DownloadDB', function (req, res) {
  // Close and the re-open DB, to ensure al pending changes are written on file
  db.closeDB()
  res.download(db.getPathDB())
  db.openDB()
})

app.post('/UploadDB', upload.single('file'), (req, res) => {
  // req.file contains the file data in a Buffer 
  if (req.file) {
    const tempPath = path.join(os.tmpdir(), 'SagraPOS_temp.sqlite3')
    console.log(tempPath);
    writeFile(tempPath, req.file.buffer, (err) => {
      if (db.copyDB(tempPath)) {
        console.log('DB cloned successfully.');
        pc.reloadPrintersAndData() // TODO better overall strategy 
        res.sendStatus(201);
      } else {
        console.error('Failed to clone DB');
        res.status(500).send('Failed to update file.');
      }
      rm(tempPath, () => { })
    })
  } else {
    res.status(400).send('No file uploaded.');
  }
});

/*
 * REDIRECT
 */
app.get(['/main', '/settings/*', '/info/*'], function (req, res) {
  res.redirect('/index.html');
});

/*
 * SERVER START
 */
server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

/*
 * PRIVATE FUNCTIONS
 */
function withPinAndBody(req: Request, res: Response, fun: Function) {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.status(201).send({
      ret: fun(req.body)
    })
  }
}

function withPinAndID(req: Request, res: Response, fun: Function) {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  const menuEntryID = parseInt(req.query.id as string)
  if (isNaN(menuEntryID)) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "Missing integer parameter with the ID of the resource to delete"
  }
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.status(200).send({
      ret: fun(menuEntryID)
    })
  }
}