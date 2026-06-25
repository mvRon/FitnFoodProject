import React, { useEffect, useRef, useState, useCallback } from "react";
import { Modal, Button, Typography, message as toast } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, QrcodeOutlined } from '@ant-design/icons';
import styled, { keyframes } from "styled-components";
import { convertPrice } from "../../utils";

const { Text, Title } = Typography;

// =============================================
// Styled Components
// =============================================

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 8px 0;
`;

const QRWrapper = styled.div`
  border: 3px solid ${(p) => (p.$expired ? "#ff4d4f" : "#22c55e")};
  border-radius: 16px;
  padding: 12px;
  background: #fff;
  transition: border-color 0.3s;
  position: relative;
  
  img {
    width: 220px;
    height: 220px;
    display: block;
    border-radius: 8px;
  }
`;

const ExpiredOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  border-radius: 13px;
`;

const CountdownText = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: ${(p) => (p.$warning ? "#f59e0b" : p.$expired ? "#ef4444" : "#22c55e")};
  animation: ${(p) => (p.$expired ? pulse : "none")} 1s infinite;
  min-width: 60px;
  text-align: center;
`;

const AmountText = styled.div`
  font-size: 22px;
  font-weight: 800;
  color: #0ea5e9;
  letter-spacing: -0.5px;
`;

const InstructionList = styled.ol`
  margin: 0;
  padding-left: 20px;
  color: #475569;
  font-size: 13px;
  line-height: 1.8;
`;

const StatusBadge = styled.div`
  background: ${(p) => (p.$success ? "#dcfce7" : p.$cancelled ? "#fee2e2" : "#fef3c7")};
  color: ${(p) => (p.$success ? "#16a34a" : p.$cancelled ? "#dc2626" : "#d97706")};
  border: 1px solid ${(p) => (p.$success ? "#bbf7d0" : p.$cancelled ? "#fecaca" : "#fde68a")};
  border-radius: 999px;
  padding: 4px 16px;
  font-size: 13px;
  font-weight: 600;
`;

const OpenLinkButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, #0ea5e9, #6366f1);
  color: #fff !important;
  padding: 8px 20px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  text-decoration: none !important;
  transition: opacity 0.2s;
  
  &:hover { opacity: 0.9; }
`;

const PAYMENT_TIMEOUT_SECONDS = 15 * 60; // 15 phút

// =============================================
// PaymentQRModal Component
// =============================================

/**
 * Modal hiển thị QR code PayOS để thanh toán
 * 
 * Props:
 * - isOpen: boolean
 * - qrCode: string (URL hình QR từ PayOS)
 * - checkoutUrl: string (link PayOS để mở trên trình duyệt)
 * - amount: number (tổng tiền VND)
 * - orderId: string (MongoDB _id của đơn hàng)
 * - socketRef: React ref của socket.io client (để lắng nghe payment:success)
 * - onSuccess: callback() khi thanh toán thành công
 * - onCancel: callback() khi user đóng modal / hủy
 * - onExpire: callback(orderId) khi hết countdown
 */
