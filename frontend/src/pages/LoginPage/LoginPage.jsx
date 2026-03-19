import React from 'react';
import { Form, Input, Button, Typography, Row, Col } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { styles, colors } from './Style';

const { Title, Text } = Typography;

function LoginPage() {
  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Row gutter={0}>
          <Col xs={24} md={11}>
            <div style={styles.showcase}>
              <div>
                <Title style={styles.showcaseTitle}>FitnFood</Title>
                <Text style={styles.showcaseText}>
                  Đồng hành cùng bạn xây dựng lối sống khỏe mạnh mỗi ngày 1.
                </Text>
              </div>

              <div style={styles.statBox}>
                <Text style={{ color: '#fff', fontSize: 13 }}>
                  Đăng nhập để theo dõi đơn hàng, tích điểm thành viên và nhận ưu đãi cá nhân hóa.
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={13}>
            <div style={styles.formSide}>
              <Title level={2} style={{ color: colors.text, marginBottom: 0 }}>
                Chào mừng trở lại
              </Title>
              <Text style={styles.subtitle}>Đăng nhập để tiếp tục mua sắm</Text>

              <Form
                layout="vertical"
                onFinish={(values) => {
                  console.log('Login:', values);
                }}
              >
                <Form.Item
                  label="Số điện thoại"
                  name="phone"
                  rules={[
                    { required: true, message: 'Vui lòng nhập số điện thoại' },
                  ]}
                >
                  <Input size="large" placeholder="Nhập số điện thoại của bạn" />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu"
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu' },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Nhập mật khẩu của bạn"
                    iconRender={(visible) =>
                      visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                    }
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={styles.submitButton}
                >
                  Đăng nhập
                </Button>

                <div style={styles.forgot}>
                  <a href="#" style={styles.link}>Quên mật khẩu?</a>
                </div>

                <div style={styles.register}>
                  <span>Chưa có tài khoản? </span>
                  <a href="/register" style={styles.link}>Đăng ký ngay</a>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default LoginPage;