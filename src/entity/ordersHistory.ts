import { OrdersHistory, Trade } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes, Address, log } from "@graphprotocol/graph-ts";
import {
    TOKEN_DECIMALS,
    WEI_E10_BD,
    WEI_E2_BD,
    WEI_E3_BD,
    WEI_E8_BD,
    ZERO_BD,
    ZERO_BI,
} from "../common";

export function saveOrderHistory(
    trade: Trade,
    open: boolean,
    leverage: BigDecimal,
    collateralAmount: BigDecimal,
    priceImpactP: BigDecimal,
    amountSentToTrader: BigDecimal | null,
    collateralPriceUsd: BigDecimal,
    price: BigDecimal,
    liqPrice: BigDecimal,
    closingFeeCollateralAmount: BigDecimal,
    orderType: i32,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    const orderHistoryID = `${trade.user.toHexString()}-${trade.index}-${date}`;
    let orderHistory = OrdersHistory.load(orderHistoryID);
    if (!orderHistory) {
        orderHistory = new OrdersHistory(orderHistoryID);
        orderHistory.trade = trade.id;
        orderHistory.borrowingFee = ZERO_BD;
    }
    if (amountSentToTrader) {
        amountSentToTrader = amountSentToTrader.div(TOKEN_DECIMALS[trade.collateralIndex]);
        const pnl = amountSentToTrader.minus(trade.collateralAmount);
        const pnlPercentage = pnl.div(trade.collateralAmount).times(WEI_E2_BD);
        orderHistory.pnl = pnl;
        orderHistory.pnlPercentage = pnlPercentage;
        orderHistory.amountSentToTrader = amountSentToTrader;
    } else {
        orderHistory.pnl = ZERO_BD;
        orderHistory.pnlPercentage = ZERO_BD;
        orderHistory.amountSentToTrader = ZERO_BD;
    }

    orderHistory.leverage = leverage.div(WEI_E3_BD);
    orderHistory.collateralAmount = collateralAmount.div(TOKEN_DECIMALS[trade.collateralIndex]);
    orderHistory.priceImpactP = priceImpactP.div(WEI_E10_BD);
    orderHistory.collateralPriceUsd = collateralPriceUsd.div(WEI_E8_BD);
    orderHistory.price = price.div(WEI_E10_BD);
    orderHistory.orderType = getOrderTypeByKey(orderType);
    orderHistory.open = open;
    orderHistory.liqPrice = liqPrice.div(WEI_E10_BD);
    orderHistory.closingFee = closingFeeCollateralAmount.div(TOKEN_DECIMALS[trade.collateralIndex]);

    orderHistory.block = block;
    orderHistory.tx = tx;
    orderHistory.date = date;

    orderHistory.save();
}

export function saveOrderHistoryBorrowingFees(
    user: Address,
    index: BigInt,
    collateralAmount: BigDecimal,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    const orderHistoryID = `${user.toHexString()}-${index}-${date}`;
    let orderHistory = OrdersHistory.load(orderHistoryID);
    if (!orderHistory) {
        orderHistory = new OrdersHistory(orderHistoryID);
        orderHistory.trade = `${user.toHexString()}-${index}`;
        orderHistory.borrowingFee = ZERO_BD;
        orderHistory.pnl = ZERO_BD;
        orderHistory.pnlPercentage = ZERO_BD;
        orderHistory.amountSentToTrader = ZERO_BD;
        orderHistory.leverage = ZERO_BD;
        orderHistory.collateralAmount = ZERO_BD;
        orderHistory.priceImpactP = ZERO_BD;
        orderHistory.collateralPriceUsd = ZERO_BD;
        orderHistory.price = ZERO_BD;
        orderHistory.orderType = ZERO_BI.toString();
        orderHistory.open = false;
        orderHistory.liqPrice = ZERO_BD;
        orderHistory.closingFee = ZERO_BD;
    }

    orderHistory.borrowingFee = orderHistory.borrowingFee.plus(collateralAmount);

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
        case 103:
            return "UPDATE_POSITION_SIZE";
        case 104:
            return "UPDATE_SL";
        case 105:
            return "UPDATE_TP";
        default:
            return "UNDEFINED";
    }
}
