import { OrdersHistory, Trade } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { WEI_E10_BD, WEI_E18_BD, WEI_E8_BD } from "../common";

export function saveOrderHistory(
    trade: Trade,
    open: boolean,
    priceImpactP: BigDecimal,
    percentProfit: BigDecimal,
    amountSentToTrader: BigDecimal,
    collateralPriceUsd: BigDecimal,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    const orderHistoryID = `${trade.user.toHexString()}-${trade.index}`;
    let orderHistory = OrdersHistory.load(orderHistoryID);
    if (!orderHistory) {
        orderHistory = new OrdersHistory(orderHistoryID);
        orderHistory.trade = trade.id;
        orderHistory.open = open;
        orderHistory.priceImpactP = priceImpactP.div(WEI_E10_BD);
        orderHistory.percentProfit = percentProfit.div(WEI_E10_BD);
        orderHistory.amountSentToTrader = amountSentToTrader.div(WEI_E18_BD);
        orderHistory.collateralPriceUsd = collateralPriceUsd.div(WEI_E8_BD);
        orderHistory.block = block;
        orderHistory.tx = tx;
        orderHistory.date = date;
    }

    orderHistory.percentProfit = percentProfit.div(WEI_E10_BD);
    orderHistory.amountSentToTrader = amountSentToTrader.div(WEI_E18_BD);
    orderHistory.collateralPriceUsd = collateralPriceUsd.div(WEI_E8_BD);

    orderHistory.save();
}
