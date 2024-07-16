import { BuyJLP, SellJLP } from "../generated/JavBorrowingProvider/JavBorrowingProvider";
import { BigDecimal } from "@graphprotocol/graph-ts";
import { saveBorrowingProviderHistory } from "./entity/borrowingProviderHistory";

export function handleBuyJLP(event: BuyJLP): void {
    const params = event.params;

    saveBorrowingProviderHistory(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.user,
        params.tokenIn,
        params.tokenOut,
        new BigDecimal(params.amountIn),
        new BigDecimal(params.amountOut),
        "BUY",
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}

export function handleSellJLP(event: SellJLP): void {
    const params = event.params;

    saveBorrowingProviderHistory(
        event.transaction.hash.concatI32(event.logIndex.toI32()),
        params.user,
        params.tokenIn,
        params.tokenOut,
        new BigDecimal(params.amountIn),
        new BigDecimal(params.amountOut),
        "SELL",
        event.block.number,
        event.transaction.hash,
        event.block.timestamp
    );
}
