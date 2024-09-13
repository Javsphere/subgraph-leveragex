import { EpochTradingPointsRecord, EpochTradingStatsRecord } from "../../generated/schema";
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
    dayWeekMonthYearFromTimestamp,
    EPOCH_TYPE,
    ONE_BD,
    PROTOCOL,
    VOLUME_THRESHOLDS,
    ZERO_BD,
} from "../common";

export const TOTAL_CLOSED_TRADES_THRESHOLD_RELATIVE = 5;
export const TOTAL_CLOSED_DAYS_THRESHOLD_RELATIVE = 2;
export const TOTAL_CLOSED_TRADES_THRESHOLD_ABSOLUTE = 3;
export const TOTAL_CLOSED_DAYS_THRESHOLD_ABSOLUTE = 2;

function isTraderEligibleForRelativeSkillPoints(weeklyStats: EpochTradingStatsRecord): boolean {
    return (
        weeklyStats.totalClosedTrades >= TOTAL_CLOSED_TRADES_THRESHOLD_RELATIVE &&
        weeklyStats.totalDaysClosedTrades >= TOTAL_CLOSED_DAYS_THRESHOLD_RELATIVE
    );
}

function isTraderEligibleForAbsoluteSkillPoints(weeklyStats: EpochTradingStatsRecord): boolean {
    return (
        weeklyStats.totalClosedTrades >= TOTAL_CLOSED_TRADES_THRESHOLD_ABSOLUTE &&
        weeklyStats.totalDaysClosedTrades >= TOTAL_CLOSED_DAYS_THRESHOLD_ABSOLUTE
    );
}

export function updatePointsOnClose(
    address: string,
    timestamp: BigInt,
    collateralID: i32,
    pnl: BigDecimal,
    pnlPercentage: BigDecimal,
    groupNumber: i32,
    pairNumber: i32,
    volume: BigDecimal,
    weeklyStats: EpochTradingStatsRecord
): void {
    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    const weekID = `${date.year}-${date.week}`;
    // load all 4 entries: UserDaily, ProtocolDaily, UserWeekly, ProtocolWeekly
    const userDailyPoints = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    const protocolDailyPoints = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );
    const userWeeklyPoints = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );
    const protocolWeeklyPoints = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );

    if (isTraderEligibleForAbsoluteSkillPoints(weeklyStats)) {
        updateAbsoluteSkillPoints(
            userDailyPoints,
            protocolDailyPoints,
            userWeeklyPoints,
            protocolWeeklyPoints,
            !userWeeklyPoints.isAbsSkillEligible ? weeklyStats.totalPnl : pnl // if trader just became eligible, use totalPnl
        );
    }
    // Determine if trader is eligible yet for relative skill points
    if (isTraderEligibleForRelativeSkillPoints(weeklyStats)) {
        updateRelativeSkillPoints(
            userDailyPoints,
            protocolDailyPoints,
            userWeeklyPoints,
            protocolWeeklyPoints,
            !userWeeklyPoints.isRelSkillEligible // if trader just became eligible, use totalPnlPercentage
                ? weeklyStats.totalPnlPercentage
                : pnlPercentage
        );
    }

    updateDiversityPoints(
        userDailyPoints,
        protocolDailyPoints,
        userWeeklyPoints,
        protocolWeeklyPoints,
        groupNumber,
        pairNumber,
        volume
    );
}

