import {
    BorrowingFeeCharged,
    BorrowingProviderFeeCharged,
    GovFeeCharged,
    LeverageUpdateExecuted,
    LimitExecuted,
    MarketExecuted,
    OpenLimitCanceled,
    OpenOrderPlaced,
    PositionSizeDecreaseExecuted,
    PositionSizeIncreaseExecuted,
    ReferralFeeCharged,
    RewardsFeeCharged,
    TradePositionUpdated,
    TradeSlUpdated,
    TradeTpUpdated,
} from "../generated/LeverageDiamond/LeverageDiamond";
import { saveTrade, updateTrade } from "./entity/trade";
import { saveOrderHistory } from "./entity/ordersHistory";
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { savePairsStatistic } from "./entity/pairsStatistics";
import { updateFeeBasedPoints } from "./entity/epochTradingPointsRecord";
import { getGroupIndex, TOKEN_DECIMALS, WEI_E3_BD } from "./common";
import {
    addBorrowingFeeStats,
    addCloseTradeStats,
    addGovFeeStats,
    addLpFeeStats,
    addOpenTradeStats,
    addReferralFeeStats,
    addStakerFeeStats,
} from "./entity/epochTradingStatsRecord";
import { closeOpenOrder, saveOpenOrder } from "./entity/openOrders";

export function handleMarketExecuted(event: MarketExecuted): void {
    const params = event.params;
    const leverage = BigDecimal.fromString(params.t.leverage.toString()).div(WEI_E3_BD);
    const amount = BigDecimal.fromString(params.t.collateralAmount.toString()).div(
        TOKEN_DECIMALS[params.t.collateralIndex]
    );
    const volume = amount.times(leverage);
    const groupIndex = getGroupIndex(BigInt.fromI32(params.t.pairIndex));

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

    if (params.open) {
        addOpenTradeStats({
            collateralID: params.t.collateralIndex,
            address: params.t.user.toHexString(),
            pairIndex: params.t.pairIndex,
            groupIndex: groupIndex.toI32(),
            positionSize: volume,
            leverage: leverage,
            timestamp: event.block.timestamp,
        });
    } else {
        const pnl = BigDecimal.fromString(params.amountSentToTrader.toString())
            .div(TOKEN_DECIMALS[params.t.collateralIndex])
            .minus(trade.collateralAmount);
        addCloseTradeStats({
            collateralID: params.t.collateralIndex,
            address: params.t.user.toHexString(),
            pairIndex: params.t.pairIndex,
            groupIndex: groupIndex.toI32(),
            positionSize: volume,
            pnl: pnl,
            tradedAmount: trade.collateralAmount,
            timestamp: event.block.timestamp,
        });
    }
}

