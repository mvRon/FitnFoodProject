import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import * as NotificationService from '../services/NotificationService';

const NotificationContext = createContext(null);

// Tạo âm thanh beep ngắn bằng Web Audio API
const playNotificationSound = () => {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'sine';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(440, audioCtx.currentTime + 0.15);

        gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);

        oscillator.start(audioCtx.currentTime);
        oscillator.stop(audioCtx.currentTime + 0.3);
    } catch (err) {
        // Trình duyệt không hỗ trợ Web Audio API – bỏ qua
    }
};

const getSocketUrl = () => {
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    const apiBase = process.env.REACT_APP_API_URL_BACKEND || '';
    return apiBase.replace(/\/api\/?$/, '');
};

const getAccessToken = () => {
    const raw = localStorage.getItem('access_token');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return raw; }
};

export const NotificationProvider = ({ children }) => {
    const user = useSelector((state) => state.user);
    const socketRef = useRef(null);

    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isConnected, setIsConnected] = useState(false);

    const accessToken = user?.access_token ? getAccessToken() : null;
    const socketUrl = getSocketUrl();

    // Tính unreadCount từ notifications state
    const updateUnreadCount = useCallback((notifs) => {
        const count = notifs.filter((n) => !n.isRead).length;
        setUnreadCount(count);
    }, []);

    // Fetch notifications từ DB khi user đăng nhập
    const fetchNotifications = useCallback(async () => {
        if (!accessToken) {
            setNotifications([]);
            setUnreadCount(0);
            return;
        }
        try {
            const res = await NotificationService.getNotifications(accessToken);
            if (res?.status === 'OK') {
                setNotifications(res.data || []);
                updateUnreadCount(res.data || []);
            }
        } catch (err) {
            // Bỏ qua lỗi fetch
        }
    }, [accessToken, updateUnreadCount]);

    // Kết nối socket /notification namespace
    useEffect(() => {
        if (!socketUrl) return;

        // Kết nối dù có token hay không (guest nhận Flash Sale)
        const socket = io(`${socketUrl}/notification`, {
            auth: accessToken ? { token: accessToken } : {},
            transports: ['websocket'],
        });

        socketRef.current = socket;

        socket.on('connect', () => {
            setIsConnected(true);
        });

        socket.on('disconnect', () => {
            setIsConnected(false);
        });

        // Nhận notification mới realtime
        socket.on('notification:new', (notification) => {
            playNotificationSound();
            setNotifications((prev) => {
                // Tránh duplicate nếu đã có
                if (prev.some((n) => n._id === notification._id)) return prev;
                const updated = [notification, ...prev];
                updateUnreadCount(updated);
                return updated;
            });
        });

        socket.on('connect_error', (err) => {
            console.warn('[NotificationSocket] connect_error:', err?.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
            setIsConnected(false);
        };
    }, [accessToken, socketUrl, updateUnreadCount]);

    // Fetch initial notifications khi user login/logout
    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    // Đánh dấu một notification đã đọc
    const markAsRead = useCallback(async (notificationId) => {
        if (!accessToken) return;
        try {
            await NotificationService.markAsRead(notificationId, accessToken);
            setNotifications((prev) => {
                const updated = prev.map((n) =>
                    n._id === notificationId ? { ...n, isRead: true } : n
                );
                updateUnreadCount(updated);
                return updated;
            });
        } catch (err) {
            console.error('[NotificationContext] markAsRead error:', err);
        }
    }, [accessToken, updateUnreadCount]);

    // Đánh dấu tất cả đã đọc
    const markAllAsRead = useCallback(async () => {
        if (!accessToken) return;
        try {
            await NotificationService.markAllAsRead(accessToken);
            setNotifications((prev) => {
                const updated = prev.map((n) => ({ ...n, isRead: true }));
                updateUnreadCount(updated);
                return updated;
            });
        } catch (err) {
            console.error('[NotificationContext] markAllAsRead error:', err);
        }
    }, [accessToken, updateUnreadCount]);

    const value = {
        socket: socketRef.current,
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        fetchNotifications,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const ctx = useContext(NotificationContext);
    if (!ctx) {
        throw new Error('useNotification must be used within NotificationProvider');
    }
    return ctx;
};

export default NotificationContext;
