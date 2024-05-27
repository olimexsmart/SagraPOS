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
    total: number,
    time: string, // SQLite handles dates as strings
}

export interface OrderLogItem {
    orderID: number,
    menuEntryID: number,
    quantity: number,
}

export interface ServerSettings {
    serverUrl: string | null,
    wifi: Wifi | null
}

export interface Wifi {
    ssid: string | null,
    password: string | null,
}
