import { CharacterSet, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import { Printer } from "@Interfaces/printer"
import * as db from "./dbController";
import sharp from "sharp";


const CONSOLE_PRINTER_ID = 100
const PRINT_LOGO = 'PrintLogo'
const PRINT_LOGO_HEIGHT = 'PrintLogoHeight'
const TEXT_OVER_LOGO = 'OverLogoText'
const TEXT_UNDER_LOGO = 'UnderLogoText'
let printersInfo: Map<number, Printer>
let logo: Buffer
let textOverLogo: string
let textUnderLogo: string

export interface OrderToPrint {
    total: number,
    // Print category name -> PrintEntry
    entries: Map<string, PrintEntry[]>
}

export interface PrintEntry {
    name: string,
    quantityOrdered: number,
    sequence: number,
    entryPrice: number
};

export function reloadPrintersAndData() { // TODO call this from printer CRUD API
    // Cache printers
    printersInfo = db.GetPrinters().reduce((map, printer) => {
        map.set(printer.id, printer)
        return map;
    }, new Map<number, Printer>())
    // Cache receipt settings
    logo = db.GetSettingValuesByKey(PRINT_LOGO).valueBlob
    resizeImageToHeight(logo, db.GetSettingValuesByKey(PRINT_LOGO_HEIGHT).valueNum).then(x => logo = x)
    textOverLogo = db.GetSettingValuesByKey(TEXT_OVER_LOGO).valueString
    textUnderLogo = db.GetSettingValuesByKey(TEXT_UNDER_LOGO).valueString
}

export function confirmPrint(printerID: number, toPrint: OrderToPrint) {
    // TODO distinguish different printer models
    // TODO each printer model will have its printing class
    if (printerID == CONSOLE_PRINTER_ID) { // Hard coded spcial case for debugging
        printerConsole(toPrint)
        return
    }
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
        characterSet: CharacterSet.PC858_EURO,
        // Replace the Euro sign in strings by code 164.

    })
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
            printer.println(`${v.name.toUpperCase().padEnd(pad)}x${v.quantityOrdered}`)
            // Prenotation number
            // TODO make this settings-configurable so that it can be hidden
            printer.bold(false)
            printer.setTextSize(0, 0)
            printer.println(`PRENOTAZIONE ${v.sequence}`)
        }
        printer.cut()
    }
    // Order final recap
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
            printer.print(`${v.quantityOrdered} ${v.name.toUpperCase().padEnd(pad)}`)
            printEuroSign(printer)
            printer.println(v.entryPrice.toFixed(2))
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
    printer.print(`${totalPrompt.padEnd(pad)}`)
    printEuroSign(printer)
    printer.println(toPrint.total.toFixed(2))
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

function printEuroSign(printer: ThermalPrinter) {
    printer.add(new Buffer([0x1b, 0x74, 19]));
    printer.add(new Buffer([213]))
}

async function resizeImageToHeight(imageBuffer: Buffer, targetHeight: number): Promise<Buffer> {
    try {
      const resizedImageBuffer: Buffer = await sharp(imageBuffer)
        .resize({
          height: targetHeight,
          withoutEnlargement: true, // Ensures the image is not enlarged
          fit: 'cover' // Ensures the resized image covers the specified dimensions
        })
        .toBuffer();
  
      return resizedImageBuffer;
    } catch (error) {
      console.error('Error resizing image:', error);
      throw error; // Rethrow or handle the error as needed
    }
  }

function printerConsole(toPrint: OrderToPrint) {
    console.log('Total: ' + toPrint.total)
    console.log(toPrint.entries)
}