import Database from 'better-sqlite3';
import * as di from './dbInterfaces'
import { Inventory } from "@Interfaces/inventory"
import { Printer } from "@Interfaces/printer"
import { MenuEntryDTO } from "@Interfaces/menu-entry-dto"
import { MenuCategory } from "@Interfaces/menu-categories"

// TODO rename columns to uniform to interfaces?
let db: any = undefined

export function initDB() {
    db = new Database('SagraPOS.sqlite3') //, { verbose: console.log });
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON')
    // Categories
    db.prepare(`CREATE TABLE IF NOT EXISTS "Categories" (
        "ID"	INTEGER,
        "Name"	TEXT NOT NULL,
        PRIMARY KEY("ID" AUTOINCREMENT)
        )`).run()
    // MenuEntries
    db.prepare(`CREATE TABLE IF NOT EXISTS "MenuEntries" (
        "ID"	INTEGER,
        "CategoryID"	INTEGER,
        "PrintCategoryID"	INTEGER,
        "Name"	TEXT NOT NULL,
        "PrintingName"	TEXT DEFAULT NULL,
        "Price"	REAL NOT NULL DEFAULT 0,
        "Image"	BLOB,
        "Inventory"	INTEGER,
        FOREIGN KEY("CategoryID") REFERENCES "Categories"("ID") ON DELETE SET NULL,
        FOREIGN KEY("PrintCategoryID") REFERENCES "PrintCategories"("ID") ON DELETE SET NULL,
        PRIMARY KEY("ID" AUTOINCREMENT)
        );`).run()
    // OrderLogItems
    db.prepare(`CREATE TABLE IF NOT EXISTS "OrderLogItems" (
        "ID"	INTEGER,
        "OrderID"	INTEGER NOT NULL,
        "MenuEntryID"	INTEGER NOT NULL,
        "Quantity"	INTEGER NOT NULL,
        "Valid"	INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY("MenuEntryID") REFERENCES "MenuEntries"("ID") on delete cascade,
        FOREIGN KEY("OrderID") REFERENCES "OrdersLog"("ID") on delete cascade,
        PRIMARY KEY("ID")
        )`).run()
    // OrdersLog
    db.prepare(`CREATE TABLE IF NOT EXISTS "OrdersLog" (
        "ID"	INTEGER,
        "Total"	REAL NOT NULL,
        "Time"	TEXT NOT NULL,
        "Valid"	INTEGER NOT NULL DEFAULT 1,
        PRIMARY KEY("ID")
    )`).run()
    // PrintCategories
    db.prepare(`CREATE TABLE IF NOT EXISTS "PrintCategories" (
        "ID"	INTEGER NOT NULL,
        "Name"	TEXT NOT NULL,
        PRIMARY KEY("ID" AUTOINCREMENT)
    )`).run()
    // Printers
    db.prepare(`CREATE TABLE IF NOT EXISTS "Printers" (
        "ID"	INTEGER,
        "Name"	TEXT NOT NULL,
        "IP"	TEXT NOT NULL,
        "Port"	INTEGER NOT NULL DEFAULT 9100,
        "Hidden"	INTEGER NOT NULL DEFAULT 0,
        PRIMARY KEY("ID")
    )`).run()
    // SettingCategories
    db.prepare(`CREATE TABLE IF NOT EXISTS "SettingCategories" (
        "ID"	INTEGER NOT NULL,
        "Name"	TEXT NOT NULL,
        PRIMARY KEY("ID" AUTOINCREMENT)
    )`).run()
    // Settings
    db.prepare(`CREATE TABLE IF NOT EXISTS "Settings" (
        "Key"	TEXT NOT NULL,
        "Category"	INTEGER NOT NULL,
        "ValueString"	TEXT,
        "ValueNum"	NUMERIC,
        "ValueBlob"	BLOB,
        "ValueInt"	INTEGER,
        "DisplayName"	TEXT,
        "Description"	TEXT,
        PRIMARY KEY("Key"),
        FOREIGN KEY("Category") REFERENCES "SettingCategories"("ID") on delete cascade
    )`).run()
    // Totals
    // TODO what is this table for?
    db.prepare(`CREATE TABLE IF NOT EXISTS "Totals" (
        "Key"	TEXT NOT NULL,
        "Value"	REAL NOT NULL DEFAULT 0,
        PRIMARY KEY("Key")
    )`).run()
    // TODO initialize default settings if table is created?
}