const PaymentQRModal = ({
    isOpen,
    qrCode,
    checkoutUrl,
    amount,
    orderId,
    socketRef,
    onSuccess,
    onCancel,
    onExpire,
    bin,
    accountNumber,
    accountName,
    description,
}) => {
    const [secondsLeft, setSecondsLeft] = useState(PAYMENT_TIMEOUT_SECONDS);
    const [paymentStatus, setPaymentStatus] = useState("pending"); // pending | success | cancelled | expired
    const intervalRef = useRef(null);
    const hasHandledRef = useRef(false);

    // Countdown timer
    useEffect(() => {
        if (!isOpen || paymentStatus !== "pending") return;

        hasHandledRef.current = false;
        setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);

        intervalRef.current = setInterval(() => {
            setSecondsLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(intervalRef.current);
                    setPaymentStatus("expired");
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => {
            clearInterval(intervalRef.current);
        };
    }, [isOpen, paymentStatus]);

    // Xử lý khi hết hạn
    useEffect(() => {
        if (paymentStatus === "expired" && !hasHandledRef.current) {
            hasHandledRef.current = true;
            toast.warning("Link thanh toán đã hết hạn. Đơn hàng đã bị hủy.");
            if (onExpire) onExpire(orderId);
        }
    }, [paymentStatus, orderId, onExpire]);

    // Lắng nghe Socket.IO event payment:success / payment:cancelled
    useEffect(() => {
        if (!isOpen || !socketRef?.current || !orderId) return;

        const socket = socketRef.current;

        // Tham gia phòng theo dõi thanh toán
        socket.emit("payment:join", { orderId });

        const handleSuccess = (payload) => {
            if (String(payload?.orderId) !== String(orderId)) return;
            if (hasHandledRef.current) return;
            hasHandledRef.current = true;

            clearInterval(intervalRef.current);
            setPaymentStatus("success");
            toast.success("Thanh toán thành công!");

            setTimeout(() => {
                if (onSuccess) onSuccess(payload);
            }, 1500); // Delay 1.5s để user nhìn thấy trạng thái success
        };

        const handleCancelled = (payload) => {
            if (String(payload?.orderId) !== String(orderId)) return;
            if (hasHandledRef.current) return;
            hasHandledRef.current = true;

            clearInterval(intervalRef.current);
            setPaymentStatus("cancelled");
            toast.error("Thanh toán đã bị hủy.");

            setTimeout(() => {
                if (onCancel) onCancel();
            }, 1500);
        };

        socket.on("payment:success", handleSuccess);
        socket.on("payment:cancelled", handleCancelled);

        return () => {
            socket.emit("payment:leave", { orderId });
            socket.off("payment:success", handleSuccess);
            socket.off("payment:cancelled", handleCancelled);
        };
    }, [isOpen, orderId, socketRef, onSuccess, onCancel]);

    // Reset khi modal đóng
    useEffect(() => {
        if (!isOpen) {
            clearInterval(intervalRef.current);
            setPaymentStatus("pending");
            setSecondsLeft(PAYMENT_TIMEOUT_SECONDS);
            hasHandledRef.current = false;
        }
    }, [isOpen]);

    const formatTime = (secs) => {
        const m = Math.floor(secs / 60).toString().padStart(2, "0");
        const s = (secs % 60).toString().padStart(2, "0");
        return `${m}:${s}`;
    };

    const isExpired = paymentStatus === "expired";
    const isSuccess = paymentStatus === "success";
    const isCancelled = paymentStatus === "cancelled";
    const isDone = isExpired || isSuccess || isCancelled;
    const isWarning = !isDone && secondsLeft < 180; // Dưới 3 phút cảnh báo

    const handleClose = useCallback(() => {
        if (!isDone && !hasHandledRef.current) {
            hasHandledRef.current = true;
            // User đóng modal trước khi thanh toán → gọi onCancel
        }
        clearInterval(intervalRef.current);
        if (onCancel) onCancel();
    }, [isDone, onCancel]);

    const renderStatus = () => {
        if (isSuccess) return <StatusBadge $success><CheckCircleOutlined /> Thanh toán thành công!</StatusBadge>;
        if (isCancelled) return <StatusBadge $cancelled><CloseCircleOutlined /> Thanh toán đã bị hủy</StatusBadge>;
        if (isExpired) return <StatusBadge $cancelled>⏰ Hết thời gian thanh toán</StatusBadge>;
        return (
            <StatusBadge>
                ⏳ Chờ thanh toán —{" "}
                <CountdownText as="span" $warning={isWarning} $expired={isExpired}>
                    {formatTime(secondsLeft)}
                </CountdownText>
            </StatusBadge>
        );
    };

    const qrImageUrl = (bin && accountNumber)
        ? `https://img.vietqr.io/image/${bin}-${accountNumber}-qr_only.jpg?amount=${amount}&addInfo=${encodeURIComponent(description || "")}&accountName=${encodeURIComponent(accountName || "")}`
        : qrCode?.startsWith("http")
            ? qrCode
            : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrCode || "")}`;

    return (
        <Modal
            open={isOpen}
            onCancel={handleClose}
            footer={
                isDone
                    ? [
                        <Button key="close" type="primary" onClick={handleClose}>
                            Đóng
                        </Button>,
                    ]
                    : [
                        <Button key="cancel" onClick={handleClose}>
                            Hủy thanh toán
                        </Button>,
                    ]
            }
            title={
                <span style={{ fontSize: 16, fontWeight: 700 }}>
                    <QrcodeOutlined /> Thanh toán bằng QR Code
                </span>
            }
            width={380}
            centered
            maskClosable={false}
            destroyOnHidden
        >
            <ModalBody>
                {/* Số tiền */}
                <AmountText>{convertPrice(amount)}</AmountText>

                {/* QR Code */}
                {qrCode && (
                    <QRWrapper $expired={isExpired}>
                        <img src={qrImageUrl} alt="QR Code thanh toán PayOS" />
                        {isExpired && <ExpiredOverlay>Hết hạn</ExpiredOverlay>}
                        {isSuccess && (
                            <ExpiredOverlay style={{ background: "rgba(34,197,94,0.8)" }}>
                                ✓ Đã thanh toán
                            </ExpiredOverlay>
                        )}
                    </QRWrapper>
                )}

                {/* Trạng thái / Countdown */}
                {renderStatus()}

                {/* Nút mở link */}
                {!isDone && checkoutUrl && (
                    <OpenLinkButton href={checkoutUrl} target="_blank" rel="noopener noreferrer">
                        🔗 Mở trang thanh toán
                    </OpenLinkButton>
                )}

                {/* Hướng dẫn */}
                {!isDone && (
                    <InstructionList>
                        <li>Mở app ngân hàng hỗ trợ QR (Vietcombank, MB, BIDV...)</li>
                        <li>Chọn "Quét mã QR" hoặc "Thanh toán QR"</li>
                        <li>Quét mã QR bên trên</li>
                        <li>Xác nhận thanh toán trên app</li>
                    </InstructionList>
                )}

                {/* Thông báo khi hết hạn */}
                {isExpired && (
                    <Text type="secondary" style={{ fontSize: 12, textAlign: "center" }}>
                        Đơn hàng đã bị hủy tự động. Vui lòng đặt hàng lại.
                    </Text>
                )}
            </ModalBody>
        </Modal>
    );
};

export default PaymentQRModal;
