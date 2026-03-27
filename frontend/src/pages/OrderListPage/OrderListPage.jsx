import React, { useState, useEffect } from 'react';
import { Typography, Table, Tag, Space, Button, Popconfirm, message } from 'antd'; // Thêm Popconfirm và message
import { Link, useLocation, useNavigate } from 'react-router-dom';
import * as OrderService from '../../services/OrderService.js'
// import axios from 'axios'; // Sẽ dùng sau này khi có API backend

import { OrderListWrapper, StyledOrderListCard } from './Style.js';
import { useSelector } from 'react-redux';
import { useQuery } from '@tanstack/react-query';
import { useMutationHook } from '../../hooks/useMutationHook.js';

const { Title, Text } = Typography;

const renderOrderItemThumb = (image, name) => {
  if (image) {
    return (
      <img
        src={image}
        alt={name}
        style={{
          width: '70px',
          height: '70px',
          objectFit: 'cover',
          border: '1px solid rgb(238, 238, 238)',
          borderRadius: '10px',
          padding: '2px'
        }}
      />
    )
  }

  return (
    <div
      style={{
        width: '70px',
        height: '70px',
        border: '1px dashed #94a3b8',
        borderRadius: '10px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#64748b',
        fontSize: '11px',
        textAlign: 'center',
        padding: '4px'
      }}
    >
      Ảnh
      <br />
      sản phẩm
    </div>
  )
}

const OrderListPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const location = useLocation()
  const { state } = location
  const flag = ((state?.id) && (state?.token) ? true : false) //Chỉ cần thiếu 1 trong 2 thì luôn false

