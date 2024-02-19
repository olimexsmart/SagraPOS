import Database from 'better-sqlite3';
import * as di from './dbInterfaces'
import { Inventory } from "@Interfaces/inventory"
import { Printer } from "@Interfaces/printer"
import { MenuEntryDTO } from "@Interfaces/menu-entry-dto"
import { MenuCategory } from "@Interfaces/menu-categories"

// TODO rename columns to uniform to interfaces?
let db: any = undefined

export function initDB() {
    db = new Database('SagraPOS.sqlite3');
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON')
    // db.prepare('CREATE TABLE IF NOT EXISTS testTable (' +
    //     'ID INTEGER PRIMARY KEY,' +
    //     'testData TEXT NOT NULL' +
    //     ');').run()
    // TODO create of all tables
    // TODO initialize default settings if table is created
}

/*
 * MENU
 */
// TODO rename also API
export function GetMenuEntryDTOs(): MenuEntryDTO[] {
    const menuEntries = db.prepare('SELECT ID, CategoryID, Name, Price FROM MenuEntries').all();
    return menuEntries.map((menuEntry: any): MenuEntryDTO => ({
        id: menuEntry.ID,
        name: menuEntry.Name,
        price: menuEntry.Price,
        categoryID: menuEntry.CategoryID,
    }));
}

export function GetMenuEntries(): di.MenuEntry[] {
    const menuEntries = db.prepare('SELECT ID, CategoryID, PrintCategoryID, Name, Price, Inventory FROM MenuEntries').all();
    return menuEntries.map((menuEntry: any): di.MenuEntry => ({
        id: menuEntry.ID,
        categoryID: menuEntry.CategoryID,
        printCategoryID: menuEntry.PrintCategoryID,
        name: menuEntry.Name,
        price: menuEntry.Price,
        inventory: menuEntry.Inventory
    }));
}


export function GetImage(id: number) {
    return db.prepare('SELECT Image FROM MenuEntries WHERE ID = ?').get(id)?.Image
}

export function GetCategories(): MenuCategory[] {
    const menuCategories = db.prepare('SELECT * FROM Categories').all()
    return menuCategories.map((menuCategory: any): MenuCategory => ({
        id: menuCategory.ID,
        name: menuCategory.Name,
    }));
}

export function GetPrintCategories(): MenuCategory[] {
    const menuCategories = db.prepare('SELECT * FROM PrintCategories').all()
    return menuCategories.map((menuCategory: any): MenuCategory => ({
        id: menuCategory.ID,
        name: menuCategory.Name,
    }));
}

export function GetInventory(): Inventory {
    const res = db.prepare('SELECT ID, Inventory FROM MenuEntries').all()
    /*
        It looks very complex (it kind is)
        basically the reduce function is used to initialize a scalar variable
        from an array
        In this case we are initializing a Dictionary<int, int> or in JS that 
        would be an object with all int field defining int values
        It is also peculiar the mandatory type definitions of the
        callback input parameters, basically it's an inline interface definiton.
    */
    return res.reduce((acc: any, { ID, Inventory }: { ID: number, Inventory: number }) => {
        acc[ID] = Inventory;
        return acc;
    }, {} as Inventory);
}

export function UpdateInventory(menuEntryID: number, newInventory: number | null): boolean {
    const info = db.prepare('UPDATE MenuEntries SET Inventory = ? WHERE ID = ?').run(newInventory, menuEntryID)
    return info.changes > 0
}

/*
 * ORDERS LOG
 */
export function GetOrdersTotal(): number {
    return db.prepare('SELECT SUM(Total) AS out FROM OrdersLog WHERE Valid = 1').get().out ?? 0
}

export function GetOrdersNumber(): number {
    return db.prepare('SELECT COUNT(*) AS out FROM OrdersLog WHERE Valid = 1;').get().out ?? 0
}

export function GetOrdersTotalItems(): number {
    return db.prepare('SELECT SUM(Quantity) AS out FROM OrderLogItems WHERE Valid = 1').get().out ?? 0
}

export function GetOrdersTotalQuantityByEntry(menuEntryID: number): number {
    return db.prepare('SELECT SUM(Quantity) AS out FROM OrderLogItems WHERE Valid = 1 AND MenuEntryID = ?').get(menuEntryID)?.out ?? 0
}

export function GetSequenceNumberByEntry(menuEntryID: number): number {
    return db.prepare('SELECT COUNT(DISTINCT orderID) AS out FROM OrderLogItems'
        + ' WHERE menuentryid = ? AND valid = 1').get(menuEntryID)?.out ?? 0
}

export function ResetOrdersLog(): void {
    const tr = db.transaction(() => {
        db.prepare('UPDATE OrdersLog SET Valid = 0').run()
        db.prepare('UPDATE OrderLogItems SET Valid = 0').run()
    })
    tr()
}

export function InsertOrdersLog(orderLog: di.OrdersLog, orderLogItems: di.OrderLogItem[]): void {
    const tr = db.transaction((orderLog: di.OrdersLog, orderLogItems: di.OrderLogItem[]) => {
        const info = db.prepare('INSERT INTO OrdersLog (Total, Time, Valid) VALUES (@total, @time, 1)').run(orderLog)
        for (const oli of orderLogItems) {
            oli.orderID = info.lastInsertRowid
            db.prepare('INSERT INTO OrderLogItems (OrderID, MenuEntryID, Quantity, Valid)'
                + 'VALUES (@orderID, @menuEntryID, @quantity, 1)').run(oli)
        }
    })

    tr(orderLog, orderLogItems)
}

/*
 * SETTING
 */
export function GetMasterPin(): number | undefined {
    return db.prepare('SELECT ValueInt FROM Settings WHERE Key = ?').get('PIN').ValueInt
}

/*
 * PRINTERS
 */
export function GetPrinters(): Printer[] {
    const printers = db.prepare('SELECT * FROM Printers').all();
    return printers.map((printer: any): Printer => ({
        id: printer.ID,
        name: printer.Name,
        ip: printer.IP,
        port: printer.Port,
        hidden: printer.Hidden === 1 // Convert integer to boolean 
    }));
}
