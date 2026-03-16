import React from 'react';
import { Row, Col, Typography } from 'antd';
import { StyledFooter } from './Style'


const { Title, Text, Link } = Typography;


const FooterComponent = () => {
  return (
    <div>
      <StyledFooter>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: '#ffffff' }}>Về chúng tôi</Title>
            <Text style={{ color: '#ccc' }}>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</Text>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: '#ffffff' }}>Hỗ trợ khách hàng</Title>
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              <li><Link href="#" style={{ color: '#ccc' }}>Chính sách bảo hành</Link></li>
              <li><Link href="#" style={{ color: '#ccc' }}>Hướng dẫn mua hàng</Link></li>
              <li><Link href="#" style={{ color: '#ccc' }}>Câu hỏi thường gặp</Link></li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: '#ffffff' }}>Liên hệ</Title>
            <Text style={{ color: '#ccc' }}>
              Địa chỉ: 69/68 Đ. Đặng Thuỳ Trâm, Phường 13, Quận Bình Thạnh, Tp. Hồ Chí Minh.<br />
              Hotline: 1900 1234<br />
              Email: support@gmail.com
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: '#ffffff' }}>Theo dõi chúng tôi</Title>
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              <li><Link href="#" style={{ color: '#ccc' }}>Facebook</Link></li>
              <li><Link href="#" style={{ color: '#ccc' }}>YouTube</Link></li>
              <li><Link href="#" style={{ color: '#ccc' }}>Zalo</Link></li>
            </ul>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', color: '#888', marginTop: 40 }}>
          © {new Date().getFullYear()} Lorem Ipsum. All rights reserved.
        </div>
      </StyledFooter>
    </div>
  );
};

export default FooterComponent;