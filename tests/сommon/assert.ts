import {
    DAY_STATISTIC_ENTITY_TYPE,
    dayMonthYearFromTimestamp,
    MONTH_STATISTIC_ENTITY_TYPE,
    TOTAL_STATISTIC_ENTITY_TYPE,
    TOTAL_STATISTICS_ID,
} from "../../src/common";
import { assert } from "matchstick-as";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function assertDayStatistic(
    timestamp: BigInt,
    lottoBurnAmount: string,
    stakingBurnAmount: string,
    burnAmount: string,
    entityCount: i32
): void {
    const date = dayMonthYearFromTimestamp(timestamp);
    const idKey = `${date.year}-${date.month}-${date.day}`;
    assert.fieldEquals(DAY_STATISTIC_ENTITY_TYPE, idKey, "lottoBurnAmount", lottoBurnAmount);
    assert.fieldEquals(DAY_STATISTIC_ENTITY_TYPE, idKey, "stakingBurnAmount", stakingBurnAmount);
    assert.fieldEquals(DAY_STATISTIC_ENTITY_TYPE, idKey, "totalBurnAmount", burnAmount);
    assert.entityCount(DAY_STATISTIC_ENTITY_TYPE, entityCount);
}

export function assertMonthStatistic(
    timestamp: BigInt,
    lottoBurnAmount: string,
    stakingBurnAmount: string,
    burnAmount: string,
    entityCount: i32
): void {
    const date = dayMonthYearFromTimestamp(timestamp);
    const idKey = `${date.year}-${date.month}`;
    assert.fieldEquals(MONTH_STATISTIC_ENTITY_TYPE, idKey, "lottoBurnAmount", lottoBurnAmount);
    assert.fieldEquals(MONTH_STATISTIC_ENTITY_TYPE, idKey, "stakingBurnAmount", stakingBurnAmount);
    assert.fieldEquals(MONTH_STATISTIC_ENTITY_TYPE, idKey, "totalBurnAmount", burnAmount);
    assert.entityCount(MONTH_STATISTIC_ENTITY_TYPE, entityCount);
}

export function assertTotalStatistic(
    lottoBurnAmount: string,
    stakingBurnAmount: string,
    burnAmount: string,
    entityCount: i32
): void {
    const idKey = TOTAL_STATISTICS_ID;
    assert.fieldEquals(TOTAL_STATISTIC_ENTITY_TYPE, idKey, "lottoBurnAmount", lottoBurnAmount);
    assert.fieldEquals(TOTAL_STATISTIC_ENTITY_TYPE, idKey, "stakingBurnAmount", stakingBurnAmount);
    assert.fieldEquals(TOTAL_STATISTIC_ENTITY_TYPE, idKey, "totalBurnAmount", burnAmount);
    assert.entityCount(TOTAL_STATISTIC_ENTITY_TYPE, entityCount);
}
