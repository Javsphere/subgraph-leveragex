import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { saveXVaultHistory } from "./entity/xVaultHistory";
import { saveXVaultRequest } from "./entity/xVaultRequests";
import { Deposit, Withdraw, WithdrawCanceled, WithdrawRequested } from "../generated/XVault/XVault";
import { XVaultType } from "./common";

export function handleXVaultWithdrawRequest(event: WithdrawRequested, vaultType: XVaultType): void {
    const params = event.params;

    saveXVaultRequest(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.sender,
        params.owner,
        new BigDecimal(params.shares),
        params.currEpoch,
        params.unlockEpoch,
        true,
        vaultType,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleXVaultCancelWithdrawRequest(
    event: WithdrawCanceled,
    vaultType: XVaultType
): void {
    const params = event.params;

    saveXVaultRequest(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.sender,
        params.owner,
        new BigDecimal(params.shares),
        params.currEpoch,
        params.unlockEpoch,
        false,
        vaultType,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleXVaultDeposit(event: Deposit, vaultType: XVaultType): void {
    const params = event.params;

    saveXVaultHistory(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.sender,
        params.owner,
        new BigDecimal(params.assets),
        new BigDecimal(params.shares),
        true,
        vaultType,
        BigInt.fromI32(0),
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleXVaultWithdraw(event: Withdraw, vaultType: XVaultType): void {
    const params = event.params;

    saveXVaultHistory(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.owner,
        params.receiver,
        new BigDecimal(params.assets),
        new BigDecimal(params.shares),
        false,
        vaultType,
        params.unlockEpoch,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}