/*
 * MENU
 */
export function GetMenuEntryDTOs(): MenuEntryDTO[] {
    const menuEntries = db.prepare('SELECT ID, CategoryID, PrintCategoryID, Name, Price FROM MenuEntries').all();
    return menuEntries.map((menuEntry: any): MenuEntryDTO => ({
        id: menuEntry.ID,
        name: menuEntry.Name,
        price: menuEntry.Price,
        categoryID: menuEntry.CategoryID,
        printCategoryID: menuEntry.PrintCategoryID
    }));
}

export function GetMenuEntries(): di.MenuEntry[] {
    const menuEntries = db.prepare('SELECT ID, CategoryID, PrintCategoryID, Name, PrintingName, Price, Inventory FROM MenuEntries').all();
    return menuEntries.map((menuEntry: any): di.MenuEntry => ({
        id: menuEntry.ID,
        categoryID: menuEntry.CategoryID,
        printCategoryID: menuEntry.PrintCategoryID,
        name: menuEntry.Name,
        printingName: menuEntry.PrintingName,
        price: menuEntry.Price,
        inventory: menuEntry.Inventory
    }));
}

export function GetImage(menuEntryID: number): Buffer {
    return db.prepare('SELECT Image FROM MenuEntries WHERE ID = ?').get(menuEntryID)?.Image
}

export function UpdateImage(menuEntryID: number, newImage: Buffer): number {
    return db.prepare('UPDATE MenuEntries SET Image = ? WHERE ID = ?').run(newImage, menuEntryID).changes
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

export function InsertMenuEntry(newEntry: MenuEntryDTO): number {
    return db.prepare('INSERT INTO MenuEntries (CategoryID, PrintCategoryID, Name, Price, Inventory)'
        + ' VALUES (@categoryID, @printCategoryID, @name, @price, NULL)').run(newEntry).lastInsertRowid
}

export function UpdateMenuEntry(updatedEntry: MenuEntryDTO): number {
    if (!updatedEntry.id) {
        throw new Error("UpdateMenuEntry called without a valid 'id'. Are you trying to update the void?");
    }
    return db.prepare('UPDATE MenuEntries SET CategoryID = @categoryID, PrintCategoryID = @printCategoryID, Name = @name, Price = @price WHERE ID = @id')
        .run(updatedEntry).changes;
}

export function DeleteMenuEntry(entryId: number): number {
    if (!entryId) {
        throw new Error("DeleteMenuEntry called without a valid 'id'. Are you trying to make the database lose weight by deleting random chunks of it?");
    }
    return db.prepare('DELETE FROM MenuEntries WHERE ID = ?').run(entryId).changes;
}


/*
 * INVENTORY
 */
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
                + ' VALUES (@orderID, @menuEntryID, @quantity, 1)').run(oli)
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

export function GetAllSettings() {
    // TODO for frontend settings page (check if json can handle decently Buffers)
}

export function GetSettingValuesByKey(key: string): di.SettingValues {
    const s = db.prepare('SELECT ValueString, ValueNum, ValueBlob FROM Settings WHERE Key = ?').get(key)
    if (s === undefined)
        return {
            valueNum: null,
            valueBlob: null,
            valueString: null,
        }
    else
        return {
            valueNum: s.ValueNum,
            valueBlob: s.ValueBlob,
            valueString: s.ValueString
        }
}

/*
 * PRINTERS
 */
export function GetPrinters(): Printer[] {
    const printers = db.prepare('SELECT * FROM Printers').all()
    return printers.map((printer: any): Printer => ({
        id: printer.ID,
        name: printer.Name,
        ip: printer.IP,
        port: printer.Port,
        hidden: printer.Hidden === 1 // Convert integer to boolean 
    }))
}