export function handleLimitExecuted(event: LimitExecuted): void {
    const params = event.params;
    const leverage = BigDecimal.fromString(params.t.leverage.toString()).div(WEI_E3_BD);
    const amount = BigDecimal.fromString(params.t.collateralAmount.toString()).div(
        TOKEN_DECIMALS[params.t.collateralIndex]
    );
    const volume = amount.times(leverage);
    const orderType = params.orderType;
    const groupIndex = getGroupIndex(BigInt.fromI32(params.t.pairIndex));

    const isOpen = params.percentProfit == new BigInt(0) && params.orderType != 6;

    closeOpenOrder(params.orderId.user, params.orderId.index, event.transaction.hash);

    const trade = saveTrade(
        params.t.user,
        params.t.index,
        params.t.pairIndex,
        BigDecimal.fromString(params.t.leverage.toString()),
        params.t.long,
        isOpen,
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
        isOpen,
        new BigDecimal(params.priceImpactP),
        new BigDecimal(params.amountSentToTrader),
        new BigDecimal(params.collateralPriceUsd),
        new BigDecimal(params.price),
        orderType,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
    savePairsStatistic(
        BigInt.fromI32(params.t.collateralIndex),
        BigInt.fromI32(params.t.pairIndex),
        params.t.long,
        isOpen
    );

    if (orderType == 0 || orderType == 2 || orderType == 3) {
        addOpenTradeStats({
            collateralID: params.t.collateralIndex,
            address: params.t.user.toHexString(),
            pairIndex: params.t.pairIndex,
            groupIndex: groupIndex.toI32(),
            positionSize: volume,
            leverage: leverage,
            timestamp: event.block.timestamp,
        });
    } else {
        const pnl = BigDecimal.fromString(params.amountSentToTrader.toString())
            .div(TOKEN_DECIMALS[params.t.collateralIndex])
            .minus(trade.collateralAmount);
        addCloseTradeStats({
            collateralID: params.t.collateralIndex,
            address: params.t.user.toHexString(),
            pairIndex: params.t.pairIndex,
            groupIndex: groupIndex.toI32(),
            positionSize: volume,
            pnl: pnl,
            tradedAmount: trade.collateralAmount,
            timestamp: event.block.timestamp,
        });
    }
}

export function handleOpenLimitCanceled(event: OpenLimitCanceled): void {
    const params = event.params;

    closeOpenOrder(params.trader, params.index, event.transaction.hash);
}

export function handleTradePositionUpdated(event: TradePositionUpdated): void {}

export function handleLeverageUpdateExecuted(event: LeverageUpdateExecuted): void {
    const params = event.params;
    updateTrade(
        params.trader,
        params.index,
        new BigDecimal(params.values.newLeverage),
        new BigDecimal(params.values.newCollateralAmount),
        null,
        null,
        null
    );
}

export function handlePositionSizeIncreaseExecuted(event: PositionSizeIncreaseExecuted): void {
    const params = event.params;
    const volume = BigDecimal.fromString(params.values.positionSizeCollateralDelta.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );
    const groupIndex = getGroupIndex(params.pairIndex);

    updateTrade(
        params.trader,
        params.index,
        new BigDecimal(params.values.newLeverage),
        new BigDecimal(params.values.newCollateralAmount),
        new BigDecimal(params.values.newOpenPrice),
        null,
        null
    );

    addOpenTradeStats({
        collateralID: params.collateralIndex,
        address: params.trader.toHexString(),
        pairIndex: params.pairIndex.toI32(),
        groupIndex: groupIndex.toI32(),
        positionSize: volume,
        leverage: BigDecimal.fromString(params.values.newLeverage.toString()).div(WEI_E3_BD),
        timestamp: event.block.timestamp,
    });
}

export function handlePositionSizeDecreaseExecuted(event: PositionSizeDecreaseExecuted): void {
    const params = event.params;
    const volume = BigDecimal.fromString(params.values.positionSizeCollateralDelta.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );
    const groupIndex = getGroupIndex(params.pairIndex);

    updateTrade(
        params.trader,
        params.index,
        BigDecimal.fromString(params.values.newLeverage.toString()),
        new BigDecimal(params.values.newCollateralAmount),
        null,
        null,
        null
    );

    const totalFees = params.values.gnsStakingFeeCollateral
        .plus(params.values.vaultFeeCollateral)
        .plus(params.values.borrowingFeeCollateral);
    const pnlWithFees = params.values.existingPnlCollateral
        .times(params.values.positionSizeCollateralDelta)
        .div(params.values.existingPositionSizeCollateral);

    const levDelta =
        params.leverageDelta != BigInt.fromI32(0)
            ? params.leverageDelta
            : BigInt.fromI32(params.values.newLeverage);
    const leverage_raw = BigDecimal.fromString(levDelta.toString());
    const leverage = leverage_raw.div(WEI_E3_BD);
    const initialCollateral = BigDecimal.fromString(
        params.values.positionSizeCollateralDelta.toString()
    )
        .div(TOKEN_DECIMALS[params.collateralIndex])
        .div(leverage);

    const pnl = BigDecimal.fromString(pnlWithFees.minus(totalFees).toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );

    addCloseTradeStats({
        collateralID: params.collateralIndex,
        address: params.trader.toHexString(),
        pairIndex: params.pairIndex.toI32(),
        groupIndex: groupIndex.toI32(),
        positionSize: volume,
        pnl: pnl,
        tradedAmount: initialCollateral,
        timestamp: event.block.timestamp,
    });
}

export function handleTradeSlUpdated(event: TradeSlUpdated): void {
    const params = event.params;
    updateTrade(
        params.tradeId.user,
        params.tradeId.index,
        null,
        null,
        null,
        null,
        BigDecimal.fromString(params.newSl.toString())
    );
}

export function handleTradeTpUpdated(event: TradeTpUpdated): void {
    const params = event.params;
    updateTrade(
        params.tradeId.user,
        params.tradeId.index,
        null,
        null,
        null,
        BigDecimal.fromString(params.newTp.toString()),
        null
    );
}

export function handleGovFeeCharged(event: GovFeeCharged): void {
    const params = event.params;
    const trader = event.params.trader.toHexString();
    const govFee = BigDecimal.fromString(params.amountCollateral.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );

    log.info("[handleGovFeeCharged] {}", [event.transaction.hash.toHexString()]);
    addGovFeeStats(trader, govFee, event.block.timestamp, params.collateralIndex);

    updateFeeBasedPoints(trader, govFee, event.block.timestamp, params.collateralIndex);
}

export function handleReferralFeeCharged(event: ReferralFeeCharged): void {
    const params = event.params;
    const trader = event.params.trader.toHexString();
    const referralFee = BigDecimal.fromString(params.amountCollateral.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );

    addReferralFeeStats(trader, referralFee, event.block.timestamp, params.collateralIndex);

    updateFeeBasedPoints(trader, referralFee, event.block.timestamp, params.collateralIndex);
}

export function handleRewardsFeeCharged(event: RewardsFeeCharged): void {
    const params = event.params;
    const trader = event.params.trader.toHexString();
    const rewardsFee = BigDecimal.fromString(params.amountCollateral.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );

    addStakerFeeStats(trader, rewardsFee, event.block.timestamp, params.collateralIndex);
    updateFeeBasedPoints(trader, rewardsFee, event.block.timestamp, params.collateralIndex);
}

export function handleBorrowingProviderFeeCharged(event: BorrowingProviderFeeCharged): void {
    const params = event.params;
    const trader = event.params.trader.toHexString();
    const lpFee = BigDecimal.fromString(params.amountCollateral.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );

    addLpFeeStats(trader, lpFee, event.block.timestamp, params.collateralIndex);
    updateFeeBasedPoints(trader, lpFee, event.block.timestamp, params.collateralIndex);
}

export function handleBorrowingFeeCharged(event: BorrowingFeeCharged): void {
    const params = event.params;
    const borrowingFee = BigDecimal.fromString(params.amountCollateral.toString()).div(
        TOKEN_DECIMALS[params.collateralIndex]
    );

    addBorrowingFeeStats(
        params.trader.toHexString(),
        borrowingFee,
        event.block.timestamp,
        params.collateralIndex
    );
}

export function handleOpenOrderPlaced(event: OpenOrderPlaced): void {
    const params = event.params;
    saveOpenOrder(
        params.trader,
        params.index,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}
