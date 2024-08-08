import { PAIRS_STATISTIC_ENTITY_TYPE } from "../../src/common";
import { assert } from "matchstick-as";
import { BigInt, log } from "@graphprotocol/graph-ts";

export function assertPairsStatistic(
    collateralIndex: BigInt,
    pairIndex: BigInt,
    longPositionsCount: string,
    shortPositionsCount: string,
    totalPositionsCount: string,
    entityCount: i32
): void {
    const idKey = `${collateralIndex}-${pairIndex}`;
    assert.fieldEquals(
        PAIRS_STATISTIC_ENTITY_TYPE,
        idKey,
        "longPositionsCount",
        longPositionsCount
    );
    assert.fieldEquals(
        PAIRS_STATISTIC_ENTITY_TYPE,
        idKey,
        "shortPositionsCount",
        shortPositionsCount
    );
    assert.fieldEquals(
        PAIRS_STATISTIC_ENTITY_TYPE,
        idKey,
        "totalPositionsCount",
        totalPositionsCount
    );
    assert.entityCount(PAIRS_STATISTIC_ENTITY_TYPE, entityCount);
}
