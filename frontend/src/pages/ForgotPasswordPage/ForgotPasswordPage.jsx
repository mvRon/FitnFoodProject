import React, { useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import * as UserService from '../../services/UserService';
import { useMutationHook } from '../../hooks/useMutationHook';
import { styles, colors } from './Style';

const { Title, Text } = Typography;

function ForgotPasswordPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');

  const mutation = useMutationHook(data => UserService.forgotPassword(data));
  const { data, isPending } = mutation;

  const handleFinish = () => {
    mutation.mutate({ email }, {
      onSuccess: (res) => {
        if (res.status === 'OK') {
          message.success('Email khôi phục đã được gửi. Vui lòng kiểm tra hộp thư của bạn.');
        } else {
          message.error(res.message || 'Có lỗi xảy ra');
        }
      },
      onError: () => {
        message.error('Có lỗi xảy ra khi gửi yêu cầu');
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
                  Khôi phục quyền truy cập và tiếp tục hành trình sống khỏe.
                </Text>
              </div>

              <div style={styles.statBox}>
                <Text style={{ color: '#fff', fontSize: 13 }}>
                  Chúng tôi sẽ gửi một liên kết bảo mật qua email giúp bạn đặt lại mật khẩu nhanh chóng.
                </Text>
              </div>
            </div>
          </Col>

          <Col xs={24} md={13}>
            <div style={styles.formSide}>
              <Title level={2} style={{ color: colors.text, marginBottom: 0 }}>
                Quên mật khẩu?
              </Title>
              <Text style={styles.subtitle}>
                Nhập email bạn đã đăng ký để nhận liên kết đặt lại mật khẩu.
              </Text>

              <Form layout="vertical" onFinish={handleFinish} form={form}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Vui lòng nhập email' },
                    { type: 'email', message: 'Email không đúng định dạng' },
                  ]}
                >
                  <Input
                    size="large"
                    placeholder="Nhập email của bạn"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </Form.Item>

                <Button
                  type="primary"
                  htmlType="submit"
                  block
                  style={styles.submitButton}
                  loading={isPending}
                >
                  Gửi liên kết
                </Button>

                <div style={styles.register}>
                  <Text style={{ color: colors.muted }}>Nhớ mật khẩu? </Text>
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

export default ForgotPasswordPage;
