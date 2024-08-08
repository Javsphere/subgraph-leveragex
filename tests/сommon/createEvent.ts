import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import {
    MarketExecuted,
    MarketExecutedTStruct,
} from "../../generated/LeverageDiamond/LeverageDiamond";

export function createMarketExecutedEvent(
    trade: ethereum.Tuple,
    open: boolean,
    price: BigInt,
    priceImpactP: BigInt,
    percentProfit: BigInt,
    amountSentToTrader: BigInt,
    collateralPriceUsd: BigInt
): MarketExecuted {
    const event = changetype<MarketExecuted>(newMockEvent());
    event.parameters = new Array(7);
    event.parameters[0] = new ethereum.EventParam("t", ethereum.Value.fromTuple(trade));
    event.parameters[1] = new ethereum.EventParam("open", ethereum.Value.fromBoolean(open));
    event.parameters[2] = new ethereum.EventParam(
        "price",
        ethereum.Value.fromUnsignedBigInt(price)
    );
    event.parameters[3] = new ethereum.EventParam(
        "priceImpactP",
        ethereum.Value.fromUnsignedBigInt(priceImpactP)
    );
    event.parameters[4] = new ethereum.EventParam(
        "percentProfit",
        ethereum.Value.fromUnsignedBigInt(percentProfit)
    );
    event.parameters[5] = new ethereum.EventParam(
        "amountSentToTrader",
        ethereum.Value.fromUnsignedBigInt(amountSentToTrader)
    );
    event.parameters[6] = new ethereum.EventParam(
        "collateralPriceUsd",
        ethereum.Value.fromUnsignedBigInt(collateralPriceUsd)
    );

    return event;
}
