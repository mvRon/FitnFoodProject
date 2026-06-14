import React, { useEffect, useRef, useState } from 'react'
import { Badge, Col, message, Popover } from 'antd';
import { WrapperHeader, WrapperTextHeader, WrapperHeaderAccount, WrapperSpanHeader, WrapperContentPopup, WrapperEmailUser } from './Style'
import { UserOutlined, CaretDownOutlined, ShoppingCartOutlined } from '@ant-design/icons';
import SearchComponent from '../SearchComponent/SearchComponent';

import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import * as UserService from '../../services/UserService'
import * as ProductService from '../../services/ProductService'
import { resetUser } from '../../redux/slice/userSlice';
import { searchProduct } from '../../redux/slice/productSlice';
import Logo from '../../assets/logoFitnFood.jpg'
import { clearOrder, syncCart } from '../../redux/slice/orderSlice';
import { useDebounce } from '../../hooks/useDebounce';

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
  const [suggestions, setSuggestions] = useState([])
  const [isSuggesting, setIsSuggesting] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const order = useSelector((state) => state.order)
  const searchValue = useSelector((state) => state?.product?.search)
  const searchDebounce = useDebounce(search, 350)
  const blurTimeoutRef = useRef(null)


  const navigate = useNavigate()
  const handleNavigateLogin = () => {
    navigate('/login')
  }

  const handleHome = () => {
    navigate('/')
  }

  const handleLogout = async () => {
    try {
      setIsLoading(true)

      // Persist the latest cart state before clearing local redux on logout.
      if (user?.id) {
        await dispatch(syncCart({ userId: user.id, cartItems: order?.orderItems || [] }))
      }

      await UserService.logoutUser()
      dispatch(resetUser())
      dispatch(clearOrder())
      handleHome()
      message.success("Đăng xuất thành công!")
    } catch (error) {
      message.error("Có lỗi khi đăng xuất, vui lòng thử lại")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const name = user?.name.trim().split(/\s+/).pop();
    setUserName(name)
    setUserAvatar(user?.avatar)
  }, [user])

  useEffect(() => {
    if (typeof searchValue === 'string' && searchValue !== search) {
      setSearch(searchValue)
    }
  }, [searchValue, search])

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    const query = (searchDebounce || '').trim()
    if (!query) {
      setSuggestions([])
      setIsSuggesting(false)
      return
    }

    let isActive = true
    setIsSuggesting(true)

    ProductService.searchProducts(query, { limit: 6, includeImages: true, page: 1 })
      .then((res) => {
        if (!isActive) return
        setSuggestions(res?.data || [])
      })
      .catch(() => {
        if (!isActive) return
        setSuggestions([])
      })
      .finally(() => {
        if (!isActive) return
        setIsSuggesting(false)
      })

    return () => {
      isActive = false
    }
  }, [searchDebounce])



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
    const nextValue = e.target.value
    setSearch(nextValue)
    dispatch(searchProduct(nextValue))
  }

  const handleSearchSubmit = () => {
    const trimmed = (search || '').trim()
    dispatch(searchProduct(trimmed))
    if (trimmed.length > 0) {
      navigate('/')
    }
    setShowSuggestions(false)
  }

  const handleSearchFocus = () => {
    if (blurTimeoutRef.current) {
      clearTimeout(blurTimeoutRef.current)
    }
    setShowSuggestions(true)
  }

  const handleSearchBlur = () => {
    blurTimeoutRef.current = setTimeout(() => {
      setShowSuggestions(false)
    }, 120)
  }

  const handleSelectSuggestion = (product) => {
    if (!product?._id) return
    setSearch(product?.name || '')
    dispatch(searchProduct(product?.name || ''))
    setShowSuggestions(false)
    navigate(`/productDetail/${product._id}`)
  }




  return (
    <header style={{ width: '100%', background: 'var(--color-primary)' }}>
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
          <span className="hidden-mobile" style={{ color: 'var(--color-white)', fontWeight: 700, fontSize: 35 }}>
            <em>FIT</em>n<span style={{ color: 'var(--color-accent)' }}><em>FOOD</em></span>
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
            <SearchComponent
              value={search}
              onChange={onSearch}
              onSearch={handleSearchSubmit}
              placeholder="Tìm sản phẩm phù hợp với bạn..."
              suggestions={suggestions}
              showSuggestions={showSuggestions}
              isLoading={isSuggesting}
              onSelectSuggestion={handleSelectSuggestion}
              onFocus={handleSearchFocus}
              onBlur={handleSearchBlur}
            />
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
                  src={userAvatart || user?.avatar || null}
                  alt="avatar"
                  style={{ height: 26, width: 26, borderRadius: '50%', objectFit: 'cover', cursor: 'pointer' }}
                />
              </Popover>
            ) : (
              <UserOutlined style={{ fontSize: 24, color: 'var(--color-white)' }} />
            )}
            {user?.access_token ? (
              <Popover content={content} trigger="click">
                <span className="header-greeting" style={{ color: 'var(--color-white)', cursor: 'pointer', fontWeight: 500, fontSize: 13 }}>
                  Hi, {userName || user.email || 'User'}
                </span>
              </Popover>
            ) : (
              <div className="header-login" onClick={handleNavigateLogin} style={{ color: 'var(--color-white)', cursor: 'pointer', fontSize: 12 }}>
                <span>Đăng nhập</span>
                <span>Đăng ký <CaretDownOutlined /></span>
              </div>
            )}
          </div>
          {/* Cart */}
          {!isHiddenCart && (
            <div onClick={() => navigate('/order')} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2 }}>
              <Badge count={user?.access_token ? order?.orderItems?.length : 0} size="small">
                <ShoppingCartOutlined style={{ color: 'var(--color-white)', fontSize: 24 }} />
              </Badge>
              <span className="cart-label" style={{ color: 'var(--color-white)', fontSize: 12, fontWeight: 500, display: 'none' }}>Giỏ hàng</span>
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
