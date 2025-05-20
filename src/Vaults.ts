import { Deposit, Withdraw, WithdrawCanceled, WithdrawRequested } from "../generated/XVault/XVault";
import {
    handleXVaultDeposit,
    handleXVaultWithdraw,
    handleXVaultWithdrawRequest,
    handleXVaultCancelWithdrawRequest,
} from "./XVault";
import { XVaultType } from "./common";

export function handleJavVaultWithdrawRequest(event: WithdrawRequested): void {
    handleXVaultWithdrawRequest(event, XVaultType.JAV);
}

export function handleJavVaultCancelWithdrawRequest(event: WithdrawCanceled): void {
    handleXVaultCancelWithdrawRequest(event, XVaultType.JAV);
}

export function handleJavVaultDeposit(event: Deposit): void {
    handleXVaultDeposit(event, XVaultType.JAV);
}

export function handleJavVaultWithdraw(event: Withdraw): void {
    handleXVaultWithdraw(event, XVaultType.JAV);
}

export function handleJavlisVaultWithdrawRequest(event: WithdrawRequested): void {
    handleXVaultWithdrawRequest(event, XVaultType.JAVLIS);
}

export function handleJavlisVaultCancelWithdrawRequest(event: WithdrawCanceled): void {
    handleXVaultCancelWithdrawRequest(event, XVaultType.JAVLIS);
}

export function handleJavlisVaultDeposit(event: Deposit): void {
    handleXVaultDeposit(event, XVaultType.JAVLIS);
}

export function handleJavlisVaultWithdraw(event: Withdraw): void {
    handleXVaultWithdraw(event, XVaultType.JAVLIS);
}
