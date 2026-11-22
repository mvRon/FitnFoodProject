const PaymentOutbox = require("../models/PaymentOutboxModel");
const Notification = require("../models/NotificationModel");
const EmailService = require("./EmailService");
const { emitToAdmin } = require("../socket/notificationSocket");

let workerTimer = null;
let workerRunning = false;

const claimNextEvent = async () => {
    const now = new Date();
    const staleLockCutoff = new Date(Date.now() - 60000);
    return PaymentOutbox.findOneAndUpdate(
        {
            $or: [
                { status: { $in: ["pending", "failed"] }, nextAttemptAt: { $lte: now } },
                { status: "processing", lockedAt: { $lte: staleLockCutoff } },
            ],
            attempts: { $lt: 10 },
        },
        {
            $set: { status: "processing", lockedAt: now },
            $inc: { attempts: 1 },
        },
        { sort: { createdAt: 1 }, new: true }
    );
};

const createAdminNotification = async (event) => {
    const payload = event.payload || {};
    const dedupKey =
        event.eventType === "ORDER_PAID"
            ? `notification:${event.dedupKey}`
            : `notification:${event.dedupKey}`;

    const notificationData =
        event.eventType === "ORDER_PAID"
            ? {
                recipientType: "admin",
                type: "NEW_ORDER",
                title: "Đơn hàng mới!",
                message: `Đơn hàng #${payload.orderId.slice(-6).toUpperCase()} vừa được đặt và thanh toán qua QR.`,
                metadata: {
                    orderId: payload.orderId,
                    totalPrice: payload.totalPrice,
                    paymentMethod: payload.paymentMethod || "payos",
                },
            }
            : {
                recipientType: "admin",
                type: "PAYMENT_FAILED",
                title: "Thanh toán thất bại!",
                message: `Đơn hàng #${payload.orderId.slice(-6).toUpperCase()} bị hủy hoặc lỗi thanh toán (mã: ${payload.code}).`,
                metadata: {
                    orderId: payload.orderId,
                    code: payload.code,
                    reason: payload.reason,
                },
            };

    const notification = await Notification.findOneAndUpdate(
        { dedupKey },
        {
            $setOnInsert: {
                ...notificationData,
                dedupKey,
                isRead: false,
            },
        },
        { upsert: true, new: true }
    );

    if (notification) {
        emitToAdmin(notification);
    }
};

const processEvent = async (event, io) => {
    if (event.eventType === "ORDER_PAID") {
        const payload = event.payload || {};
        if (payload.email) {
            await EmailService.sendEmailOrder({
                email: payload.email,
                orderItems: payload.orderItems || [],
                totalPrice: payload.totalPrice,
            });
        }

        await createAdminNotification(event);

        if (io) {
            io.to(`payment:${payload.orderId}`).emit("payment:success", {
                orderId: payload.orderId,
                totalPrice: payload.totalPrice,
                paidAt: payload.paidAt,
            });
        }
    } else {
        await createAdminNotification(event);

        const payload = event.payload || {};
        if (io) {
            io.to(`payment:${payload.orderId}`).emit("payment:cancelled", {
                orderId: payload.orderId,
                reason: payload.reason,
            });
        }
    }
};

const runPaymentOutboxWorker = async (io) => {
    if (workerRunning) return;
    workerRunning = true;

    try {
        while (true) {
            const event = await claimNextEvent();
            if (!event) break;

            try {
                await processEvent(event, io);
                await PaymentOutbox.findByIdAndUpdate(event._id, {
                    $set: {
                        status: "processed",
                        processedAt: new Date(),
                        lockedAt: null,
                        lastError: null,
                    },
                });
            } catch (error) {
                await PaymentOutbox.findByIdAndUpdate(event._id, {
                    $set: {
                        status: "failed",
                        lockedAt: null,
                        nextAttemptAt: new Date(Date.now() + Math.min(60000, 5000 * event.attempts)),
                        lastError: error?.message || "Unknown outbox error",
                    },
                });
                console.error("[PaymentOutbox] Event processing failed:", error);
            }
        }
    } finally {
        workerRunning = false;
    }
};

const startPaymentOutboxWorker = (io) => {
    if (workerTimer) return;
    runPaymentOutboxWorker(io).catch((error) => console.error("[PaymentOutbox] Worker error:", error));
    workerTimer = setInterval(() => {
        runPaymentOutboxWorker(io).catch((error) => console.error("[PaymentOutbox] Worker error:", error));
    }, 5000);
    workerTimer.unref?.();
};

module.exports = { startPaymentOutboxWorker, runPaymentOutboxWorker };
