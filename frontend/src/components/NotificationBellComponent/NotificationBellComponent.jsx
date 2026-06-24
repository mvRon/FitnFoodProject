import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    BellOutlined, 
    CheckOutlined, 
    InboxOutlined, 
    ShoppingCartOutlined, 
    CustomerServiceOutlined, 
    WarningOutlined, 
    CarOutlined, 
    CheckCircleOutlined, 
    FireOutlined, 
    MessageOutlined 
} from '@ant-design/icons';
import { useNotification } from '../../context/NotificationContext';
import {
    BellContainer,
    BellButton,
    UnreadBadge,
    DropdownWrapper,
    DropdownHeader,
    HeaderTitle,
    HeaderBadge,
    MarkAllReadButton,
    NotificationList,
    EmptyState,
    NotificationItemWrapper,
    IconContainer,
    ContentWrapper,
    TitleContainer,
    NotificationTitle,
    TimeText,
    MessageText,
    TagContainer,
    MetaTag,
    UnreadDot,
    DropdownFooter
} from './Style';

// =============================================
// Notification type config: icon + color + navigate path
// =============================================
const TYPE_CONFIG = {
    LOW_STOCK:      { icon: <InboxOutlined />, color: '#f59e0b', label: 'Tồn kho thấp' },
    NEW_ORDER:      { icon: <ShoppingCartOutlined />, color: '#10b981', label: 'Đơn hàng mới' },
    CHAT_SUPPORT:   { icon: <CustomerServiceOutlined />, color: '#6366f1', label: 'Yêu cầu CSKH' },
    PAYMENT_FAILED: { icon: <WarningOutlined />, color: '#ef4444', label: 'Lỗi thanh toán' },
    ORDER_STATUS:   { icon: <CarOutlined />, color: '#0ea5e9', label: 'Đơn hàng' },
    RESTOCK:        { icon: <CheckCircleOutlined />, color: '#10b981', label: 'Hàng về' },
    FLASH_SALE:     { icon: <FireOutlined />, color: '#f97316', label: 'Flash Sale' },
    CHAT_REPLY:     { icon: <MessageOutlined />, color: '#8b5cf6', label: 'Phản hồi CSKH' },
};

const getNavigatePath = (notification) => {
    const meta = notification?.metadata || {};
    switch (notification.type) {
        case 'NEW_ORDER':
        case 'PAYMENT_FAILED':
            return { path: '/system/admin', state: { openTab: 'Order' } };
        case 'LOW_STOCK':
            return { path: '/system/admin', state: { openTab: 'Inventory' } };
        case 'CHAT_SUPPORT':
            return { path: '/system/admin', state: { openTab: 'Chat' } };
        case 'ORDER_STATUS':
            return { path: meta.orderId ? `/orderDetail/${meta.orderId}` : '/myOrder' };
        case 'RESTOCK':
            return { path: meta.productId ? `/productDetail/${meta.productId}` : '/' };
        case 'FLASH_SALE':
            return { path: meta.link || '/' };
        case 'CHAT_REPLY':
            return { path: null }; // mở chat widget
        default:
            return { path: '/' };
    }
};

const formatTimeAgo = (dateStr) => {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now - date;
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1)  return 'Vừa xong';
    if (diffMin < 60) return `${diffMin} phút trước`;
    if (diffHr < 24)  return `${diffHr} giờ trước`;
    return `${diffDay} ngày trước`;
};

const NotificationBellComponent = () => {
    const navigate = useNavigate();
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();

    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Đóng dropdown khi click ra ngoài
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [isOpen]);

    const handleNotificationClick = useCallback(async (notification) => {
        if (!notification.isRead) {
            await markAsRead(notification._id);
        }
        const routeObj = getNavigatePath(notification);
        setIsOpen(false);
        if (routeObj && routeObj.path) {
            navigate(routeObj.path, { state: routeObj.state });
        }
    }, [markAsRead, navigate]);

    const handleMarkAllRead = useCallback(async (e) => {
        e.stopPropagation();
        await markAllAsRead();
    }, [markAllAsRead]);

    const displayNotifications = notifications.slice(0, 10);

    return (
        <BellContainer ref={dropdownRef}>
            {/* Chuông */}
            <BellButton
                id="notification-bell-btn"
                onClick={() => setIsOpen((v) => !v)}
                aria-label="Thông báo"
            >
                <BellOutlined style={{ fontSize: 22, color: 'var(--color-white)' }} />
                {unreadCount > 0 && (
                    <UnreadBadge $hasUnread={unreadCount > 0}>
                        {unreadCount > 99 ? '99+' : unreadCount}
                    </UnreadBadge>
                )}
            </BellButton>

            {/* Dropdown */}
            {isOpen && (
                <DropdownWrapper id="notification-dropdown">
                    {/* Header */}
                    <DropdownHeader>
                        <HeaderTitle>
                            <BellOutlined style={{ fontSize: 16 }} />
                            <span>Thông báo</span>
                            {unreadCount > 0 && (
                                <HeaderBadge>
                                    {unreadCount} mới
                                </HeaderBadge>
                            )}
                        </HeaderTitle>
                        {unreadCount > 0 && (
                            <MarkAllReadButton onClick={handleMarkAllRead}>
                                <CheckOutlined style={{ fontSize: 10 }} />
                                Đọc tất cả
                            </MarkAllReadButton>
                        )}
                    </DropdownHeader>

                    {/* Notification list */}
                    <NotificationList className="notif-list-container">
                        {displayNotifications.length === 0 ? (
                            <EmptyState>
                                <div style={{ fontSize: 40, marginBottom: 12 }}><BellOutlined /></div>
                                <div style={{ fontSize: 13, fontWeight: 500 }}>Chưa có thông báo nào</div>
                            </EmptyState>
                        ) : (
                            displayNotifications.map((notif) => {
                                const config = TYPE_CONFIG[notif.type] || { icon: <BellOutlined />, color: '#64748b' };
                                return (
                                    <NotificationItemWrapper
                                        key={notif._id}
                                        id={`notif-item-${notif._id}`}
                                        onClick={() => handleNotificationClick(notif)}
                                        $isRead={notif.isRead}
                                    >
                                        {/* Icon */}
                                        <IconContainer $color={config.color}>
                                            {config.icon}
                                        </IconContainer>

                                        {/* Content */}
                                        <ContentWrapper>
                                            <TitleContainer>
                                                <NotificationTitle $isRead={notif.isRead}>
                                                    {notif.title}
                                                </NotificationTitle>
                                                <TimeText>
                                                    {formatTimeAgo(notif.createdAt)}
                                                </TimeText>
                                            </TitleContainer>

                                            <MessageText>
                                                {notif.message}
                                            </MessageText>

                                            {/* Metadata tags */}
                                            {notif.metadata && Object.keys(notif.metadata).length > 0 && (
                                                <TagContainer>
                                                    <MetaTag style={{ color: config.color }}>
                                                        • {config.label}
                                                    </MetaTag>
                                                </TagContainer>
                                            )}
                                        </ContentWrapper>

                                        {/* Unread indicator */}
                                        {!notif.isRead && <UnreadDot />}
                                    </NotificationItemWrapper>
                                );
                            })
                        )}
                    </NotificationList>

                    {/* Footer */}
                    <DropdownFooter>
                        Cập nhật tự động theo thời gian thực
                    </DropdownFooter>
                </DropdownWrapper>
            )}
        </BellContainer>
    );
};

export default NotificationBellComponent;
