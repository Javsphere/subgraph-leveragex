import { EpochTradingPointsRecord, EpochTradingStatsRecord } from "../../generated/schema";
import { BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import {
    dayWeekMonthYearFromTimestamp,
    EPOCH_TYPE,
    ONE_BD,
    PROTOCOL,
    VOLUME_THRESHOLD,
    WEI_E2_BD,
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
    tradedAmount: BigDecimal,
    groupNumber: i32,
    pairNumber: i32,
    volume: BigDecimal,
    weeklyStats: EpochTradingStatsRecord
): void {
    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    const weekID = `${date.year}-${date.week}`;
    const monthID = `${date.year}-${date.month}`;
    const yearID = `${date.year}`;
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
    const userMonthlyPoints = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.MONTH,
        monthID,
        collateralID,
        false
    );
    const protocolMonthlyPoints = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.MONTH,
        monthID,
        collateralID,
        false
    );
    const userYearlyPoints = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.YEAR,
        yearID,
        collateralID,
        false
    );
    const protocolYearlyPoints = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.YEAR,
        yearID,
        collateralID,
        false
    );

    if (isTraderEligibleForAbsoluteSkillPoints(weeklyStats)) {
        updateAbsoluteSkillPoints(
            userDailyPoints,
            protocolDailyPoints,
            !userWeeklyPoints.isAbsSkillEligible ? weeklyStats.totalPnl : pnl, // if trader just became eligible, use totalPnl
            tradedAmount
        );
        updateAbsoluteSkillPoints(
            userWeeklyPoints,
            protocolWeeklyPoints,
            !userWeeklyPoints.isAbsSkillEligible ? weeklyStats.totalPnl : pnl, // if trader just became eligible, use totalPnl
            tradedAmount
        );
        updateAbsoluteSkillPoints(
            userMonthlyPoints,
            protocolMonthlyPoints,
            !userWeeklyPoints.isAbsSkillEligible ? weeklyStats.totalPnl : pnl, // if trader just became eligible, use totalPnl
            tradedAmount
        );
        updateAbsoluteSkillPoints(
            userYearlyPoints,
            protocolYearlyPoints,
            !userWeeklyPoints.isAbsSkillEligible ? weeklyStats.totalPnl : pnl, // if trader just became eligible, use totalPnl
            tradedAmount
        );
    }
    // Determine if trader is eligible yet for relative skill points
    if (isTraderEligibleForRelativeSkillPoints(weeklyStats)) {
        updateRelativeSkillPoints(userDailyPoints, protocolDailyPoints);
        updateRelativeSkillPoints(userWeeklyPoints, protocolWeeklyPoints);
        updateRelativeSkillPoints(userMonthlyPoints, protocolMonthlyPoints);
        updateRelativeSkillPoints(userYearlyPoints, protocolYearlyPoints);
    }

    updateDiversityPoints(
        userDailyPoints,
        userWeeklyPoints,
        userMonthlyPoints,
        userYearlyPoints,
        protocolDailyPoints,
        protocolWeeklyPoints,
        protocolMonthlyPoints,
        protocolYearlyPoints,
        groupNumber,
        volume
    );
}

export function updateAbsoluteSkillPoints(
    userPoints: EpochTradingPointsRecord,
    protocolPoints: EpochTradingPointsRecord,
    pnl: BigDecimal,
    tradedAmount: BigDecimal
): void {
    let userSkillPoints = userPoints.pnl.plus(pnl) > ZERO_BD ? userPoints.pnl.plus(pnl) : ZERO_BD;

    let protocolSkillPoints = calculateSkillPoints(userPoints, protocolPoints, pnl, true);

    // update pnls
    userPoints.pnl = userPoints.pnl.plus(pnl);
    // reverse as user pnl
    protocolPoints.pnl = protocolPoints.pnl.minus(pnl);

    userPoints.totalTradedAmount = userPoints.totalTradedAmount.plus(tradedAmount);
    protocolPoints.totalTradedAmount = protocolPoints.totalTradedAmount.plus(tradedAmount);

    // update skill points
    userPoints.absSkillPoints = userSkillPoints;
    protocolPoints.absSkillPoints = protocolSkillPoints;

    userPoints.isAbsSkillEligible = true;

    // Saving all the entities
    userPoints.save();
    protocolPoints.save();
}

