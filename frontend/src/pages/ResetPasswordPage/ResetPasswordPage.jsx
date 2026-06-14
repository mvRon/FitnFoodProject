import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, message } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import * as UserService from '../../services/UserService';
import { useMutationHook } from '../../hooks/useMutationHook';
import { styles, colors } from './Style';

const { Title, Text } = Typography;

function ResetPasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const searchParams = new URLSearchParams(location.search);
  const token = searchParams.get('token');

  const mutation = useMutationHook(data => UserService.resetPassword(data));
  const { isPending } = mutation;

  const handleFinish = () => {
    if (!token) {
      message.error('Token không hợp lệ hoặc đã hết hạn.');
      return;
    }

    if (password !== confirmPassword) {
      message.error('Mật khẩu xác nhận không khớp.');
      return;
    }

    mutation.mutate({ token, newPassword: password }, {
      onSuccess: (res) => {
        if (res.status === 'OK') {
          message.success('Đặt lại mật khẩu thành công!');
          navigate('/login');
        } else {
          message.error(res.message || 'Có lỗi xảy ra');
        }
      },
      onError: () => {
        message.error('Có lỗi xảy ra khi đặt lại mật khẩu');
      }
    });
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Row gutter={0}>
          <Col xs={24} md={11}>
            <div style={styles.showcase}>
              <div>
                <Title style={styles.showcaseTitle}>FitnFood</Title>
                <Text style={styles.showcaseText}>
                  Bảo mật tài khoản là ưu tiên hàng đầu của chúng tôi.
                </Text>
              </div>

              <div style={styles.statBox}>
                <Text style={{ color: '#fff', fontSize: 13 }}>
                  Vui lòng tạo một mật khẩu mạnh với ít nhất 6 ký tự để bảo vệ thông tin của bạn.
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={13}>
            <div style={styles.formSide}>
              <Title level={2} style={{ color: colors.text, marginBottom: 0 }}>
                Đặt lại mật khẩu
              </Title>
              <Text style={styles.subtitle}>
                Nhập mật khẩu mới cho tài khoản của bạn.
              </Text>

              <Form layout="vertical" onFinish={handleFinish} form={form}>
                <Form.Item
                  label="Mật khẩu mới"
                  name="password"
                  rules={[
                    { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Nhập mật khẩu mới"
                    onChange={(e) => setPassword(e.target.value)}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Form.Item
                  label="Xác nhận mật khẩu mới"
                  name="confirmPassword"
                  rules={[
                    { required: true, message: 'Vui lòng xác nhận mật khẩu mới' },
                  ]}
                >
                  <Input.Password
                    size="large"
                    placeholder="Xác nhận mật khẩu mới"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={styles.submitButton}
                  loading={isPending}
                >
                  Lưu mật khẩu mới
                </Button>

                <div style={styles.register}>
                  <a onClick={() => navigate('/login')} style={styles.link}>
                    Quay lại đăng nhập
                  </a>
                </div>
              </Form>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
