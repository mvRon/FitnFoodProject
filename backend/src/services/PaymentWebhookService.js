const Order = require("../models/OrderModel");
const PaymentOutbox = require("../models/PaymentOutboxModel");
const OrderService = require("./OrderService");

const enqueueOutbox = async (data) => {
    try {
        await PaymentOutbox.create(data);
    } catch (error) {
        if (error?.code !== 11000) {
            throw error;
        }
    }
};

const handleVerifiedWebhook = async ({ orderCode, code, desc, amount, paymentLinkId }) => {
    const numericOrderCode = Number(orderCode);
    if (!Number.isSafeInteger(numericOrderCode)) {
        return { status: "ignored", reason: "invalid_order_code" };
    }

    const order = await Order.findOne({ payosOrderCode: numericOrderCode }).populate("user", "email");
    if (!order) {
        return { status: "ignored", reason: "order_not_found" };
    }

    if (code === "00") {
        if (amount !== undefined && Number(amount) !== Number(order.totalPrice)) {
            console.warn(
                `[PayOS Webhook] Amount mismatch for order ${order._id}: webhook=${amount}, order=${order.totalPrice}`
            );
            return { status: "ignored", reason: "amount_mismatch" };
        }

        if (paymentLinkId && order.paymentLinkId && String(paymentLinkId) !== String(order.paymentLinkId)) {
            console.warn(`[PayOS Webhook] Payment link mismatch for order ${order._id}`);
            return { status: "ignored", reason: "payment_link_mismatch" };
        }

        const paidAt = new Date();
        const paidOrder = await Order.findOneAndUpdate(
            {
                _id: order._id,
                isPaid: { $ne: true },
                $or: [
                    { paymentStatus: "pending" },
                    { paymentStatus: "failed" },
                    { paymentStatus: { $exists: false } },
                ],
            },
            {
                $set: {
                    isPaid: true,
                    paidAt,
                    paymentStatus: "paid",
                },
            },
            { new: true }
        );

        if (!paidOrder) {
            return { status: "duplicate", reason: "already_paid_or_cancelled" };
        }

        await enqueueOutbox({
            dedupKey: `payos:${numericOrderCode}:paid`,
            order: paidOrder._id,
            eventType: "ORDER_PAID",
            payload: {
                orderId: paidOrder._id.toString(),
                email: order.user?.email || "",
                orderItems: paidOrder.orderItems,
                totalPrice: paidOrder.totalPrice,
                paymentMethod: paidOrder.paymentMethod || "payos",
                paidAt,
            },
        });

        return { status: "processed", paidAt };
    }

    const cancelResult = await OrderService.cancelExpiredOrder(order._id);

    if (cancelResult.status === "OK") {
        await enqueueOutbox({
            dedupKey: `payos:${numericOrderCode}:cancelled`,
            order: order._id,
            eventType: "PAYMENT_CANCELLED",
            payload: {
                orderId: order._id.toString(),
                code,
                reason: desc || "Payment failed/cancelled",
            },
        });
    }

    return { status: "processed", cancelResult };
};

module.exports = { handleVerifiedWebhook };
