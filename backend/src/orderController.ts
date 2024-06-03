import { OrderEntryDTO } from "@Interfaces/order-entry-dto"
import * as db from "./dbController";
import { OrderToPrint, PrintEntry } from "./printerController";
import { OrderLogItem } from "./dbInterfaces";

// TODO init function that gets some setting from DB
const maxItems = 99;

export function buildOrder(order: OrderEntryDTO[]): OrderToPrint {
  // Get data from DB
  const menuEntries = db.GetMenuEntries()
  const printCategories = db.GetPrintCategories()
  // Init result
  const printEntries = new Map<string, PrintEntry[]>()
  let total = 0
  // Loop on input data
  for (const o of order) {
    // Confirm max single item order quantity
    if (o.quantity > maxItems)
      throw new RangeError(`Quantity of menu entry with id ${o.menuEntryID} is over maximum allowed ${o.quantity} > ${maxItems}`)
    // Find object loaded from DB
    const f = menuEntries.filter(x => x.id === o.menuEntryID)
    if (f === undefined)
      throw new RangeError(`Menu entry with id ${o.menuEntryID} not found`)
    const menuEntry = f[0]
    // Sequence number of this item
    const sequence = db.GetSequenceNumberByEntry(menuEntry.name)
    // Total
    const entryFinalPrice = menuEntry.price * o.quantity
    total += entryFinalPrice
    // Fill print entry object
    const printEntry: PrintEntry = {
      id: menuEntry.id,
      name: menuEntry.name,
      printingName: menuEntry.printingName,
      quantityOrdered: o.quantity,
      sequence: sequence,
      price: menuEntry.price,
      finalPrice: entryFinalPrice
    }
    // Add print entity to the data structure for the printer
    const printCat = printCategories.filter(x => x.id == menuEntry.printCategoryID)[0]
    if (printEntries.has(printCat.name))
      printEntries.get(printCat.name)?.push(printEntry)
    else {
      printEntries.set(printCat.name, [printEntry])
    }
  }
  // Return to the caller that will then print
  return {
    total: total,
    entries: printEntries
  }
}

export function confirmOrder(orderPrinted: OrderToPrint): void {
  const orderLogItems: OrderLogItem[] = []
  for (const op of orderPrinted.entries.values()) {
    for(const pe of op){
      // Update inventory
      db.DecrementInventory(pe.id, pe.quantityOrdered)
      // Fill log entry object
      orderLogItems.push({
        orderID: 0, // Will be set by DB
        name: pe.name,
        price: pe.price,
        quantity: pe.quantityOrdered
      })
    }
  }
  // Update logs
  db.InsertOrdersLog(orderLogItems)
}