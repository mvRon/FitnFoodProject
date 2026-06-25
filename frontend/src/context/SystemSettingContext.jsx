import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SystemSettingService from '../services/SystemSettingService';

const SystemSettingContext = createContext(null);

// Giá trị mặc định dùng khi chưa load xong từ API
const DEFAULT_SETTING = {
    storeName: 'FitnFood',
    storeLogo: '',
    storeAddress: '',
    storePhone: '',
    storeEmail: '',
    storeSlogan: '',
    shippingFee: 30000,
    freeShippingThreshold: 200000,
    paymentMethods: { cod: true, bankTransfer: true, payos: true },
    emailSenderName: 'FitnFood Corporation',
    metaTitle: 'FitnFood – Thực phẩm lành mạnh cho cuộc sống năng động',
    metaDescription: '',
};

export const SystemSettingProvider = ({ children }) => {
    const [setting, setSetting] = useState(DEFAULT_SETTING);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const fetchSetting = async () => {
            try {
                const res = await SystemSettingService.getSystemSetting();
                if (res?.status === 'OK' && res.data) {
                    setSetting({ ...DEFAULT_SETTING, ...res.data });
                }
            } catch (err) {
                // Giữ nguyên default nếu lỗi mạng
                console.warn('[SystemSetting] Không thể tải cài đặt hệ thống, dùng giá trị mặc định.');
            } finally {
                setIsLoaded(true);
            }
        };
        fetchSetting();
    }, []);

    // Effect to update Document Title and Favicon dynamically when setting changes
    useEffect(() => {
        if (setting.metaTitle) {
            document.title = setting.metaTitle;
        } else if (setting.storeName) {
            document.title = setting.storeName;
        }

        if (setting.storeLogo) {
            let link = document.querySelector("link[rel~='icon']");
            if (!link) {
                link = document.createElement('link');
                link.rel = 'icon';
                document.head.appendChild(link);
            }
            link.href = setting.storeLogo;
        }
    }, [setting.metaTitle, setting.storeName, setting.storeLogo]);

    return (
        <SystemSettingContext.Provider value={{ setting, isLoaded, setSetting }}>
            {children}
        </SystemSettingContext.Provider>
    );
};

/**
 * Hook tiện ích để dùng cài đặt hệ thống trong bất kỳ component nào.
 * @returns {{ setting: object, isLoaded: boolean }}
 */
export const useSystemSetting = () => {
    const ctx = useContext(SystemSettingContext);
    if (!ctx) {
        throw new Error('useSystemSetting must be used within SystemSettingProvider');
    }
    return ctx;
};

export default SystemSettingContext;
