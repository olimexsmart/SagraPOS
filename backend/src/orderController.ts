import { OrderEntryDTO } from "@Interfaces/order-entry-dto"
import * as db from "./dbController";
import { OrderToPrint, PrintEntry } from "./printerController";
import { OrderLogItem } from "./dbInterfaces";
import { MenuCategory } from "@Interfaces/menu-categories";

// TODO init function that gets some setting from DB
const maxItems = 99;

// TODO stupidly complex because the interfaces are not connected to each other
// nest the MenuCategory interface into the MenuEntry
export function buildOrder(order: OrderEntryDTO[]): OrderToPrint {
  // Get data from DB
  const menuEntries = db.GetMenuEntries()
  const printCategories = db.GetPrintCategories()
  // Init result
  const printEntries = new Map<string, PrintEntry[]>()
  let total = 0
  // Insert printing categories in the right order (Map object maintaing insertion order)
  const printCategriesActual: MenuCategory[] = []
  for (const o of order) {
    // Confirm max single item order quantity
    if (o.quantity > maxItems)
      throw new RangeError(`Quantity of menu entry with id ${o.menuEntryID} is over maximum allowed ${o.quantity} > ${maxItems}`)
    // Find object loaded from DB
    const f = menuEntries.filter(x => x.id === o.menuEntryID)
    if (f === undefined)
      throw new RangeError(`Menu entry with id ${o.menuEntryID} not found`)
    const menuEntry = f[0]
    // Add this to the print categories actually present in this order
    printCategriesActual.push(printCategories.filter(x => x.id == menuEntry.printCategoryID)[0])
  }
  // Sort the array by printing category order
  printCategriesActual.sort((a, b) => a.ordering - b.ordering)
  // Insert into the printing map in the correct order
  for (const pca of printCategriesActual) {
    printEntries.set(pca.name, [])
  }
  // Loop on input data
  for (const o of order) {
    const f = menuEntries.filter(x => x.id === o.menuEntryID)
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
      finalPrice: entryFinalPrice,
      ordering: menuEntry.ordering
    }
    // TODO another useless operation if the MenuCategory would be embedded into the MenuEntry object
    const printCat = printCategories.filter(x => x.id == menuEntry.printCategoryID)[0]
    // Push this entry into the printing 
    printEntries.get(printCat.name)?.push(printEntry)
  }
  // For each printing category order the entries array
  for (const me of printEntries.values()) {
    me.sort((a, b) => a.ordering - b.ordering)
  }
  // Return to the caller that will then print
  return {
    total: total,
    entries: printEntries
  }
}

// Used to test layout of prints in settings
export function buildFakeOrder(): OrderToPrint {
  // Get data from DB
  const menuEntries = db.GetMenuEntries()
  // Print maxed quantity of every item
  const fakeOrder: OrderEntryDTO[]
    = menuEntries.map((me) => ({ menuEntryID: me.id, quantity: maxItems }))
  return buildOrder(fakeOrder)
}

export function confirmOrder(orderPrinted: OrderToPrint): void {
  const orderLogItems: OrderLogItem[] = []
  for (const op of orderPrinted.entries.values()) {
    for (const pe of op) {
      // Update inventory
      db.DecrementInventory(pe.id, pe.quantityOrdered)
      // Fill log entry object
      // TODO Add printer from where it was printed from
      // TODO Add cash money received (or leave NULL for card payments)
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