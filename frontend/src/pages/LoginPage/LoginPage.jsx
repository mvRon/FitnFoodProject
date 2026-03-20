import React, { useEffect, useState } from 'react';
import { Form, Input, Button, Typography, Row, Col, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { styles, colors } from './Style';
import * as UserService from '../../services/UserService';
import { updateUser } from '../../redux/slice/userSlice';
import { useMutationHook } from '../../hooks/useMutationHook';

const { Title, Text } = Typography;

function LoginPage() {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const location = useLocation();
  const navigate = useNavigate();

  const [isLoggedInSuccess, setIsLoggedSuccess] = useState(true);
  const [verifyCode, setVerifyCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleOnchangeEmail = (e) => setEmail(e.target.value);
  const handleOnchangePassword = (e) => setPassword(e.target.value);
  const handleOnChangeVerifyCode = (e) => setVerifyCode(e.target.value);
  const handleNavigateRegister = () => navigate('/register');
  const handleNavigateLogin = () => navigate('/login');
  const handleForgetPassword = () => navigate('/forgot-password');

  const mutation = useMutationHook(data => UserService.loginUser(data));
  const { data, isPending, isSuccess, isError } = mutation;

  const mutationVerifyCode = useMutationHook(data => UserService.verifyUser(data));
  const {
    data: dataVerifyCode,
    isPending: isPendingVerifyCode,
    isSuccess: isSuccessVerifyCode,
    isError: isErrorVerifyCode,
  } = mutationVerifyCode;

  const handleLogin = (values) => {
    mutation.mutate({ email: values.email, password: values.password });
  };

  const handleVerifyCode = () => {
    mutationVerifyCode.mutate({ email, verificationCode: verifyCode });
  };

  const handleGetDetailUser = async (id, token) => {
    const storage = localStorage.getItem('refresh_token');
    const refresh_token = JSON.parse(storage);
    const res = await UserService.getDetailUser(token);
    dispatch(updateUser({ ...res?.data, access_token: token, refresh_token }));
  };

  // Xử lý kết quả đăng nhập
  useEffect(() => {
    if (isSuccess) {
      if (data?.status === 'OK') {
        message.success(data?.message);
        // console.log('accessToken', data?.access_token)

        if (data?.access_token) {
          const decoded = jwtDecode(data?.access_token);
          localStorage.setItem('access_token', JSON.stringify(data?.access_token));
          localStorage.setItem('refresh_token', JSON.stringify(data?.refresh_token));
          if (decoded?.id) {
            handleGetDetailUser(decoded?.id, data?.access_token);
          }
        } else {
          localStorage.clear();
        }

        const redirectPath = location?.state?.from || '/';
        navigate(redirectPath);
      }

      else if (data?.status === 'ERR') {
        if (data?.message?.includes('chưa được xác minh') || data?.message?.includes('not verified')) {
          message.warning('Tài khoản chưa xác minh. Vui lòng nhập mã được gửi tới email.');
          setIsLoggedSuccess(false);
        }
        else {
          message.error(data?.message || 'Đăng nhập thất bại');
          setIsLoggedSuccess(true);
        }
      }
    }

    if (isError) {
      message.error(data?.message || 'Đăng nhập thất bại');
      setIsLoggedSuccess(true);
    }
  }, [data, isSuccess, isError]);


  // Xử lý sau khi xác minh thành công
  useEffect(() => {
    if (isSuccessVerifyCode) {
      if (dataVerifyCode?.status === 'OK') {
        message.success(dataVerifyCode?.message || 'Xác minh thành công');

        localStorage.setItem('access_token', JSON.stringify(data?.access_token));
        if (data?.access_token) {
          const decoded = jwtDecode(data?.access_token);
          if (decoded?.id) {
            handleGetDetailUser(decoded?.id, data?.access_token);
          }
        }

        setIsLoggedSuccess(true);
        const redirectPath = location?.state?.from || '/login';
        navigate(redirectPath);
      } else {
        message.error(dataVerifyCode?.message || 'Xác minh thất bại');
      }
    } else if (isErrorVerifyCode) {
      setIsLoggedSuccess(false);
      message.error(dataVerifyCode?.message || 'Xác minh thất bại');
    }
  }, [isSuccessVerifyCode, isErrorVerifyCode, dataVerifyCode]);

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <Row gutter={0}>
          <Col xs={24} md={11}>
            <div style={styles.showcase}>
              <div>
                <Title style={styles.showcaseTitle}>FitnFood</Title>
                <Text style={styles.showcaseText}>
                  Đồng hành cùng bạn xây dựng lối sống khỏe mạnh mỗi ngày.
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
                {isLoggedInSuccess ? 'Chào mừng trở lại' : 'Xác minh tài khoản'}
              </Title>
              <Text style={styles.subtitle}>
                {isLoggedInSuccess ? 'Đăng nhập để tiếp tục mua sắm' : 'Nhập mã xác minh được gửi tới email'}
              </Text>

              {isLoggedInSuccess ? (
                <Form
                  form={form}
                  layout="vertical"
                  onFinish={handleLogin}
                >
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
                      onChange={(e) => setPassword(e.target.value)}
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
                    loading={isPending}
                  >
                    Đăng nhập
                  </Button>

                  <div style={styles.forgot}>
                    <a onClick={handleForgetPassword} style={styles.link}>Quên mật khẩu?</a>
                  </div>

                  <div style={styles.register}>
                    <span>Chưa có tài khoản? </span>
                    <a onClick={handleNavigateRegister} style={styles.link}>Đăng ký ngay</a>
                  </div>
                </Form>
              ) : (
                <Form layout="vertical">
                  <Form.Item
                    label="Mã xác minh"
                    rules={[{ required: true, message: 'Vui lòng nhập mã xác minh' }]}
                  >
                    <Input
                      size="large"
                      placeholder="Nhập mã 6 chữ số"
                      maxLength={6}
                      value={verifyCode}
                      onChange={handleOnChangeVerifyCode}
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    block
                    style={styles.submitButton}
                    loading={isPendingVerifyCode}
                    onClick={handleVerifyCode}
                  >
                    Xác minh
                  </Button>

                  <div style={styles.register}>
                    <a onClick={() => setIsLoggedSuccess(true)} style={styles.link}>Quay lại đăng nhập</a>
                  </div>
                </Form>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default LoginPage;