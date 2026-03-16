import React, { useEffect, useState } from 'react'
import { Badge, Col, message, Popover } from 'antd';
import { WrapperHeader, WrapperTextHeader, WrapperHeaderAccount, WrapperSpanHeader, WrapperContentPopup, WrapperEmailUser } from './Style'
import { UserOutlined, CaretDownOutlined, ShoppingCartOutlined } from '@ant-design/icons';
// import SearchComponent from '../SearchComponent/SearchComponent';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../services/UserService'
import { resetUser } from '../../redux/slice/userSlice';
import { searchProduct } from '../../redux/slice/productSlice';
import Logo from '../../logo.svg'
import { clearOrder } from '../../redux/slice/orderSlice';

// import {
//   AvatarImage,
//   LoginAction,
//   LoginText,
// } from './Style';


const HeaderComponent = ({ isHiddenSearch = false, isHiddenCart = false }) => {

  const user = useSelector((state) => state.user)
  const dispatch = useDispatch()
  const [isloading, setIsLoading] = useState(false)
  const [userName, setUserName] = useState('')
  const [userAvatart, setUserAvatar] = useState('')
  const [search, setSearch] = useState('')
  const order = useSelector((state) => state.order)


  const navigate = useNavigate()
  const handleNavigateLogin = () => {
    navigate('/login')
  }

  const handleHome = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    setIsLoading(true)
    await UserService.logoutUser()
    dispatch(resetUser())
    dispatch(clearOrder())
    setIsLoading(false)
    handleHome()
    message.success("Đăng xuất thành công!")
  }

  useEffect(() => {
    const name = user?.name.trim().split(/\s+/).pop();
    setUserName(name)
    setUserAvatar(user?.avatar)
  }, [user])



  const content = (
    <div>
      <WrapperContentPopup onClick={() => handleClickNavigate('profileUser')}>Thông tin người dùng</WrapperContentPopup>
      {user?.isAdmin && (
        <WrapperContentPopup onClick={() => handleClickNavigate('admin')}>Quản lý hệ thống</WrapperContentPopup>
      )}
      <WrapperContentPopup onClick={() => handleClickNavigate('myOrder')}>Đơn hàng của tôi</WrapperContentPopup>
      <WrapperContentPopup onClick={() => handleClickNavigate()}>Đăng xuất</WrapperContentPopup>
    </div>
  );

  const handleClickNavigate = (type) => {
    if (type === 'profileUser') {
      navigate('/profileUser')
    } else if (type === 'admin') {
      navigate('/system/admin')
    } else if (type === 'myOrder') {
      navigate('/myOrder', {
        state: {
          id: user?.id,
          token: JSON.parse(user?.access_token)
        }
      })
    } else {
      handleLogout()
    }
  }

  const onSearch = (e) => {
    setSearch(e.target.value)
    dispatch(searchProduct(e.target.value))

  }


  return (
    <header style={{ width: '100%', background: '#A6B28B' }}>
      <nav
        className="header-nav"
        style={{
          maxWidth: 1270,
          margin: '0 auto',
          padding: '0 8px',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'nowrap',
          minHeight: 56,
          overflowX: 'auto',
        }}
      >
        {/* Logo */}
        <div
          className="header-logo"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            cursor: 'pointer',
            flex: '0 0 auto',
          }}
          onClick={handleHome}
        >
          <img
            src={Logo}
            alt="logo"
            style={{ height: 40, width: 60, borderRadius: '50%', objectFit: 'cover' }}
          />
          <span className="hidden-mobile" style={{ color: '#fff', fontWeight: 700, fontSize: 35 }}>
            <em>FIT</em>n<span style={{ color: '#ffd400' }}><em>FOOD</em></span>
          </span>
        </div>

        {/* Search bar */}
        {!isHiddenSearch && (
          <div
            className="header-search"
            style={{
              flex: 1,
              display: 'flex',
              justifyContent: 'center',
            }}
          >
            {/* <SearchComponent
              size="large"
              placeholder="Nhấp vào để tìm kiếm"
              textbutton="Tìm kiếm"
              onChange={onSearch}
              style={{ width: '100%' }}
            /> */}
          </div>
        )}

        {/* Account & Cart */}
        <div
          className="header-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flex: '0 0 auto',
          }}
        >
          {/* Account */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {user?.avatar ? (
              <Popover content={content} trigger="click">
                <img
                  src={userAvatart}
                  alt="avatar"
                  style={{ height: 26, width: 26, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                />
              </Popover>
            ) : (
              <UserOutlined style={{ fontSize: 24, color: '#fff' }} />
            )}
            {user?.access_token ? (
              <Popover content={content} trigger="click">
                <span className="header-greeting" style={{ color: '#fff', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
                  Hi, {userName || user.email || 'User'}
                </span>
              </Popover>
            ) : (
              <div className="header-login" onClick={handleNavigateLogin} style={{ color: '#fff', cursor: 'pointer', fontSize: 12 }}>
                <span>Đăng nhập</span>
                <span>Đăng ký <CaretDownOutlined /></span>
              </div>
            )}
          </div>
          {/* Cart */}
          {!isHiddenCart && (
            <div onClick={() => navigate('/order')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge count={user?.access_token ? order?.orderItems.length : 0} size="small">
                <ShoppingCartOutlined style={{ color: '#fff', fontSize: 24 }} />
              </Badge>
              <span className="cart-label" style={{ color: '#fff', fontSize: 12, fontWeight: 500, display: 'none' }}>Giỏ hàng</span>
            </div>
          )}
        </div>
      </nav>
      {/* Responsive styles */}
      <style>{`
        @media (min-width: 1025px) {
          .header-search {
            min-width: 400px;
            max-width: 800px;
            margin: 0 40px;
          }
        }
        @media (max-width: 1024px) and (min-width: 769px) {
          .header-search {
            min-width: 300px;
            max-width: 600px;
            margin: 0 20px;
          }
        }
        @media (max-width: 768px) {
          .header-nav {
            flex-direction: row;
            align-items: center;
            gap: 4px;
            padding: 6px 2px;
            min-height: 48px;
            overflow-x: auto;
            flex-wrap: nowrap;
          }
          .header-logo img {
            height: 32px !important;
            width: 32px !important;
          }
          .header-logo .hidden-mobile {
            display: none;
          }
          .header-search {
            min-width: 120px;
            max-width: 240px;
            margin: 0 6px;
          }
          .header-actions {
            gap: 6px;
          }
          .cart-label {
            display: none;
          }
          .header-greeting {
            display: none;
          }
          .header-login {
            display: flex;
            flex-direction: column;
            align-items: flex-start;
          }
        }
        .header-greeting {
          display: inline;
        }
      `}</style>
    </header>
  )
}

export default HeaderComponent
