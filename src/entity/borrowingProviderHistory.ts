import { BorrowingProviderHistory } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { WEI_E18_BD } from "../common";

export function saveBorrowingProviderHistory(
    id: Bytes,
    user: Bytes,
    tokenIn: Bytes,
    tokenOut: Bytes,
    amountIn: BigDecimal,
    amountOut: BigDecimal,
    type: string,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    let borrowingProviderHistory = new BorrowingProviderHistory(id);

    borrowingProviderHistory.address = user;
    borrowingProviderHistory.tokenIn = tokenIn;
    borrowingProviderHistory.tokenOut = tokenOut;
    borrowingProviderHistory.amountIn = amountIn.div(WEI_E18_BD);
    borrowingProviderHistory.amountOut = amountOut.div(WEI_E18_BD);
    borrowingProviderHistory.type = type;

    borrowingProviderHistory.block = block;
    borrowingProviderHistory.tx = tx;
    borrowingProviderHistory.date = date;

    borrowingProviderHistory.save();
}
