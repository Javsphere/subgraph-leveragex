import { afterEach, beforeAll, clearStore, describe, test } from "matchstick-as";
import { BigInt } from "@graphprotocol/graph-ts";

import { savePairsStatistic } from "../src/entity/pairsStatistics";
import { assertPairsStatistic } from "./сommon/assert";

describe("LeverageDiamond", () => {
    afterEach(() => {
        clearStore();
    });

    test("Should savePairsStatistic", () => {
        const collateralIndex = BigInt.fromI32(0);
        const pairIndex = BigInt.fromI32(0);
        const isLong = true;
        const isOpen = true;

        savePairsStatistic(collateralIndex, pairIndex, isLong, isOpen);

        assertPairsStatistic(collateralIndex, pairIndex, "1", "0", "1", 1);

        savePairsStatistic(BigInt.fromI32(0), BigInt.fromI32(1), isLong, isOpen);

        assertPairsStatistic(BigInt.fromI32(0), BigInt.fromI32(1), "1", "0", "1", 2);
    });
});
