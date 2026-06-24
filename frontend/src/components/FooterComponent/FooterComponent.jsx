import React from 'react';
import { Row, Col, Typography } from 'antd';
import { StyledFooter } from './Style'
import { useSystemSetting } from '../../context/SystemSettingContext';


const { Title, Text, Link } = Typography;


const FooterComponent = () => {
  const { setting } = useSystemSetting();

  return (
    <div>
      <StyledFooter>
        <Row gutter={[32, 32]}>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: 'var(--color-white)' }}>Về chúng tôi</Title>
            <Text style={{ color: 'var(--color-muted)' }}>
              {setting.storeSlogan || 'Thực phẩm lành mạnh cho cuộc sống năng động'}
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: 'var(--color-white)' }}>Hỗ trợ khách hàng</Title>
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              <li><Link href="#" style={{ color: 'var(--color-muted)' }}>Chính sách bảo hành</Link></li>
              <li><Link href="#" style={{ color: 'var(--color-muted)' }}>Hướng dẫn mua hàng</Link></li>
              <li><Link href="#" style={{ color: 'var(--color-muted)' }}>Câu hỏi thường gặp</Link></li>
            </ul>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: 'var(--color-white)' }}>Liên hệ</Title>
            <Text style={{ color: 'var(--color-muted)' }}>
              {setting.storeAddress && <>{setting.storeAddress}<br /></>}
              {setting.storePhone && <>Hotline: {setting.storePhone}<br /></>}
              {setting.storeEmail && <>Email: {setting.storeEmail}</>}
              {!setting.storeAddress && !setting.storePhone && !setting.storeEmail && (
                'Chưa cập nhật thông tin liên hệ'
              )}
            </Text>
          </Col>
          <Col xs={24} sm={12} md={8} lg={6}>
            <Title level={4} style={{ color: 'var(--color-white)' }}>Theo dõi chúng tôi</Title>
            <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
              <li><Link href="#" style={{ color: 'var(--color-muted)' }}>Facebook</Link></li>
              <li><Link href="#" style={{ color: 'var(--color-muted)' }}>YouTube</Link></li>
              <li><Link href="#" style={{ color: 'var(--color-muted)' }}>Zalo</Link></li>
            </ul>
          </Col>
        </Row>
        <div style={{ textAlign: 'center', color: 'var(--color-muted)', marginTop: 40 }}>
          © {new Date().getFullYear()} {setting.storeName || 'FitnFood'}. All rights reserved.
        </div>
      </StyledFooter>
    </div>
  );
};

export default FooterComponent;