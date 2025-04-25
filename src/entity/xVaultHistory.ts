import { XVaultHistory } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { WEI_E18_BD } from "../common";

export function saveXVaultHistory(
    id: Bytes,
    caller: Bytes,
    receiver: Bytes,
    assetsAmount: BigDecimal,
    sharesAmount: BigDecimal,
    isDeposit: boolean,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    let xVaultHistory = new XVaultHistory(id);

    xVaultHistory.ownerAddress = caller;
    xVaultHistory.receiverAddress = receiver;
    xVaultHistory.assetsAmount = assetsAmount.div(WEI_E18_BD);
    xVaultHistory.sharesAmount = sharesAmount.div(WEI_E18_BD);

    xVaultHistory.type = isDeposit ? "DEPOSIT" : "WITHDRAW";

    xVaultHistory.block = block;
    xVaultHistory.tx = tx;
    xVaultHistory.date = date;

    xVaultHistory.save();
}