//   console.log('state', state)


  const fetchMyOrder = async () => {
    const res = await OrderService.getAllOrder(state?.token, state?.id)
    return res.data
  }

  const queryOrder = useQuery({
    queryKey: ['orders'],
    queryFn: fetchMyOrder,
    retry: 3,
    retryDelay: 1000,
    enabled: flag, //false thì sẽ không gọi
  })
  const { isPending, data } = queryOrder

  // console.log('fetchaaa: ', data)



  useEffect(() => {
    setLoading(true);
    if (data) {
      try {
        //Lỗi data.map is not a function lần đầu tiên load vào sẽ gặp tình trạng data trả về ko phải là mãng mà là 1 obj nên phải dùng try catch 
        const mapped = data?.map((order, idx) => ({
          key: order._id || idx,
          orderId: order._id || `ORD${idx + 1}`,
          customerName: order.shippingAddress?.fullName || 'Ẩn',
          orderDate: order.createdAt ? order.createdAt.slice(0, 10) : '',
          totalAmount: order.totalPrice || 0,
          status: order.isDelivered ? 'Đã giao' : (order.isPaid ? 'Đã xác nhận' : 'Đang xử lý'),
          paymentMethod: order.paymentMethod === 'cash' ? 'Tiền mặt' : 'Chuyển khoản',
          products: (order.orderItems || []).map((item) => ({
            key: item.product || item._id,
            productId: item.product || item._id,
            name: item.name,
            quantity: item.amount,
            unitPrice: item.price,
            subtotal: (item.amount * item.price) * item.discount / 100 + order.shippingPrice,
            image: renderOrderItemThumb(item?.image, item?.name)
          })),
        }));
        setOrders(mapped);

      } catch (error) {
        console.error(error)
      }

    }


    setLoading(false);
  }, [data]);

  const getStatusTagColor = (status) => {
    switch (status) {
      case 'Đang xử lý':
        return 'processing';
      case 'Đã giao':
        return 'success';
      case 'Đã hủy':
        return 'error';
      case 'Đã xác nhận': // Ví dụ thêm trạng thái
        return 'blue';
      default:
        return 'default';
    }
  };



  const mutationDeleteOrder = useMutationHook(
    (data) => {
      const { token, id } = data
      const res = OrderService.deleteOrder(token, id)
      return res.data
    }
  )

  const handleCancelOrder = (id) => {
    mutationDeleteOrder.mutate({ token: state?.token, id }, {
      onSuccess: () => {
        message.success('Order deleted!')
        queryOrder.refetch()

      },
      onSettled: () => {
        queryOrder.refetch() //Lỗi không thể tự động F5 lại dữ liệu
      }
    })
  }
  const { isPending: isPendingCancel, isSuccess: isSuccessCancel, isError: isErrorCancel, data: dataCancel } = mutationDeleteOrder


  const navigate = useNavigate()
  const handleDetailOrder = (id) => {
    navigate(`/orderDetail/${id}`, {
      state: {
        token: state?.token
      }
    })
  }



  // Cấu hình cột cho bảng chính (danh sách đơn hàng)
  const columns = [
    {
      title: 'Mã đơn hàng',
      dataIndex: 'orderId',
      key: 'orderId',
    },
    {
      title: 'Ngày đặt hàng',
      dataIndex: 'orderDate',
      key: 'orderDate',
    },
    {
      title: 'Tổng tiền',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount) => `${amount.toLocaleString('vi-VN')} VNĐ`,
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusTagColor(status)}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Phương thức thanh toán',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {/* Nút Xem chi tiết */}
          <Button type="primary" onClick={() => handleDetailOrder(record?.orderId)}>
            Xem chi tiết
          </Button>

          {/* Nút Hủy đơn hàng - Chỉ hiển thị nếu trạng thái cho phép hoặc nếu đơn ko phải là chuyển khoản */}
          {record.status !== 'Đã xác nhận' && record.status !== 'Đã giao' && record.status !== 'Đã hủy' && (
            <Popconfirm
              title="Bạn có chắc chắn muốn hủy đơn hàng này?"
              onConfirm={() => handleCancelOrder(record.orderId)}
              okText="Có"
              cancelText="Không"
            >
              <Button danger>Hủy đơn hàng</Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ];


  const handleGetDetailProduct = (productId) => {
    navigate(`/productDetail/${productId}`)
  }


  // Component mở rộng để hiển thị chi tiết sản phẩm cho mỗi đơn hàng
  const expandedRowRender = (record) => {
    const productColumns = [
      { title: 'Hình ảnh', dataIndex: 'image', key: 'image', },
      { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
      { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity' },
      { title: 'Đơn giá', dataIndex: 'unitPrice', key: 'unitPrice', render: (price) => price.toLocaleString('vi-VN') + ' VNĐ' },
      {
        title: 'Giảm giá + Ship',
        dataIndex: 'subtotal',
        key: 'subtotal',
        render: (total) => total.toLocaleString('vi-VN') + ' VNĐ'
      },
    ];


    return (
      <Table
        columns={productColumns}
        dataSource={record.products}
        pagination={false}
        onRow={(row) => ({
          onClick: () => handleGetDetailProduct(row.productId),
          style: { cursor: 'pointer' }
        })}
        summary={pageData => {
          // let totalOrderProductsAmount = 0;
          // pageData.forEach(({ subtotal }) => {
          //   totalOrderProductsAmount += subtotal;
          // });
          return (

            <Table.Summary.Row >
              <Table.Summary.Cell index={0} colSpan={4}>
                <Text strong>Tổng cộng đơn hàng này:</Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={4}>
                <Text strong>{record.totalAmount.toLocaleString('vi-VN')} VNĐ</Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          );
        }}
      />
    );
  };

  return (
    <OrderListWrapper>
      <StyledOrderListCard
        title={
          <Title level={3} style={{ margin: 0 }}>
            Lịch sử đơn hàng của bạn
          </Title>
        }
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: '24px' }}>
          Theo dõi trạng thái giao hàng, xem chi tiết sản phẩm và quản lý các đơn đã đặt.
        </Text>
        <Table
          columns={columns}
          dataSource={orders}
          loading={loading}
          pagination={{ pageSize: 5 }}
          scroll={{ x: 'max-content' }}
          expandable={{ expandedRowRender }} // Thêm dòng này để cho phép mở rộng hàng
          expandRowByClick={true}
          onRow={(row) => ({
            style: { cursor: 'pointer' }
          })}
        />
      </StyledOrderListCard>
    </OrderListWrapper>
  );
};

export default OrderListPage;