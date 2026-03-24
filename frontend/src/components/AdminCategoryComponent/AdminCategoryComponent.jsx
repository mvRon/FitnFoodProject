import React, { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal, Select, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { WrapperHeader } from './Style';
import { CategoryGlobalStyle } from './Style';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/CategoryService';
import TableComponent from '../TableComponent/TableComponent';
import { useSelector } from 'react-redux';

const AdminCategoryComponent = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState('');
    const [nameError, setNameError] = useState('');
    const [isFormValid, setIsFormValid] = useState(true);
    const [form] = Form.useForm();
    const user = useSelector((state) => state?.user);
    // console.log('user', user)

    // Fetch all categories
    const fetchCategories = async () => {
        try {
            const res = await getAllCategories();
            if (res?.data) {
                setCategories(res?.data || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            message.error('Có lỗi xảy ra khi tải danh sách loại sản phẩm');
            setCategories([]); // Set empty array to prevent crash
        }
    };
    useEffect(() => {
        fetchCategories();
    }, []);

    // Hàm kiểm tra cat con có trùng với cat cha hay không
    const validateCategoryName = (name, parentId, excludeId = null) => {
        if (!name || !parentId) return { isValid: true, message: '' };

        const parentCategory = categories.find(cat => cat && cat._id === parentId);
        if (!parentCategory) return { isValid: true, message: '' };

        const isDuplicate = name.toLowerCase().trim() === parentCategory.name.toLowerCase().trim();

        if (isDuplicate) {
            return {
                isValid: false,
                message: `Tên loại sản phẩm không được trùng với tên loại cha "${parentCategory.name}"`
            };
        }

        return { isValid: true, message: '' };
    };

    //Khi người dùng nhấn bất kỳ hàng nào trong bảng sẽ mở Modal để thực hiện chỉnh sửa
    useEffect(() => {
        try {
            if (isModalOpen && rowSelected) {
                const selectedCategory = categories.find(cat => cat && cat._id === rowSelected);
                if (selectedCategory) {
                    form.setFieldsValue({
                        name: selectedCategory.name || '',
                        parent: selectedCategory.parent?._id || selectedCategory.parent || '',
                    });
                }
            }
            if (isModalOpen && !rowSelected) {
                form.resetFields();
            }
        } catch (error) {
            console.error('Error setting form fields:', error);
            form.resetFields();
        }
    }, [isModalOpen, rowSelected, categories, form]);

    // Đóng modal thì reset fields
    const handleCloseModal = () => {
        setIsModalOpen(false);
        setRowSelected('');
        form.resetFields();
        setNameError('');
        setIsFormValid(true);
    };

    // Hàm sắp xếp cha-con
    function buildCategoryTableData(categories) {
        try {
            const result = [];
            categories = categories || [];
            const categoryMap = {};
            categories.forEach(cat => {
                if (cat && cat._id) {
                    categoryMap[cat._id] = cat;
                }
            });
            // Lấy các category cha
            const parents = categories.filter(cat => cat && !cat.parent);
            parents.forEach(parent => {
                if (parent && parent._id) {
                    result.push({ ...parent, key: parent._id });
                    // Lấy các category con của parent này
                    const children = categories.filter(cat => {
                        if (!cat || !cat.parent) return false;
                        return (cat.parent._id || cat.parent) === parent._id;
                    });
                    children.forEach(child => {
                        if (child && child._id) {
                            result.push({ ...child, key: child._id, isChild: true });
                        }
                    });
                }
            });
            return result;
        } catch (error) {
            console.error('Error building category table data:', error);
            return [];
        }
    }


    // Table columns
    const rowClassName = (record) => !record.parent ? 'category-parent-row' : '';
    const columns = [
        {
            title: 'Tên loại sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span style={
                    record.isChild
                        ? { paddingLeft: 32, color: '#0284C7', fontWeight: 600 }
                        : { color: '#F59E0B', fontWeight: 'bold' }
                }>
                    {!record.parent && <span style={{ marginRight: 6 }}>★</span>}
                    {text}
                    {/* {!record.parent && <span className="category-parent-tag">CHA</span>} */}
                </span>
            ),
        },
        {
            title: 'Thuộc loại',
            dataIndex: 'parent',
            key: 'parent',
            render: (parent) =>
                parent && parent.name
                    ? <Tag style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0369A1', borderColor: 'rgba(2, 132, 199, 0.3)', borderRadius: 999 }}>{parent.name}</Tag>
                    : <Tag style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#B45309', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: 999 }}>Gốc</Tag>
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (text, record) => (
                <Space>
                    <Button className="admin-category-action-btn" icon={<EditOutlined />} onClick={e => { e.stopPropagation(); handleEditCategory(record); }} />
                    <Button className="admin-category-action-btn admin-category-action-btn-danger" icon={<DeleteOutlined />} danger onClick={e => { e.stopPropagation(); handleDeleteCategory(record, JSON.parse(user?.access_token)); }} />
                </Space>
            ),
        },
    ];

    // Data for table
    const dataTable = buildCategoryTableData(categories);


    // Add, edit, delete handlers
    const handleAddCategory = async (values) => {
        const { name, parent } = values;

        // Validate trước khi gọi API
        const validation = validateCategoryName(name, parent);
        if (!validation.isValid) {
            setNameError(validation.message);
            setIsFormValid(false);
            message.error(validation.message);
            return;
        }

        try {
            const res = await createCategory(values, JSON.parse(user?.access_token));
            if (res?.data) {
                if (res?.status === 'OK') {
                    fetchCategories();
                    handleCloseModal();
                    message.success(res?.message)
                } else {
                    message.error(res?.message || 'Có lỗi xảy ra khi thêm loại sản phẩm')
                }
            } else {
                message.error("Lỗi hệ thống!")
            }
        } catch (error) {
            console.error('Error adding category:', error);
            if (error?.response?.status === 400) {
                message.error(error?.response?.data?.message || 'Dữ liệu không hợp lệ');
            } else {
                message.error('Có lỗi xảy ra khi thêm loại sản phẩm');
            }
        }
    };
    const handleEditCategory = (record) => {
        setIsModalOpen(true);
        setRowSelected(record._id);
        form.setFieldsValue({
            name: record.name,
            parent: record.parent?._id || '',
        });
    };
    const handleUpdateCategory = async (values) => {
        const { name, parent } = values;

        // Validate trước khi gọi API (exclude current category)
        const validation = validateCategoryName(name, parent, rowSelected);
        if (!validation.isValid) {
            setNameError(validation.message);
            setIsFormValid(false);
            message.error(validation.message);
            return;
        }

        try {
            const res = await updateCategory(rowSelected, values, JSON.parse(user?.access_token));
            if (res?.data) {
                if (res?.status === 'OK') {
                    fetchCategories();
                    handleCloseModal();
                    message.success(res?.message)
                }
                else {
                    message.error(res?.data?.message || 'Có lỗi xảy ra khi cập nhật loại sản phẩm')
                }
            } else {
                message.error("Lỗi hệ thống!")
            }
        } catch (error) {
            console.error('Error updating category:', error);
            if (error?.response?.status === 400) {
                message.error(error?.response?.data?.message || 'Dữ liệu không hợp lệ');
            } else {
                message.error('Có lỗi xảy ra khi cập nhật loại sản phẩm');
            }
        }
    };
    const handleDeleteCategory = (record, token) => {
        Modal.confirm({
            title: `Bạn có chắc muốn xóa loại sản phẩm  ${record.name} này không?`,
            onOk: async () => {
                try {
                    const res = await deleteCategory(record._id, token);
                    if (res?.data) {
                        if (res?.status === 'OK') {
                            fetchCategories();
                            message.success(res?.message)
                        } else {
                            message.error(res?.message || 'Có lỗi xảy ra khi xóa loại sản phẩm')
                        }
                    } else {
                        message.error(res?.message || 'Lỗi hệ thống!')
                    }
                } catch (error) {
                    console.error('Error deleting category:', error);
                    if (error?.response?.status === 400) {
                        message.error(error?.response?.data?.message || 'Không thể xóa loại sản phẩm này');
                    } else {
                        message.error('Có lỗi xảy ra khi xóa loại sản phẩm');
                    }
                }
            },
        });
    };


    return (
        <div className="admin-category-page">
            <CategoryGlobalStyle />
            <WrapperHeader>Quản lý loại sản phẩm</WrapperHeader>
            <div className="admin-category-toolbar" style={{ marginTop: '10px' }}>
                <Button className="admin-category-add-btn" onClick={() => { setIsModalOpen(true); form.resetFields(); setRowSelected(''); setNameError(''); setIsFormValid(true); }} style={{ height: '50px', borderRadius: '6px', borderStyle: 'dashed' }}>
                    <PlusOutlined style={{ fontSize: '20px' }} /> Thêm loại sản phẩm
                </Button>
            </div>
            <div className="admin-category-table-wrap" style={{ marginTop: '20px' }}>
                <TableComponent
                    forceRender
                    columns={columns}
                    data={dataTable}
                    rowClassName={rowClassName}
                    onRow={(record) => ({
                        onClick: () => {
                            setRowSelected(record._id);
                            setIsModalOpen(true);
                        },
                    })}
                />
            </div>
            <Modal
                title={rowSelected ? 'Chỉnh sửa loại sản phẩm' : 'Thêm loại sản phẩm'}
                open={isModalOpen}
                onCancel={handleCloseModal}
                footer={null}
                forceRender
                className="admin-category-modal"
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={rowSelected ? handleUpdateCategory : handleAddCategory}
                    onValuesChange={(changedValues, allValues) => {
                        // Khi form nhận cat con đã thay đổi thì reset validate
                        if (!nameError) {
                            setIsFormValid(true);
                        }
                    }}
                >
                    <Form.Item
                        label="Tên loại sản phẩm"
                        name="name"
                        validateStatus={nameError ? 'error' : ''}
                        help={nameError}
                        rules={[
                            { required: true, message: 'Vui lòng nhập tên loại sản phẩm!' },
                            {
                                validator: async (_, value) => {
                                    const parent = form.getFieldValue('parent');
                                    const validation = validateCategoryName(value, parent, rowSelected);
                                    if (!validation.isValid) {
                                        setNameError(validation.message);
                                        setIsFormValid(false);
                                        throw new Error(validation.message);
                                    } else {
                                        setNameError('');
                                        setIsFormValid(true);
                                    }
                                }
                            }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Thuộc loại (nếu là loại con)"
                        name="parent"
                    >
                        <Select
                            allowClear
                            options={categories.filter(cat => cat && !cat.parent).map(cat => ({
                                value: cat._id,
                                label: cat.name || 'Unnamed Category'
                            }))}
                        />
                    </Form.Item>
                    <Form.Item>
                        <Button
                            className="admin-category-submit-btn"
                            type="primary"
                            htmlType="submit"
                            disabled={!isFormValid}
                        >
                            {rowSelected ? 'Cập nhật' : 'Thêm mới'}
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
            <style>{`
                .admin-category-page {
                    --admin-emerald: #10B981;
                    --admin-blue: #0284C7;
                    --admin-orange: #F59E0B;
                    --admin-bg: #F8FAFC;
                    --admin-text: #1E293B;
                    color: var(--admin-text);
                    padding: 18px;
                }
                .admin-category-page .admin-category-toolbar {
                    display: flex;
                    justify-content: flex-end;
                }
                .admin-category-page .admin-category-add-btn {
                    border-color: rgba(16, 185, 129, 0.5) !important;
                    color: #0F766E !important;
                    background: linear-gradient(140deg, rgba(16, 185, 129, 0.18), rgba(2, 132, 199, 0.08));
                    font-weight: 600;
                    transition: all 0.25s ease;
                }
                .admin-category-page .admin-category-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 18px rgba(2, 132, 199, 0.16);
                }
                .admin-category-page .admin-category-table-wrap {
                    border: 1px solid rgba(2, 132, 199, 0.16);
                    border-radius: 16px;
                    padding: 12px;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
                    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
                    animation: adminCategoryFadeIn 0.35s ease;
                }
                .admin-category-page .admin-category-table-wrap .ant-table-wrapper {
                    overflow: auto;
                    border-radius: 12px;
                }
                .admin-category-page .admin-category-table-wrap .ant-table-thead > tr > th {
                    color: #0369A1;
                    background: rgba(2, 132, 199, 0.08);
                    font-weight: 700;
                }
                .admin-category-page .admin-category-action-btn {
                    border-color: rgba(2, 132, 199, 0.28);
                    color: #0369A1;
                }
                .admin-category-page .admin-category-action-btn:hover {
                    border-color: rgba(2, 132, 199, 0.5) !important;
                    color: #0C4A6E !important;
                }
                .admin-category-page .admin-category-action-btn-danger {
                    border-color: rgba(245, 158, 11, 0.5) !important;
                    color: #B45309 !important;
                }
                .admin-category-page .admin-category-action-btn-danger:hover {
                    border-color: #F59E0B !important;
                    color: #92400E !important;
                }
                .admin-category-page .admin-category-submit-btn {
                    background: linear-gradient(135deg, #10B981, #0284C7) !important;
                    border: none !important;
                    box-shadow: 0 12px 22px rgba(16, 185, 129, 0.24);
                }
                .admin-category-modal .ant-modal-content {
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid rgba(16, 185, 129, 0.18);
                }
                .admin-category-modal .ant-modal-header {
                    background: linear-gradient(130deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.12));
                    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
                }
                @keyframes adminCategoryFadeIn {
                    from {
                        opacity: 0;
                        transform: translateY(8px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @media (max-width: 768px) {
                    .admin-category-page {
                        padding: 10px;
                    }
                    .admin-category-page .admin-category-toolbar {
                        justify-content: stretch;
                    }
                    .admin-category-page .admin-category-add-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    );
};

export default AdminCategoryComponent;