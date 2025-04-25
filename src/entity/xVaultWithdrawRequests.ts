import { XVaultWithdrawRequest } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { WEI_E18_BD } from "../common";

export function saveXVaultWithdrawRequest(
    id: Bytes,
    sender: Bytes,
    owner: Bytes,
    shares: BigDecimal,
    currEpoch: BigInt,
    unlockEpoch: BigInt,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    let xVaultWithdrawRequest = new XVaultWithdrawRequest(id);

    xVaultWithdrawRequest.senderAddress = sender;
    xVaultWithdrawRequest.ownerAddress = owner;
    xVaultWithdrawRequest.shares = shares.div(WEI_E18_BD);
    xVaultWithdrawRequest.currentEpoch = currEpoch;
    xVaultWithdrawRequest.unlockEpoch = unlockEpoch;

    xVaultWithdrawRequest.block = block;
    xVaultWithdrawRequest.tx = tx;
    xVaultWithdrawRequest.date = date;

    xVaultWithdrawRequest.save();
}
