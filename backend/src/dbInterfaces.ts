export interface MenuEntry {
    id: number,
    categoryID: number | null,
    printCategoryID: number | null,
    name: string,
    printingName: string | null
    price: number,
    inventory: number | null
}

export interface OrdersLog {
    time: string, // SQLite handles dates as strings
}

export interface OrderLogItem {
    orderID: number,
    name: string,
    price: number,
    quantity: number,
}

