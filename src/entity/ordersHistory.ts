import { OrdersHistory, Trade } from "../../generated/schema";
import {BigDecimal, BigInt, Bytes, log} from "@graphprotocol/graph-ts";
import { WEI_E10_BD, WEI_E18_BD, WEI_E8_BD } from "../common";

export function saveOrderHistory(
    trade: Trade,
    open: boolean,
    priceImpactP: BigDecimal,
    amountSentToTrader: BigDecimal,
    collateralPriceUsd: BigDecimal,
    price: BigDecimal,
    orderType: i32,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    const orderHistoryID = `${trade.user.toHexString()}-${trade.index}`;
    let orderHistory = OrdersHistory.load(orderHistoryID);
    if (!orderHistory) {
        orderHistory = new OrdersHistory(orderHistoryID);
        orderHistory.trade = trade.id;
    }
    amountSentToTrader = amountSentToTrader.div(WEI_E18_BD)
    const pnl = amountSentToTrader.minus(trade.collateralAmount);
    const pnlPercentage = pnl
        .div(trade.collateralAmount)
        .times(BigDecimal.fromString("100"));
    orderHistory.pnl = pnl;
    orderHistory.pnlPercentage = pnlPercentage;
    orderHistory.priceImpactP = priceImpactP.div(WEI_E10_BD);
    orderHistory.amountSentToTrader = amountSentToTrader;
    orderHistory.collateralPriceUsd = collateralPriceUsd.div(WEI_E8_BD);
    orderHistory.price = price.div(WEI_E10_BD);
    orderHistory.orderType = getOrderTypeByKey(orderType);
    orderHistory.open = open;
    orderHistory.block = block;
    orderHistory.tx = tx;
    orderHistory.date = date;

    orderHistory.save();
}

function getOrderTypeByKey(key: i32): string {
    switch (key) {
        case 0:
            return "MARKET_OPEN";
        case 1:
            return "MARKET_CLOSE";
        case 2:
            return "LIMIT_OPEN";
        case 3:
            return "STOP_OPEN";
        case 4:
            return "TP_CLOSE";
        case 5:
            return "SL_CLOSE";
        case 6:
            return "LIQ_CLOSE";
        case 7:
            return "UPDATE_LEVERAGE";
        case 8:
            return "MARKET_PARTIAL_OPEN";
        case 9:
            return "MARKET_PARTIAL_CLOSE";
        case 100:
            return "USER_OPEN";
        case 101:
            return "USER_CANCEL";
        case 102:
            return "USER_CLOSE";
        default:
            return "UNDEFINED";
    }
}