export function updateRelativeSkillPoints(
    userPoints: EpochTradingPointsRecord,
    protocolPoints: EpochTradingPointsRecord
): void {
    const pnlPercentage = userPoints.pnl.div(userPoints.totalTradedAmount).times(WEI_E2_BD);
    let userSkillPoints = pnlPercentage > ZERO_BD ? pnlPercentage : ZERO_BD;
    let protocolSkillPoints = calculateSkillPoints(
        userPoints,
        protocolPoints,
        pnlPercentage,
        false
    );

    // update pnls
    userPoints.pnlPercentage = pnlPercentage;
    protocolPoints.pnlPercentage = protocolPoints.pnl
        .div(protocolPoints.totalTradedAmount)
        .times(WEI_E2_BD);

    // update skill points
    userPoints.relSkillPoints = userSkillPoints;
    protocolPoints.relSkillPoints = protocolSkillPoints;

    userPoints.isRelSkillEligible = true;

    // Saving all the entities
    userPoints.save();
    protocolPoints.save();
}

export function updateDiversityPoints(
    userDailyPoints: EpochTradingPointsRecord,
    userWeeklyPoints: EpochTradingPointsRecord,
    userMonthlyPoints: EpochTradingPointsRecord,
    userYearlyPoints: EpochTradingPointsRecord,
    protocolDailyPoints: EpochTradingPointsRecord,
    protocolWeeklyPoints: EpochTradingPointsRecord,
    protocolMonthlyPoints: EpochTradingPointsRecord,
    protocolYearlyPoints: EpochTradingPointsRecord,
    groupNumber: i32,
    volume: BigDecimal
): void {
    let groupId = groupNumber;

    if (volume.ge(VOLUME_THRESHOLD) && userWeeklyPoints.groupsTraded[groupId] == ZERO_BD) {
        userDailyPoints.groupsTraded[groupId] = ONE_BD;
        userWeeklyPoints.groupsTraded[groupId] = ONE_BD;
        userMonthlyPoints.groupsTraded[groupId] = ONE_BD;
        userYearlyPoints.groupsTraded[groupId] = ONE_BD;

        protocolDailyPoints.groupsTraded[groupId] = ONE_BD;
        protocolWeeklyPoints.groupsTraded[groupId] = ONE_BD;
        protocolMonthlyPoints.groupsTraded[groupId] = ONE_BD;
        protocolYearlyPoints.groupsTraded[groupId] = ONE_BD;

        userDailyPoints.diversityPoints = userDailyPoints.diversityPoints.plus(ONE_BD);
        userWeeklyPoints.diversityPoints = userWeeklyPoints.diversityPoints.plus(ONE_BD);
        userMonthlyPoints.diversityPoints = userMonthlyPoints.diversityPoints.plus(ONE_BD);
        userYearlyPoints.diversityPoints = userYearlyPoints.diversityPoints.plus(ONE_BD);

        protocolDailyPoints.diversityPoints = protocolDailyPoints.diversityPoints.plus(ONE_BD);
        protocolWeeklyPoints.diversityPoints = protocolWeeklyPoints.diversityPoints.plus(ONE_BD);
        protocolMonthlyPoints.diversityPoints = protocolMonthlyPoints.diversityPoints.plus(ONE_BD);
        protocolYearlyPoints.diversityPoints = protocolYearlyPoints.diversityPoints.plus(ONE_BD);

        // Saving all the entities
        userDailyPoints.save();
        userWeeklyPoints.save();
        userMonthlyPoints.save();
        userYearlyPoints.save();
        protocolDailyPoints.save();
        protocolWeeklyPoints.save();
        protocolMonthlyPoints.save();
        protocolYearlyPoints.save();
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
    const monthID = `${date.year}-${date.month}`;
    const yearID = `${date.year}`;

    let userDailyStats = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.DAY,
        dayID,
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

    let userWeeklyStats = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.WEEK,
        weekID,
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

    let userMonthlyStats = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.MONTH,
        monthID,
        collateralID,
        false
    );

    let monthlyProtocolStats = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.MONTH,
        monthID,
        collateralID,
        false
    );

    let userYearlyStats = createOrLoadEpochTradingPointsRecord(
        address,
        EPOCH_TYPE.YEAR,
        yearID,
        collateralID,
        false
    );

    let yearlyProtocolStats = createOrLoadEpochTradingPointsRecord(
        PROTOCOL,
        EPOCH_TYPE.YEAR,
        yearID,
        collateralID,
        false
    );

    updateFeePoints(
        stat,
        userDailyStats,
        userWeeklyStats,
        userMonthlyStats,
        userYearlyStats,
        dailyProtocolStats,
        weeklyProtocolStats,
        monthlyProtocolStats,
        yearlyProtocolStats
    );
    updateLoyaltyPoints(
        stat,
        userDailyStats,
        userWeeklyStats,
        userMonthlyStats,
        userYearlyStats,
        dailyProtocolStats,
        weeklyProtocolStats,
        monthlyProtocolStats,
        yearlyProtocolStats
    );
}

