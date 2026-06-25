import React, { useEffect, useRef, useState } from 'react';
import {
    Form,
    Input,
    InputNumber,
    Switch,
    Tabs,
    message as toast,
    Spin,
    Tooltip,
} from 'antd';
import {
    SettingOutlined,
    ShopOutlined,
    CreditCardOutlined,
    MailOutlined,
    GlobalOutlined,
    CameraOutlined,
    SaveOutlined,
    DollarOutlined,
    CarOutlined,
    BankOutlined,
    QrcodeOutlined,
    PushpinOutlined
} from '@ant-design/icons';

import * as SystemSettingService from '../../services/SystemSettingService';
import {
    SettingWrapper,
    SettingHeader,
    HeaderIcon,
    HeaderText,
    HeaderTitle,
    HeaderSubtitle,
    TabCard,
    SectionBox,
    SectionLabel,
    LogoPreview,
    LogoPlaceholder,
    PaymentMethodRow,
    PaymentMethodInfo,
    SaveButton,
} from './Style';

const { TextArea } = Input;

// ─────────────────────────────────────────────────────────────────────────────
//  Helper: chuyển file thành base64
// ─────────────────────────────────────────────────────────────────────────────
const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (err) => reject(err);
    });

// ─────────────────────────────────────────────────────────────────────────────
//  Component chính
// ─────────────────────────────────────────────────────────────────────────────
const AdminSystemSettingComponent = () => {
    // Lấy token trực tiếp từ localStorage (giống các admin component khác)
    const getToken = () => {
        const raw = localStorage.getItem('access_token');
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return raw; }
    };

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Ant Design form instances cho từng tab
    const [shopForm] = Form.useForm();
    const [paymentForm] = Form.useForm();
    const [emailForm] = Form.useForm();
    const [seoForm] = Form.useForm();

    // Logo preview state
    const [logoPreview, setLogoPreview] = useState('');
    const logoInputRef = useRef(null);

    // ── Load dữ liệu khi mount ──────────────────────────────────────────────
    useEffect(() => {
        const fetchSetting = async () => {
            try {
                setLoading(true);
                const res = await SystemSettingService.getSystemSetting();
                if (res?.status === 'OK') {
                    const d = res.data;
                    shopForm.setFieldsValue({
                        storeName: d.storeName,
                        storeAddress: d.storeAddress,
                        storePhone: d.storePhone,
                        storeEmail: d.storeEmail,
                        storeSlogan: d.storeSlogan,
                    });
                    setLogoPreview(d.storeLogo || '');
                    paymentForm.setFieldsValue({
                        shippingFee: d.shippingFee,
                        freeShippingThreshold: d.freeShippingThreshold,
                        cod: d.paymentMethods?.cod ?? true,
                        payos: d.paymentMethods?.payos ?? true,
                    });
                    emailForm.setFieldsValue({
                        emailSenderName: d.emailSenderName,
                        autoSendEmail_verifyAccount: d.autoSendEmail?.verifyAccount ?? true,
                        autoSendEmail_recoveryPassword: d.autoSendEmail?.recoveryPassword ?? true,
                        autoSendEmail_sendEmailOrder: d.autoSendEmail?.sendEmailOrder ?? true,
                    });
                    seoForm.setFieldsValue({
                        metaTitle: d.metaTitle,
                        metaDescription: d.metaDescription,
                    });
                }
            } catch (err) {
                toast.error('Không thể tải cài đặt hệ thống!');
            } finally {
                setLoading(false);
            }
        };
        fetchSetting();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // ── Hàm lưu chung – nhận data object ───────────────────────────────────
    const handleSave = async (data) => {
        try {
            setSaving(true);
            const res = await SystemSettingService.updateSystemSetting(data, getToken());
            if (res?.status === 'OK') {
                toast.success('Lưu cài đặt thành công!');
            } else {
                toast.error('Lưu thất bại, vui lòng thử lại.');
            }
        } catch (err) {
            toast.error('Lỗi kết nối server!');
        } finally {
            setSaving(false);
        }
    };

    // ── Logo upload ──────────────────────────────────────────────────────────
    const handleLogoChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) {
            toast.warning('Ảnh logo không được vượt quá 2MB');
            return;
        }
        const base64 = await fileToBase64(file);
        setLogoPreview(base64);
    };

    // ── Tab: Thông tin cửa hàng ─────────────────────────────────────────────
    const onSaveShop = async () => {
        const values = await shopForm.validateFields();
        await handleSave({ ...values, storeLogo: logoPreview });
    };

    // ── Tab: Thanh toán & Vận chuyển ────────────────────────────────────────
    const onSavePayment = async () => {
        const values = await paymentForm.validateFields();
        await handleSave({
            shippingFee: values.shippingFee,
            freeShippingThreshold: values.freeShippingThreshold,
            paymentMethods: {
                cod: values.cod,
                payos: values.payos,
            },
        });
    };

    // ── Tab: Email ──────────────────────────────────────────────────────────
    const onSaveEmail = async () => {
        const values = await emailForm.validateFields();
        await handleSave({
            emailSenderName: values.emailSenderName,
            autoSendEmail: {
                verifyAccount: values.autoSendEmail_verifyAccount,
                recoveryPassword: values.autoSendEmail_recoveryPassword,
                sendEmailOrder: values.autoSendEmail_sendEmailOrder,
            }
        });
    };

    // ── Tab: SEO ────────────────────────────────────────────────────────────
    const onSaveSeo = async () => {
        const values = await seoForm.validateFields();
        await handleSave(values);
    };

    // ─────────────────────────────────────────────────────────────────────────
    //  Render các Tab
    // ─────────────────────────────────────────────────────────────────────────
    const tabItems = [
        {
            key: 'shop',
            label: (
                <span>
                    <ShopOutlined /> Cửa hàng
                </span>
            ),
            children: (
                <Form form={shopForm} layout="vertical" requiredMark={false}>
                    <SectionBox>
                        <SectionLabel>Thông tin cơ bản</SectionLabel>

                        {/* Logo */}
                        <Form.Item label="Logo cửa hàng">
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                <Tooltip title="Nhấp để chọn ảnh (tối đa 2MB)">
                                    <LogoPreview onClick={() => logoInputRef.current?.click()}>
                                        {logoPreview ? (
                                            <img src={logoPreview} alt="Logo" />
                                        ) : (
                                            <LogoPlaceholder>
                                                <CameraOutlined />
                                                <span>Tải lên</span>
                                            </LogoPlaceholder>
                                        )}
                                    </LogoPreview>
                                </Tooltip>
                                <div style={{ color: '#7c7c9a', fontSize: 13 }}>
                                    <div>Nhấp vào ô để tải logo lên.</div>
                                    <div>Định dạng PNG/JPG, tối đa 2MB.</div>
                                    {logoPreview && (
                                        <button
                                            type="button"
                                            style={{
                                                marginTop: 6,
                                                background: 'none',
                                                border: 'none',
                                                color: '#ef4444',
                                                cursor: 'pointer',
                                                padding: 0,
                                                fontSize: 12,
                                            }}
                                            onClick={() => setLogoPreview('')}
                                        >
                                            Xóa logo
                                        </button>
                                    )}
                                </div>
                                <input
                                    ref={logoInputRef}
                                    type="file"
                                    accept="image/*"
                                    style={{ display: 'none' }}
                                    onChange={handleLogoChange}
                                />
                            </div>
                        </Form.Item>

                        <Form.Item
                            name="storeName"
                            label="Tên cửa hàng"
                            rules={[{ required: true, message: 'Vui lòng nhập tên cửa hàng' }]}
                        >
                            <Input placeholder="FitnFood" size="large" />
                        </Form.Item>

                        <Form.Item name="storeSlogan" label="Slogan / Mô tả ngắn" style={{ margin: 0 }}>
                            <Input
                                placeholder="Thực phẩm lành mạnh cho cuộc sống năng động"
                                size="large"
                            />
                        </Form.Item>
                    </SectionBox>

                    <SectionBox>
                        <SectionLabel>Thông tin liên hệ</SectionLabel>

                        <Form.Item name="storeAddress" label="Địa chỉ cửa hàng">
                            <Input placeholder="123 Đường ABC, Quận 1, TP.HCM" size="large" />
                        </Form.Item>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Form.Item
                                name="storePhone"
                                label="Số điện thoại"
                                rules={[
                                    {
                                        pattern: /^[0-9+\-\s()]{7,15}$/,
                                        message: 'Số điện thoại không hợp lệ',
                                    },
                                ]}
                                style={{ margin: 0 }}
                            >
                                <Input placeholder="0909 123 456" size="large" />
                            </Form.Item>

                            <Form.Item
                                name="storeEmail"
                                label="Email liên hệ"
                                rules={[{ type: 'email', message: 'Email không hợp lệ' }]}
                                style={{ margin: 0 }}
                            >
                                <Input placeholder="contact@fitnfood.com" size="large" />
                            </Form.Item>
                        </div>
                    </SectionBox>

                    <SaveButton onClick={onSaveShop} disabled={saving}>
                        <SaveOutlined />
                        {saving ? 'Đang lưu...' : 'Lưu thông tin cửa hàng'}
                    </SaveButton>
                </Form>
            ),
        },
        {
            key: 'payment',
            label: (
                <span>
                    <CreditCardOutlined /> Thanh toán & Vận chuyển
                </span>
            ),
            children: (
                <Form form={paymentForm} layout="vertical" requiredMark={false}>
                    <SectionBox>
                        <SectionLabel>
                            <CarOutlined style={{ marginRight: 6 }} />
                            Cài đặt vận chuyển
                        </SectionLabel>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            <Form.Item
                                name="shippingFee"
                                label="Phí vận chuyển mặc định (VNĐ)"
                                rules={[{ required: true, message: 'Vui lòng nhập phí ship' }]}
                                style={{ margin: 0 }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size="large"
                                    min={0}
                                    step={1000}
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(v) => v.replace(/,/g, '')}
                                    placeholder="30000"
                                    addonAfter="₫"
                                />
                            </Form.Item>

                            <Form.Item
                                name="freeShippingThreshold"
                                label="Miễn phí ship từ (VNĐ)"
                                rules={[{ required: true, message: 'Vui lòng nhập ngưỡng miễn ship' }]}
                                style={{ margin: 0 }}
                            >
                                <InputNumber
                                    style={{ width: '100%' }}
                                    size="large"
                                    min={0}
                                    step={10000}
                                    formatter={(v) => `${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                                    parser={(v) => v.replace(/,/g, '')}
                                    placeholder="200000"
                                    addonAfter="₫"
                                />
                            </Form.Item>
                        </div>
                    </SectionBox>

                    <SectionBox>
                        <SectionLabel>
                            <DollarOutlined style={{ marginRight: 6 }} />
                            Phương thức thanh toán
                        </SectionLabel>

                        <PaymentMethodRow>
                            <PaymentMethodInfo>
                                <div className="pm-icon"><DollarOutlined /></div>
                                <div>
                                    <div className="pm-name">COD – Thanh toán khi nhận hàng</div>
                                    <div className="pm-desc">Khách trả tiền mặt khi nhận hàng</div>
                                </div>
                            </PaymentMethodInfo>
                            <Form.Item name="cod" valuePropName="checked" style={{ margin: 0 }}>
                                <Switch />
                            </Form.Item>
                        </PaymentMethodRow>

                        <PaymentMethodRow>
                            <PaymentMethodInfo>
                                <div className="pm-icon"><QrcodeOutlined /></div>
                                <div>
                                    <div className="pm-name">PayOS – Thanh toán QR</div>
                                    <div className="pm-desc">Quét mã QR qua app ngân hàng</div>
                                </div>
                            </PaymentMethodInfo>
                            <Form.Item name="payos" valuePropName="checked" style={{ margin: 0 }}>
                                <Switch />
                            </Form.Item>
                        </PaymentMethodRow>
                    </SectionBox>

                    <SaveButton onClick={onSavePayment} disabled={saving}>
                        <SaveOutlined />
                        {saving ? 'Đang lưu...' : 'Lưu cài đặt thanh toán'}
                    </SaveButton>
                </Form>
            ),
        },
        {
            key: 'email',
            label: (
                <span>
                    <MailOutlined /> Email
                </span>
            ),
            children: (
                <Form form={emailForm} layout="vertical" requiredMark={false}>
                    <SectionBox>
                        <SectionLabel>Cài đặt email hệ thống</SectionLabel>

                        <Form.Item
                            name="emailSenderName"
                            label="Tên người gửi email (Sender Name)"
                            help='Tên hiển thị trong hộp thư của khách hàng, ví dụ: "FitnFood Corporation"'
                            rules={[{ required: true, message: 'Vui lòng nhập tên người gửi' }]}
                        >
                            <Input
                                prefix={<MailOutlined style={{ color: '#a78bfa' }} />}
                                placeholder="FitnFood Corporation"
                                size="large"
                            />
                        </Form.Item>

                        <div style={{ padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid rgba(2, 132, 199, 0.1)', marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            <div style={{ fontWeight: 600, color: '#0284C7', fontSize: 14, borderBottom: '1px solid rgba(2, 132, 199, 0.1)', paddingBottom: '8px' }}>
                                Tùy chỉnh Gửi email tự động
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#1E293B', fontSize: 13 }}>Xác nhận tài khoản</div>
                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Gửi email mã xác nhận khi người dùng đăng ký tài khoản mới.</div>
                                </div>
                                <Form.Item name="autoSendEmail_verifyAccount" valuePropName="checked" style={{ margin: 0 }}>
                                    <Switch />
                                </Form.Item>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#1E293B', fontSize: 13 }}>Khôi phục mật khẩu</div>
                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Gửi email chứa liên kết để người dùng đặt lại mật khẩu.</div>
                                </div>
                                <Form.Item name="autoSendEmail_recoveryPassword" valuePropName="checked" style={{ margin: 0 }}>
                                    <Switch />
                                </Form.Item>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                <div>
                                    <div style={{ fontWeight: 500, color: '#1E293B', fontSize: 13 }}>Xác nhận đặt hàng</div>
                                    <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>Gửi email hóa đơn tự động khi khách hàng đặt hàng thành công.</div>
                                </div>
                                <Form.Item name="autoSendEmail_sendEmailOrder" valuePropName="checked" style={{ margin: 0 }}>
                                    <Switch />
                                </Form.Item>
                            </div>
                        </div>

                        <div
                            style={{
                                marginTop: 20,
                                padding: '14px 16px',
                                background: '#faf5ff',
                                borderRadius: 10,
                                border: '1px solid #ede9fe',
                                fontSize: 13,
                                color: '#5b21b6',
                                lineHeight: 1.6,
                            }}
                        >
                            <strong><PushpinOutlined style={{ marginRight: 6 }} />Lưu ý:</strong> Tên người gửi này sẽ xuất hiện trong tất cả
                            email hệ thống gửi đi bao gồm: xác thực tài khoản, khôi phục mật khẩu và
                            xác nhận đơn hàng.
                        </div>
                    </SectionBox>

                    <SaveButton onClick={onSaveEmail} disabled={saving}>
                        <SaveOutlined />
                        {saving ? 'Đang lưu...' : 'Lưu cài đặt email'}
                    </SaveButton>
                </Form>
            ),
        },
        {
            key: 'seo',
            label: (
                <span>
                    <GlobalOutlined /> SEO
                </span>
            ),
            children: (
                <Form form={seoForm} layout="vertical" requiredMark={false}>
                    <SectionBox>
                        <SectionLabel>Cài đặt SEO trang web</SectionLabel>

                        <Form.Item
                            name="metaTitle"
                            label="Meta Title"
                            help="Tiêu đề hiển thị trên tab trình duyệt và kết quả tìm kiếm Google (khuyến nghị dưới 60 ký tự)"
                            rules={[{ required: true, message: 'Vui lòng nhập Meta Title' }]}
                        >
                            <Input
                                placeholder="FitnFood – Thực phẩm lành mạnh cho cuộc sống năng động"
                                size="large"
                                showCount
                                maxLength={70}
                            />
                        </Form.Item>

                        <Form.Item
                            name="metaDescription"
                            label="Meta Description"
                            help="Mô tả ngắn xuất hiện dưới tiêu đề trên kết quả tìm kiếm (khuyến nghị 120–160 ký tự)"
                            style={{ marginTop: 16 }}
                        >
                            <TextArea
                                placeholder="FitnFood cung cấp các sản phẩm thực phẩm lành mạnh, giàu dinh dưỡng, phù hợp với lối sống năng động và khoa học."
                                rows={4}
                                showCount
                                maxLength={200}
                            />
                        </Form.Item>
                    </SectionBox>

                    <SaveButton onClick={onSaveSeo} disabled={saving}>
                        <SaveOutlined />
                        {saving ? 'Đang lưu...' : 'Lưu cài đặt SEO'}
                    </SaveButton>
                </Form>
            ),
        },
    ];

    // ─────────────────────────────────────────────────────────────────────────
    //  Render
    // ─────────────────────────────────────────────────────────────────────────
    return (
        <SettingWrapper>
            {/* Header banner */}
            <SettingHeader>
                <HeaderIcon>
                    <SettingOutlined />
                </HeaderIcon>
                <HeaderText>
                    <HeaderTitle>Cài đặt hệ thống</HeaderTitle>
                    <HeaderSubtitle>
                        Quản lý thông tin cửa hàng, thanh toán, email và SEO từ một nơi duy nhất
                    </HeaderSubtitle>
                </HeaderText>
            </SettingHeader>

            {/* Main content */}
            <TabCard>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}>
                        <Spin size="large" tip="Đang tải cài đặt..." />
                    </div>
                ) : (
                    <Tabs items={tabItems} size="large" />
                )}
            </TabCard>
        </SettingWrapper>
    );
};

export default AdminSystemSettingComponent;
