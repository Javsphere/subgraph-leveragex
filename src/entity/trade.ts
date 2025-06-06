import { Trade } from "../../generated/schema";
import { Address, BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TOKEN_DECIMALS, WEI_E10_BD, WEI_E3_BD } from "../common";

export function getTrade(user: Address, index: BigInt): Trade | null {
    const tradeID = `${user.toHexString()}-${index}`;
    return Trade.load(tradeID);
}

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
    sl: BigDecimal,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): Trade {
    const tradeID = `${user.toHexString()}-${index}`;
    let trade = Trade.load(tradeID);
    if (!trade) {
        trade = new Trade(tradeID);
        trade.user = user;
        trade.index = index;
        trade.pairIndex = pairIndex;
        trade.long = long;
        trade.collateralIndex = collateralIndex;
        trade.tradeType = getTradeTypeByKey(tradeType);
        trade.openPrice = openPrice.div(WEI_E10_BD);

        trade.block = block;
        trade.tx = tx;
        trade.date = date;
    }

    trade.leverage = leverage.div(WEI_E3_BD);
    trade.collateralAmount = collateralAmount.div(TOKEN_DECIMALS[trade.collateralIndex]);
    trade.isOpen = isOpen;
    trade.tp = tp.div(WEI_E10_BD);
    trade.sl = sl.div(WEI_E10_BD);

    trade.save();

    return trade;
}

export function updateTrade(
    user: Address,
    index: BigInt,
    leverage: BigDecimal | null,
    collateralAmount: BigDecimal | null,
    openPrice: BigDecimal | null,
    tp: BigDecimal | null,
    sl: BigDecimal | null
): void {
    const tradeID = `${user.toHexString()}-${index}`;
    let trade = Trade.load(tradeID);
    if (!trade) {
        return;
    }
    if (leverage) {
        trade.leverage = leverage.div(WEI_E3_BD);
    }
    if (collateralAmount) {
        trade.collateralAmount = collateralAmount.div(TOKEN_DECIMALS[trade.collateralIndex]);
    }
    if (openPrice) {
        trade.openPrice = openPrice.div(WEI_E10_BD);
    }
    if (tp) {
        trade.tp = tp.div(WEI_E10_BD);
    }
    if (sl) {
        trade.sl = sl.div(WEI_E10_BD);
    }
    trade.save();
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
