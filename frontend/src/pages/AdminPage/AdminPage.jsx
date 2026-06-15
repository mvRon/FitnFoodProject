import { AppstoreAddOutlined, ProductOutlined, UserOutlined, ShoppingCartOutlined, ShopOutlined, GiftOutlined, SettingOutlined, MessageOutlined, BarChartOutlined, BellOutlined } from '@ant-design/icons';
import { Button, Form, Input, Menu, message as toast } from 'antd'
import React, { useEffect, useState } from 'react'
import { getLevelKeys } from '../../utils';
import { useSelector } from 'react-redux';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
import { useLocation } from 'react-router-dom';
// import { useNavigate } from 'react-router-dom';
// import ProfilePage from '../ProfilePage/ProfilePage';
// import { retry } from '@reduxjs/toolkit/query';
import AdminProductComponent from '../../components/AdminProductComponent/AdminProductComponent';
import AdminOrderComponent from '../../components/AdminOrderComponent/AdminOrderComponent.jsx'
import AdminCategoryComponent from '../../components/AdminCategoryComponent/AdminCategoryComponent.jsx';
import { AdminPageGlobalStyle, AdminPageShell } from './Style';
// import AdminBannerComponent from '../../components/AdminBannerComponent/AdminBannerComponent.jsx';
import AdminDiscountComponent from '../../components/AdminDiscountComponent/AdminDiscountComponent.jsx';
import AdminInventoryComponent from '../../components/AdminInventoryComponent/AdminInventoryComponent.jsx';
import AdminUserComponent from '../../components/AdminUserComponent/AdminUserComponent';
import AdminChatComponent from '../../components/AdminChatComponent/AdminChatComponent';
import AdminRevenueDashboard from '../../components/AdminRevenueDashboard/AdminRevenueDashboard';
import AdminNotificationComponent from '../../components/AdminNotificationComponent/AdminNotificationComponent';
import * as NotificationService from '../../services/NotificationService';

const AdminPage = () => {
    // const navigate = useNavigate()
    const renderKey = (key) => {
        switch (key) {
            case 'User':
                return (
                    <AdminUserComponent />
                )
            case 'Product':
                return (
                    <AdminProductComponent />
                )
            case 'Category':
                return (
                    <AdminCategoryComponent />
                )
            case 'Order':
                return (
                    <AdminOrderComponent />
                )
            case 'Discount':
                return (
                    <AdminDiscountComponent />
                )
            case 'Inventory':
                return (
                    <AdminInventoryComponent />
                )
            case 'Chat':
                return (
                    <AdminChatComponent />
                )
            case 'Revenue':
                return (
                    <AdminRevenueDashboard />
                )
            case 'Notification':
                return <AdminNotificationComponent />
            default:
                return <></>
        }
    }



    const items = [
        {
            key: 'Users',
            icon: <UserOutlined />,
            label: 'Quản lý Users',
            children: [
                {
                    key: 'User',
                    label: 'Quản lý người dùng',
                },
            ],
        },
        {
            key: 'Products',
            icon: <ProductOutlined />,
            label: 'Quản lý Products',
            children: [
                {
                    key: 'Product',
                    label: 'Quản lý thông tin sản phẩm',
                },
                {
                    key: 'Category',
                    label: 'Quản lý loại sản phẩm',
                },
            ],
        },
        {
            key: 'Orders',
            icon: <ShoppingCartOutlined />,
            label: 'Quản lý Orders',
            children: [
                {
                    key: 'Order',
                    label: 'Quản lý thông tin đơn hàng',
                },
            ],
        },
        {
            key: 'Discounts',
            icon: <GiftOutlined />,
            label: 'Quản lý Discounts',
            children: [
                {
                    key: 'Discount',
                    label: 'Quản lý mã giảm giá',
                },
            ],
        },
        {
            key: 'System',
            icon: <SettingOutlined />,
            label: 'Quản lý kho hàng',
            children: [
                {
                    key: 'Inventory',
                    label: 'Quản lý tồn kho',
                },
            ],
        },
        {
            key: 'Chat',
            icon: <MessageOutlined />,
            label: 'Chat hỗ trợ',
        },
        {
            key: 'Revenue',
            icon: <BarChartOutlined />,
            label: 'Doanh thu & AI',
        },
        {
            key: 'Notification',
            icon: <BellOutlined />,
            label: 'Gửi thông báo',
        }
    ];


    const levelKeys = getLevelKeys(items);

    const location = useLocation();

    const [stateOpenKeys, setStateOpenKeys] = useState(['Users']);
    const [keySelected, setKeySelected] = useState('User');

    useEffect(() => {
        if (location.state?.openTab) {
            setKeySelected(location.state.openTab);
            if (location.state.openTab === 'Order') {
                setStateOpenKeys(['Orders']);
            } else if (location.state.openTab === 'Inventory') {
                setStateOpenKeys(['System']);
            }
        }
    }, [location.state?.openTab]);

    const onOpenChange = (openKeys) => {
        const currentOpenKey = openKeys.find((key) => stateOpenKeys.indexOf(key) === -1);
        // open
        if (currentOpenKey !== undefined) {
            const repeatIndex = openKeys
                .filter((key) => key !== currentOpenKey)
                .findIndex((key) => levelKeys[key] === levelKeys[currentOpenKey]);
            setStateOpenKeys(
                openKeys
                    // remove repeat key
                    .filter((_, index) => index !== repeatIndex)
                    // remove current level all child
                    .filter((key) => levelKeys[key] <= levelKeys[currentOpenKey]),
            );
        } else {
            // close
            setStateOpenKeys(openKeys);
        }
    };

    const handleOnClick = ({ key }) => {
        setKeySelected(key)
    }

    return (
        <>
            <AdminPageGlobalStyle />
            {/* <HeaderComponent isHiddenSearch={true} isHiddenCart={true} /> */}
            <AdminPageShell className="adminpage-shell">
                <div className="adminpage-main">
                    <div className="adminpage-menu-wrapper">
                        <div className="adminpage-brand-card">
                            <div className="adminpage-brand-title">FitnFood Admin</div>
                            <div className="adminpage-brand-subtitle">Quản trị hệ thống thông minh</div>
                        </div>
                        <Menu
                            className="adminpage-menu"
                            mode="inline"
                            defaultSelectedKeys={['231']}
                            openKeys={stateOpenKeys}
                            onOpenChange={onOpenChange}
                            items={items}
                            onClick={handleOnClick}
                            theme='light'
                        />
                    </div>
                    <div className="adminpage-content-wrapper">
                        <div className="adminpage-content-head">
                            <h2>Không gian quản trị</h2>
                            <p>Tối ưu vận hành với bảng điều khiển trực quan, màu sắc đồng bộ và thao tác nhanh.</p>
                        </div>
                        <div className="adminpage-content-card">
                            {renderKey(keySelected)}
                        </div>
                    </div>
                </div>
            </AdminPageShell>
        </>
    )
}

export default AdminPage


