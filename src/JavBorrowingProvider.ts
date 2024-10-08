import { BigDecimal } from "@graphprotocol/graph-ts";
import { saveBorrowingProviderHistory } from "./entity/borrowingProviderHistory";
import {
    BuyLLP,
    RewardDistributed,
    SellLLP,
} from "../generated/JavBorrowingProvider/JavBorrowingProvider";
import { saveLLPRewardsStat } from "./entity/llpRewardsStats";

export function handleBuyLLP(event: BuyLLP): void {
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

export function handleSellLLP(event: SellLLP): void {
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

export function handleRewardDistributed(event: RewardDistributed): void {
    const params = event.params;

    saveLLPRewardsStat(new BigDecimal(params.usdAmount), event.block.timestamp);
}
