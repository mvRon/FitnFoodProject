import React from 'react';
import { Form, Input, Button, Row, Col, Typography } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { styles, colors } from './Style';

const { Title, Text } = Typography;

function RegisterPage() {
  const navigate = useNavigate();

  const formatDobInput = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const validateDob = (_, value) => {
    if (!value) return Promise.reject(new Error('Vui lòng nhập ngày sinh'));
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return Promise.reject(new Error('Định dạng đúng là DD/MM/YYYY'));
    }

    const [dayText, monthText, yearText] = value.split('/');
    const day = Number(dayText);
    const month = Number(monthText);
    const year = Number(yearText);

    if (month < 1 || month > 12) {
      return Promise.reject(new Error('Tháng phải từ 01 đến 12'));
    }

    const maxDay = new Date(year, month, 0).getDate();
    if (day < 1 || day > maxDay) {
      return Promise.reject(new Error('Ngày không hợp lệ với tháng đã nhập'));
    }

    return Promise.resolve();
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Row gutter={0}>
          <Col xs={24} md={10}>
            <div style={styles.hero}>
              <div>
                <Title style={styles.heroTitle}>Tạo tài khoản mới</Title>
                <Text style={styles.heroText}>
                  Đăng ký nhanh để nhận ưu đãi, theo dõi đơn hàng và cá nhân hóa thực đơn phù hợp.
                </Text>
              </div>

              <ul style={styles.heroList}>
                <li>Tích điểm thành viên cho mỗi đơn hàng</li>
                <li>Nhận thông báo khuyến mãi sớm nhất</li>
                <li>Lưu nhanh thông tin giao hàng</li>
              </ul>
            </div>
          </Col>

          <Col xs={24} md={14}>
            <div style={styles.panel}>
              <Title level={2} style={{ color: colors.text, marginBottom: 0 }}>
                Đăng ký tài khoản
              </Title>
              <Text style={styles.panelSubtitle}>Hoàn thiện thông tin để bắt đầu</Text>

              <Form layout="vertical">
                <Title level={4}>Thông tin cá nhân</Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Họ và tên" name="name">
                      <Input size="large" placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Ngày sinh"
                      name="dob"
                      getValueFromEvent={formatDobInput}
                      rules={[{ validator: validateDob }]}
                    >
                      <Input
                        size="large"
                        maxLength={10}
                        inputMode="numeric"
                        placeholder="(DD/MM/YYYY)"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Số điện thoại" name="phone">
                      <Input size="large" placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Email (bắt buộc)"
                      name="email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email' },
                        { type: 'email', message: 'Email không đúng định dạng' },
                      ]}
                    >
                      <Input size="large" placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={4}>Tạo mật khẩu</Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item label="Mật khẩu" name="password">
                      <Input.Password
                        size="large"
                        placeholder="Nhập mật khẩu"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item label="Nhập lại mật khẩu" name="confirmPassword">
                      <Input.Password
                        size="large"
                        placeholder="Nhập lại mật khẩu"
                        iconRender={(visible) =>
                          visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                        }
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Text style={styles.passwordNote}>
                  Mật khẩu tối thiểu 6 ký tự, có ít nhất 1 chữ và 1 số
                </Text>

                <Row gutter={16} style={{ marginTop: 24 }}>
                  <Col xs={24} md={12} style={{ marginBottom: 10 }}>
                    <Button style={styles.backButton} block onClick={() => navigate('/login')}>
                      Quay lại đăng nhập
                    </Button>
                  </Col>

                  <Col xs={24} md={12}>
                    <Button type="primary" style={styles.submitButton} block onClick={console.log('Register')}>
                      Hoàn tất đăng ký
                    </Button>
                  </Col>
                </Row>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default RegisterPage;