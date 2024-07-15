import { BigInt, Address, ethereum, BigDecimal } from "@graphprotocol/graph-ts";
import { afterEach, beforeAll, clearStore, describe, test } from "matchstick-as";

import { WEI_UNITS_BI } from "../src/common";

import { assertDayStatistic, assertMonthStatistic, assertTotalStatistic } from "./сommon/assert";
import { AMOUNT_1, AMOUNT_2, DAY_TIMESTAMPS, MONTH_TIMESTAMPS } from "./сommon/constants";
import { createBurnWULXEvent } from "./сommon/createEvent";
import { handleBurnWULX } from "../src/TokenBurnStatistics";

describe("PackageBurnt", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create an DayStatistic entity", () => {
        const timestamp = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const burnWULXEvent = createBurnWULXEvent(timestamp, burnAmount, 1);
        handleBurnWULX(burnWULXEvent);

        assertDayStatistic(
            timestamp,
            burnAmount.div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an DayStatistic entity with diff days", () => {
        // 1 day timestamps
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[1]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const burnWULXEvent1 = createBurnWULXEvent(timestamp1, burnAmount1, 1);
        handleBurnWULX(burnWULXEvent1);

        const burnWULXEvent2 = createBurnWULXEvent(timestamp2, burnAmount2, 1);
        handleBurnWULX(burnWULXEvent2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            burnAmount1.div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount1.div(WEI_UNITS_BI).toString(),
            2
        );
        assertDayStatistic(
            timestamp2,
            burnAmount2.div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount2.div(WEI_UNITS_BI).toString(),
            2
        );
    });

    test("Should update an DayStatistic entity", () => {
        // 1 day timestamps
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(DAY_TIMESTAMPS[1]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const burnWULXEvent1 = createBurnWULXEvent(timestamp1, burnAmount1, 1);
        handleBurnWULX(burnWULXEvent1);

        const burnWULXEvent2 = createBurnWULXEvent(timestamp2, burnAmount2, 1);
        handleBurnWULX(burnWULXEvent2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an MonthStatistic entity", () => {
        const timestamp = BigInt.fromI32(MONTH_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const burnWULXEvent = createBurnWULXEvent(timestamp, burnAmount, 1);
        handleBurnWULX(burnWULXEvent);

        assertMonthStatistic(
            timestamp,
            burnAmount.div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an MonthStatistic entity", () => {
        // 1 month timestamps
        const timestamp1 = BigInt.fromI32(MONTH_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[1]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const burnWULXEvent1 = createBurnWULXEvent(timestamp1, burnAmount1, 1);
        handleBurnWULX(burnWULXEvent1);

        const burnWULXEvent2 = createBurnWULXEvent(timestamp2, burnAmount2, 1);
        handleBurnWULX(burnWULXEvent2);

        assertMonthStatistic(
            BigInt.fromI32(MONTH_TIMESTAMPS[2]),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an TotalStatistic entity", () => {
        const timestamp = BigInt.fromI32(1705017600);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const burnWULXEvent = createBurnWULXEvent(timestamp, burnAmount, 1);
        handleBurnWULX(burnWULXEvent);

        assertTotalStatistic(
            burnAmount.div(WEI_UNITS_BI).toString(),
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an TotalStatistic entity", () => {
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[2]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const burnWULXEvent1 = createBurnWULXEvent(timestamp1, burnAmount1, 1);
        handleBurnWULX(burnWULXEvent1);

        const burnWULXEvent2 = createBurnWULXEvent(timestamp2, burnAmount2, 0);
        handleBurnWULX(burnWULXEvent2);

        assertTotalStatistic(
            burnAmount1.div(WEI_UNITS_BI).toString(),
            burnAmount2.div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });
});
