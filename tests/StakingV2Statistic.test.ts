import { BigInt, Address, ethereum, BigDecimal } from "@graphprotocol/graph-ts";
import { afterEach, beforeAll, clearStore, describe, test } from "matchstick-as";

import { WEI_UNITS_BI } from "../src/common";
import {
    createPackageBurntEvent,
    createPackageRewardAirdroppedEvent,
    createPackageRewardClaimedEvent,
    createWULXBurntEvent,
} from "./сommon/createEvent";
import {
    handlePackageBurnt,
    handlePackageRewardAirdropped,
    handlePackageRewardClaimed,
    handleWULXBurnt,
} from "../src/StakingV2Statistics";
import { assertDayStatistic, assertMonthStatistic, assertTotalStatistic } from "./сommon/assert";
import { AMOUNT_1, AMOUNT_2, DAY_TIMESTAMPS, MONTH_TIMESTAMPS } from "./сommon/constants";

describe("PackageBurnt", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create an DayStatistic entity", () => {
        const timestamp = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageBurntEvent = createPackageBurntEvent(timestamp, new BigInt(1), burnAmount);
        handlePackageBurnt(packageBurntEvent);

        assertDayStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
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
        const packageBurntEvent1 = createPackageBurntEvent(timestamp1, new BigInt(1), burnAmount1);
        handlePackageBurnt(packageBurntEvent1);

        const packageBurntEvent2 = createPackageBurntEvent(timestamp2, new BigInt(1), burnAmount2);
        handlePackageBurnt(packageBurntEvent2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            "0",
            burnAmount1.div(WEI_UNITS_BI).toString(),
            burnAmount1.div(WEI_UNITS_BI).toString(),
            2
        );
        assertDayStatistic(
            timestamp2,
            "0",
            burnAmount2.div(WEI_UNITS_BI).toString(),
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
        const packageBurntEvent1 = createPackageBurntEvent(timestamp1, new BigInt(1), burnAmount1);
        handlePackageBurnt(packageBurntEvent1);

        const packageBurntEvent2 = createPackageBurntEvent(timestamp2, new BigInt(1), burnAmount2);
        handlePackageBurnt(packageBurntEvent2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an MonthStatistic entity", () => {
        const timestamp = BigInt.fromI32(MONTH_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageBurntEvent = createPackageBurntEvent(timestamp, new BigInt(1), burnAmount);
        handlePackageBurnt(packageBurntEvent);

        assertMonthStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
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
        const packageBurntEvent1 = createPackageBurntEvent(timestamp1, new BigInt(1), burnAmount1);
        handlePackageBurnt(packageBurntEvent1);

        const packageBurntEvent2 = createPackageBurntEvent(timestamp2, new BigInt(1), burnAmount2);
        handlePackageBurnt(packageBurntEvent2);

        assertMonthStatistic(
            BigInt.fromI32(MONTH_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an TotalStatistic entity", () => {
        const timestamp = BigInt.fromI32(1705017600);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageBurntEvent = createPackageBurntEvent(timestamp, new BigInt(1), burnAmount);
        handlePackageBurnt(packageBurntEvent);

        assertTotalStatistic(
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an TotalStatistic entity", () => {
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[2]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const packageBurntEvent1 = createPackageBurntEvent(timestamp1, new BigInt(1), burnAmount1);
        handlePackageBurnt(packageBurntEvent1);

        const packageBurntEvent2 = createPackageBurntEvent(timestamp2, new BigInt(1), burnAmount2);
        handlePackageBurnt(packageBurntEvent2);

        assertTotalStatistic(
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });
});

describe("PackageRewardClaimed", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create an DayStatistic entity", () => {
        const timestamp = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageRewardClaimed = createPackageRewardClaimedEvent(
            timestamp,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed);

        assertDayStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an DayStatistic entity", () => {
        // 1 day timestamps
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(DAY_TIMESTAMPS[1]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const packageRewardClaimed1 = createPackageRewardClaimedEvent(
            timestamp1,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount1,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed1);

        const packageRewardClaimed2 = createPackageRewardClaimedEvent(
            timestamp2,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount2,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an MonthStatistic entity", () => {
        const timestamp = BigInt.fromI32(MONTH_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageRewardClaimed = createPackageRewardClaimedEvent(
            timestamp,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed);

        assertMonthStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
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
        const packageRewardClaimed1 = createPackageRewardClaimedEvent(
            timestamp1,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount1,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed1);

        const packageRewardClaimed2 = createPackageRewardClaimedEvent(
            timestamp2,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount2,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed2);

        assertMonthStatistic(
            BigInt.fromI32(MONTH_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an TotalStatistic entity", () => {
        const timestamp = BigInt.fromI32(1705017600);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageRewardClaimed = createPackageRewardClaimedEvent(
            timestamp,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed);

        assertTotalStatistic(
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an TotalStatistic entity", () => {
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[2]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const packageRewardClaimed1 = createPackageRewardClaimedEvent(
            timestamp1,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount1,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed1);

        const packageRewardClaimed2 = createPackageRewardClaimedEvent(
            timestamp2,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount2,
            new BigInt(1)
        );
        handlePackageRewardClaimed(packageRewardClaimed2);

        assertTotalStatistic(
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });
});

describe("WULXBurnt", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create an DayStatistic entity", () => {
        const timestamp = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const wulxBurntEvent = createWULXBurntEvent(timestamp, burnAmount);
        handleWULXBurnt(wulxBurntEvent);

        assertDayStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an DayStatistic entity", () => {
        // 1 day timestamps
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(DAY_TIMESTAMPS[1]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const wulxBurntEvent1 = createWULXBurntEvent(timestamp1, burnAmount1);
        handleWULXBurnt(wulxBurntEvent1);

        const wulxBurntEvent2 = createWULXBurntEvent(timestamp2, burnAmount2);
        handleWULXBurnt(wulxBurntEvent2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an MonthStatistic entity", () => {
        const timestamp = BigInt.fromI32(MONTH_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const wulxBurntEvent = createWULXBurntEvent(timestamp, burnAmount);
        handleWULXBurnt(wulxBurntEvent);

        assertMonthStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
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
        const wulxBurntEvent1 = createWULXBurntEvent(timestamp1, burnAmount1);
        handleWULXBurnt(wulxBurntEvent1);

        const wulxBurntEvent2 = createWULXBurntEvent(timestamp2, burnAmount2);
        handleWULXBurnt(wulxBurntEvent2);

        assertMonthStatistic(
            BigInt.fromI32(MONTH_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an TotalStatistic entity", () => {
        const timestamp = BigInt.fromI32(1705017600);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const wulxBurntEvent = createWULXBurntEvent(timestamp, burnAmount);
        handleWULXBurnt(wulxBurntEvent);

        assertTotalStatistic(
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an TotalStatistic entity", () => {
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[2]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const wulxBurntEvent1 = createWULXBurntEvent(timestamp1, burnAmount1);
        handleWULXBurnt(wulxBurntEvent1);

        const wulxBurntEvent2 = createWULXBurntEvent(timestamp2, burnAmount2);
        handleWULXBurnt(wulxBurntEvent2);

        assertTotalStatistic(
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });
});

describe("PackageRewardAirdropped", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should create an DayStatistic entity", () => {
        const timestamp = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageRewardAirdroppedEvent = createPackageRewardAirdroppedEvent(
            timestamp,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent);

        assertDayStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an DayStatistic entity", () => {
        // 1 day timestamps
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(DAY_TIMESTAMPS[1]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const packageRewardAirdroppedEvent1 = createPackageRewardAirdroppedEvent(
            timestamp1,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount1,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent1);

        const packageRewardAirdroppedEvent2 = createPackageRewardAirdroppedEvent(
            timestamp2,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount2,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent2);

        assertDayStatistic(
            BigInt.fromI32(DAY_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an MonthStatistic entity", () => {
        const timestamp = BigInt.fromI32(MONTH_TIMESTAMPS[0]);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageRewardAirdroppedEvent = createPackageRewardAirdroppedEvent(
            timestamp,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent);

        assertMonthStatistic(
            timestamp,
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
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
        const packageRewardAirdroppedEvent1 = createPackageRewardAirdroppedEvent(
            timestamp1,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount1,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent1);

        const packageRewardAirdroppedEvent2 = createPackageRewardAirdroppedEvent(
            timestamp2,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount2,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent2);

        assertMonthStatistic(
            BigInt.fromI32(MONTH_TIMESTAMPS[2]),
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should create an TotalStatistic entity", () => {
        const timestamp = BigInt.fromI32(1705017600);
        const burnAmount = AMOUNT_1.times(WEI_UNITS_BI);
        const packageRewardAirdroppedEvent = createPackageRewardAirdroppedEvent(
            timestamp,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent);

        assertTotalStatistic(
            "0",
            burnAmount.div(WEI_UNITS_BI).toString(),
            burnAmount.div(WEI_UNITS_BI).toString(),
            1
        );
    });

    test("Should update an TotalStatistic entity", () => {
        const timestamp1 = BigInt.fromI32(DAY_TIMESTAMPS[0]);
        const timestamp2 = BigInt.fromI32(MONTH_TIMESTAMPS[2]);
        const burnAmount1 = AMOUNT_1.times(WEI_UNITS_BI);
        const burnAmount2 = AMOUNT_2.times(WEI_UNITS_BI);
        const packageRewardAirdroppedEvent1 = createPackageRewardAirdroppedEvent(
            timestamp1,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount1,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent1);

        const packageRewardAirdroppedEvent2 = createPackageRewardAirdroppedEvent(
            timestamp2,
            new BigInt(1),
            new BigInt(1),
            new BigInt(1),
            burnAmount2,
            new BigInt(1)
        );
        handlePackageRewardAirdropped(packageRewardAirdroppedEvent2);

        assertTotalStatistic(
            "0",
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            burnAmount1.plus(burnAmount2).div(WEI_UNITS_BI).toString(),
            1
        );
    });
});
