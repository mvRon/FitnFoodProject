import React, { useState, useEffect } from 'react';
import { Form, Input, Button, message as toast, Select } from 'antd';
import { BellOutlined, FireOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import * as NotificationService from '../../services/NotificationService';
import * as ProductService from '../../services/ProductService';
import * as DiscountService from '../../services/DiscountService';
import {
    NotificationGlobalStyle,
    DashboardShell,
    HeaderCard,
    HeaderTitle,
    HeaderDesc,
    FormWrapper,
    SubmitButton
} from './Style';

const AdminNotificationComponent = () => {
    const user = useSelector((state) => state.user);
    const [form] = Form.useForm();
    const [isSending, setIsSending] = useState(false);
    const [products, setProducts] = useState([]);
    const [discounts, setDiscounts] = useState([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [productRes, discountRes] = await Promise.all([
                    ProductService.getAllProduct('', 1, 1000, false),
                    DiscountService.getAllDiscount(100, 1)
                ]);
                setProducts(productRes?.data || []);
                setDiscounts(discountRes?.data || []);
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        };
        fetchData();
    }, []);

    const getToken = () => {
        const raw = localStorage.getItem('access_token');
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return raw; }
    };

    const handleSendFlashSale = async (values) => {
        setIsSending(true);
        try {
            const token = getToken();
            const link = values.productId ? `/productDetail/${values.productId}` : '';
            const res = await NotificationService.broadcastFlashSale({
                title: values.title,
                message: values.message,
                metadata: { link },
            }, token);

            if (res?.status === 'OK') {
                toast.success('Flash Sale đã được gửi đến tất cả người dùng!');
                form.resetFields();
            } else {
                toast.error(res?.message || 'Gửi thất bại!');
            }
        } catch (err) {
            toast.error('Có lỗi xảy ra khi gửi thông báo.');
        } finally {
            setIsSending(false);
        }
    };

    return (
        <DashboardShell className="admin-notification-page">
            <NotificationGlobalStyle />
            <HeaderCard>
                <HeaderTitle>
                    <FireOutlined /> Gửi Flash Sale Realtime
                </HeaderTitle>
                <HeaderDesc>
                    Thông báo sẽ được push ngay lập tức đến tất cả người dùng đang online (kể cả khách vãng lai).
                </HeaderDesc>
            </HeaderCard>

            <FormWrapper>
                <Form
                    className="admin-notification-form"
                    form={form}
                    layout="vertical"
                    onFinish={handleSendFlashSale}
                >
                    <Form.Item
                        name="title"
                        label={<span style={{ fontWeight: 600 }}>Tiêu đề thông báo</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
                    >
                        <Input
                            placeholder="VD: FLASH SALE hôm nay – Giảm đến 50%!"
                            size="large"
                            maxLength={80}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        name="message"
                        label={<span style={{ fontWeight: 600 }}>Nội dung thông báo</span>}
                        rules={[{ required: true, message: 'Vui lòng nhập nội dung!' }]}
                    >
                        <Input.TextArea
                            rows={3}
                            placeholder="VD: Săn ngay ưu đãi hôm nay! Hàng giới hạn, mua ngay trước khi hết."
                            maxLength={200}
                            showCount
                        />
                    </Form.Item>

                    <Form.Item
                        name="productId"
                        label={<span style={{ fontWeight: 600 }}>Sản phẩm Flash Sale (tuỳ chọn)</span>}
                    >
                        <Select
                            showSearch
                            allowClear
                            placeholder="Chọn sản phẩm để điều hướng người dùng"
                            size="large"
                            optionFilterProp="children"
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={products.map(p => ({ value: p._id, label: p.name }))}
                        />
                    </Form.Item>

                    <Form.Item
                        name="discountId"
                        label={<span style={{ fontWeight: 600 }}>Đính kèm Mã Giảm Giá (tuỳ chọn)</span>}
                    >
                        <Select
                            showSearch
                            allowClear
                            placeholder="Chọn mã giảm giá để chèn vào nội dung"
                            size="large"
                            optionFilterProp="children"
                            onChange={(val) => {
                                let currentMessage = form.getFieldValue('message') || '';
                                // Loại bỏ câu chèn cũ nếu đã tồn tại
                                currentMessage = currentMessage.replace(/\n*Nhập mã .*? để được giảm giá!/g, '');

                                if (val) {
                                    const selectedDiscount = discounts.find(d => d._id === val);
                                    if (selectedDiscount) {
                                        const appendText = `\nNhập mã ${selectedDiscount.code} để được giảm giá!`;
                                        form.setFieldsValue({ message: (currentMessage + appendText).trim() });
                                    }
                                } else {
                                    form.setFieldsValue({ message: currentMessage.trim() });
                                }
                            }}
                            filterOption={(input, option) =>
                                (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                            }
                            options={discounts.filter(d => d.isActive).map(d => ({ value: d._id, label: `${d.code} - ${d.name}` }))}
                        />
                    </Form.Item>

                    <Form.Item>
                        <SubmitButton type="submit" disabled={isSending}>
                            <BellOutlined /> {isSending ? 'Đang gửi...' : 'Gửi Thông Báo Bắn Push'}
                        </SubmitButton>
                    </Form.Item>
                </Form>
            </FormWrapper>
        </DashboardShell>
    );
};

export default AdminNotificationComponent;
