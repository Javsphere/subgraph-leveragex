import {
    LimitExecuted,
    MarketExecuted,
    OpenLimitCanceled,
} from "../generated/LeverageDiamond/LeverageDiamond";
import { saveTrade } from "./entity/trade";
import { saveOrderHistory } from "./entity/ordersHistory";
import { BigDecimal } from "@graphprotocol/graph-ts";

export function handleMarketExecuted(event: MarketExecuted): void {
    const params = event.params;
    const trade = saveTrade(
        params.t.user,
        params.t.index,
        params.t.pairIndex,
        BigDecimal.fromString(params.t.leverage.toString()),
        params.t.long,
        params.t.isOpen,
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
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
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
        params.t.isOpen,
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
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
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
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}
