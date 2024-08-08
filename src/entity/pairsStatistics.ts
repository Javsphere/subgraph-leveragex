import { BigInt, log } from "@graphprotocol/graph-ts";
import { PairsStatistic } from "../../generated/schema";

export function savePairsStatistic(
    collateralIndex: BigInt,
    pairIndex: BigInt,
    isLong: boolean,
    isOpen: boolean
): void {
    const pairsStatisticID = `${collateralIndex}-${pairIndex}`;
    let pairsStatistic = PairsStatistic.load(pairsStatisticID);
    if (!pairsStatistic) {
        pairsStatistic = new PairsStatistic(pairsStatisticID);
        pairsStatistic.longPositionsCount = BigInt.fromI32(0);
        pairsStatistic.shortPositionsCount = BigInt.fromI32(0);
        pairsStatistic.totalPositionsCount = BigInt.fromI32(0);
    }
    if (isOpen) {
        if (isLong) {
            pairsStatistic.longPositionsCount = pairsStatistic.longPositionsCount.plus(
                BigInt.fromI32(1)
            );
        } else {
            pairsStatistic.shortPositionsCount = pairsStatistic.shortPositionsCount.plus(
                BigInt.fromI32(1)
            );
        }
        pairsStatistic.totalPositionsCount = pairsStatistic.totalPositionsCount.plus(
            BigInt.fromI32(1)
        );
    } else {
        if (isLong) {
            pairsStatistic.longPositionsCount = pairsStatistic.longPositionsCount.minus(
                BigInt.fromI32(1)
            );
        } else {
            pairsStatistic.shortPositionsCount = pairsStatistic.shortPositionsCount.minus(
                BigInt.fromI32(1)
            );
        }
        pairsStatistic.totalPositionsCount = pairsStatistic.totalPositionsCount.minus(
            BigInt.fromI32(1)
        );
    }

    pairsStatistic.save();
}
