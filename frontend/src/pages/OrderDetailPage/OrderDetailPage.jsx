import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom'; // Để lấy orderId từ URL
import { Typography, Spin, Divider, Tag, Space, Button, Result } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import * as OrderService from '../../services/OrderService.js'
import { useSelector } from 'react-redux';
// import axios from 'axios'; 

import {
  OrderDetailWrapper,
  MainContent,
  SectionCard,
  ProductItem,
  PriceDetail,
} from './Style.js';
import { useQuery } from '@tanstack/react-query';

const { Title, Text } = Typography;

const DELIVERY_STATUS_LABEL = {
  pending: 'Chờ xử lý',
  processing: 'Đang xử lý',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
};

const OrderDetailPage = () => {
  const { orderId } = useParams(); // Lấy orderId từ URL
  const [orderDetail, setOrderDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation()
  const { state } = location
  const user = useSelector((state) => state.user);
  
  let token = state?.token || user?.access_token;
  try {
      if (typeof token === 'string' && token.startsWith('"')) {
          token = JSON.parse(token);
      }
  } catch (e) {
      console.error("Token parse error", e);
  }

  const flag = (orderId ? true : false)


  const fetchDetailOrder = async () => {
    const res = await OrderService.getDetailOrder(token, orderId)
    return res.data
  }
  const queryDetailOrder = useQuery({
    queryKey: ['orderDetail', orderId],
    queryFn: fetchDetailOrder,
    retry: 3,
    retryDelay: 1000,
    enabled: flag && !!token,
  })
  const { isPending, data } = queryDetailOrder

  const priceMemo = useMemo(() => {
    const result = data?.orderItems?.reduce((total, current) => {
      return total + (current?.price * current?.amount)
    }, 0)
    return result
  }, [data])

  const mockOrders = [
    {
      _id: data?.id, // Sử dụng _id để khớp với cách MongoDB lưu trữ
      orderItems: [
        {
          name: data?.orderItems?.name,
          amount: data?.orderItems?.amount,
          image: data?.orderItems?.image,
          price: data?.orderItems?.price,
          discount: data?.orderItems?.discount,
          product: data?.orderItems?.product
        },
      ],
      shippingAddress: {
        fullName: data?.shippingAddress?.fullName,
        address: data?.shippingAddress?.address,
        city: data?.shippingAddress?.city,
        phone: data?.shippingAddress?.phone
      },
      paymentMethod: 'Thanh toán khi nhận hàng',
      itemsPrice: priceMemo, // (2*250000) + (1*700000 * 0.9) //giá tiền tạm tính của tất cả sản phẩm có trong orderItems
      shippingPrice: data?.shippingPrice,
      totalPrice: data?.totalPrice,
      user: data?.user,
      isPaid: data?.isPaid,
      paidAt: data?.paidAt,
      isDelivered: data?.isDelivered,
      status: 'Đang xử lý', // Thêm trường status cho mock data
      createdAt: data?.createdAt,
    },
  ];



  // Hàm định dạng tiền tệ
  const formatCurrency = (amount) => {
    return `${amount?.toLocaleString('vi-VN')} VNĐ`;
  };

  // Hàm lấy màu cho Tag trạng thái
  const getStatusTagColor = (status) => {
    switch (status) {
      case 'Chờ xử lý': return 'default';
      case 'Đang xử lý': return 'processing';
      case 'Đang giao hàng': return 'blue';
      case 'Đã giao hàng': return 'success';
      case 'Đã hủy': return 'error';
      default: return 'default';
    }
  };


  useEffect(() => {

    setLoading(true)
    setError(null)
    setOrderDetail(data)
    setLoading(false)

  }, [data])


  if (loading) {
    return (
      <OrderDetailWrapper>
        <Spin indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
      </OrderDetailWrapper>
    );
  }

  if (error) {
    return (
      <OrderDetailWrapper>
        <SectionCard title={<Title level={4}>Lỗi</Title>}>
          <Text type="danger">{error}</Text>
          <Button type="primary" onClick={() => window.history.back()} style={{ marginTop: '20px' }}>
            Quay lại
          </Button>
        </SectionCard>
      </OrderDetailWrapper>
    );
  }

  if (!orderDetail) {
    return (
      <OrderDetailWrapper>
        <div style={{ padding: '60px 20px', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'center' }}>
            <Result
                status="warning"
                title={<span style={{ fontSize: '24px', fontWeight: 'bold' }}>Không tìm thấy đơn hàng</span>}
                subTitle={<span style={{ fontSize: '16px', color: '#595959' }}>Đơn hàng bạn đang tìm kiếm không tồn tại, đã bị xóa hoặc bạn không có quyền xem đơn hàng này.</span>}
                extra={
                    <Button 
                        type="primary" 
                        size="large" 
                        onClick={() => window.history.back()}
                        style={{ borderRadius: '8px', padding: '0 32px', height: '44px' }}
                    >
                        Quay lại
                    </Button>
                }
            />
        </div>
      </OrderDetailWrapper>
    );
  }

  // Khi có dữ liệu, hiển thị chi tiết
  const deliveryStatusText = DELIVERY_STATUS_LABEL[orderDetail?.isDelivered] || 'Chờ xử lý';

  // console.log('hahaha', orderDetail)
  return (
    <OrderDetailWrapper>
      <MainContent>
        {/* Cột trái: Thông tin sản phẩm và địa chỉ */}
        <div className="left-column">
          <SectionCard
            title={
              <Title level={4} style={{ margin: 0 }}>
                Thông tin đơn hàng #{orderDetail._id}
                {/* Thông tin đơn hàng #  */}
                <Tag color={getStatusTagColor(deliveryStatusText)} style={{ marginLeft: '16px' }}>
                  {deliveryStatusText}
                </Tag>
              </Title>
            }
          >
            <Text strong>Ngày đặt hàng: </Text>
            <Text>{new Date(orderDetail.createdAt).toLocaleString('vi-VN')}</Text>
            <Divider />

            <Title level={5}>Sản phẩm trong đơn hàng:</Title>
            {orderDetail.orderItems.map((item, index) => (
              <ProductItem key={index}>
                <img src={item.image} alt={item.name} />
                <div className="product-info">
                  <div className="product-name">{item.name}</div>
                  <div className="product-price">
                    {/* Hiển thị giá gốc, gạch ngang nếu có chiết khấu */}
                    {item.discount > 0 && (
                      <Text delete style={{ fontSize: '13px', color: '#999' }}>
                        {formatCurrency(item.price)}
                      </Text>
                    )}
                    {/* Hiển thị giá sau chiết khấu (nếu có) hoặc giá gốc (nếu không có chiết khấu) */}
                    <Text strong type={item.discount > 0 ? 'danger' : undefined} style={{ marginLeft: item.discount > 0 ? '8px' : '0px' }}>
                      {formatCurrency(item.price * (1 - (item.discount || 0) / 100))}
                    </Text>
                    <Text style={{ marginLeft: '8px' }}>x {item.amount}</Text>
                    <Text strong style={{ marginLeft: '8px' }}>
                      = {formatCurrency(item.price * item.amount * (1 - (item.discount || 0) / 100))}
                    </Text>
                  </div>
                  {item.discount > 0 && <Text type="success" style={{ fontSize: '13px' }}>({item.discount}% giảm giá)</Text>}
                </div>
              </ProductItem>
            ))}
          </SectionCard>

          <SectionCard
            title={<Title level={4} style={{ margin: 0 }}>Địa chỉ giao hàng</Title>}
          >
            <Text strong>Họ tên: </Text><Text>{orderDetail?.shippingAddress?.fullName}</Text><br />
            <Text strong>Địa chỉ: </Text><Text>{orderDetail?.shippingAddress?.address}, {orderDetail?.shippingAddress?.city}</Text><br />
            <Text strong>Số điện thoại: </Text><Text>{orderDetail?.shippingAddress?.phone}</Text><br />
          </SectionCard>
        </div>

        {/* Cột phải: Thông tin thanh toán và tổng kết */}
        <div className="right-column">
          <SectionCard
            title={<Title level={4} style={{ margin: 0 }}>Thông tin thanh toán</Title>}
          >
            <Text strong>Phương thức: </Text><Text>{orderDetail.paymentMethod === "cash" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản"}</Text><br />
            <Text strong>Trạng thái thanh toán: </Text>
            {orderDetail.isPaid ? (
              <Tag color="success">Đã thanh toán</Tag>
            ) : (
              <Tag color="error">Chưa thanh toán</Tag>
            )}
            {orderDetail.isPaid && (
              <Text type="secondary" style={{ display: 'block', marginTop: '8px' }}>
                Thanh toán lúc: {new Date(orderDetail.paidAt).toLocaleString('vi-VN', { timeZone: 'UTC' })}
              </Text>
            )}
            <Divider />
            <Text strong>Trạng thái giao hàng: </Text>
            <Tag color={getStatusTagColor(deliveryStatusText)}>{deliveryStatusText}</Tag>
          </SectionCard>

          <SectionCard
            title={<Title level={4} style={{ margin: 0 }}>Tổng kết đơn hàng</Title>}
          >
            <PriceDetail>
              <Text className="label">Tổng tiền tạm tính:</Text>
              <Text className="value">{formatCurrency(priceMemo)}</Text>
            </PriceDetail>
            <PriceDetail>
              <Text className="label">Phí vận chuyển:</Text>
              <Text className="value">{formatCurrency(orderDetail.shippingPrice)}</Text>
            </PriceDetail>
            <PriceDetail>
              <Text className="label">Giảm khuyến mãi:</Text>
              <Text className="value">{formatCurrency(priceMemo - orderDetail.totalPrice)}</Text>
            </PriceDetail>

            <Divider />
            <PriceDetail className="total">
              <Text className="label">Phải thanh toán:</Text>
              <Text className="value">{formatCurrency(orderDetail.totalPrice)}</Text>
            </PriceDetail>
            <Space>
              <Button style={{ marginTop: '25px' }} type="primary" onClick={() => window.history.back()}>
                Quay lại đơn hàng
              </Button>
              {/* Thêm các nút hành động khác nếu cần, ví dụ: "Mua lại", "Liên hệ hỗ trợ" */}
            </Space>
          </SectionCard>
        </div>
      </MainContent>
    </OrderDetailWrapper>
  );
};

export default OrderDetailPage;