import { OrderEntryDTO } from "@Interfaces/order-entry-dto"
import * as db from "./dbController";
import { OrderToPrint, PrintEntry } from "./printerController";
import { OrderLogItem } from "./dbInterfaces";

// TODO init function that gets some setting from DB
const maxItems = 99;



export function confirmOrder(order: OrderEntryDTO[]): OrderToPrint {
  // Get complete information about each order entry
  const menuEntries = db.GetMenuEntries()
  const printCategories = db.GetPrintCategories()
  let total = 0
  const printEntries = new Map<string, PrintEntry[]>()
  const orderLogItems: OrderLogItem[] = []
  for (const o of order) {
    const f = menuEntries.filter(x => x.id === o.menuEntryID)
    if (f === undefined)
      throw new RangeError(`Menu entry with id ${o.menuEntryID} not found`)
    const menuEntry = f[0]
    // Max quantity check
    if (o.quantity > maxItems)
      throw new RangeError(`Quantity of menu entry with id ${o.menuEntryID} is over maximum allowed ${o.quantity} > ${maxItems}`)
    // Total
    const entryPrice = menuEntry.price * o.quantity
    total += entryPrice
    // Sequence number of this item
    const sequence = db.GetSequenceNumberByEntry(o.menuEntryID)
    // Update inventory
    if (menuEntry.inventory != null)  // Also checks for undefined
      db.UpdateInventory(o.menuEntryID, menuEntry.inventory - o.quantity)
    // Fill log entry object
    orderLogItems.push({
      menuEntryID: o.menuEntryID,
      orderID: 0,
      quantity: o.quantity
    })
    // Fill print entry object
    const printEntry: PrintEntry = {
      name: menuEntry.name,
      printingName: menuEntry.printingName,
      quantityOrdered: o.quantity,
      sequence: sequence,
      entryPrice: entryPrice
    }
    // Add print entity to the data structure for the printer
    const printCat = printCategories.filter(x => x.id == menuEntry.printCategoryID)[0]
    if (printEntries.has(printCat.name))
      printEntries.get(printCat.name)?.push(printEntry)
    else {
      printEntries.set(printCat.name, [printEntry])
    }
  }
  // Update logs
  db.InsertOrdersLog({
    time: new Date().toISOString(),
    total: total
  }, orderLogItems)
  // Return to the caller that will then print
  return {
    total: total,
    entries: printEntries
  }
}