export function updateAbsoluteSkillPoints(
    userDailyPoints: EpochTradingPointsRecord,
    protocolDailyPoints: EpochTradingPointsRecord,
    userWeeklyPoints: EpochTradingPointsRecord,
    protocolWeeklyPoints: EpochTradingPointsRecord,
    pnl: BigDecimal
): void {
    let userDailySkillPoints =
        userDailyPoints.pnl.plus(pnl) > ZERO_BD ? userDailyPoints.pnl.plus(pnl) : ZERO_BD;
    let userWeeklySkillPoints =
        userWeeklyPoints.pnl.plus(pnl) > ZERO_BD ? userWeeklyPoints.pnl.plus(pnl) : ZERO_BD;
    let protocolDailySkillPoints = calculateSkillPoints(
        userDailyPoints,
        protocolDailyPoints,
        pnl,
        true
    );
    let protocolWeeklySkillPoints = calculateSkillPoints(
        userWeeklyPoints,
        protocolWeeklyPoints,
        pnl,
        true
    );

    // update pnls
    userDailyPoints.pnl = userDailyPoints.pnl.plus(pnl);
    protocolDailyPoints.pnl = protocolDailyPoints.pnl.plus(pnl);
    userWeeklyPoints.pnl = userWeeklyPoints.pnl.plus(pnl);
    protocolWeeklyPoints.pnl = protocolWeeklyPoints.pnl.plus(pnl);

    // update skill points
    userDailyPoints.absSkillPoints = userDailySkillPoints;
    protocolDailyPoints.absSkillPoints = protocolDailySkillPoints;
    userWeeklyPoints.absSkillPoints = userWeeklySkillPoints;
    protocolWeeklyPoints.absSkillPoints = protocolWeeklySkillPoints;

    userWeeklyPoints.isAbsSkillEligible = true;
    userDailyPoints.isAbsSkillEligible = true;

    // Saving all the entities
    userDailyPoints.save();
    protocolDailyPoints.save();
    userWeeklyPoints.save();
    protocolWeeklyPoints.save();
}

export function updateRelativeSkillPoints(
    userDailyPoints: EpochTradingPointsRecord,
    protocolDailyPoints: EpochTradingPointsRecord,
    userWeeklyPoints: EpochTradingPointsRecord,
    protocolWeeklyPoints: EpochTradingPointsRecord,
    pnlPercentage: BigDecimal
): void {
    let userDailySkillPoints =
        userDailyPoints.pnlPercentage.plus(pnlPercentage) > ZERO_BD
            ? userDailyPoints.pnlPercentage.plus(pnlPercentage)
            : ZERO_BD;
    let userWeeklySkillPoints =
        userWeeklyPoints.pnlPercentage.plus(pnlPercentage) > ZERO_BD
            ? userWeeklyPoints.pnlPercentage.plus(pnlPercentage)
            : ZERO_BD;
    let protocolDailySkillPoints = calculateSkillPoints(
        userDailyPoints,
        protocolDailyPoints,
        pnlPercentage,
        false
    );
    let protocolWeeklySkillPoints = calculateSkillPoints(
        userWeeklyPoints,
        protocolWeeklyPoints,
        pnlPercentage,
        false
    );

    // update pnls
    userDailyPoints.pnlPercentage = userDailyPoints.pnlPercentage.plus(pnlPercentage);
    protocolDailyPoints.pnlPercentage = protocolDailyPoints.pnlPercentage.plus(pnlPercentage);
    userWeeklyPoints.pnlPercentage = userWeeklyPoints.pnlPercentage.plus(pnlPercentage);
    protocolWeeklyPoints.pnlPercentage = protocolWeeklyPoints.pnlPercentage.plus(pnlPercentage);

    // update skill points
    userDailyPoints.relSkillPoints = userDailySkillPoints;
    protocolDailyPoints.relSkillPoints = protocolDailySkillPoints;
    userWeeklyPoints.relSkillPoints = userWeeklySkillPoints;
    protocolWeeklyPoints.relSkillPoints = protocolWeeklySkillPoints;

    userWeeklyPoints.isRelSkillEligible = true;
    userDailyPoints.isRelSkillEligible = true;

    // Saving all the entities
    userDailyPoints.save();
    protocolDailyPoints.save();
    userWeeklyPoints.save();
    protocolWeeklyPoints.save();
}

