import {
    LeverageUpdateExecuted,
    LimitExecuted,
    MarketExecuted,
    OpenLimitCanceled,
    PositionSizeDecreaseExecuted,
    PositionSizeIncreaseExecuted,
    TradePositionUpdated,
} from "../generated/LeverageDiamond/LeverageDiamond";
import { saveTrade, updateTrade } from "./entity/trade";
import { saveOrderHistory } from "./entity/ordersHistory";
import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { savePairsStatistic } from "./entity/pairsStatistics";

export function handleMarketExecuted(event: MarketExecuted): void {
    const params = event.params;
    const trade = saveTrade(
        params.t.user,
        params.t.index,
        params.t.pairIndex,
        BigDecimal.fromString(params.t.leverage.toString()),
        params.t.long,
        params.open,
        params.t.collateralIndex,
        params.t.tradeType,
        BigDecimal.fromString(params.t.collateralAmount.toString()),
        BigDecimal.fromString(params.t.openPrice.toString()),
        BigDecimal.fromString(params.t.tp.toString()),
        BigDecimal.fromString(params.t.sl.toString()),
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );

    saveOrderHistory(
        trade,
        params.open,
        new BigDecimal(params.priceImpactP),
        new BigDecimal(params.percentProfit),
        new BigDecimal(params.amountSentToTrader),
        new BigDecimal(params.collateralPriceUsd),
        new BigDecimal(params.price),
        params.open ? 100 : 102,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
    savePairsStatistic(
        BigInt.fromI32(params.t.collateralIndex),
        BigInt.fromI32(params.t.pairIndex),
        params.t.long,
        params.open
    );
}

export function handleLimitExecuted(event: LimitExecuted): void {
    const params = event.params;
    const trade = saveTrade(
        params.t.user,
        params.t.index,
        params.t.pairIndex,
        BigDecimal.fromString(params.t.leverage.toString()),
        params.t.long,
        params.exactExecution,
        params.t.collateralIndex,
        params.t.tradeType,
        BigDecimal.fromString(params.t.collateralAmount.toString()),
        BigDecimal.fromString(params.t.openPrice.toString()),
        BigDecimal.fromString(params.t.tp.toString()),
        BigDecimal.fromString(params.t.sl.toString()),
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );

    saveOrderHistory(
        trade,
        params.exactExecution,
        new BigDecimal(params.priceImpactP),
        new BigDecimal(params.percentProfit),
        new BigDecimal(params.amountSentToTrader),
        new BigDecimal(params.collateralPriceUsd),
        new BigDecimal(params.price),
        params.orderType,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
    savePairsStatistic(
        BigInt.fromI32(params.t.collateralIndex),
        BigInt.fromI32(params.t.pairIndex),
        params.t.long,
        params.exactExecution
    );
}

export function handleOpenLimitCanceled(event: OpenLimitCanceled): void {
    const params = event.params;
    const trade = saveTrade(
        params.trader,
        params.index,
        params.pairIndex,
        BigDecimal.fromString("0"),
        false,
        false,
        0,
        0,
        BigDecimal.fromString("0"),
        BigDecimal.fromString("0"),
        BigDecimal.fromString("0"),
        BigDecimal.fromString("0"),
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );

    saveOrderHistory(
        trade,
        false,
        BigDecimal.fromString("0"),
        BigDecimal.fromString("0"),
        trade.collateralAmount,
        BigDecimal.fromString("0"),
        BigDecimal.fromString("0"),
        101,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );

    savePairsStatistic(
        BigInt.fromI32(trade.collateralIndex),
        BigInt.fromI32(trade.pairIndex),
        trade.long,
        false
    );
}

export function handleTradePositionUpdated(event: TradePositionUpdated): void {}

export function handleLeverageUpdateExecuted(event: LeverageUpdateExecuted): void {
    const params = event.params;
    updateTrade(
        params.trader,
        params.index,
        params.pairIndex,
        new BigDecimal(params.values.newLeverage),
        new BigDecimal(params.values.newCollateralAmount),
        null
    );
}

export function handlePositionSizeIncreaseExecuted(event: PositionSizeIncreaseExecuted): void {
    const params = event.params;
    updateTrade(
        params.trader,
        params.index,
        params.pairIndex,
        new BigDecimal(params.values.newLeverage),
        new BigDecimal(params.values.newCollateralAmount),
        new BigDecimal(params.values.newOpenPrice)
    );
}

export function handlePositionSizeDecreaseExecuted(event: PositionSizeDecreaseExecuted): void {
    const params = event.params;
    updateTrade(
        params.trader,
        params.index,
        params.pairIndex,
        BigDecimal.fromString(params.values.newLeverage.toString()),
        new BigDecimal(params.values.newCollateralAmount),
        null
    );
}
