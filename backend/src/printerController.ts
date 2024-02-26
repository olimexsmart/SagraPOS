import { CharacterSet, PrinterTypes, ThermalPrinter } from "node-thermal-printer";
import { Printer } from "@Interfaces/printer"
import * as db from "./dbController";


const CONSOLE_PRINTER_ID = 100
const PRINT_LOGO = 'PrintLogo'
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
    sequence: number
};

export function reloadPrintersAndData() { // TODO call this from printer CRUD API
    // Cache printers
    printersInfo = db.GetPrinters().reduce((map, printer) => {
        map.set(printer.id, printer);
        return map;
    }, new Map<number, Printer>())
    // Cache receipt settings
    logo = db.GetSettingValuesByKey(PRINT_LOGO).valueBlob
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
        characterSet: CharacterSet.PC852_LATIN2,
    });
    // Print 
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
            let extraSpace = v.name.toUpperCase().padEnd(12)
            if (v.quantityOrdered > 10)
                extraSpace = v.name.toUpperCase().padEnd(11)
            printer.println(`${extraSpace}x${v.quantityOrdered}`)
            // Prenotation number
            // TODO make this settings-configurable
            printer.bold(false)
            printer.setTextSize(0, 0)
            printer.println(`PRENOTAZIONE ${v.sequence}`)
        }
        printer.cut()
    }

    // Confirm print
    printer.execute().then(() => {
        console.log("Print done!");
    }).catch((e) => {
        // TODO this should propagate to frontend
        console.error("Print failed:", e);
    })
}

function printerConsole(toPrint: OrderToPrint) {
    console.log('Total: ' + toPrint.total);
    console.log(toPrint.entries);
}