export function updateFeePoints(
    stat: BigDecimal,
    userDailyStats: EpochTradingPointsRecord,
    userWeeklyStats: EpochTradingPointsRecord,
    userMonthStats: EpochTradingPointsRecord,
    userYearStats: EpochTradingPointsRecord,
    protocolDailyStats: EpochTradingPointsRecord,
    protocolWeeklyStats: EpochTradingPointsRecord,
    protocolMonthlyStats: EpochTradingPointsRecord,
    protocolYearlyStats: EpochTradingPointsRecord
): void {
    // Updating total fees
    userDailyStats.totalFeesPaid = userDailyStats.totalFeesPaid.plus(stat);
    userWeeklyStats.totalFeesPaid = userWeeklyStats.totalFeesPaid.plus(stat);
    userMonthStats.totalFeesPaid = userMonthStats.totalFeesPaid.plus(stat);
    userYearStats.totalFeesPaid = userYearStats.totalFeesPaid.plus(stat);
    protocolDailyStats.totalFeesPaid = protocolDailyStats.totalFeesPaid.plus(stat);
    protocolWeeklyStats.totalFeesPaid = protocolWeeklyStats.totalFeesPaid.plus(stat);
    protocolMonthlyStats.totalFeesPaid = protocolMonthlyStats.totalFeesPaid.plus(stat);
    protocolYearlyStats.totalFeesPaid = protocolYearlyStats.totalFeesPaid.plus(stat);

    // Updating fee points
    userDailyStats.feePoints = userDailyStats.feePoints.plus(stat);
    userWeeklyStats.feePoints = userWeeklyStats.feePoints.plus(stat);
    userMonthStats.feePoints = userMonthStats.feePoints.plus(stat);
    userYearStats.feePoints = userYearStats.feePoints.plus(stat);
    protocolDailyStats.feePoints = protocolDailyStats.feePoints.plus(stat);
    protocolWeeklyStats.feePoints = protocolWeeklyStats.feePoints.plus(stat);
    protocolMonthlyStats.feePoints = protocolMonthlyStats.feePoints.plus(stat);
    protocolYearlyStats.feePoints = protocolYearlyStats.feePoints.plus(stat);

    // Saving all the entities
    userDailyStats.save();
    userWeeklyStats.save();
    userMonthStats.save();
    userYearStats.save();
    protocolDailyStats.save();
    protocolWeeklyStats.save();
    protocolMonthlyStats.save();
    protocolYearlyStats.save();
}

export function updateLoyaltyPoints(
    stat: BigDecimal,
    userDailyStats: EpochTradingPointsRecord,
    userWeeklyStats: EpochTradingPointsRecord,
    userMonthStats: EpochTradingPointsRecord,
    userYearStats: EpochTradingPointsRecord,
    protocolDailyStats: EpochTradingPointsRecord,
    protocolWeeklyStats: EpochTradingPointsRecord,
    protocolMonthlyStats: EpochTradingPointsRecord,
    protocolYearlyStats: EpochTradingPointsRecord
): void {
    let totalUserDailyFees = userDailyStats.totalFeesPaid.plus(stat);
    let oldLoyaltyPoints = userDailyStats.loyaltyPoints;
    let newLoyaltyPoints = calculateLoyaltyPoints(totalUserDailyFees);

    // Updating loyalty points
    userDailyStats.loyaltyPoints = newLoyaltyPoints;
    userWeeklyStats.loyaltyPoints = userWeeklyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    userMonthStats.loyaltyPoints = userMonthStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    userYearStats.loyaltyPoints = userYearStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    protocolDailyStats.loyaltyPoints = protocolDailyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    protocolWeeklyStats.loyaltyPoints = protocolWeeklyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    protocolMonthlyStats.loyaltyPoints = protocolMonthlyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);
    protocolYearlyStats.loyaltyPoints = protocolYearlyStats.loyaltyPoints
        .plus(newLoyaltyPoints)
        .minus(oldLoyaltyPoints);

    // Saving all the entities
    userDailyStats.save();
    userWeeklyStats.save();
    userMonthStats.save();
    userYearStats.save();
    protocolDailyStats.save();
    protocolWeeklyStats.save();
    protocolMonthlyStats.save();
    protocolYearlyStats.save();
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
        epochTradingPointsRecord.totalTradedAmount = BigDecimal.fromString("0");
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
