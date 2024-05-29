import { CharacterSet, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import { InfoOrderEntryDTO, InfoOrdersDTO } from "@Interfaces/info-orders-dto"
import { Printer } from "@Interfaces/printer"
import * as db from "./dbController";
import Jimp from 'jimp';
import * as net from 'net';
import { promisify } from 'util';
import * as dns from 'dns';
import * as os from 'os';


const CONSOLE_PRINTER_ID = 100
const PRINT_LOGO = 'PrintLogo'
const PRINT_LOGO_HEIGHT = 'PrintLogoHeight'
const TEXT_OVER_LOGO = 'OverLogoText'
const TEXT_UNDER_LOGO = 'UnderLogoText'
let printersInfo: Map<number, Printer>
let logo: Buffer | null
let textOverLogo: string | null
let textUnderLogo: string | null

const lookup = promisify(dns.lookup);



export interface OrderToPrint {
  total: number,
  // Print category name -> PrintEntry
  entries: Map<string, PrintEntry[]>
}

export interface PrintEntry {
  name: string,
  printingName: string | null,
  quantityOrdered: number,
  sequence: number,
  entryPrice: number
};

export function reloadPrintersAndData() {
  // Cache printers
  printersInfo = db.GetPrinters().reduce((map, printer) => {
    map.set(printer.id, printer)
    return map;
  }, new Map<number, Printer>())
  // Cache receipt settings
  const logoDB = db.GetSettingByKey(PRINT_LOGO)
  if (logoDB !== null) {
    const logoHeightRaw = db.GetSettingByKey(PRINT_LOGO_HEIGHT)?.value ?? "0"
    const logoHeight = parseInt(logoHeightRaw)
    resizeImageToHeight(
      Buffer.from(logoDB.value, 'base64'),
      logoHeight)
      .then(x => logo = x)
  }
  textOverLogo = db.GetSettingByKey(TEXT_OVER_LOGO)?.value ?? ""
  textUnderLogo = db.GetSettingByKey(TEXT_UNDER_LOGO)?.value ?? ""
}

export function pokePrinter(printerToPoke: Printer) {
  if (printerToPoke.id === CONSOLE_PRINTER_ID) { // Hard coded spcial case for debugging
    console.log(printerToPoke);
    return
  }
  // Connect to printer using the provided ip
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `tcp://${printerToPoke.ip}:${printerToPoke.port}`,
    characterSet: CharacterSet.PC858_EURO
  })
  printer.bold(true)
  printer.setTextSize(1, 1)
  printer.println(`Name: ${printerToPoke.name}`)
  printer.println(`IP: ${printerToPoke.ip}`)
  printer.println(`Port: ${printerToPoke.port}`)
  printer.cut() // TODO make it nicer
  // Confirm print
  printer.execute().then(() => {
    console.log("Print done!")
  }).catch((e) => {
    // TODO this should propagate to frontend
    console.error("Print failed:", e)
  })
}

