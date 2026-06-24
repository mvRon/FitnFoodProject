// frontend/src/components/AdminDiscountComponent/AdminDiscountComponent.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Form, Input, Select, DatePicker, Table, Space, Popconfirm, message, InputNumber } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, ReloadOutlined, PercentageOutlined } from '@ant-design/icons';
import {
    AdminDiscountGlobalStyle,
    DashboardShell,
    HeaderCard,
    HeaderTitle,
    HeaderDesc,
    StatsGrid,
    StatCard,
    StatLabel,
    StatValue,
    FilterBar
} from './Style'; // Import styles

import useMutationHook from '../../hooks/useMutationHook';
import * as DiscountService from '../../services/DiscountService.js'; // Sẽ tạo service này sau
import { useQuery } from '@tanstack/react-query';
import Loading from '../LoadingComponent/LoadingComponent';
import ModalComponent from '../ModalComponent/ModalComponent';
import { useSelector } from 'react-redux'; // Để lấy access_token

import { getBase64 } from '../../utils'; // Giả sử bạn có hàm này để convert image sang base64
import moment from 'moment'; // Để xử lý DatePicker

const { Option } = Select;

const AdminDiscountComponent = () => {
    const [rowSelected, setRowSelected] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalOpenEdit, setIsModalOpenEdit] = useState(false);
    const [searchKeyword, setSearchKeyword] = useState('');

    const user = useSelector((state) => state.user);

    const [form] = Form.useForm();       // Form thêm
    const [formEdit] = Form.useForm();   // Form sửa

    // -------- Pagination state ----------
    const [page, setPage] = useState(0);       // backend dùng page từ 0
    const [limit, setLimit] = useState(10);

    // -------- CREATE ----------
    const mutation = useMutationHook(
        (data) => DiscountService.createDiscount(data, JSON.parse(user?.access_token))
    );
    const { data, isLoading, isSuccess, isError } = mutation;

    useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            message.success('Tạo mã giảm giá thành công!');
            setIsModalOpen(false);
            form.resetFields();
            queryDiscount.refetch();
        } else if (data?.status === 'ERR') {
            message.error(data?.message || 'Tạo mã giảm giá thất bại.');
        }
    }, [isSuccess, isError, data]);

    // -------- UPDATE ----------
    const mutationUpdate = useMutationHook(
        (payload) => DiscountService.updateDiscount(rowSelected, payload, JSON.parse(user?.access_token))
    );
    const { data: dataUpdate, isLoading: isLoadingUpdate, isSuccess: isSuccessUpdate, isError: isErrorUpdate } = mutationUpdate;

    useEffect(() => {
        if (isSuccessUpdate && dataUpdate?.status === 'OK') {
            message.success('Cập nhật mã giảm giá thành công!');
            setIsModalOpenEdit(false);
            formEdit.resetFields();
            queryDiscount.refetch();
        } else if (dataUpdate?.status === 'ERR') {
            message.error(dataUpdate?.message || 'Cập nhật mã giảm giá thất bại.');
        }
    }, [isSuccessUpdate, isErrorUpdate, dataUpdate]);

    // -------- DELETE ----------
    const mutationDelete = useMutationHook(
        (id) => DiscountService.deleteDiscount(id, JSON.parse(user?.access_token))
    );
    const { data: dataDelete, isLoading: isLoadingDelete, isSuccess: isSuccessDelete, isError: isErrorDelete } = mutationDelete;

    useEffect(() => {
        if (isSuccessDelete && dataDelete?.status === 'OK') {
            message.success('Xóa mã giảm giá thành công!');
            setIsModalOpenDelete(false);
            queryDiscount.refetch();
        } else if (dataDelete?.status === 'ERR') {
            message.error(dataDelete?.message || 'Xóa mã giảm giá thất bại.');
        }
    }, [isSuccessDelete, isErrorDelete, dataDelete]);

    // -------- QUERY LIST ----------
    const fetchAllDiscount = async (context) => {
        const qLimit = context?.queryKey?.[1];
        const qPage = context?.queryKey?.[2];
        const res = await DiscountService.getAllDiscount(qLimit, qPage);
        return res;
    };
    const queryDiscount = useQuery({ queryKey: ['discounts', limit, page], queryFn: fetchAllDiscount });
    const { isLoading: isLoadingDiscounts, data: discounts } = queryDiscount;

    // -------- Handlers --------
    const handleAddDiscount = () => {
        setIsModalOpen(true);
        form.resetFields();
        // set default values
        form.setFieldsValue({
            type: 'percent',
            value: 0,
            minValue: 0,
            maxUses: 1,
            isActive: true,
            startDate: null,
            endDate: null,
        });
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleCancelEdit = () => {
        setIsModalOpenEdit(false);
        formEdit.resetFields();
    };

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false);
    };


    // onFinishAdd
    const onFinishAdd = (values) => {
        const payload = {
            ...values,
            value: Number(values.value ?? 0),
            minValue: Number(values.minValue ?? 0),
            maxUses: Number(values.maxUses ?? 1),
            startDate: values.startDate ? values.startDate.format('YYYY-MM-DD HH:mm:ss') : null,
            endDate: values.endDate ? values.endDate.format('YYYY-MM-DD HH:mm:ss') : null,
        };
        mutation.mutate(payload);
    };

    // onFinishEdit tương tự
    const onFinishEdit = (values) => {
        const payload = {
            ...values,
            value: Number(values.value ?? 0),
            minValue: Number(values.minValue ?? 0),
            maxUses: Number(values.maxUses ?? 1),
            startDate: values.startDate ? values.startDate.format('YYYY-MM-DD HH:mm:ss') : null,
            endDate: values.endDate ? values.endDate.format('YYYY-MM-DD HH:mm:ss') : null,
        };
        delete payload.usesLeft;
        mutationUpdate.mutate(payload);
    };





    const handleDeleteDiscount = () => {
        mutationDelete.mutate(rowSelected);
    };

    // Mở modal SỬA
    const handleEditDiscount = async (id) => {
        setRowSelected(id);
        setIsModalOpenEdit(true);
        formEdit.resetFields();
        const response = await DiscountService.getDetailDiscount(id);
        if (response?.status === 'OK') {
            const d = response.data;
            formEdit.setFieldsValue({
                name: d.name,
                code: d.code,
                type: d.type, // 'percent' | 'fixed'
                value: Number(d.value ?? 0),
                minValue: Number(d.minValue ?? 0),
                maxUses: Number(d.maxUses ?? 1),
                startDate: d.startDate ? moment(d.startDate) : null,
                endDate: d.endDate ? moment(d.endDate) : null,
                isActive: d.isActive,
                usesLeft: Number(d.usesLeft ?? 0),
            });
        } else if (response?.status === 'ERR') {
            message.error(response?.message || 'Không tìm thấy mã giảm giá!');
        }
    };

    const renderAction = (record) => {
        return (
            <Space size="middle">
                <Button className="admin-discount-action-btn" icon={<EditOutlined />} onClick={() => handleEditDiscount(record._id)} />
                <Popconfirm
                    title="Xác nhận xóa"
                    description="Bạn có chắc chắn muốn xóa mã giảm giá này?"
                    onConfirm={() => {
                        setRowSelected(record._id);
                        setIsModalOpenDelete(true);
                    }}
                    okText="Có"
                    cancelText="Không"
                >
                    <Button className="admin-discount-action-btn admin-discount-action-btn-danger" icon={<DeleteOutlined />} />
                </Popconfirm>
            </Space>
        );
    };

    const columns = [
        {
            title: 'Tên mã',
            dataIndex: 'name',
            sorter: (a, b) => (a?.name || '').length - (b?.name || '').length,
        },
        {
            title: 'Mã Code',
            dataIndex: 'code',
            sorter: (a, b) => (a?.code || '').length - (b?.code || '').length,
        },
        {
            title: 'Loại',
            dataIndex: 'type',
            render: (text) => (text === 'percent' ? 'Phần trăm' : 'Cố định'),
        },
        {
            title: 'Giá trị',
            dataIndex: 'value',
            sorter: (a, b) => (a?.value || 0) - (b?.value || 0),
            render: (text, record) =>
                record.type === 'percent' ? `${text}%` : `${Number(text ?? 0).toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Tối thiểu',
            dataIndex: 'minValue',
            sorter: (a, b) => (a?.minValue || 0) - (b?.minValue || 0),
            render: (text) => `${Number(text ?? 0).toLocaleString('vi-VN')} VNĐ`,
        },
        {
            title: 'Lượt dùng tối đa',
            dataIndex: 'maxUses',
            sorter: (a, b) => (a?.maxUses || 0) - (b?.maxUses || 0),
        },
        {
            title: 'Còn lại',
            dataIndex: 'usesLeft',
            sorter: (a, b) => (a?.usesLeft || 0) - (b?.usesLeft || 0),
        },
        {
            title: 'Bắt đầu',
            dataIndex: 'startDate',
            render: (text) => (text ? moment(text).format('DD/MM/YYYY HH:mm') : ''),
        },
        {
            title: 'Kết thúc',
            dataIndex: 'endDate',
            render: (text) => (text ? moment(text).format('DD/MM/YYYY HH:mm') : ''),
        },
        {
            title: 'Trạng thái',
            dataIndex: 'isActive',
            render: (text) => (text ? 'Hoạt động' : 'Không hoạt động'),
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: (text, record) => renderAction(record),
        },
    ];

    const stats = useMemo(() => {
        const total = discounts?.data?.length || 0;
        const active = discounts?.data?.filter(d => d.isActive).length || 0;
        const inactive = total - active;
        return { total, active, inactive };
    }, [discounts?.data]);

    const rawDataTable = discounts?.data || [];
    const dataTable = rawDataTable
        .filter(item => {
            if (!searchKeyword) return true;
            return item?.name?.toLowerCase().includes(searchKeyword.toLowerCase()) || item?.code?.toLowerCase().includes(searchKeyword.toLowerCase());
        })
        .map((discount) => ({ ...discount, key: discount._id }));

    return (
        <>
            <AdminDiscountGlobalStyle />
            <DashboardShell className="admin-discount-page">
                <HeaderCard>
                    <HeaderTitle>
                        <PercentageOutlined /> Quản lý Mã giảm giá
                    </HeaderTitle>
                    <HeaderDesc>
                        Tạo và quản lý các chương trình khuyến mãi, mã giảm giá để thu hút khách hàng.
                    </HeaderDesc>

                    <StatsGrid>
                        <StatCard>
                            <StatLabel>Tổng mã giảm giá</StatLabel>
                            <StatValue>{stats.total}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Đang hoạt động</StatLabel>
                            <StatValue>{stats.active}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Ngừng hoạt động</StatLabel>
                            <StatValue>{stats.inactive}</StatValue>
                        </StatCard>
                    </StatsGrid>
                </HeaderCard>

                <FilterBar>
                    <Input
                        placeholder="Tìm theo tên mã, code..."
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="admin-discount-search-input"
                        allowClear
                    />
                    <Space wrap>
                        <Button className="admin-discount-add-btn" onClick={handleAddDiscount} style={{ height: 38 }}>
                            <PlusOutlined /> Thêm mã giảm giá
                        </Button>
                        <Button
                            className="admin-discount-refresh-btn"
                            icon={<ReloadOutlined />}
                            onClick={() => queryDiscount.refetch()}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </FilterBar>

                <div className="admin-discount-table-wrap">
                <Table
                    loading={isLoadingDiscounts}
                    columns={columns}
                    dataSource={dataTable}
                    pagination={{
                        pageSize: limit,
                        total: discounts?.total || 0,
                        current: (discounts?.currentPage || 1),
                        onChange: (p, ps) => {
                            // backend page từ 0, UI từ 1
                            setPage(p - 1);
                            setLimit(ps);
                        },
                    }}
                />
            </div>

            {/* Modal thêm mã giảm giá */}
            <ModalComponent
                forceRender
                title={<div className="admin-discount-modal-title">Thêm mã giảm giá</div>}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                className="admin-discount-modal"
            >
                <Form
                    className="admin-discount-form"
                    form={form}
                    name="basic"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    onFinish={onFinishAdd}
                    autoComplete="off"
                    preserve={false}
                >
                    <Form.Item
                        label="Tên mã"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên mã giảm giá!' }]}
                    >
                        <Input placeholder="Tên mã" />
                    </Form.Item>

                    <Form.Item
                        label="Mã Code"
                        name="code"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã code!' },
                            { pattern: /^[A-Z0-9]+$/, message: 'Mã code chỉ chứa chữ cái in hoa và số!' },
                        ]}
                    >
                        <Input placeholder="VD: SAVE10" />
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="type"
                        rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
                    >
                        <Select>
                            <Option value="percent">Phần trăm (%)</Option>
                            <Option value="fixed">Cố định (VNĐ)</Option>
                        </Select>
                    </Form.Item>

                    {/* Giá trị phụ thuộc vào type */}
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                        {({ getFieldValue }) => {
                            const isPercent = getFieldValue('type') === 'percent';
                            return (
                                <Form.Item
                                    label="Giá trị"
                                    name="value"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá trị giảm!' },
                                        {
                                            validator: (_, v) => {
                                                if (v === null || v === undefined || v === '') {
                                                    return Promise.reject('Vui lòng nhập giá trị giảm!');
                                                }
                                                if (typeof v !== 'number' || Number.isNaN(v)) {
                                                    return Promise.reject('Giá trị phải là số!');
                                                }
                                                if (isPercent) {
                                                    if (v < 0 || v > 100) return Promise.reject('Phần trăm phải từ 0 đến 100!');
                                                } else {
                                                    if (v < 0) return Promise.reject('Giá trị cố định phải dương!');
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <InputNumber style={{ width: '100%' }} min={0} max={isPercent ? 100 : undefined} />
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item
                        label="Tối thiểu"
                        name="minValue"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá trị tối thiểu!' },
                            {
                                validator: (_, v) => {
                                    if (v === null || v === undefined || v === '') {
                                        return Promise.reject('Vui lòng nhập giá trị tối thiểu!');
                                    }
                                    if (typeof v !== 'number' || Number.isNaN(v)) {
                                        return Promise.reject('Giá trị phải là số!');
                                    }
                                    if (v < 0) return Promise.reject('Giá trị tối thiểu không âm!');
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        label="Lượt dùng tối đa"
                        name="maxUses"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượt dùng tối đa!' },
                            {
                                validator: (_, v) => {
                                    if (v === null || v === undefined || v === '') {
                                        return Promise.reject('Vui lòng nhập số lượt dùng tối đa!');
                                    }
                                    if (typeof v !== 'number' || Number.isNaN(v)) {
                                        return Promise.reject('Số lượt phải là số!');
                                    }
                                    if (v < 1) return Promise.reject('Số lượt phải lớn hơn 0!');
                                    if (!Number.isInteger(v)) return Promise.reject('Số lượt phải là số nguyên!');
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                    </Form.Item>

                    <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Ngày kết thúc"
                        name="endDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button className="admin-discount-submit-btn" type="primary" htmlType="submit" loading={isLoading}>
                            Thêm mới
                        </Button>
                    </Form.Item>
                </Form>
            </ModalComponent>

            {/* Modal chỉnh sửa mã giảm giá */}
            <ModalComponent
                forceRender
                title={<div className="admin-discount-modal-title">Chỉnh sửa mã giảm giá</div>}
                open={isModalOpenEdit}
                onCancel={handleCancelEdit}
                footer={null}
                className="admin-discount-modal"
            >
                <Form
                    className="admin-discount-form"
                    form={formEdit}
                    name="formEdit"
                    labelCol={{ span: 6 }}
                    wrapperCol={{ span: 18 }}
                    onFinish={onFinishEdit}
                    autoComplete="off"
                    preserve={false}
                >
                    <Form.Item
                        label="Tên mã"
                        name="name"
                        rules={[{ required: true, message: 'Vui lòng nhập tên mã giảm giá!' }]}
                    >
                        <Input placeholder="Tên mã" />
                    </Form.Item>

                    <Form.Item
                        label="Mã Code"
                        name="code"
                        rules={[
                            { required: true, message: 'Vui lòng nhập mã code!' },
                            { pattern: /^[A-Z0-9]+$/, message: 'Mã code chỉ chứa chữ cái in hoa và số!' },
                        ]}
                    >
                        <Input placeholder="VD: SAVE10" />
                    </Form.Item>

                    <Form.Item
                        label="Loại"
                        name="type"
                        rules={[{ required: true, message: 'Vui lòng chọn loại giảm giá!' }]}
                    >
                        <Select>
                            <Option value="percent">Phần trăm (%)</Option>
                            <Option value="fixed">Cố định (VNĐ)</Option>
                        </Select>
                    </Form.Item>

                    {/* Giá trị phụ thuộc vào type */}
                    <Form.Item noStyle shouldUpdate={(prev, cur) => prev.type !== cur.type}>
                        {({ getFieldValue }) => {
                            const isPercent = getFieldValue('type') === 'percent';
                            return (
                                <Form.Item
                                    label="Giá trị"
                                    name="value"
                                    rules={[
                                        { required: true, message: 'Vui lòng nhập giá trị giảm!' },
                                        {
                                            validator: (_, v) => {
                                                if (v === null || v === undefined || v === '') {
                                                    return Promise.reject('Vui lòng nhập giá trị giảm!');
                                                }
                                                if (typeof v !== 'number' || Number.isNaN(v)) {
                                                    return Promise.reject('Giá trị phải là số!');
                                                }
                                                if (isPercent) {
                                                    if (v < 0 || v > 100) return Promise.reject('Phần trăm phải từ 0 đến 100!');
                                                } else {
                                                    if (v < 0) return Promise.reject('Giá trị cố định phải dương!');
                                                }
                                                return Promise.resolve();
                                            },
                                        },
                                    ]}
                                >
                                    <InputNumber style={{ width: '100%' }} min={0} max={isPercent ? 100 : undefined} />
                                </Form.Item>
                            );
                        }}
                    </Form.Item>

                    <Form.Item
                        label="Tối thiểu"
                        name="minValue"
                        rules={[
                            { required: true, message: 'Vui lòng nhập giá trị tối thiểu!' },
                            {
                                validator: (_, v) => {
                                    if (v === null || v === undefined || v === '') {
                                        return Promise.reject('Vui lòng nhập giá trị tối thiểu!');
                                    }
                                    if (typeof v !== 'number' || Number.isNaN(v)) {
                                        return Promise.reject('Giá trị phải là số!');
                                    }
                                    if (v < 0) return Promise.reject('Giá trị tối thiểu không âm!');
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>

                    <Form.Item
                        label="Lượt dùng tối đa"
                        name="maxUses"
                        rules={[
                            { required: true, message: 'Vui lòng nhập số lượt dùng tối đa!' },
                            {
                                validator: (_, v) => {
                                    if (v === null || v === undefined || v === '') {
                                        return Promise.reject('Vui lòng nhập số lượt dùng tối đa!');
                                    }
                                    if (typeof v !== 'number' || Number.isNaN(v)) {
                                        return Promise.reject('Số lượt phải là số!');
                                    }
                                    if (v < 1) return Promise.reject('Số lượt phải lớn hơn 0!');
                                    if (!Number.isInteger(v)) return Promise.reject('Số lượt phải là số nguyên!');
                                    return Promise.resolve();
                                },
                            },
                        ]}
                    >
                        <InputNumber style={{ width: '100%' }} min={1} precision={0} />
                    </Form.Item>

                    <Form.Item
                        label="Ngày bắt đầu"
                        name="startDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày bắt đầu!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        label="Ngày kết thúc"
                        name="endDate"
                        rules={[{ required: true, message: 'Vui lòng chọn ngày kết thúc!' }]}
                    >
                        <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" style={{ width: '100%' }} />
                    </Form.Item>

                    {/* usesLeft hiển thị, không cho sửa */}
                    <Form.Item label="Còn lại" name="usesLeft">
                        <InputNumber style={{ width: '100%' }} disabled />
                    </Form.Item>

                    <Form.Item wrapperCol={{ offset: 6, span: 18 }}>
                        <Button className="admin-discount-submit-btn" type="primary" htmlType="submit" loading={isLoadingUpdate}>
                            Cập nhật
                        </Button>
                    </Form.Item>
                </Form>
            </ModalComponent>

            {/* Modal xác nhận xóa */}
            <ModalComponent
                title={<div className="admin-discount-modal-title">Xóa mã giảm giá</div>}
                open={isModalOpenDelete}
                onCancel={handleCancelDelete}
                onOk={handleDeleteDiscount}
                confirmLoading={isLoadingDelete}
                className="admin-discount-modal"
            >
                <div className="admin-discount-delete-content">Bạn có chắc chắn muốn xóa mã giảm giá này không?</div>
            </ModalComponent>
            </DashboardShell>
        </>
    );
};

export default AdminDiscountComponent;