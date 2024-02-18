export interface InfoOrdersDTO
{
    infoOrderEntries: InfoOrderEntryDTO[],
    ordersTotal: number,
    numOrders: number
}

export interface InfoOrderEntryDTO
{
    menuEntryName: string,
    quantitySold: number,
    totalSold: number,
    totalSoldPercentage: number,
    totalPercentage: number,
}