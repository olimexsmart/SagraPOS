import { InfoOrderEntryDTO, InfoOrdersDTO } from "@Interfaces/info-orders-dto"
import * as db from "./dbController";

export function GatherInfo(): InfoOrdersDTO {
    const iod: InfoOrdersDTO = {
        ordersTotal: db.GetOrdersTotal(),
        numOrders: db.GetOrdersNumber(),
        infoOrderEntries: []
    }
    // For each menu item compute some basic statistics
    const totalItems = db.GetOrdersTotalItems();
    if (totalItems !== 0) {
        const menuEntries = db.GetMenuEntryDTOs(); // Assuming this fetches all menu entries
        for (const me of menuEntries) {
            const quantitySold = db.GetOrdersTotalQuantityByEntry(me.id);
            const totalSold = quantitySold * me.price
            const ioe: InfoOrderEntryDTO = {
                menuEntryName: me.name,
                quantitySold: quantitySold,
                totalSold: totalSold,
                totalPercentage: quantitySold / totalItems,
                totalSoldPercentage: totalSold / iod.ordersTotal,
            }
            iod.infoOrderEntries.push(ioe);
        }
    }

    return iod;
}
