import { Trade } from "../../generated/schema";
import { Address, BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { WEI_E10_BD, WEI_E18_BD, WEI_E3_BD } from "../common";

export function saveTrade(
    user: Address,
    index: BigInt,
    pairIndex: i32,
    leverage: BigDecimal,
    long: boolean,
    isOpen: boolean,
    collateralIndex: i32,
    tradeType: i32,
    collateralAmount: BigDecimal,
    openPrice: BigDecimal,
    tp: BigDecimal,
    sl: BigDecimal
): Trade {
    const tradeID = `${user}-${pairIndex}-${index}`;
    let trade = Trade.load(tradeID);
    if (!trade) {
        trade = new Trade(tradeID);
        trade.user = user;
        trade.index = index;
        trade.pairIndex = pairIndex;
        trade.leverage = leverage.div(WEI_E3_BD);
        trade.long = long;
        trade.isOpen = isOpen;
        trade.collateralIndex = collateralIndex;
        trade.tradeType = getTradeTypeByKey(tradeType);
        trade.collateralAmount = collateralAmount.div(WEI_E18_BD);
        trade.openPrice = openPrice.div(WEI_E10_BD);
        trade.tp = tp.div(WEI_E10_BD);
        trade.sl = sl.div(WEI_E10_BD);
    }

    trade.isOpen = isOpen;

    trade.save();

    return trade;
}

function getTradeTypeByKey(key: i32): string {
    switch (key) {
        case 0:
            return "TRADE";
        case 1:
            return "LIMIT";
        case 2:
            return "STOP";
        default:
            return "UNDEFINED";
    }
}
