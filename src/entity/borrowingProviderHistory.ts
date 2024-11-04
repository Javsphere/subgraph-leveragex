import { BorrowingProviderHistory } from "../../generated/schema";
import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { TOKEN_DECIMALS, WEI_E18_BD } from "../common";

export function saveBorrowingProviderHistory(
    id: Bytes,
    user: Bytes,
    tokenIn: Bytes,
    tokenOut: Bytes,
    tokenIndex: i32,
    amountIn: BigDecimal,
    amountOut: BigDecimal,
    isSell: boolean,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    let borrowingProviderHistory = new BorrowingProviderHistory(id);

    borrowingProviderHistory.address = user;
    borrowingProviderHistory.tokenIn = tokenIn;
    borrowingProviderHistory.tokenOut = tokenOut;
    borrowingProviderHistory.amountIn = amountIn.div(
        isSell ? WEI_E18_BD : TOKEN_DECIMALS[tokenIndex]
    );
    borrowingProviderHistory.amountOut = amountOut.div(
        isSell ? TOKEN_DECIMALS[tokenIndex] : WEI_E18_BD
    );
    borrowingProviderHistory.type = isSell ? "SELL" : "BUY";

    borrowingProviderHistory.block = block;
    borrowingProviderHistory.tx = tx;
    borrowingProviderHistory.date = date;

    borrowingProviderHistory.save();
}
