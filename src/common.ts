import { Bytes, crypto, BigInt, Address, BigDecimal, ethereum } from "@graphprotocol/graph-ts";

export const ZERO_BI = BigInt.zero();
const ONE_BI = BigInt.fromI32(1);

export const PAIRS_STATISTIC_ENTITY_TYPE = "PairsStatistic";

export const WEI_E3_BD = BigDecimal.fromString("1e3");
export const WEI_E8_BD = BigDecimal.fromString("1e18");
export const WEI_E10_BD = BigDecimal.fromString("1e10");
export const WEI_E18_BD = BigDecimal.fromString("1e18");
