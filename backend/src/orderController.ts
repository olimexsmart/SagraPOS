import { OrderEntryDTO } from "@Interfaces/order-entry-dto"
import * as db from "./dbController";
import { PrintEntry } from "./printerController";

// TODO init function that gets some setting from DB
const maxItems = 99;



export function confirmOrder(order: OrderEntryDTO[]): Map<string, PrintEntry[]> {
    // Get complete information about each order entry
    const menuEntries = db.GetMenuEntries()
    const printCategories = db.GetPrintCategories()
    let total = 0
    const orderToPrint = new Map<string, PrintEntry[]>()
    for (const o of order) {
        const f = menuEntries.filter(x => x.id === o.menuEntryID)
        if (f === undefined)
            throw new RangeError(`Menu entry with id ${o.menuEntryID} not found`)
        const menuEntry = f[0]
        // Max quantity check
        if (o.quantity > maxItems)
            throw new RangeError(`Quantity of menu entry with id ${o.menuEntryID} is over maximum allowed ${o.quantity} > ${maxItems}`)
        // Total
        total += menuEntry.price * o.quantity
        // TODO Get sequence number of this item
        const sequence = 0
        // TODO insert into logs
        // TODO update inventory
        // Fill print entry object
        const printEntry: PrintEntry = {
            name: menuEntry.name,
            quantityOrdered: o.quantity,
            sequence: sequence
        }
        // Add print entity to the data structure for the printer
        const printCat = printCategories.filter(x => x.id == menuEntry.printCategoryID)[0]
        if (orderToPrint.has(printCat.name))
            orderToPrint.get(printCat.name)?.push(printEntry)
        else {
            orderToPrint.set(printCat.name, [printEntry])
        }
    }
    // Return the data structure just filled to the caller
    return orderToPrint
}