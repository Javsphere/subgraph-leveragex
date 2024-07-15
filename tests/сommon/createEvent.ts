import { BigInt, ethereum } from "@graphprotocol/graph-ts";
import { newMockEvent } from "matchstick-as";
import { BurnWULX } from "../../generated/TokenBurn/TokenBurn";
import {
    PackageBurnt,
    PackageRewardAirdropped,
    PackageRewardClaimed,
    WULXBurnt,
} from "../../generated/StakingFacet/StakingFacet";

export function createBurnWULXEvent(
    creation_date: BigInt,
    burnAmount: BigInt,
    contractId: i32
): BurnWULX {
    const event = changetype<BurnWULX>(newMockEvent());
    event.block.timestamp = creation_date;
    event.parameters = new Array(2);
    event.parameters[0] = new ethereum.EventParam(
        "amount",
        ethereum.Value.fromUnsignedBigInt(burnAmount)
    );
    event.parameters[1] = new ethereum.EventParam("contractId", ethereum.Value.fromI32(contractId));

    return event;
}

export function createPackageBurntEvent(
    creation_date: BigInt,
    nftItemId: BigInt,
    burnAmount: BigInt
): PackageBurnt {
    const event = changetype<PackageBurnt>(newMockEvent());
    event.block.timestamp = creation_date;
    event.parameters = new Array(2);
    event.parameters[0] = new ethereum.EventParam(
        "nftItemId",
        ethereum.Value.fromUnsignedBigInt(nftItemId)
    );
    event.parameters[1] = new ethereum.EventParam(
        "burnAmount",
        ethereum.Value.fromUnsignedBigInt(burnAmount)
    );

    return event;
}

export function createPackageRewardClaimedEvent(
    creation_date: BigInt,
    nftItemId: BigInt,
    epoch: BigInt,
    packageId: BigInt,
    cappedRewardAmount: BigInt,
    burnAmount: BigInt,
    cappedUSDTAmountPortion: BigInt
): PackageRewardClaimed {
    const event = changetype<PackageRewardClaimed>(newMockEvent());
    event.block.timestamp = creation_date;
    event.parameters = new Array(6);
    event.parameters[0] = new ethereum.EventParam(
        "nftItemId",
        ethereum.Value.fromUnsignedBigInt(nftItemId)
    );
    event.parameters[1] = new ethereum.EventParam(
        "epoch",
        ethereum.Value.fromUnsignedBigInt(epoch)
    );
    event.parameters[2] = new ethereum.EventParam(
        "packageId",
        ethereum.Value.fromUnsignedBigInt(packageId)
    );
    event.parameters[3] = new ethereum.EventParam(
        "cappedRewardAmount",
        ethereum.Value.fromUnsignedBigInt(cappedRewardAmount)
    );
    event.parameters[4] = new ethereum.EventParam(
        "burnAmount",
        ethereum.Value.fromUnsignedBigInt(burnAmount)
    );
    event.parameters[5] = new ethereum.EventParam(
        "cappedUSDTAmountPortion",
        ethereum.Value.fromUnsignedBigInt(cappedUSDTAmountPortion)
    );

    return event;
}

export function createWULXBurntEvent(creation_date: BigInt, amount: BigInt): WULXBurnt {
    const event = changetype<WULXBurnt>(newMockEvent());
    event.block.timestamp = creation_date;
    event.parameters = new Array(1);
    event.parameters[0] = new ethereum.EventParam(
        "amount",
        ethereum.Value.fromUnsignedBigInt(amount)
    );

    return event;
}

export function createPackageRewardAirdroppedEvent(
    creation_date: BigInt,
    nftItemId: BigInt,
    epoch: BigInt,
    airdropAmount: BigInt,
    burnAmount: BigInt,
    extraBurnAmount: BigInt
): PackageRewardAirdropped {
    const event = changetype<PackageRewardAirdropped>(newMockEvent());
    event.block.timestamp = creation_date;
    event.parameters = new Array(5);
    event.parameters[0] = new ethereum.EventParam(
        "nftItemId",
        ethereum.Value.fromUnsignedBigInt(nftItemId)
    );
    event.parameters[1] = new ethereum.EventParam(
        "epoch",
        ethereum.Value.fromUnsignedBigInt(epoch)
    );
    event.parameters[2] = new ethereum.EventParam(
        "airdropAmount",
        ethereum.Value.fromUnsignedBigInt(airdropAmount)
    );
    event.parameters[3] = new ethereum.EventParam(
        "burnAmount",
        ethereum.Value.fromUnsignedBigInt(burnAmount)
    );
    event.parameters[4] = new ethereum.EventParam(
        "extraBurnAmount",
        ethereum.Value.fromUnsignedBigInt(extraBurnAmount)
    );

    return event;
}
