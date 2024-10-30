import { OpenOrder } from "../../generated/schema";
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts";
import { ZERO_BYTES } from "../common";

export function saveOpenOrder(
    user: Address,
    index: BigInt,
    block: BigInt,
    tx: Bytes,
    date: BigInt
): void {
    const orderID = `${user.toHexString()}-${index}`;
    let order = OpenOrder.load(orderID);
    if (!order) {
        order = new OpenOrder(orderID);
        order.user = user;
        order.index = index;
        order.isOpen = true;

        order.block = block;
        order.openTx = tx;
        order.closeTx = ZERO_BYTES;
        order.date = date;
    }

    order.save();
}

export function closeOpenOrder(user: Address, index: BigInt, tx: Bytes): void {
    const orderID = `${user.toHexString()}-${index}`;
    let order = OpenOrder.load(orderID);
    if (order && order.isOpen) {
        order.isOpen = false;
        order.closeTx = tx;

        order.save();
    }
}
