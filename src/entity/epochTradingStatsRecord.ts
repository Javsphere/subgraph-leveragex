import { EpochTradingStatsRecord } from "../../generated/schema";
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { dayWeekMonthYearFromTimestamp, EPOCH_TYPE, PROTOCOL, ZERO_BD } from "../common";
import { updatePointsOnClose } from "./epochTradingPointsRecord";

/**
 * @dev This function is called when a user opens a trade
 */
export class addOpenTradeStatsInput {
    collateralID: i32;
    address: string;
    pairIndex: i32;
    groupIndex: i32;
    positionSize: BigDecimal;
    timestamp: BigInt;
}
export function addOpenTradeStats(data: addOpenTradeStatsInput): void {
    const address = data.address;
    const pairIndex = data.pairIndex;
    const positionSize = data.positionSize;
    const timestamp = data.timestamp;
    const collateralID = data.collateralID;
    log.info("[addOpenTradeStats] address {} pairIndex {}, positionSize {}", [
        address,
        pairIndex.toString(),
        positionSize.toString(),
    ]);

    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    const weekID = `${date.year}-${date.week}`;

    // Daily stats
    const dailyStats = createOrLoadEpochTradingStatsRecord(
        address,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );

    _addOpenTradeStats(data, dailyStats);

    // Weekly stats
    const weeklyStats = createOrLoadEpochTradingStatsRecord(
        address,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    _addOpenTradeStats(data, weeklyStats, dailyStats.totalOpenedTrades == 1);

    // Daily protocol stats
    const dailyProtocolStats = createOrLoadEpochTradingStatsRecord(
        PROTOCOL,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    _addOpenTradeStats(data, dailyProtocolStats);

    // Weekly protocol stats
    const weeklyProtocolStats = createOrLoadEpochTradingStatsRecord(
        PROTOCOL,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    _addOpenTradeStats(data, weeklyProtocolStats, dailyProtocolStats.totalOpenedTrades == 1);
}

export class addCloseTradeStatsInput {
    collateralID: i32;
    address: string;
    pairIndex: i32;
    groupIndex: i32;
    positionSize: BigDecimal;
    pnl: BigDecimal;
    pnlPercentage: BigDecimal;
    timestamp: BigInt;
}

/**
 * @dev This function is called when a user closes a trade
 */
export function addCloseTradeStats(data: addCloseTradeStatsInput): void {
    const collateralID = data.collateralID;
    const address = data.address;
    const pairIndex = data.pairIndex;
    const positionSize = data.positionSize;
    const pnl = data.pnl;
    const pnlPercentage = data.pnlPercentage;
    const timestamp = data.timestamp;
    log.info(
        "[addCloseTradeStats] address {} pairIndex {}, positionSize {}, pnl {}, pnlPercentage {}",
        [
            address,
            pairIndex.toString(),
            positionSize.toString(),
            pnl.toString(),
            pnlPercentage.toString(),
        ]
    );

    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    const weekID = `${date.year}-${date.week}`;

    // Daily stats
    const dailyStats = createOrLoadEpochTradingStatsRecord(
        address,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    _addCloseTradeStats(data, dailyStats);

    // Weekly stats
    const weeklyStats = createOrLoadEpochTradingStatsRecord(
        address,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    _addCloseTradeStats(data, weeklyStats, dailyStats.totalClosedTrades == 1);

    // Daily protocol stats
    const dailyProtocolStats = createOrLoadEpochTradingStatsRecord(
        PROTOCOL,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    _addCloseTradeStats(data, dailyProtocolStats);

    // Weekly protocol stats
    const weeklyProtocolStats = createOrLoadEpochTradingStatsRecord(
        PROTOCOL,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    _addCloseTradeStats(data, weeklyProtocolStats, dailyProtocolStats.totalClosedTrades == 1);

    updatePointsOnClose(
        address,
        timestamp,
        collateralID,
        data.pnl,
        data.pnlPercentage,
        data.groupIndex,
        data.pairIndex,
        data.positionSize,
        weeklyStats
    );
}

/**
 * Internal handler for adding open trade stats
 */
function _addOpenTradeStats(
    data: addOpenTradeStatsInput,
    currentStats: EpochTradingStatsRecord,
    firstOpenedTrade: boolean = false
): EpochTradingStatsRecord {
    const pairIndex = data.pairIndex;
    const groupIndex = data.groupIndex;
    const positionSize = data.positionSize;

    // Make sure volume array is initialized and large enough for groupIndex
    const volumePerGroupArray = currentStats.totalVolumePerGroup;
    if (volumePerGroupArray.length <= groupIndex) {
        for (let i = volumePerGroupArray.length; i <= groupIndex; i++) {
            volumePerGroupArray.push(ZERO_BD);
        }
    }

    // Add volume to group
    volumePerGroupArray[groupIndex] = volumePerGroupArray[groupIndex].plus(positionSize);
    currentStats.totalVolumePerGroup = volumePerGroupArray;

    // Mark pair as traded if it's not already
    const pairsTradedArray = currentStats.pairsTraded;
    if (!pairsTradedArray.includes(pairIndex)) {
        pairsTradedArray.push(pairIndex);
        currentStats.pairsTraded = pairsTradedArray;
    }

    currentStats.totalOpenedTrades = currentStats.totalOpenedTrades + 1;

    if (firstOpenedTrade) {
        currentStats.totalDaysOpenedTrades = currentStats.totalDaysOpenedTrades + 1;
    }

    currentStats.save();
    return currentStats;
}

/**
 * Internal handler for adding close trade stats
 */
function _addCloseTradeStats(
    data: addCloseTradeStatsInput,
    currentStats: EpochTradingStatsRecord,
    firstClosedTrade: boolean = false
): EpochTradingStatsRecord {
    const pairIndex = data.pairIndex;
    const groupIndex = data.groupIndex;
    const positionSize = data.positionSize;
    const pnl = data.pnl;
    const pnlPercentage = data.pnlPercentage;

    // Make sure volume array is initialized and large enough for groupIndex
    const volumePerGroupArray = currentStats.totalVolumePerGroup;
    if (volumePerGroupArray.length <= groupIndex) {
        for (let i = volumePerGroupArray.length; i <= groupIndex; i++) {
            volumePerGroupArray.push(ZERO_BD);
        }
    }

    // Add volume to group
    volumePerGroupArray[groupIndex] = volumePerGroupArray[groupIndex].plus(positionSize);
    currentStats.totalVolumePerGroup = volumePerGroupArray;

    // Add pnl
    currentStats.totalPnl = currentStats.totalPnl.plus(pnl);

    // Add pnl percentage
    currentStats.totalPnlPercentage = currentStats.totalPnlPercentage.plus(pnlPercentage);

    // Mark pair as traded if it's not already
    const pairsTradedArray = currentStats.pairsTraded;
    if (!pairsTradedArray.includes(pairIndex)) {
        pairsTradedArray.push(pairIndex);
        currentStats.pairsTraded = pairsTradedArray;
    }

    currentStats.totalClosedTrades = currentStats.totalClosedTrades + 1;

    if (firstClosedTrade) {
        currentStats.totalDaysClosedTrades = currentStats.totalDaysClosedTrades + 1;
    }

    currentStats.save();
    return currentStats;
}

export function addBorrowingFeeStats(
    address: string,
    borrowingFee: BigDecimal,
    timestamp: BigInt,
    collateralID: i32
): EpochTradingStatsRecord[] {
    return _addStats(address, borrowingFee, timestamp, collateralID, "totalBorrowingFees");
}

export function addGovFeeStats(
    address: string,
    govFee: BigDecimal,
    timestamp: BigInt,
    collateralID: i32
): EpochTradingStatsRecord[] {
    return _addStats(address, govFee, timestamp, collateralID, "totalGovFees");
}

export function addReferralFeeStats(
    address: string,
    referralFee: BigDecimal,
    timestamp: BigInt,
    collateralID: i32
): EpochTradingStatsRecord[] {
    return _addStats(address, referralFee, timestamp, collateralID, "totalReferralFees");
}

export function addLpFeeStats(
    address: string,
    lpFee: BigDecimal,
    timestamp: BigInt,
    collateralID: i32
): EpochTradingStatsRecord[] {
    return _addStats(address, lpFee, timestamp, collateralID, "totalLpFees");
}

export function addStakerFeeStats(
    address: string,
    stakerFee: BigDecimal,
    timestamp: BigInt,
    collateralID: i32
): EpochTradingStatsRecord[] {
    return _addStats(address, stakerFee, timestamp, collateralID, "totalStakerFees");
}

function _addStats(
    address: string,
    stat: BigDecimal,
    timestamp: BigInt,
    collateralID: i32,
    statName: string
): EpochTradingStatsRecord[] {
    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    const weekID = `${date.year}-${date.week}`;

    let dailyStats = createOrLoadEpochTradingStatsRecord(
        address,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    dailyStats = _addStat(stat, statName, dailyStats);

    let weeklyStats = createOrLoadEpochTradingStatsRecord(
        address,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    weeklyStats = _addStat(stat, statName, weeklyStats);

    let dailyProtocolStats = createOrLoadEpochTradingStatsRecord(
        PROTOCOL,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    dailyProtocolStats = _addStat(stat, statName, dailyProtocolStats);

    let weeklyProtocolStats = createOrLoadEpochTradingStatsRecord(
        PROTOCOL,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    weeklyProtocolStats = _addStat(stat, statName, weeklyProtocolStats);

    dailyStats.save();
    weeklyStats.save();
    dailyProtocolStats.save();
    weeklyProtocolStats.save();

    return [dailyStats, weeklyStats, dailyProtocolStats, weeklyProtocolStats];
}

function _addStat(
    stat: BigDecimal,
    statName: string,
    currentStats: EpochTradingStatsRecord
): EpochTradingStatsRecord {
    if (statName == "totalBorrowingFees") {
        currentStats.totalBorrowingFees = currentStats.totalBorrowingFees.plus(stat);
    } else if (statName == "totalGovFees") {
        currentStats.totalGovFees = currentStats.totalGovFees.plus(stat);
    } else if (statName == "totalReferralFees") {
        currentStats.totalReferralFees = currentStats.totalReferralFees.plus(stat);
    } else if (statName == "totalLpFees") {
        currentStats.totalLpFees = currentStats.totalLpFees.plus(stat);
    } else if (statName == "totalStakerFees") {
        currentStats.totalStakerFees = currentStats.totalStakerFees.plus(stat);
    }

    return currentStats;
}

export function generateAggregateTradingStatsId(
    address: string,
    epochType: string,
    dateID: string,
    collateral: i32
): string {
    return address + "-" + epochType + "-" + dateID + "-" + collateral.toString();
}

export function createOrLoadEpochTradingStatsRecord(
    address: string,
    epochType: string,
    dateID: string,
    collateralID: i32,
    save: boolean
): EpochTradingStatsRecord {
    log.info(
        "[createOrLoadEpochTradingStatsRecord] address {}, epochType {}, epochNumber {}, collateral {}",
        [address, epochType.toString(), dateID, collateralID.toString()]
    );
    const id = generateAggregateTradingStatsId(address, epochType, dateID, collateralID);
    let epochTradingStatsRecord = EpochTradingStatsRecord.load(id);
    if (epochTradingStatsRecord == null) {
        epochTradingStatsRecord = new EpochTradingStatsRecord(id);
        epochTradingStatsRecord.address = address;
        epochTradingStatsRecord.date = dateID;
        epochTradingStatsRecord.epochType = epochType;
        epochTradingStatsRecord.collateralID = collateralID;
        epochTradingStatsRecord.totalVolumePerGroup = [];
        epochTradingStatsRecord.totalBorrowingFees = ZERO_BD;
        epochTradingStatsRecord.pairsTraded = [];
        epochTradingStatsRecord.totalPnl = ZERO_BD;
        epochTradingStatsRecord.totalPnlPercentage = ZERO_BD;
        // Add govFees, referralFees, triggerFees, lpFees, stakerFees
        epochTradingStatsRecord.totalGovFees = ZERO_BD;
        epochTradingStatsRecord.totalReferralFees = ZERO_BD;
        epochTradingStatsRecord.totalLpFees = ZERO_BD;
        epochTradingStatsRecord.totalStakerFees = ZERO_BD;
        epochTradingStatsRecord.totalOpenedTrades = 0;
        epochTradingStatsRecord.totalClosedTrades = 0;
        epochTradingStatsRecord.totalDaysOpenedTrades = 0;
        epochTradingStatsRecord.totalDaysClosedTrades = 0;

        if (save) {
            epochTradingStatsRecord.save();
        }
    }
    return epochTradingStatsRecord as EpochTradingStatsRecord;
}
