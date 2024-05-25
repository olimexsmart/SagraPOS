import path from 'path';
import os from 'os'
import Database from 'better-sqlite3';
import * as di from './dbInterfaces'
import { Inventory } from "@Interfaces/inventory"
import { Printer } from "@Interfaces/printer"
import { MenuEntry } from "@Interfaces/menu-entry-dto"
import { MenuCategory } from "@Interfaces/menu-categories"
import { Setting, SettingCategory } from "@Interfaces/setting"


// TODO rename columns to uniform to interfaces?
let db: any = undefined
// Database path, default is user home directory (very cross-platform)
let dbPath: string

export function openDB(): void {
  db = new Database(dbPath) //, { verbose: console.log });
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON')
}

export function closeDB(): void {
  db.close()
}

export function getPathDB(): string {
  return dbPath
}

export function initDB(appDir: string): void {
  dbPath = path.join(appDir, 'SagraPOS.sqlite3')
  openDB()
  // Categories
  db.prepare(`CREATE TABLE IF NOT EXISTS "Categories" (
        "ID"	INTEGER,
        "Name"	TEXT NOT NULL,
        PRIMARY KEY("ID" AUTOINCREMENT)
        )`).run()
  // MenuEntries
  db.prepare(`CREATE TABLE IF NOT EXISTS "MenuEntries" (
        "ID"	INTEGER,
        "CategoryID" INTEGER NOT NULL,
        "PrintCategoryID"	INTEGER NOT NULL,
        "Name"	TEXT NOT NULL,
        "PrintingName" TEXT DEFAULT NULL,
        "Price"	REAL NOT NULL DEFAULT 0,
        "Image"	BLOB,
        "Inventory"	INTEGER,
        FOREIGN KEY("CategoryID") REFERENCES "Categories"("ID"),
        FOREIGN KEY("PrintCategoryID") REFERENCES "PrintCategories"("ID"),
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
  // db.prepare(`CREATE TABLE IF NOT EXISTS "Totals" (
  //     "Key"	TEXT NOT NULL,
  //     "Value"	REAL NOT NULL DEFAULT 0,
  //     PRIMARY KEY("Key")
  // )`).run()
  // TODO initialize default settings if table is created?
}

interface ColInfo {
  cid: number,
  name: string,
  type: string,
  notnull: number,
  dflt_value: any | null,
  pk: number
}

export function copyDB(tempDBPath: string): boolean {
  const sourceDB = new Database(tempDBPath)
  // Check if tables are compatible (log tables do not matter), order is relevant for FKs
  const tableList = ['Categories', 'PrintCategories', 'MenuEntries', 'SettingCategories', 'Settings', 'Printers']
  let compatible = true
  for (const table of tableList) {
    const colsD: ColInfo[] = getTableInfo(db, table)
    const colsS: ColInfo[] = getTableInfo(sourceDB, table)
    // Check number of columns
    if (colsD.length !== colsS.length) {
      compatible = false
      break
    }
    // Check column names and types
    for (let i = 0; i < colsD.length; i++) {
      compatible =
        colsD[i].name === colsS[i].name
        && colsD[i].type === colsS[i].type
        && colsD[i].notnull === colsS[i].notnull
        && colsD[i].dflt_value === colsS[i].dflt_value
        && colsD[i].pk === colsS[i].pk
    }
    // Continue only if compatible
    if (!compatible) break
  }
  // Only if everything is compatible proceed to copy
  if (compatible) {
    db.prepare('ATTACH DATABASE ? AS sourceDB').run(tempDBPath)
    // Empty tables, order is relevant for FKs
    const deleteTableSeq = ['OrderLogItems', 'OrdersLog', 'MenuEntries', 'Categories', 'PrintCategories', 'Settings', 'SettingCategories', 'Printers']
    for (const table of deleteTableSeq) {
      db.prepare(`DELETE FROM ${table}`).run()
    }
    // Delete and insert
    for (const table of tableList) {
      db.prepare(`INSERT INTO ${table} SELECT * FROM sourceDB.${table}`).run()
    }
    db.prepare('DETACH DATABASE sourceDB').run()
  }

  return compatible;
}

function getTableInfo(dbIn: any, tableName: string): ColInfo[] {
  const colInfo = dbIn.prepare(`select * from pragma_table_info(?) as tblInfo`).all(tableName)
  return colInfo.map((colEntry: any): ColInfo => ({
    cid: colEntry.cid,
    name: colEntry.name,
    type: colEntry.type,
    notnull: colEntry.notnull,
    dflt_value: colEntry.dflt_value,
    pk: colEntry.pk
  }));
}

/*
 * MENU ENTRIES
 */
/* See setting-menu.component.ts in frontend project
'SELECT m.ID, m.CategoryID, m.PrintCategoryID, '
+ 'm.Name, m.PrintingName, m.Price, '
+ 'm.Inventory, c.Name AS CategoryName, '
+ 'pc.Name AS PrintingCategoryName '
+ 'FROM MenuEntries m '
+ 'INNER JOIN Categories c ON m.CategoryID = c.ID '
+ 'INNER JOIN PrintCategories pc ON m.PrintCategoryID = pc.ID'

 */
export function GetMenuEntries(): MenuEntry[] {
  const menuEntries = db.prepare('SELECT ID, CategoryID, PrintCategoryID, Name, PrintingName, Price, Inventory FROM MenuEntries').all();
  return menuEntries.map((menuEntry: any): MenuEntry => ({
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

export function InsertMenuEntry(newEntry: MenuEntry): number {
  return db.prepare(
    'INSERT INTO MenuEntries (CategoryID, PrintCategoryID, Name, PrintingName, Price, Inventory)'
    + ' VALUES (@categoryID, @printCategoryID, @name, @printingName, @price, @inventory)')
    .run(newEntry).lastInsertRowid
}

export function UpdateMenuEntry(updatedEntry: MenuEntry): number {
  if (!updatedEntry.id) {
    throw new Error('UpdateMenuEntry called without a valid id');
  }
  return db.prepare(
    'UPDATE MenuEntries SET CategoryID = @categoryID, '
    + 'PrintCategoryID = @printCategoryID, Name = @name, '
    + 'PrintingName = @printingName, Price = @price, Inventory = @inventory '
    + 'WHERE ID = @id')
    .run(updatedEntry).changes;
}

export function DeleteMenuEntry(entryId: number): number {
  if (!entryId) {
    throw new Error('DeleteMenuEntry called without a valid id');
  }
  return db.prepare('DELETE FROM MenuEntries WHERE ID = ?').run(entryId).changes;
}

/*
 * MENU CATEGORIES
 */
export function GetCategories(): MenuCategory[] {
  const menuCategories = db.prepare('SELECT * FROM Categories').all()
  return menuCategories.map((menuCategory: any): MenuCategory => ({
    id: menuCategory.ID,
    name: menuCategory.Name,
    occurrences: GetCategoryOccurrences(menuCategory.ID)
  }));
}

export function InsertCategory(newEntry: MenuCategory): number {
  return db.prepare('INSERT INTO Categories (Name)'
    + ' VALUES (@name)').run(newEntry).lastInsertRowid
}

export function UpdateCategory(updatedEntry: MenuCategory): number {
  if (!updatedEntry.id) { // TODO does this error serve any purpose?
    throw new Error('UpdateCategory called without a valid id');
  }
  return db.prepare('UPDATE Categories SET Name = @name WHERE ID = @id')
    .run(updatedEntry).changes;
}

export function DeleteCategory(entryId: number): number {
  if (!entryId) {
    throw new Error('DeleteCategory called without a valid id');
  }
  const occurrences = GetCategoryOccurrences(entryId)
  if (occurrences > 0)
    throw new RangeError(`Category with id ${entryId} is used and cannot be deleted`)
  else
    return db.prepare('DELETE FROM Categories WHERE ID = ?').run(entryId).changes;
}

function GetCategoryOccurrences(entryId: number): number {
  return db.prepare('SELECT COUNT(*) AS out FROM MenuEntries WHERE CategoryID = ?').get(entryId).out ?? 0
}

/*
 * PRINT CATEGORIES
 */
export function GetPrintCategories(): MenuCategory[] {
  const menuCategories = db.prepare('SELECT * FROM PrintCategories').all()
  return menuCategories.map((menuCategory: any): MenuCategory => ({
    id: menuCategory.ID,
    name: menuCategory.Name,
    occurrences: GetPrintCategoryOccurrences(menuCategory.ID)
  }));
}

export function InsertPrintCategory(newEntry: MenuCategory): number {
  return db.prepare('INSERT INTO PrintCategories (Name)'
    + ' VALUES (@name)').run(newEntry).lastInsertRowid
}

export function UpdatePrintCategory(updatedEntry: MenuCategory): number {
  if (!updatedEntry.id) { // TODO does this error serve any purpose?
    throw new Error('UpdatePrintCategory called without a valid id');
  }
  return db.prepare('UPDATE PrintCategories SET Name = @name WHERE ID = @id')
    .run(updatedEntry).changes;
}

export function DeletePrintCategory(entryId: number): number {
  if (!entryId) {
    throw new Error('DeleteCategory called without a valid id');
  }
  const occurrences = GetPrintCategoryOccurrences(entryId)
  if (occurrences > 0)
    throw new RangeError(`Category with id ${entryId} is used and cannot be deleted`)
  else
    return db.prepare('DELETE FROM PrintCategories WHERE ID = ?').run(entryId).changes;
}

function GetPrintCategoryOccurrences(entryId: number): number {
  return db.prepare('SELECT COUNT(*) AS out FROM MenuEntries WHERE PrintCategoryID = ?').get(entryId).out ?? 0
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
export function GetMasterPin(): number {
  let pin = db.prepare('SELECT Value FROM Settings WHERE Key = ?').get('PIN')?.Value // TODO const labels for all settings
  if (pin === undefined)
    return 1234 // TODO const label for hardcoded default pin
  return parseInt(pin)
}

const settingJoinQuery = `SELECT
                            s.Key, 
                            s.Category, 
                            s.InputType, 
                            s.Value, 
                            s.DisplayName, 
                            s.Description, 
                            sc.ID AS CategoryID,
                            sc.Name AS CategoryName
                          FROM 
                            Settings s
                          INNER JOIN 
                            SettingCategories sc ON s.Category = sc.ID
`

export function GetServerSettings(): di.ServerSettings {
  // TODO: retrieve server settings from db
  const s = db.prepare('SELECT Server_Url AS ServerUrl, Wifi_SSID AS WifiSsid, Wifi_password AS WifiPwd FROM "ServerSettings"').get()
  if (s === undefined)
    return {
      serverUrl: null,
      wifi: null,
    }
  else
    return {
      serverUrl: s.ServerUrl,
      wifi: {
        ssid: s.WifiSsid,
        password: s.WifiPwd
      }
    }
}

export function GetAllSettings(): Setting[] {
  const sRaw = db.prepare(settingJoinQuery).all()
  return sRaw.map((s: any): Setting => ({
    key: s.Key,
    category: {
      id: s.CategoryID,
      name: s.CategoryName
    },
    inputType: s.InputType,
    value: s.Value,
    displayName: s.DisplayName,
    description: s.Description
  }));
}

export function GetSettingValuesByKey(key: string): Setting | null {
  const s = db.prepare(`${settingJoinQuery}
                        WHERE 
                          Key = ?`).get(key)
  if (s === undefined)
    return null

  return {
    key: s.Key,
    category: {
      id: s.CategoryID,
      name: s.CategoryName
    },
    inputType: s.InputType,
    value: s.Value,
    displayName: s.DisplayName,
    description: s.Description
  }
}

export function SetSettingValueByKey(settingMod: Setting): number {
  return db.prepare(`UPDATE 
                      Settings 
                    SET 
                      Key = @key,
                      Category = @category,
                      InputType = @inputType,
                      Value = @value,
                      DisplayName = @displayName,
                      Description = @description
                    WHERE 
                      ID = @id`)
    .run(settingMod).changes;
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

export function InsertPrinter(newEntry: Printer): number {
  const entryWithConvertedHidden = {
    ...newEntry,
    hidden: newEntry.hidden ? 1 : 0, // Convert hidden to integer
  };
  return db.prepare(
    'INSERT INTO Printers (Name, IP, Port, Hidden)'
    + ' VALUES (@name, @ip, @port, @hidden)')
    .run(entryWithConvertedHidden).lastInsertRowid
}

export function UpdatePrinter(updatedEntry: Printer): number {
  if (!updatedEntry.id) {
    throw new Error('UpdatePrinter called without a valid id');
  }
  const entryWithConvertedHidden = {
    ...updatedEntry,
    hidden: updatedEntry.hidden ? 1 : 0, // Convert hidden to integer
  };
  return db.prepare(
    'UPDATE Printers SET '
    + 'Name = @name, IP = @ip, '
    + 'Port = @port, Hidden = @hidden '
    + 'WHERE ID = @id')
    .run(entryWithConvertedHidden).changes;
}

export function DeletePrinter(entryId: number): number {
  if (!entryId) {
    throw new Error('DeletePrinter called without a valid id');
  }
  return db.prepare('DELETE FROM Printers WHERE ID = ?').run(entryId).changes;
}


