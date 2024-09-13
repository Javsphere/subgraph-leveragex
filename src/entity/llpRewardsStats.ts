import { BigDecimal, BigInt } from "@graphprotocol/graph-ts";
import { LlpRewardsStat } from "../../generated/schema";
import { dayWeekMonthYearFromTimestamp, WEI_E18_BD } from "../common";

export function saveLLPRewardsStat(usdAmount: BigDecimal, timestamp: BigInt): void {
    const date = dayWeekMonthYearFromTimestamp(timestamp);
    const dayID = `${date.year}-${date.month}-${date.day}`;
    let llpRewardsStats = LlpRewardsStat.load(dayID);
    if (!llpRewardsStats) {
        llpRewardsStats = new LlpRewardsStat(dayID);
        llpRewardsStats.usdAmount = BigDecimal.fromString("0");
    }
    llpRewardsStats.usdAmount = llpRewardsStats.usdAmount.plus(usdAmount.div(WEI_E18_BD));
    llpRewardsStats.save();
}
