import { BigDecimal } from "@graphprotocol/graph-ts";
import { saveXVaultHistory } from "./entity/xVaultHistory";
import { saveXVaultRequest } from "./entity/xVaultRequests";
import { Deposit, Withdraw, WithdrawCanceled, WithdrawRequested } from "../generated/XVault/XVault";

export function handleXVaultWithdrawRequest(event: WithdrawRequested): void {
    const params = event.params;

    saveXVaultRequest(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.sender,
        params.owner,
        new BigDecimal(params.shares),
        params.currEpoch,
        params.unlockEpoch,
        true,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleXVaultCancelWithdrawRequest(event: WithdrawCanceled): void {
    const params = event.params;

    saveXVaultRequest(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.sender,
        params.owner,
        new BigDecimal(params.shares),
        params.currEpoch,
        params.unlockEpoch,
        false,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleXVaultDeposit(event: Deposit): void {
    const params = event.params;

    saveXVaultHistory(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.sender,
        params.owner,
        new BigDecimal(params.assets),
        new BigDecimal(params.shares),
        true,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleXVaultWithdraw(event: Withdraw): void {
    const params = event.params;

    saveXVaultHistory(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.owner,
        params.receiver,
        new BigDecimal(params.assets),
        new BigDecimal(params.shares),
        false,
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}
