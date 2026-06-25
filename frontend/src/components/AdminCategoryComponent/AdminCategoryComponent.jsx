import React, { useEffect, useState, useMemo } from 'react';
import { Button, Form, Input, message, Modal, Select, Space, Tag } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, SearchOutlined, TagsOutlined, ReloadOutlined } from '@ant-design/icons';
import {
    CategoryGlobalStyle,
    AdminCategoryPageGlobalStyle,
    DashboardShell,
    HeaderCard,
    HeaderTitle,
    HeaderDesc,
    StatsGrid,
    StatCard,
    StatLabel,
    StatValue,
    FilterBar
} from './Style';
import { getAllCategories, createCategory, updateCategory, deleteCategory } from '../../services/CategoryService';
import TableComponent from '../TableComponent/TableComponent';
import { useSelector } from 'react-redux';

const AdminCategoryComponent = () => {
    const [categories, setCategories] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState('');
    const [searchKeyword, setSearchKeyword] = useState('');
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

    const getParentCategoryName = (parent) => {
        if (!parent) return null;

        if (typeof parent === 'object') {
            if (parent.name) return parent.name;
            if (parent._id) {
                const foundParent = categories.find(cat => cat && cat._id === parent._id);
                return foundParent?.name || null;
            }
            return null;
        }

        const foundParent = categories.find(cat => cat && cat._id === parent);
        return foundParent?.name || null;
    };

    const columns = [
        {
            title: 'Tên loại sản phẩm',
            dataIndex: 'name',
            key: 'name',
            render: (text, record) => (
                <span className={record.isChild ? 'admin-category-name-child' : 'admin-category-name-parent'}>
                    {!record.parent && <span className="admin-category-star">★</span>}
                    {text}
                    {/* {!record.parent && <span className="category-parent-tag">CHA</span>} */}
                </span>
            ),
        },
        {
            title: 'Thuộc loại',
            dataIndex: 'parent',
            key: 'parent',
            render: (parent) => {
                const parentName = getParentCategoryName(parent);
                return parentName
                    ? <Tag className="admin-category-parent-tag">{parentName}</Tag>
                    : <Tag className="admin-category-root-tag">Gốc</Tag>
            }
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
    const rawDataTable = buildCategoryTableData(categories);
    const dataTable = rawDataTable.filter(item => {
        if (!searchKeyword) return true;
        return item?.name?.toLowerCase().includes(searchKeyword.toLowerCase());
    });


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
            className: 'admin-category-modal',
            title: `Bạn có chắc muốn xóa loại sản phẩm  ${record.name} này không?`,
            okText: 'Xóa',
            cancelText: 'Hủy',
            okButtonProps: {
                className: 'admin-common-modal-ok'
            },
            cancelButtonProps: {
                className: 'admin-common-modal-cancel'
            },
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


    const stats = useMemo(() => {
        const total = categories?.length || 0;
        const parents = categories?.filter(c => !c.parent).length || 0;
        const children = categories?.filter(c => c.parent).length || 0;
        return { total, parents, children };
    }, [categories]);

    return (
        <>
            <CategoryGlobalStyle />
            <AdminCategoryPageGlobalStyle />
            <DashboardShell className="admin-category-page">
                <HeaderCard>
                    <HeaderTitle>
                        <TagsOutlined /> Quản lý loại sản phẩm
                    </HeaderTitle>
                    <HeaderDesc>
                        Thiết lập danh mục gốc và danh mục con giúp tổ chức sản phẩm một cách logic.
                    </HeaderDesc>

                    <StatsGrid>
                        <StatCard>
                            <StatLabel>Tổng loại sản phẩm</StatLabel>
                            <StatValue>{stats.total}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Danh mục gốc</StatLabel>
                            <StatValue>{stats.parents}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Danh mục con</StatLabel>
                            <StatValue>{stats.children}</StatValue>
                        </StatCard>
                    </StatsGrid>
                </HeaderCard>

                <FilterBar>
                    <Input
                        placeholder="Tìm kiếm loại sản phẩm..."
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="admin-category-search-input"
                        allowClear
                    />
                    <Space wrap>
                        <Button className="admin-category-add-btn" onClick={() => { setIsModalOpen(true); form.resetFields(); setRowSelected(''); setNameError(''); setIsFormValid(true); }}>
                            <PlusOutlined style={{ fontSize: '20px' }} /> Thêm loại sản phẩm
                        </Button>
                        <Button
                            className="admin-category-refresh-btn"
                            icon={<ReloadOutlined />}
                            onClick={() => fetchCategories()}
                        >
                            Làm mới
                        </Button>
                    </Space>
                </FilterBar>

                <div className="admin-category-table-wrap">
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
            </DashboardShell>
        </>
    );
};

export default AdminCategoryComponent;