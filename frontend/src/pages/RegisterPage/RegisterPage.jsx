import React, { useState } from 'react';
import { Form, Input, Button, Row, Col, Typography, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { styles, colors } from './Style';
import * as UserService from '../../services/UserService';

const { Title, Text } = Typography;

function RegisterPage() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  const formatDobInput = (event) => {
    const digits = event.target.value.replace(/\D/g, '').slice(0, 8);
    if (digits.length <= 2) return digits;
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
  };

  const validateDob = (_, value) => {
    if (!value) return Promise.resolve();
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

  const onFinish = async (values) => {
    const payload = {
      name: values.name?.trim(),
      email: values.email?.trim(),
      password: values.password,
      confirmPassword: values.confirmPassword,
      phone: values.phone?.trim(),
      address: values.address?.trim(),
      city: values.city?.trim(),
    };

    try {
      setIsSubmitting(true);
      const res = await UserService.registerUser(payload);

      if (res?.status === 'OK') {
        message.success('Đăng ký thành công. Vui lòng kiểm tra email để xác minh tài khoản.');
        setRegisteredEmail(payload.email);
        setIsRegisterMode(false);
        return;
      }

      message.error(res?.message || 'Đăng ký thất bại');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyAccount = async () => {
    if (!registeredEmail) {
      message.error('Không tìm thấy email đăng ký để xác minh');
      return;
    }

    if (!verifyCode?.trim()) {
      message.error('Vui lòng nhập mã xác minh');
      return;
    }

    try {
      setIsVerifying(true);
      const res = await UserService.verifyUser({
        email: registeredEmail,
        verificationCode: verifyCode.trim(),
      });

      if (res?.status === 'OK') {
        message.success('Xác minh tài khoản thành công. Vui lòng đăng nhập.');
        form.resetFields();
        setVerifyCode('');
        setIsRegisterMode(true);
        navigate('/login');
        return;
      }

      message.error(res?.message || 'Xác minh thất bại');
    } catch (error) {
      message.error(error?.response?.data?.message || 'Xác minh thất bại, vui lòng thử lại');
    } finally {
      setIsVerifying(false);
    }
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
                {isRegisterMode ? 'Đăng ký tài khoản' : 'Xác minh tài khoản'}
              </Title>
              <Text style={styles.panelSubtitle}>
                {isRegisterMode
                  ? 'Hoàn thiện thông tin để bắt đầu'
                  : 'Nhập mã xác minh được gửi tới email của bạn'}
              </Text>

              {isRegisterMode ? (
              <Form form={form} layout="vertical" onFinish={onFinish}>
                <Title level={4}>Thông tin cá nhân</Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Họ và tên"
                      name="name"
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên' }]}
                    >
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
                    <Form.Item
                      label="Số điện thoại"
                      name="phone"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}
                    >
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

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Địa chỉ"
                      name="address"
                      rules={[{ required: true, message: 'Vui lòng nhập địa chỉ' }]}
                    >
                      <Input size="large" placeholder="Nhập địa chỉ" />
                    </Form.Item>
                  </Col>

                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Thành phố"
                      name="city"
                      rules={[{ required: true, message: 'Vui lòng nhập thành phố' }]}
                    >
                      <Input size="large" placeholder="Nhập thành phố" />
                    </Form.Item>
                  </Col>
                </Row>

                <Title level={4}>Tạo mật khẩu</Title>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      label="Mật khẩu"
                      name="password"
                      rules={[
                        { required: true, message: 'Vui lòng nhập mật khẩu' },
                        { min: 6, message: 'Mật khẩu tối thiểu 6 ký tự' },
                      ]}
                    >
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
                    <Form.Item
                      label="Nhập lại mật khẩu"
                      name="confirmPassword"
                      dependencies={['password']}
                      rules={[
                        { required: true, message: 'Vui lòng nhập lại mật khẩu' },
                        ({ getFieldValue }) => ({
                          validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                              return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu nhập lại không khớp'));
                          },
                        }),
                      ]}
                    >
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
                    <Button
                      type="primary"
                      htmlType="submit"
                      style={styles.submitButton}
                      loading={isSubmitting}
                      block
                    >
                      Hoàn tất đăng ký
                    </Button>
                  </Col>
                </Row>
              </Form>
              ) : (
                <Form layout="vertical">
                  <Form.Item label="Email đã đăng ký">
                    <Input size="large" value={registeredEmail} disabled />
                  </Form.Item>

                  <Form.Item
                    label="Mã xác minh"
                    required
                    rules={[{ required: true, message: 'Vui lòng nhập mã xác minh' }]}
                  >
                    <Input
                      size="large"
                      placeholder="Nhập mã xác minh"
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                    />
                  </Form.Item>

                  <Row gutter={16} style={{ marginTop: 24 }}>
                    <Col xs={24} md={12} style={{ marginBottom: 10 }}>
                      <Button
                        style={styles.backButton}
                        block
                        onClick={() => {
                          setIsRegisterMode(true);
                          setVerifyCode('');
                        }}
                      >
                        Quay lại đăng ký
                      </Button>
                    </Col>

                    <Col xs={24} md={12}>
                      <Button
                        type="primary"
                        style={styles.submitButton}
                        loading={isVerifying}
                        block
                        onClick={handleVerifyAccount}
                      >
                        Xác minh tài khoản
                      </Button>
                    </Col>
                  </Row>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default RegisterPage;