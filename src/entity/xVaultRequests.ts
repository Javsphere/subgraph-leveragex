import { XVaultRequest } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { WEI_E18_BD, XVaultType } from "../common";

export function saveXVaultRequest(
    id: Bytes,
    sender: Bytes,
    owner: Bytes,
    shares: BigDecimal,
    currEpoch: BigInt,
    unlockEpoch: BigInt,
    isWithdraw: boolean,
    vaultType: XVaultType,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    let xVaultRequest = new XVaultRequest(id);

    xVaultRequest.senderAddress = sender;
    xVaultRequest.ownerAddress = owner;
    xVaultRequest.shares = shares.div(WEI_E18_BD);
    xVaultRequest.currentEpoch = currEpoch;
    xVaultRequest.unlockEpoch = unlockEpoch;
    xVaultRequest.type = isWithdraw ? "WITHDRAW" : "CANCEL";
    xVaultRequest.vaultType = vaultType == XVaultType.JAV ? "JAV" : "JAVLIS";

    xVaultRequest.block = block;
    xVaultRequest.tx = tx;
    xVaultRequest.date = date;

    xVaultRequest.save();
}