export function updateDiversityPoints(
    userDailyPoints: EpochTradingPointsRecord,
    protocolDailyPoints: EpochTradingPointsRecord,
    userWeeklyPoints: EpochTradingPointsRecord,
    protocolWeeklyPoints: EpochTradingPointsRecord,
    groupNumber: i32,
    pairNumber: i32,
    volume: BigDecimal
): void {
    let groupId = 0;
    let volumeThreshold = ZERO_BD;
    if (groupNumber == 0 && (pairNumber == 0 || pairNumber == 1)) {
        groupId = 0;
    } else if (groupNumber == 0 && pairNumber > 1) {
        groupId = 1;
    } else if (groupNumber == 1 || groupNumber == 8 || groupNumber == 9) {
        groupId = 2;
    } else if (groupNumber == 6 || groupNumber == 7) {
        groupId = 3;
    } else {
        groupId = 4;
    }

    if (groupId < 4) {
        volumeThreshold = VOLUME_THRESHOLDS[groupId];
        if (volume.ge(volumeThreshold) && userWeeklyPoints.groupsTraded[groupId] == ZERO_BD) {
            userDailyPoints.groupsTraded[groupId] = ONE_BD;
            protocolDailyPoints.groupsTraded[groupId] = ONE_BD;
            userWeeklyPoints.groupsTraded[groupId] = ONE_BD;
            protocolWeeklyPoints.groupsTraded[groupId] = ONE_BD;

            userDailyPoints.diversityPoints = userDailyPoints.diversityPoints.plus(ONE_BD);
            protocolDailyPoints.diversityPoints = protocolDailyPoints.diversityPoints.plus(ONE_BD);
            userWeeklyPoints.diversityPoints = userWeeklyPoints.diversityPoints.plus(ONE_BD);
            protocolWeeklyPoints.diversityPoints =
                protocolWeeklyPoints.diversityPoints.plus(ONE_BD);

            // Saving all the entities
            userDailyPoints.save();
            protocolDailyPoints.save();
            userWeeklyPoints.save();
            protocolWeeklyPoints.save();
        }
    }
}

export function calculateSkillPoints(
    userStat: EpochTradingPointsRecord,
    protocolStat: EpochTradingPointsRecord,
    pnl: BigDecimal,
    absolute: boolean
): BigDecimal {
    let userOldPnl = absolute ? userStat.pnl : userStat.pnlPercentage;
    let userNewPnl = userOldPnl.plus(pnl);
    let protocolOldPts = absolute ? protocolStat.absSkillPoints : protocolStat.relSkillPoints;
    let protocolNewPts = ZERO_BD;

    if (userNewPnl > ZERO_BD && userOldPnl > ZERO_BD) {
        protocolNewPts = protocolOldPts.minus(userOldPnl).plus(userNewPnl);
    } else if (userNewPnl > ZERO_BD && userOldPnl <= ZERO_BD) {
        protocolNewPts = protocolOldPts.plus(userNewPnl);
    } else if (userNewPnl < ZERO_BD && userOldPnl > ZERO_BD) {
        protocolNewPts = protocolOldPts.minus(userOldPnl);
    } else {
        protocolNewPts = protocolOldPts;
    }

    return protocolNewPts;
}

export function updateFeeBasedPoints(
    address: string,
    stat: BigDecimal,
    timestamp: BigInt,
    collateralID: i32
): void {
    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    const weekID = `${date.year}-${date.week}`;

    let userDailyStats = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );

    let userWeeklyStats = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );

    let dailyProtocolStats = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.DAY,
        dayID,
        collateralID,
        false
    );

    let weeklyProtocolStats = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.WEEK,
        weekID,
        collateralID,
        false
    );

    updateFeePoints(stat, userDailyStats, userWeeklyStats, dailyProtocolStats, weeklyProtocolStats);
    updateLoyaltyPoints(
        stat,
        userDailyStats,
        userWeeklyStats,
        dailyProtocolStats,
        weeklyProtocolStats
    );
}

export function updateFeePoints(
    stat: BigDecimal,
    userDailyStats: EpochTradingPointsRecord,
    userWeeklyStats: EpochTradingPointsRecord,
    protocolDailyStats: EpochTradingPointsRecord,
    protocolWeeklyStats: EpochTradingPointsRecord
): void {
    // Updating total fees
    userDailyStats.totalFeesPaid = userDailyStats.totalFeesPaid.plus(stat);
    userWeeklyStats.totalFeesPaid = userWeeklyStats.totalFeesPaid.plus(stat);
    protocolDailyStats.totalFeesPaid = protocolDailyStats.totalFeesPaid.plus(stat);
    protocolWeeklyStats.totalFeesPaid = protocolWeeklyStats.totalFeesPaid.plus(stat);

    // Updating fee points
    userDailyStats.feePoints = userDailyStats.feePoints.plus(stat);
    userWeeklyStats.feePoints = userWeeklyStats.feePoints.plus(stat);
    protocolDailyStats.feePoints = protocolDailyStats.feePoints.plus(stat);
    protocolWeeklyStats.feePoints = protocolWeeklyStats.feePoints.plus(stat);

    // Saving all the entities
    userDailyStats.save();
    protocolDailyStats.save();
    userWeeklyStats.save();
    protocolWeeklyStats.save();
}

