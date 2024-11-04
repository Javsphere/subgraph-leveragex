import { Address, BigDecimal, BigInt, log } from "@graphprotocol/graph-ts";
import { LeverageDiamond } from "../generated/LeverageDiamond/LeverageDiamond";
import { constants } from "../generated/constants";
import { Bytes } from "@graphprotocol/graph-ts/common/collections";

export const ZERO_BI = BigInt.zero();
export const ZERO_BD = BigDecimal.fromString("0");
export const ZERO_BYTES = Bytes.fromHexString("0x") as Bytes;
export const ONE_BI = BigInt.fromI32(1);
export const ONE_BD = BigDecimal.fromString("1");
const SECONDS_IN_DAY = BigInt.fromI32(86400);

export const PAIRS_STATISTIC_ENTITY_TYPE = "PairsStatistic";

export const WEI_E2_BD = BigDecimal.fromString("1e2");
export const WEI_E3_BD = BigDecimal.fromString("1e3");
export const WEI_E6_BD = BigDecimal.fromString("1e6");
export const WEI_E8_BD = BigDecimal.fromString("1e8");
export const WEI_E10_BD = BigDecimal.fromString("1e10");
export const WEI_E18_BD = BigDecimal.fromString("1e18");

//DIVERSITY POINTS THRESHOLDS BY GROUP
export const THRESHOLD_GROUP_0 = BigDecimal.fromString("100");
export const THRESHOLD_GROUP_1 = BigDecimal.fromString("250");
export const THRESHOLD_GROUP_2 = BigDecimal.fromString("300");
export const THRESHOLD_GROUP_3 = BigDecimal.fromString("500");
export const VOLUME_THRESHOLDS = [
    THRESHOLD_GROUP_0,
    THRESHOLD_GROUP_1,
    THRESHOLD_GROUP_2,
    THRESHOLD_GROUP_3,
];

class Networks {
    BASE_SEPOLIA!: string;
}

export const NETWORKS: Networks = {
    BASE_SEPOLIA: "base-sepolia",
};

export const PROTOCOL = "protocol";

export const TOKEN_DECIMALS = getColDecimalsByNetwork();

class EpochTypes {
    DAY!: string;
    WEEK!: string;
    MONTH!: string;
    YEAR!: string;
}

export const EPOCH_TYPE: EpochTypes = {
    DAY: "day",
    WEEK: "week",
    MONTH: "month",
    YEAR: "year",
};

function toBigInt(integer: i32): BigInt {
    return BigInt.fromI32(integer);
}

class DayWeekMonthYear {
    day: string;
    week: string;
    month: string;
    year: string;

    constructor(day: BigInt, week: BigInt, month: BigInt, year: BigInt) {
        this.day = day.toString().padStart(2, "0");
        this.week = week.toString().padStart(2, "0");
        this.month = month.toString().padStart(2, "0");
        this.year = year.toString();
    }
}

function getWeekNumber(day: BigInt, month: BigInt, year: BigInt): BigInt {
    // Function to check if a year is a leap year
    function isLeapYear(year: BigInt): boolean {
        return (
            (year.mod(toBigInt(4)).equals(toBigInt(0)) &&
                year.mod(toBigInt(100)).notEqual(toBigInt(0))) ||
            year.mod(toBigInt(400)).equals(toBigInt(0))
        );
    }

    // Days in each month
    const monthDays = [31, isLeapYear(year) ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    // Calculate the day of the year as a BigInt
    let dayOfYear = toBigInt(0);
    for (let i = 0; i < month.toI32() - 1; i++) {
        dayOfYear = dayOfYear.plus(toBigInt(monthDays[i])); // Add days of previous months
    }
    dayOfYear = dayOfYear.plus(day); // Add the days of the current month

    // Calculate the week number (1-indexed) using BigInt
    const weekNumber = dayOfYear.mod(toBigInt(7)).equals(toBigInt(0))
        ? dayOfYear.div(toBigInt(7)) // If it’s exactly divisible, use that
        : dayOfYear.div(toBigInt(7)).plus(toBigInt(1)); // Otherwise, round up

    return weekNumber < toBigInt(53) ? weekNumber : weekNumber.minus(toBigInt(52));
}

export function dayWeekMonthYearFromTimestamp(timestamp: BigInt): DayWeekMonthYear {
    let daysSinceEpochStart = timestamp.div(SECONDS_IN_DAY);
    daysSinceEpochStart = daysSinceEpochStart.plus(toBigInt(719468));

    let era: BigInt = (
        daysSinceEpochStart >= ZERO_BI
            ? daysSinceEpochStart
            : daysSinceEpochStart.minus(toBigInt(146096))
    ).div(toBigInt(146097));

    let dayOfEra: BigInt = daysSinceEpochStart.minus(era.times(toBigInt(146097))); // [0, 146096]

    let yearOfEra: BigInt = dayOfEra
        .minus(dayOfEra.div(toBigInt(1460)))
        .plus(dayOfEra.div(toBigInt(36524)))
        .minus(dayOfEra.div(toBigInt(146096)))
        .div(toBigInt(365)); // [0, 399]

    let year: BigInt = yearOfEra.plus(era.times(toBigInt(400)));

    let dayOfYear: BigInt = dayOfEra.minus(
        toBigInt(365)
            .times(yearOfEra)
            .plus(yearOfEra.div(toBigInt(4)))
            .minus(yearOfEra.div(toBigInt(100)))
    ); // [0, 365]

    let monthZeroIndexed = toBigInt(5).times(dayOfYear).plus(toBigInt(2)).div(toBigInt(153)); // [0, 11]

    let day = dayOfYear
        .minus(
            toBigInt(153)
                .times(monthZeroIndexed)
                .plus(toBigInt(2))
                .div(toBigInt(5))
                .plus(toBigInt(1))
        )
        .plus(toBigInt(2)); // [1, 31]

    let month = monthZeroIndexed.plus(monthZeroIndexed < toBigInt(10) ? toBigInt(3) : toBigInt(-9)); // [1, 12]

    year = month <= toBigInt(2) ? year.plus(ONE_BI) : year;

    let week = getWeekNumber(day, month, year);

    return new DayWeekMonthYear(day, week, month, year);
}

export function getDiamondContract(): LeverageDiamond {
    return LeverageDiamond.bind(Address.fromString(constants.leverageDiamondAddress));
}

export function getGroupIndex(pairIndex: BigInt): BigInt {
    const pairsStorageContract = getDiamondContract();
    return pairsStorageContract.pairs(pairIndex).groupIndex;
}

function getColDecimalsByNetwork(): BigDecimal[] {
    if (constants.networkName == NETWORKS.BASE_SEPOLIA) {
        return [
            WEI_E18_BD, // 0
            WEI_E18_BD, //1
            WEI_E18_BD, //2
            WEI_E18_BD, //3
            WEI_E18_BD, //4
            WEI_E18_BD, //5
            WEI_E18_BD, //6
            WEI_E8_BD, //7
            WEI_E6_BD, //8
        ];
    } else {
        throw new Error("Unknown network");
    }
}
