import { CharacterSet, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import { OrdersInfo } from "@Interfaces/info-orders-dto"
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
const TEXT_START_RECAP = 'StartRecapText'
const RECAP_ENABLED = 'PrintOrderRecap'
let printersInfo: Map<number, Printer>
let logo: Buffer | null
let textStartRecap: string[] | null
let textOverLogo: string[] | null
let textUnderLogo: string[] | null
let recapEnabled: boolean = false

const lookup = promisify(dns.lookup);



export interface OrderToPrint {
  total: number,
  // Print category name -> PrintEntry
  entries: Map<string, PrintEntry[]>
}

export interface PrintEntry {
  id: number,
  name: string,
  printingName: string | null,
  quantityOrdered: number,
  sequence: number,
  finalPrice: number
  price: number,
  ordering: number,
  printSequenceEnable: boolean
};

export function reloadPrintersAndData() {
  // Cache printers
  printersInfo = db.GetPrinters().reduce((map, printer) => {
    map.set(printer.id, printer)
    return map;
  }, new Map<number, Printer>())
  // Cache receipt settings
  const logoDB = db.GetSettingByKey(PRINT_LOGO)
  if (logoDB !== null && logoDB.value !== null) {
    const logoHeightRaw = db.GetSettingByKey(PRINT_LOGO_HEIGHT)?.value ?? "0"
    const logoHeight = parseInt(logoHeightRaw)
    resizeImageToHeight(
      Buffer.from(logoDB.value, 'base64'),
      logoHeight)
      .then(x => logo = x)
  }
  textStartRecap = db.GetSettingByKey(TEXT_START_RECAP)?.value.replace('\r', '').split('\n') ?? null
  textOverLogo = db.GetSettingByKey(TEXT_OVER_LOGO)?.value.replace('\r', '').split('\n') ?? null
  textUnderLogo = db.GetSettingByKey(TEXT_UNDER_LOGO)?.value.replace('\r', '').split('\n') ?? null
  recapEnabled = db.GetSettingByKey(RECAP_ENABLED)?.value === '1'
}

export async function pokePrinter(printerToPoke: Printer): Promise<void> {
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
  return confirmPrint(printer)
}

export async function printOrder(printerID: number, toPrint: OrderToPrint): Promise<void> {
  if (printerID === CONSOLE_PRINTER_ID) { // Hard coded special case for debugging
    return consolePrintOrder(toPrint)
  }
  // Generate a random code to allow reconstructing the complete order print
  const orderCode = generateRandomString()
  const dateTime = new Date().toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  })
  const orderSignature = `${orderCode} - ${dateTime}`
  // Get printer and connection
  const reqPrinter = getPrinterAndConnection(printerID)
  const printer = reqPrinter.printer
  // Order main body
  for (const [printCatName, menuItems] of toPrint.entries) { // Loop on print categories
    // Title with category name
    printer.setTextSize(0, 0)
    printer.bold(true)
    printer.alignCenter()
    printer.println(`------ ${printCatName.toUpperCase()} ------`)
    printer.println(orderSignature)
    // Body with the ordered entries
    printer.alignLeft()
    for (const mi of menuItems) { // Loop on items of this printing category
      printer.println('')
      printer.bold(true)
      printer.setTextSize(2, 2)
      let pad = 12 // TODO should be configurable per-printer
      if (mi.quantityOrdered >= 10)
        pad--
      const name = mi.printingName ?? mi.name
      printer.println(`${name.toUpperCase().padEnd(pad)}x${mi.quantityOrdered}`)
      // Prenotation number
      if(mi.printSequenceEnable) {
        printer.bold(false)
        printer.setTextSize(0, 0)
        printer.println(`PRENOTAZIONE ${mi.sequence}`)
      }
    }
    printer.cut()
  }
  // Text start recap
  printer.bold(true)
  printer.alignCenter()
  printer.setTextSize(0, 0)
  if (textStartRecap != null) {
    for (const t of textStartRecap) {
      printer.println(t)
    }
  }
  // Order final recap 
  if (recapEnabled) {
    for (const printEntries of toPrint.entries.values()) {
      for (const v of printEntries) {
        printer.bold(true)
        printer.print(v.name.toUpperCase().padEnd(22))
        printer.bold(false)
        printer.print(`x${v.quantityOrdered}`.padEnd(6))
        printLineWithEuroSign(printer, '', (v.price * v.quantityOrdered).toFixed(2))
      }
    }
  }
  // Order total
  printer.println("")
  printer.setTextSize(2, 3)
  printer.bold(true)
  let pad = 9 // TODO should be configurable per-printer
  if (toPrint.total >= 10)
    pad--
  if (toPrint.total >= 100)
    pad--
  const totalPrompt = "TOTALE:" // TODO text configurable in settings 
  printLineWithEuroSign(printer, totalPrompt.padEnd(pad), toPrint.total.toFixed(2))
  // Order datetime
  printer.setTextSize(0, 0)
  printer.bold(false)
  printer.alignCenter()
  printer.println(orderSignature)
  // Over logo text
  printer.setTextSize(0, 0)
  printer.alignCenter()
  printer.bold(true)
  printer.println("")
  if (textOverLogo != null) {
    for (const t of textOverLogo) {
      printer.println(t)
    }
  }
  // Logo
  if (logo != null)
    printer.printImageBuffer(logo)
  // Under logo text
  printer.bold(false)
  printer.println("")
  if (textUnderLogo != null) {
    for (const t of textUnderLogo) {
      printer.println(t)
    }
  }
  printer.cut()

  // Confirm print
  return confirmPrint(printer)
}