export function updateLoyaltyPoints(
    stat: BigDecimal,
    userDailyStats: EpochTradingPointsRecord,
    userWeeklyStats: EpochTradingPointsRecord,
    protocolDailyStats: EpochTradingPointsRecord,
    protocolWeeklyStats: EpochTradingPointsRecord
): void {
    let totalUserDailyFees = userDailyStats.totalFeesPaid.plus(stat);
    let oldLoyaltyPoints = userDailyStats.loyaltyPoints;
    let newLoyaltyPoints = calculateLoyaltyPoints(totalUserDailyFees);

    // Updating loyalty points
    userDailyStats.loyaltyPoints = newLoyaltyPoints;
    userWeeklyStats.loyaltyPoints = userWeeklyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    protocolDailyStats.loyaltyPoints = protocolDailyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    protocolWeeklyStats.loyaltyPoints = protocolWeeklyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);

    // Saving all the entities
    userDailyStats.save();
    protocolDailyStats.save();
    userWeeklyStats.save();
    protocolWeeklyStats.save();
}

export function calculateLoyaltyPoints(fees: BigDecimal): BigDecimal {
    if (fees >= BigDecimal.fromString("8") && fees < BigDecimal.fromString("40")) {
        return BigDecimal.fromString("1");
    } else if (fees >= BigDecimal.fromString("40") && fees < BigDecimal.fromString("200")) {
        return BigDecimal.fromString("5");
    } else if (fees >= BigDecimal.fromString("200") && fees < BigDecimal.fromString("400")) {
        return BigDecimal.fromString("25");
    } else if (fees >= BigDecimal.fromString("400")) {
        return BigDecimal.fromString("50");
    } else {
        return BigDecimal.fromString("0");
    }
}

export function generateId(
    address: string,
    epochType: string,
    dateID: string,
    collateralID: i32
): string {
    return address + "-" + epochType + "-" + dateID + "-" + collateralID.toString();
}

export function createOrLoadEpochTradingPointsRecord(
    address: string,
    epochType: string,
    dateID: string,
    collateralID: i32,
    save: boolean
): EpochTradingPointsRecord {
    log.info(
        "[createOrLoadEpochTradingPointsRecord] address {}, epochType {}, epochNumber {}, collateral {}",
        [address, epochType.toString(), dateID, collateralID.toString()]
    );
    const id = generateId(address, epochType, dateID, collateralID);
    let epochTradingPointsRecord = EpochTradingPointsRecord.load(id);
    if (epochTradingPointsRecord == null) {
        epochTradingPointsRecord = new EpochTradingPointsRecord(id);
        epochTradingPointsRecord.address = address;
        epochTradingPointsRecord.date = dateID;
        epochTradingPointsRecord.epochType = epochType;
        epochTradingPointsRecord.collateralID = collateralID;
        epochTradingPointsRecord.totalFeesPaid = BigDecimal.fromString("0");
        epochTradingPointsRecord.pnl = BigDecimal.fromString("0");
        epochTradingPointsRecord.pnlPercentage = BigDecimal.fromString("0");
        epochTradingPointsRecord.groupsTraded = [ZERO_BD, ZERO_BD, ZERO_BD, ZERO_BD];
        epochTradingPointsRecord.loyaltyPoints = BigDecimal.fromString("0");
        epochTradingPointsRecord.diversityPoints = BigDecimal.fromString("0");
        epochTradingPointsRecord.absSkillPoints = BigDecimal.fromString("0");
        epochTradingPointsRecord.relSkillPoints = BigDecimal.fromString("0");
        epochTradingPointsRecord.feePoints = BigDecimal.fromString("0");
        epochTradingPointsRecord.isAbsSkillEligible = false;
        epochTradingPointsRecord.isRelSkillEligible = false;
        if (save) {
            epochTradingPointsRecord.save();
        }
    }
    return epochTradingPointsRecord as EpochTradingPointsRecord;
}
