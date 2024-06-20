export function dbTableInit(db: any): void {
  // Categories
  db.prepare(`CREATE TABLE IF NOT EXISTS "Categories" (
    "ID"	INTEGER,
    "Name"	TEXT NOT NULL,
    "Ordering"	INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY("ID" AUTOINCREMENT)
  )`).run()
  // PrintCategories
  db.prepare(`CREATE TABLE IF NOT EXISTS "PrintCategories" (
    "ID"	INTEGER NOT NULL,
    "Name"	TEXT NOT NULL,
    "Ordering"	INTEGER NOT NULL DEFAULT 0,
    PRIMARY KEY("ID" AUTOINCREMENT)
  )`).run()
  // MenuEntries
  db.prepare(`CREATE TABLE IF NOT EXISTS "MenuEntries" (
    "ID"	INTEGER,
    "CategoryID"	INTEGER NOT NULL,
    "PrintCategoryID"	INTEGER NOT NULL,
    "Name"	TEXT NOT NULL,
    "PrintingName"	TEXT DEFAULT NULL,
    "Price"	REAL NOT NULL DEFAULT 0,
    "Image"	BLOB,
    "Inventory"	INTEGER,
    "Ordering"	INTEGER NOT NULL DEFAULT 0,
    "Hidden"	INTEGER NOT NULL DEFAULT 0,
    "PrintSequenceEnable"	INTEGER NOT NULL DEFAULT 1,
    FOREIGN KEY("CategoryID") REFERENCES "Categories"("ID"),
    FOREIGN KEY("PrintCategoryID") REFERENCES "PrintCategories"("ID"),
    PRIMARY KEY("ID" AUTOINCREMENT)
  )`).run()
  // OrdersLog
  db.prepare(`CREATE TABLE IF NOT EXISTS "OrdersLog" (
    "ID"	INTEGER,
    "Time"	TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "Code"	TEXT NOT NULL UNIQUE,
    PRIMARY KEY("ID")
  )`).run()
  // OrderLogItems
  db.prepare(`CREATE TABLE IF NOT EXISTS "OrderLogItems" (
    "ID"	INTEGER,
    "OrderID"	INTEGER NOT NULL,
    "Name"	TEXT NOT NULL,
    "Price"	REAL NOT NULL,
    "Quantity"	INTEGER NOT NULL,
    "Valid"	INTEGER NOT NULL DEFAULT 1,
    PRIMARY KEY("ID" AUTOINCREMENT),
    FOREIGN KEY("OrderID") REFERENCES "OrdersLog"("ID") on delete cascade
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
    "InputType"	TEXT,
    "Value"	TEXT,
    "DisplayName"	TEXT,
    "Description"	TEXT,
    FOREIGN KEY("Category") REFERENCES "SettingCategories"("ID") on delete cascade,
    PRIMARY KEY("Key")
  )`).run()
}