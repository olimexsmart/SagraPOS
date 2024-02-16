export interface InfoOrders
{
    infoOrderEntries: InfoOrderEntry[],
    ordersTotal: number,
    numOrders: number
}

export interface InfoOrderEntry
{
    menuEntryName: string,
    quantitySold: number,
    totalSold: number,
    totalSoldPercentage: number,
    totalPercentage: number,
}