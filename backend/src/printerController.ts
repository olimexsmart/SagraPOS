import { PrinterTypes, ThermalPrinter } from "node-thermal-printer";

export interface PrintEntry {
    name: string,
    quantityOrdered: number,
    sequence: number
};

// TODO init function that loads all printers (but can be called to refresh after data has been modified)

export function confirmPrint(printerID: number, toPrint: Map<string, PrintEntry[]>) {

    printerConsole(toPrint)

    // let printer = new ThermalPrinter({
    //     type: PrinterTypes.EPSON,
    //     interface: 'tcp://192.168.1.7'
    // });

    // printer.alignCenter();
    // printer.println("Hello world");
    // // await printer.printImage('./assets/olaii-logo-black.png')
    // printer.cut();


    // printer.execute().then(() => {
    //     console.log("Print done!");
    // }).catch((e) => {
    //     console.error("Print failed:", e);
    // })
}

function printerConsole(toPrint: Map<string, PrintEntry[]>) {
    console.log(toPrint);
    
}