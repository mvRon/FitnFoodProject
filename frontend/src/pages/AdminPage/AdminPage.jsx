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
            {/* <HeaderComponent isHiddenSearch={true} isHiddenCart={true} /> */}
            <div className="adminpage-main" style={{ display: 'flex', minHeight: '100vh' }}>
                <div className="adminpage-menu-wrapper" style={{ minWidth: 0 }}>
                    <Menu
                        mode="inline"
                        defaultSelectedKeys={['231']}
                        openKeys={stateOpenKeys}
                        onOpenChange={onOpenChange}
                        style={{
                            width: '256px',
                            boxShadow: '1px 1px 2px #ccc',
                            height: '100vh',
                            maxWidth: '100vw',
                        }}
                        items={items}
                        onClick={handleOnClick}
                        theme='light'
                    />
                </div>
                <div className="adminpage-content-wrapper" style={{ flex: 1, padding: '15px' }}>
                    {renderKey(keySelected)}
                </div>
            </div>
            <style>{`
                @media (max-width: 1024px) {
                    .adminpage-main {
                        flex-direction: column;
                        min-height: unset;
                    }
                    .adminpage-menu-wrapper {
                        width: 100% !important;
                        max-width: 100vw !important;
                    }
                    .adminpage-menu-wrapper .ant-menu {
                        width: 100% !important;
                        max-width: 100vw !important;
                        height: auto !important;
                        box-shadow: none !important;
                    }
                    .adminpage-content-wrapper {
                        padding: 10px 4px;
                    }
                }
                @media (max-width: 600px) {
                    .adminpage-content-wrapper {
                        padding: 4px 2px;
                    }
                    .adminpage-menu-wrapper .ant-menu {
                        font-size: 15px;
                    }
                }
            `}</style>
        </>
    )
}

export default AdminPage