export function printOrder(printerID: number, toPrint: OrderToPrint): void {
  if (printerID === CONSOLE_PRINTER_ID) { // Hard coded special case for debugging
    consolePrintOrder(toPrint)
    return
  }
  // Get printer and connection
  const reqPrinter = getPrinterAndConnection(printerID)
  const printer = reqPrinter.printer
  // Order main body
  for (const [key, value] of toPrint.entries) {
    // Title with category name
    printer.setTextSize(0, 0)
    printer.bold(true)
    printer.alignCenter()
    printer.println(`------ ${key.toUpperCase()} ------`)
    printer.println('')
    // Body with the ordered entries
    printer.alignLeft()
    for (const v of value) {
      printer.println('')
      printer.bold(true)
      printer.setTextSize(2, 2)
      let pad = 12 // TODO should be configurable per-printer
      if (v.quantityOrdered > 10)
        pad--
      const name = v.printingName ?? v.name
      printer.println(`${name.toUpperCase().padEnd(pad)}x${v.quantityOrdered}`)
      // Prenotation number
      // TODO make this settings-configurable so that it can be hidden
      printer.bold(false)
      printer.setTextSize(0, 0)
      printer.println(`PRENOTAZIONE ${v.sequence}`)
    }
    printer.cut()
  }
  // Order final recap // TODO configurable if wanted
  for (const [key, value] of toPrint.entries) {
    printer.setTextSize(1, 1)
    for (const v of value) {
      let pad = 14 // TODO should be configurable per-printer
      if (v.quantityOrdered > 10)
        pad--
      if (v.entryPrice > 10)
        pad--
      if (v.entryPrice > 100)
        pad--
      printLineWithEuroSign(
        printer,
        `${v.quantityOrdered} ${v.name.toUpperCase().padEnd(pad)}`,
        v.entryPrice.toFixed(2))
    }
  }
  // Order total
  printer.println("")
  printer.setTextSize(2, 3)
  printer.bold(true)
  let pad = 9 // TODO should be configurable per-printer
  if (toPrint.total > 10)
    pad--
  if (toPrint.total > 100)
    pad--
  const totalPrompt = "TOTALE:" // TODO text configurable in settings 
  printLineWithEuroSign(printer, totalPrompt.padEnd(pad), toPrint.total.toFixed(2))
  // Over logo text
  printer.setTextSize(0, 0)
  printer.alignCenter()
  printer.bold(true)
  printer.println("")
  if (textOverLogo != null)
    printer.println(textOverLogo)
  // Logo
  if (logo != null)
    printer.printImageBuffer(logo)
  // Under logo text
  printer.bold(false)
  printer.println("")
  if (textUnderLogo != null)
    printer.println(textUnderLogo)
  printer.cut()


  // Confirm print
  printer.execute().then(() => {
    console.log("Print done!")
  }).catch((e) => {
    // TODO this should propagate to frontend
    console.error("Print failed:", e)
  })
}

// TODO layout is very basic could be nicer to look at
export function printInfo(printerID: number, toPrint: InfoOrdersDTO) {
  if (printerID === CONSOLE_PRINTER_ID) { // Hard coded spcial case for debugging
    consolePrintInfo(toPrint)
    return
  }
  // Get printer and connection
  const reqPrinter = getPrinterAndConnection(printerID)
  const printer = reqPrinter.printer
  // Header
  printer.alignLeft()
  printer.setTextSize(0, 0)
  printer.bold(true)
  printer.println(`Numero totale ordini: ${toPrint.numOrders}`) // TODO these string should be configurable
  printLineWithEuroSign(printer, 'Totale vendite: ', toPrint.ordersTotal.toFixed(2))
  printLineWithEuroSign(printer, 'Spesa media: ', (toPrint.ordersTotal / toPrint.numOrders).toFixed(2))
  printer.println('')
  // Details of each entry
  for (const entry of toPrint.infoOrderEntries) {
    printer.bold(true)
    printer.println(entry.menuEntryName.toUpperCase())
    printer.bold(false)
    printer.println(`Vendute: ${entry.quantitySold}`)
    printer.println(`Percentuale vendite: ${(entry.totalPercentage * 100).toFixed(1)}%`)
    printLineWithEuroSign(printer, 'Entrate: ', entry.totalSold.toFixed(2))
    printer.println(`Percentuale entrate: ${(entry.totalSoldPercentage * 100).toFixed(1)}%`)
    printer.println('')
  }
  printer.cut()

  // Confirm print
  printer.execute().then(() => {
    console.log("Print done!")
  }).catch((e) => {
    // TODO this should propagate to frontend
    console.error("Print failed:", e)
  })
}

export async function scanPrinters(port: number = 9100): Promise<string[]> {
  const subnet = findLocalSubnet();
  if (!subnet) {
    console.error('No suitable subnet found.');
    return [];
  }

  const host = await lookup(subnet.split('/')[0]);
  const scanPromises: Promise<ScanResult>[] = [];
  const openIps: string[] = [];

  for (let i = 1; i <= 254; i++) {
    const ip = host.address.replace(/\d+$/, i.toString());
    scanPromises.push(scanIp(ip, port));
  }

  const results = await Promise.allSettled(scanPromises);
  results.forEach(result => {
    if (result.status === 'fulfilled' && result.value.isOpen) {
      console.log(`Open port found at ${result.value.ip}:${result.value.port}`);
      openIps.push(result.value.ip);
    }
  });

  console.log('Scan complete.');
  return openIps;
}

