export interface OrdersInfo
{
    grossProfit: number,
    numberOfOrders: number
    infoByEntry: OrdersInfoEntry[],
}

export interface OrdersInfoEntry
{
    menuEntryName: string,
    numberSold: number,
    grossProfit: number,
}