export function printInfo(printerID: number, toPrint: OrdersInfo): Promise<void> {
  if (printerID === CONSOLE_PRINTER_ID) { // Hard coded spcial case for debugging
    return consolePrintInfo(toPrint)
  }
  // Get printer and connection
  const reqPrinter = getPrinterAndConnection(printerID)
  const printer = reqPrinter.printer
  // Header
  printer.alignLeft()
  printer.setTextSize(1, 1)
  printer.bold(true)
  printer.println(new Date().toLocaleString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour12: false
  }))
  printer.println(`Numero Ordini: ${toPrint.numberOfOrders}`)
  printLineWithEuroSign(printer, 'Lordo: ', toPrint.grossProfit.toFixed(2))
  printer.setTextSize(0, 0)
  printer.println('')
  // Order by number sold
  toPrint.infoByEntry.sort((a, b) => b.numberSold - a.numberSold);
  // Details of each entry
  for (const entry of toPrint.infoByEntry) {
    printer.bold(true)
    printer.print(entry.menuEntryName.toUpperCase().padEnd(22))
    printer.bold(false)
    printer.print(`x${entry.numberSold}`.padEnd(6))
    printLineWithEuroSign(printer, '', entry.grossProfit.toFixed(2))
  }
  printer.cut()

  // Confirm print
  return confirmPrint(printer)
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
async function confirmPrint(printer: ThermalPrinter): Promise<void> {
  return new Promise<void>((resolve, error) => {
    printer.execute({
      waitForResponse: false
    }).then(() => resolve()).catch(() => error())
  })
}

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

// TODO This could be used also in other context, move to an utils module
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

async function consolePrintOrder(toPrint: OrderToPrint): Promise<void> {
  return new Promise((resolve) => {
    fakeLoading(2000).then(() => { // Ensure fakeLoading returns a Promise
      console.log('Total: ' + toPrint.total);
      console.log(toPrint.entries);
      resolve();
    });
  });
}

async function consolePrintInfo(toPrint: OrdersInfo): Promise<void> {
  return new Promise((resolve) => {
    fakeLoading(2000).then(() => { // Ensure fakeLoading returns a Promise
      console.log('Total number of orders: ' + toPrint.numberOfOrders)
      console.log('Total of all orders: ' + toPrint.grossProfit)
      console.log(toPrint.infoByEntry);
      resolve();
    });
  });
}

async function fakeLoading(duration: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, duration);
  });
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

function generateRandomString(length: number = 5): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  const charactersLength = characters.length;

  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}