/*
 * PRIVATE INTERFACES
 */

interface RequestedPrinter {
  printerInfo: Printer,
  printer: ThermalPrinter
}

interface ScanResult {
  ip: string;
  port: number;
  isOpen: boolean;
}

/*
 * PRIVATE FUNCTIONS
 */
function getPrinterAndConnection(printerID: number): RequestedPrinter {
  // TODO distinguish different printer models
  // TODO each printer model will have its printing class
  // Check if printer is present and try to reload printers if not (maybe there was a recent change)
  if (!printersInfo.has(printerID)) {
    throw new RangeError(`Printer with ID: ${printerID} is not present in the database`) // TODO catch in API and set status code 404
  }
  // Get printer 
  const pInfo = printersInfo.get(printerID)!
  // Connect to printer using the saved ip
  let printer = new ThermalPrinter({
    type: PrinterTypes.EPSON,
    interface: `tcp://${pInfo.ip}:${pInfo.port}`,
    characterSet: CharacterSet.PC858_EURO
  })
  // 
  return {
    printer: printer,
    printerInfo: pInfo
  }
}

function printLineWithEuroSign(printer: ThermalPrinter, textBefore: string, textAfter: string) {
  printer.print(textBefore)
  printer.add(Buffer.from([0x1b, 0x74, 19]));
  printer.add(Buffer.from([213]))
  printer.println(textAfter)
}


async function resizeImageToHeight(imageBuffer: Buffer, targetHeight: number): Promise<Buffer> {
  try {
    if (!imageBuffer || imageBuffer.length === 0) {
      throw new Error('Invalid image buffer provided');
    }
    // Read the image from the buffer
    const image = await Jimp.read(imageBuffer);
    // Resize the image to the desired height while maintaining the aspect ratio
    const resizedImage = image.resize(Jimp.AUTO, targetHeight);
    // Get the buffer of the resized image
    const resizedImageBuffer: Buffer = await new Promise((resolve, reject) => {
      resizedImage.getBuffer(Jimp.MIME_PNG, (err, buffer) => {
        if (err) {
          console.error('Error getting buffer:', err);
          reject(err);
        } else {
          resolve(buffer);
        }
      });
    });

    return resizedImageBuffer;
  } catch (error) {
    console.error('Error resizing image:', error);
    throw error; // TODO Rethrow or handle the error as needed
  }
}

function consolePrintOrder(toPrint: OrderToPrint) {
  fakeLoading(2000)
  console.log('Total: ' + toPrint.total)
  console.log(toPrint.entries)
}

function consolePrintInfo(toPrint: InfoOrdersDTO) {
  fakeLoading(2000)
  console.log('Total number of orders: ' + toPrint.numOrders)
  console.log('Total of all orders: ' + toPrint.ordersTotal)
  console.log(toPrint.infoOrderEntries);
}

function fakeLoading(ms: number):void {
    // Contraption to have a two seconds fake loading for debugging
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
      if ((new Date().getTime() - start) > ms) {
        break;
      }
    }
}

async function scanIp(ip: string, port: number): Promise<ScanResult> {
  return new Promise(resolve => {
    const socket = new net.Socket();
    const result: ScanResult = { ip, port, isOpen: false };

    socket.setTimeout(2000); // 2 seconds timeout
    socket.once('connect', () => {
      result.isOpen = true;
      socket.destroy();
    });
    socket.on('timeout', () => {
      socket.destroy();
    });
    socket.on('error', () => {
      socket.destroy();
    });
    socket.on('close', () => {
      resolve(result);
    });

    socket.connect(port, ip);
  });
}

function findLocalSubnet(): string | null {
  const interfaces = os.networkInterfaces();
  for (const iface of Object.values(interfaces)) {
    for (const config of iface!) {
      if (config.family === 'IPv4' && !config.internal) {
        return config.cidr;  // cidr includes the subnet mask (e.g., '192.168.1.0/24')
      }
    }
  }
  return null;
}