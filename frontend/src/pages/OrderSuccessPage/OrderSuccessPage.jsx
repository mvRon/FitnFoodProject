import React from 'react';
import { Result, Button, Typography } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { OrderSuccessWrapper } from './Style'; // Import styled component
import { useSelector } from 'react-redux';

const { Title, Text } = Typography;

const OrderSuccessPage = () => {
    const navigate = useNavigate();
    const user = useSelector((state) => state.user); 
    const token = localStorage.getItem('access_token'); 
    const parsedToken = token ? JSON.parse(token) : null; 

    const handleGoHome = () => {
        navigate('/'); // Điều hướng về trang chủ
    };

    // console.log('user', user)

    const handleGoOrderHistory = () => {
        navigate('/myOrder', {
            state: {
                id: user?.id,
                token: parsedToken,
            }
        });
    };

    return (
        <OrderSuccessWrapper>
            <Result
                status="success"
                icon={<CheckCircleOutlined style={{ color: '#10B981' }} />}
                title={<Title level={2}>Đặt hàng thành công!</Title>}
                subTitle={<Text>Cảm ơn bạn đã mua hàng. Đơn hàng đang được xử lý và sẽ sớm cập nhật trạng thái giao nhận.</Text>}
                extra={[
                    <Button type="primary" key="home" onClick={handleGoHome}>
                        Về trang chủ
                    </Button>,
                    <Button key="history" onClick={handleGoOrderHistory}>
                        Xem lịch sử đơn hàng
                    </Button>,
                ]}
            />
        </OrderSuccessWrapper>
    );
};

export default OrderSuccessPage;