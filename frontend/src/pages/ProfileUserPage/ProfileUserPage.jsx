import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useCallback } from 'react';
import { Spin, Form, Input, Button, message, Upload, Image } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import {
    Container,
    HeroBadge,
    HeroSection,
    HeroSubtitle,
    HeroTitle,
    ProfileCard,
    ProfileHeader,
    HeaderInfo,
    HeaderName,
    HeaderRole,
    AvatarRing,
    ContentGrid,
    FieldLabel,
    FieldValue,
    CardTitle,
    InfoRow,
    ProfileForm,
    FormActions,
    PrimaryButton,
    SecondaryButton,
    EmptyText,
} from './Style';
import * as UserService from '../../services/UserService';

import { updateUser } from '../../redux/slice/userSlice'
import { compressImage } from '../../utils'
import { useMutationHook } from '../../hooks/useMutationHook';

const ProfileUserPage = () => {
    const [form] = Form.useForm();
    const access_token = JSON.parse(localStorage.getItem('access_token'));
    const user = useSelector((state) => state.user);
    const id = user?.id;
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formValues, setFormValues] = useState({});
    const dispatch = useDispatch()
    
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwordForm] = Form.useForm();
    const mutationForgotPassword = useMutationHook(data => UserService.forgotPassword(data));
    const mutationChangePassword = useMutationHook(data => UserService.changePassword(data, access_token));


    const fetchUserInfo = useCallback(async () => {
        try {
            setLoading(true);
            const res = await UserService.getDetailUser(access_token);
            if (res?.status === "OK") {
                setUserData(res?.data);
                setError(null);
            } else {
                setError(res?.message || 'Không thể lấy thông tin người dùng.');
            }
        } catch (err) {
            setError('Lỗi khi lấy thông tin người dùng.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [access_token]);

    useEffect(() => {
        if (!access_token) {
            setError('Bạn chưa đăng nhập hoặc phiên đăng nhập đã hết hạn.');
            setLoading(false);
            return;
        }

        fetchUserInfo();
    }, [access_token, fetchUserInfo]);

    const handleOnchangeDetailAvatar = async ({ fileList }) => {
        const file = fileList[0];
        if (file) {
            if (!file.url && !file.preview) {
                const rawBase64 = await getBase64(file.originFileObj);
                file.preview = await compressImage(rawBase64);
            }
            setFormValues((prev) => ({
                ...prev,
                avatar: file.preview,
            }));
        }
    };

    const handleUpdateUser = async (values) => {
        try {
            setLoading(true);
            const targetUserId = userData?._id || id;
            const updatedData = {
                ...values,
                avatar: formValues.avatar || userData.avatar,
            };

            const res = await UserService.updateUser(targetUserId, access_token, updatedData);
            if (res) {
                if (res?.status === "OK") {
                    message.success(res?.message);
                    setIsEditing(false);
                    dispatch(updateUser({ ...res?.data, access_token }));
                    await fetchUserInfo();
                } else {
                    message.error(res?.message);
                }
            } else {
                message.error('Không nhận được phản hồi từ máy chủ.');
            }

            return res;
        } catch (err) {
            message.error('Lỗi khi cập nhật thông tin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStartEdit = () => {
        setIsEditing(true);
        setFormValues(userData || {});
        form.setFieldsValue(userData || {});
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setFormValues({});
    };

    const handleForgotPasswordFromProfile = () => {
        if (!userData?.email) {
            message.error('Không tìm thấy email của tài khoản.');
            return;
        }
        mutationForgotPassword.mutate({ email: userData.email }, {
            onSuccess: (res) => {
                if (res.status === 'OK') {
                    message.success('Email khôi phục đã được gửi. Vui lòng kiểm tra hộp thư.');
                } else {
                    message.error(res.message || 'Có lỗi xảy ra');
                }
            },
            onError: () => {
                message.error('Có lỗi xảy ra khi gửi yêu cầu');
            }
        });
    };

    const handleFinishChangePassword = (values) => {
        if (values.newPassword !== values.confirmNewPassword) {
            message.error('Mật khẩu xác nhận không khớp!');
            return;
        }
        mutationChangePassword.mutate({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword
        }, {
            onSuccess: (res) => {
                if (res.status === 'OK') {
                    message.success('Đổi mật khẩu thành công!');
                    setIsChangingPassword(false);
                    passwordForm.resetFields();
                } else {
                    message.error(res.message || 'Mật khẩu cũ không chính xác hoặc có lỗi xảy ra.');
                }
            },
            onError: () => {
                message.error('Đổi mật khẩu thất bại.');
            }
        });
    };

    if (loading) {
        return (
            <Container>
                <Spin size="large" />
            </Container>
        );
    }

    if (error) {
        return <Container>Lỗi: {error}</Container>;
    }

    if (!userData) {
        return <Container>Không tìm thấy thông tin người dùng.</Container>;
    }

    return (
        <Container>
            <HeroSection>
                <HeroBadge>My Profile</HeroBadge>
                <HeroTitle>Thông tin tài khoản</HeroTitle>
                <HeroSubtitle>
                    Cập nhật hồ sơ cá nhân để hệ thống gợi ý sản phẩm dinh dưỡng phù hợp hơn.
                </HeroSubtitle>
            </HeroSection>

            <ProfileCard>
                <ProfileHeader>
                    <AvatarRing>
                        {userData.avatar ? (
                            <Image
                                src={userData.avatar}
                                alt="Avatar"
                                preview={true}
                                style={{
                                    width: 84,
                                    height: 84,
                                    objectFit: 'cover',
                                    borderRadius: '50%',
                                }}
                            />
                        ) : (
                            <EmptyText>{(userData.name || 'U').charAt(0).toUpperCase()}</EmptyText>
                        )}
                    </AvatarRing>

                    <HeaderInfo>
                        <HeaderName>{userData.name || 'Người dùng FitnFood'}</HeaderName>
                        <HeaderRole>{userData.isAdmin ? 'Quản trị viên' : 'Người dùng'}</HeaderRole>
                    </HeaderInfo>
                </ProfileHeader>

                {isEditing ? (
                    <ProfileForm
                        form={form}
                        layout="vertical"
                        initialValues={userData || {}}
                        onFinish={handleUpdateUser}
                        onValuesChange={(changed, all) => setFormValues(all)}
                    >
                        <CardTitle>Chỉnh sửa hồ sơ</CardTitle>
                        <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input />
                        </Form.Item>
                        <Form.Item label="Email" name="email">
                            <Input disabled />
                        </Form.Item>
                        <Form.Item label="Số điện thoại" name="phone">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Địa chỉ" name="address">
                            <Input />
                        </Form.Item>
                        <Form.Item label="Tỉnh/Thành" name="city">
                            <Input />
                        </Form.Item>

                        <Form.Item label="Avatar" name="avatar">
                            <Upload
                                showUploadList={false}
                                maxCount={1}
                                beforeUpload={() => false}
                                onChange={handleOnchangeDetailAvatar}
                            >
                                <Button icon={<UploadOutlined />}>Upload</Button>
                            </Upload>
                            {(formValues.avatar || userData.avatar) && (
                                // <img
                                //   src={formValues.avatar || userData.avatar}
                                //   alt="Avatar preview"
                                //   style={{
                                //     width: 60,
                                //     height: 60,
                                //     borderRadius: '50%',
                                //     marginTop: 10,
                                //     objectFit: 'cover',
                                //   }}
                                // />
                                <Image
                                    src={formValues.avatar || userData.avatar}
                                    alt="Avatar preview"
                                    preview={true}
                                    style={{
                                        width: 60,
                                        height: 60,
                                        borderRadius: '50%',
                                        marginTop: 10,
                                        objectFit: 'cover',
                                    }}
                                />


                            )}
                        </Form.Item>

                        <FormActions>
                            <PrimaryButton htmlType="submit" type="primary">
                                Lưu thay đổi
                            </PrimaryButton>
                            <SecondaryButton onClick={handleCancelEdit}>
                                Hủy
                            </SecondaryButton>
                        </FormActions>
                    </ProfileForm>
                ) : (
                    <>
                        <CardTitle>Chi tiết tài khoản</CardTitle>

                        <ContentGrid>
                            <InfoRow>
                                <FieldLabel>Họ tên</FieldLabel>
                                <FieldValue>{userData.name || 'Không có dữ liệu'}</FieldValue>
                            </InfoRow>
                            <InfoRow>
                                <FieldLabel>Email</FieldLabel>
                                <FieldValue>{userData.email || 'Không có dữ liệu'}</FieldValue>
                            </InfoRow>
                            <InfoRow>
                                <FieldLabel>Số điện thoại</FieldLabel>
                                <FieldValue>{userData.phone || 'Không có dữ liệu'}</FieldValue>
                            </InfoRow>
                            <InfoRow>
                                <FieldLabel>Địa chỉ</FieldLabel>
                                <FieldValue>{userData.address || 'Không có dữ liệu'}</FieldValue>
                            </InfoRow>
                            <InfoRow>
                                <FieldLabel>Tỉnh/Thành</FieldLabel>
                                <FieldValue>{userData.city || 'Không có dữ liệu'}</FieldValue>
                            </InfoRow>
                        </ContentGrid>

                        <FormActions>
                            <PrimaryButton onClick={handleStartEdit}>
                                Chỉnh sửa hồ sơ
                            </PrimaryButton>
                        </FormActions>
                    </>
                )}
            </ProfileCard>

            <ProfileCard style={{ marginTop: '20px' }}>
                <CardTitle>Bảo mật tài khoản</CardTitle>
                <div style={{ marginBottom: '20px' }}>
                    <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>
                        Nhận liên kết đặt lại mật khẩu qua email nếu bạn đã quên mật khẩu.
                    </p>
                    <SecondaryButton 
                        onClick={handleForgotPasswordFromProfile}
                        loading={mutationForgotPassword.isPending}
                    >
                        Quên mật khẩu
                    </SecondaryButton>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '20px 0' }} />

                {isChangingPassword ? (
                    <ProfileForm
                        form={passwordForm}
                        layout="vertical"
                        onFinish={handleFinishChangePassword}
                    >
                        <Form.Item 
                            label="Mật khẩu cũ" 
                            name="oldPassword" 
                            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu hiện tại" />
                        </Form.Item>
                        <Form.Item 
                            label="Mật khẩu mới" 
                            name="newPassword" 
                            rules={[
                                { required: true, message: 'Vui lòng nhập mật khẩu mới' },
                                { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự' }
                            ]}
                        >
                            <Input.Password placeholder="Nhập mật khẩu mới" />
                        </Form.Item>
                        <Form.Item 
                            label="Xác nhận mật khẩu mới" 
                            name="confirmNewPassword" 
                            rules={[{ required: true, message: 'Vui lòng xác nhận mật khẩu mới' }]}
                        >
                            <Input.Password placeholder="Xác nhận mật khẩu mới" />
                        </Form.Item>

                        <FormActions>
                            <PrimaryButton 
                                htmlType="submit" 
                                type="primary"
                                loading={mutationChangePassword.isPending}
                            >
                                Lưu mật khẩu
                            </PrimaryButton>
                            <SecondaryButton onClick={() => {
                                setIsChangingPassword(false);
                                passwordForm.resetFields();
                            }}>
                                Hủy
                            </SecondaryButton>
                        </FormActions>
                    </ProfileForm>
                ) : (
                    <div>
                        <p style={{ color: 'var(--muted)', marginBottom: '10px' }}>
                            Thay đổi mật khẩu định kỳ để bảo vệ tài khoản của bạn.
                        </p>
                        <PrimaryButton onClick={() => setIsChangingPassword(true)}>
                            Đổi mật khẩu
                        </PrimaryButton>
                    </div>
                )}
            </ProfileCard>
        </Container>
    );
};

export default ProfileUserPage;

const getBase64 = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
};