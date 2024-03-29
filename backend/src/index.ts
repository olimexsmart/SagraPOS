import express, { Express, Request, Response, NextFunction } from "express"
import multer from 'multer'
import path from "path"
import * as db from "./dbController"
import { GatherInfo } from "./infoController"
import { CheckMasterPin } from "./settingsController"
import { confirmOrder } from "./orderController"
import * as pc from "./printerController"
import { existsSync, writeFile } from "fs"



initBackend()
// Express config
const app: Express = express()
const port = 3000
// Configure multer to store files in memory
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })
app.use(express.static(path.join(__dirname, 'angular')))
app.use(express.json())

// Complete init 
function initBackend() {
  db.initDB()
  pc.reloadPrintersAndData()
}

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack)
  res.status(500).send('Something broke!')
})

/*
 * PRINTER
 */
app.post('/ConfirmOrder', (req: Request, res: Response) => {
  const toPrint = confirmOrder(req.body)
  pc.printOrder(parseInt(req.query.printerID as string), toPrint)
  res.send()
})

app.get('/GetPrinters', (req: Request, res: Response) => {
  res.send(db.GetPrinters())
})

/*
 * MENU
 */
app.get('/GetMenuEntryDTOs', (req: Request, res: Response) => {
  res.send(db.GetMenuEntryDTOs())
})

app.post('/InsertMenuEntry', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.status(201).send('New ID: ' + db.InsertMenuEntry(req.body).toString())
  }
})

app.put('/UpdateMenuEntry', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.status(200).send('Rows updated:' + db.UpdateMenuEntry(req.body).toString())
  }
})

app.delete('/DeleteMenuEntry', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  const menuEntryID = parseInt(req.query.menuEntryID as string)
  if (isNaN(menuEntryID)) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "Missing integer parameter menuEntryID"
  }
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.status(200).send('Rows updated:' + db.DeleteMenuEntry(menuEntryID).toString())
  }
})

app.get('/GetCategories', (req: Request, res: Response) => {
  res.send(db.GetCategories())
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
        'Content-Type': 'image/png',
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
  const menuEntryID = parseInt(req.query.menuEntryID as string)
  if (isNaN(menuEntryID)) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "Missing integer parameter menuEntryID"
  }
  if (!req.file) {
    masterPinCheck.statusCode = 400
    masterPinCheck.message = "No image uploaded"
  }

  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    if (db.UpdateImage(menuEntryID, req.file!.buffer) > 0)
      res.status(201).send('Image uploaded and saved successfully.')
  }
})

/*
 * INFO
 */
app.get('/GetInfoOrders', (req: Request, res: Response) => {
  res.send(GatherInfo())
})

app.delete('/ResetInfoOrders', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.send(db.ResetOrdersLog())
  }
})

app.get('/PrintInfo', (req: Request, res: Response) => {
  pc.printInfo(parseInt(req.query.printerID as string), GatherInfo())
  res.send()
})

/*
 * INVENTORY
 */
app.get('/GetQuantities', (req: Request, res: Response) => {
  res.send(db.GetInventory())
})

app.put('/SetQuantity', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  const entryID = parseInt(req.query.entryID as string)
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
 * DB SWAP
 */
app.get('/DownloadDB', function (req, res) {
  // Close and the re-open DB, to ensure al pending changes are written on file
  db.closeDB()
  res.download(getPathDB())
  db.openDB()
})

app.post('/UploadDB', upload.single('file'), (req, res) => {
  // req.file contains the file data in a Buffer 
  if (req.file) {
    db.closeDB()
    // Overwrite the existing file
    writeFile(getPathDB(), req.file.buffer, (err) => {
      if (err) {
        console.error('Failed to write file:', err);
        res.status(500).send('Failed to update file.');
      } else {
        console.log('File has been replaced successfully.');
        res.sendStatus(201);
      }
      initBackend() // Re-init either way
    });
  } else {
    res.status(400).send('No file uploaded.');
  }
});

function getPathDB() {
  // TODO set env variable
  const debugPath = `${__dirname}/../SagraPOS.sqlite3`
  const deployPath = `${__dirname}/../../../../SagraPOS.sqlite3`
  return existsSync(debugPath) ? debugPath : deployPath
}

/*
 * SERVER START
 */
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`)
})

