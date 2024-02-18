export interface MenuEntry {
    id: number,
    categoryID: number,
    printCategoryID: number,
    name: string,
    price: number,
    inventory: number
}

export interface OrdersLog {
    total: number,
    time: string, // SQLite handles dates as strings
}

export interface OrderLogItem {
    orderID: number,
    menuEntryID: number,
    quantity: number,
}