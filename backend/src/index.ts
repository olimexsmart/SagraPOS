import express, { Express, Request, Response, NextFunction } from "express";
// import { printTest } from "./printerController";
import path from "path";
import * as db from "./dbController";
import { GatherInfo } from "./infoController";
import { CheckMasterPin } from "./settingsController";
import { confirmOrder } from "./orderController";
import * as pc from "./printerController";


const app: Express = express();
const port = 3000;
db.initDB()
pc.reloadPrintersAndData()

console.log(__dirname)
app.use(express.static(path.join(__dirname, 'angular')))
app.use(express.json())

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

app.post('/ConfirmOrder', (req: Request, res: Response) => {
  const toPrint = confirmOrder(req.body)
  pc.printOrder(parseInt(req.query.printerID as string), toPrint)
  res.send();
});


app.get('/PrintInfo', (req: Request, res: Response) => {
  pc.printInfo(parseInt(req.query.printerID as string), GatherInfo())
  res.send()
});

app.get('/GetEntries', (req: Request, res: Response) => {
  res.send(db.GetMenuEntryDTOs())
});

app.get('/GetCategories', (req: Request, res: Response) => {
  res.send(db.GetCategories());
});

app.get('/GetImage', (req: Request, res: Response) => {
  const idParam = req.query.id;
  const id = parseInt(idParam as string, 10);
  if (isNaN(id)) {
    res.status(400).send('Missing integer parameter id');
  }
  else {
    let img: Buffer = db.GetImage(id)
    if (img) {
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length
      });
      res.end(img);
    } else {
      res.status(404).send('Not Found');
    }
  }
});

app.get('/GetInfoOrders', (req: Request, res: Response) => {
  res.send(GatherInfo());
});

app.delete('/ResetInfoOrders', (req: Request, res: Response) => {
  const masterPinCheck = CheckMasterPin(req.query.pin)
  if (masterPinCheck.statusCode != 200) {
    res.status(masterPinCheck.statusCode).send(masterPinCheck.message)
  } else {
    res.send(db.ResetOrdersLog());
  }
});

app.get('/GetPrinters', (req: Request, res: Response) => {
  res.send(db.GetPrinters())
})

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

// Start server
app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});

