import { AppstoreAddOutlined, ProductOutlined, UserOutlined, ShoppingCartOutlined, ShopOutlined, GiftOutlined, SettingOutlined } from '@ant-design/icons';
import { Menu } from 'antd'
import React, { useState } from 'react'
import { getLevelKeys } from '../../utils';
import HeaderComponent from '../../components/HeaderComponent/HeaderComponent';
// import { useNavigate } from 'react-router-dom';
// import ProfilePage from '../ProfilePage/ProfilePage';
// import AdminUserComponent from '../../components/AdminUserComponent/AdminUserComponent';
// import { retry } from '@reduxjs/toolkit/query';
import AdminProductComponent from '../../components/AdminProductComponent/AdminProductComponent';
// import AdminOrderComponent from '../../components/AdminOrderComponent/AdminOrderComponent.jsx'
import AdminCategoryComponent from '../../components/AdminCategoryComponent/AdminCategoryComponent.jsx';
import { AdminPageGlobalStyle, AdminPageShell } from './Style';
// import AdminBannerComponent from '../../components/AdminBannerComponent/AdminBannerComponent.jsx';
// import AdminDiscountComponent from '../../components/AdminDiscountComponent/AdminDiscountComponent.jsx';

const AdminPage = () => {
    // const navigate = useNavigate()
    const renderKey = (key) => {
        switch (key) {
            // case 'User':
            //     return (
            //         <AdminUserComponent />
            //     )
            case 'Product':
                return (
                    <AdminProductComponent />
                )
            case 'Category':
                return (
                    <AdminCategoryComponent />
                )
            // case 'Order':
            //     return (
            //         <AdminOrderComponent />
            //     )
            // case 'Discount':
            //     return (
            //         <AdminDiscountComponent />
            //     )
            // case 'Banner':
            //     return (
            //         <AdminBannerComponent />
            //     )

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
            label: 'Quản lý hệ thống',
            children: [
                {
                    key: 'Banner',
                    label: 'Quản lý banner',
                },
            ],
        }
    ];


    const levelKeys = getLevelKeys(items);

    const [stateOpenKeys, setStateOpenKeys] = useState(['Users']);
    const [keySelected, setKeySelected] = useState('User')

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