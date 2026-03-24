import React, { useEffect, useRef, useState } from 'react'
import { Button, Checkbox, Form, Input, message, Modal, Select, Space, Tag, InputNumber } from 'antd'
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, UploadOutlined } from '@ant-design/icons'
import TableComponent from '../TableComponent/TableComponent'
// import InputComponent from '../InputComponent/InputComponent'
import { getBase64, renderOption } from '../../utils'
import { WrapperHeader, WrapperUploadFile } from './Style'
import * as ProductService from '../../services/ProductService'
import { useMutationHook } from '../../hooks/useMutationHook'
// import * as message from '../../components/MessageComponent/MessageComponent'
import LoadingComponent from '../LoadingComponent/LoadingComponent'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import DrawerComponent from '../DrawerComponent/DrawerComponent'
import { useSelector } from 'react-redux'
import ModalComponent from '../ModalComponent/ModalComponent'
import { useDebounce } from '../../hooks/useDebounce'
import { getAllCategories } from '../../services/CategoryService'

const AdminProductComponent = () => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [rowSelected, setRowSelected] = useState('')
    const [isloading, setIsLoading] = useState(false)
    const [isOpenDrawer, setIsOpenDrawer] = useState(false)
    const [isPendingUpdate, setIsPendingUpdate] = useState(false)
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false)
    const user = useSelector((state) => state?.user)
    const [searchText, setSearchText] = useState('');
    const [searchedColumn, setSearchedColumn] = useState('');
    const searchInput = useRef(null);
    const [typeSelect, setTypeSelect] = useState('')
    let storageData = localStorage.getItem('access_token');
    storageData = JSON.parse(storageData);
    const [allCategories, setAllCategories] = useState([]);
    const [parentCategory, setParentCategory] = useState('');
    const [childCategories, setChildCategories] = useState([]);
    const [selectedChildCategory, setSelectedChildCategory] = useState('');
    const [parentCategoryEdit, setParentCategoryEdit] = useState('');
    const [childCategoriesEdit, setChildCategoriesEdit] = useState([]);
    const [selectedChildCategoryEdit, setSelectedChildCategoryEdit] = useState('');



    const handleDetailProduct = () => {
        if (rowSelected) {
            setIsOpenDrawer(true)
        }
    }

    const handleCancelDelete = () => {
        setIsModalOpenDelete(false)
    }

    const fetchAllTypeProduct = async () => {
        const res = await ProductService.getAllTypeProduct()
        return res
    }

    const handleDeleteProduct = () => {
        mutationDeleteProduct.mutate({ id: rowSelected, token: storageData }, {
            onSettled: () => {
                queryProduct.refetch()
            }
        })
    }

    // const renderAction = () => {
    //     return (
    //         <div>
    //             <DeleteOutlined style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }} onClick={() => setIsModalOpenDelete(true)} />
    //             <EditOutlined style={{ color: 'yellow', fontSize: '30px', cursor: 'pointer' }} onClick={handleDetailProduct} />
    //         </div>
    //     )

    // }

    const renderAction = (record) => {
        return (
            <Space>
                <Button className="admin-product-action-btn" icon={<EditOutlined />} onClick={handleDetailProduct} />
                <Button className="admin-product-action-btn admin-product-action-btn-danger" icon={<DeleteOutlined />} danger onClick={e => { e.stopPropagation(); setIsModalOpenDelete(true); setRowSelected(record._id); }} />
            </Space>
        )

    }


    const initital = () => ({
        name: '',
        price: '',
        description: '',
        rating: '',
        image: '',
        type: '',
        countInStock: '',
        sold: '',
        discount: ''
    })
    const [stateProduct, setStateProduct] = useState(initital());

    const [stateDetailProduct, setStateDetailProduct] = useState(initital());

    const [form] = Form.useForm()


    const mutationUpdateProduct = useMutationHook(
        (data) => {
            const { id, token, ...rests } = data
            const res = ProductService.updateProduct(id, token, { ...rests })
            handleCloseDrawer()
            return res
        },
    )

    const mutationDeleteProduct = useMutationHook(
        (data) => {
            const { id, token } = data
            const res = ProductService.deleteProduct(id, token)
            handleCloseDrawer()
            return res
        },
    )

    const handleDeleteManyProduct = (ids) => {
        mutationDeleteManyProduct.mutate({ ids: ids, token: storageData }, {
            onSettled: () => {
                queryProduct.refetch()
            }
        })

    }

    const mutationDeleteManyProduct = useMutationHook(
        (data) => {
            const { token, ...ids } = data
            const res = ProductService.deleteManyProduct(ids, token)
            return res
        },
    )


    const mutation = useMutationHook(
        (data) => {
            const { name, price, description, rating, images, type, countInStock, sold, discount } = data
            const res = ProductService.createProduct({ name, price, description, rating, images, type, countInStock, sold, discount })
            return res
        }
    )

    const { data, isPending, isSuccess } = mutation
    const { data: dataUpdated, isPending: isPendingUpdated, isSuccess: isSuccessUpdated } = mutationUpdateProduct
    const { data: dataDeleted, isPending: isPendingDeleted, isSuccess: isSuccessDeleted } = mutationDeleteProduct
    const { data: dataDeletedMany, isPending: isPendingDeletedMany, isSuccess: isSuccessDeletedMany, isError: isErrorDeletedMany } = mutationDeleteManyProduct


    const fetchGetDetailProduct = async (rowSelected) => {
        const res = await ProductService.getDetailProduct(rowSelected)
        if (res?.data) {
            setStateDetailProduct({
                name: res?.data?.name,
                price: res?.data?.price,
                description: res?.data?.description,
                rating: res?.data?.rating,
                // images: res?.data?.images[0],
                images: Array.isArray(res?.data?.images) ? res?.data?.images : [res?.data?.images], // Đảm bảo images luôn là mảng
                type: res?.data?.type,
                countInStock: res?.data?.countInStock,
                sold: res?.data?.sold,
                discount: res?.data?.discount,
            })
        }
        return res
    }

    //gọi api để lấy thông tin chi tiết khi đã có rowSelected
    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            setIsPendingUpdate(true)
            fetchGetDetailProduct(rowSelected)
        }
        setIsPendingUpdate(false)
    }, [rowSelected, isOpenDrawer])

    //tự động điền thông tin từ api vào form
    useEffect(() => {
        if (!isModalOpen) {
            form.setFieldsValue(stateDetailProduct)
        } else {
            form.setFieldsValue(initital())
        }
    }, [form, stateDetailProduct, isModalOpen])

    //Tự động tắt form và thông báo khi đã thêm SP thành công
    useEffect(() => {
        if (isSuccess && data?.status === 'OK') {
            message.success(data?.message)
            handleCloseDrawer()
        }
    }, [isSuccess])

    //Khi trạng thái của isSuccessDeletedMany thay đổi sẽ thực hiện khối lệnh
    useEffect(() => {
        if (isSuccessDeletedMany && dataDeletedMany?.status === 'OK') {
            message.success(dataDeletedMany?.message)
        } else if (isErrorDeletedMany) {
            message.error(isErrorDeletedMany?.message)
        }
    }, [isSuccessDeletedMany])

    //Tự động tắt form và thông báo khi đã xóa SP thành công
    useEffect(() => {
        if (isSuccessDeleted && dataDeleted?.status === 'OK') {
            message.success(dataDeleted?.message)
            handleCancelDelete()
        }
    }, [isSuccessDeleted])


    // //Update thành công thì tắt form và thoongg báo
    useEffect(() => {
        if (isSuccessUpdated && dataUpdated?.status === 'OK') {
            setIsPendingUpdate(false)
            message.success(dataUpdated?.message)
            handleCloseDrawer()
        }
    }, [isSuccessUpdated])


    const getAllProducts = async () => {
        const res = await ProductService.getAllProduct()
        return res
    }

    const queryProduct = useQuery({
        queryKey: ['products'],
        queryFn: getAllProducts,
        retry: 3,
        retryDelay: 1000
    });
    const { data: products, isLoading: isLoadingProduct } = queryProduct


    const queryTypeProduct = useQuery({
        queryKey: ['TypeProduct'],
        queryFn: fetchAllTypeProduct,
        retry: 3,
        retryDelay: 1000
    });
    const { data: typeProduct, isLoading: isLoadingTypeProduct } = queryTypeProduct





    // const { data: products, isLoading: isLoadingProduct } = useQuery({
    //     queryKey: ['products'],
    //     queryFn: getAllProducts,
    //     retry: 3,
    //     retryDelay: 1000
    // });

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };
    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText('');
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div
                style={{
                    padding: 8,
                }}
                onKeyDown={(e) => e.stopPropagation()}
            >
                <Input
                    ref={searchInput}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    style={{
                        marginBottom: 8,
                        display: 'block',
                    }}
                />
                <Space>
                    <Button
                        type="primary"
                        onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => clearFilters && handleReset(clearFilters)}
                        size="small"
                        style={{
                            width: 90,
                        }}
                    >
                        Reset
                    </Button>

                    <Button
                        type="link"
                        size="small"
                        onClick={() => {
                            close();
                        }}
                    >
                        close
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => (
            <SearchOutlined
                style={{
                    color: filtered ? '#1677ff' : undefined,
                }}
            />
        ),
        onFilter: (value, record) =>
            record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        filterDropdownProps: {
            onOpenChange(open) {
                if (open) {
                    setTimeout(() => searchInput.current?.select(), 100);
                }
            },
        },
        // render: (text) =>
        //     searchedColumn === dataIndex ? (
        //         <Highlighter
        //             highlightStyle={{
        //                 backgroundColor: '#ffc069',
        //                 padding: 0,
        //             }}
        //             searchWords={[searchText]}
        //             autoEscape
        //             textToHighlight={text ? text.toString() : ''}
        //         />
        //     ) : (
        //         text
        //     ),
    });

    const getCategoryById = (id) => allCategories.find(cat => cat._id === id);

    const columns = [
        {
            title: 'STT',
            dataIndex: 'index',
            render: (text, record, index) => index + 1, // Tính STT dựa trên trang hiện tại và kích thước trang
        },
        {
            title: 'Tên sản phẩm',
            dataIndex: 'name',
            render: (text) => <a>{text}</a>,
            sorter: (a, b) => a.name.length - b.name.length,
            ...getColumnSearchProps('name') //sort by name
        },
        {
            title: 'Giá tiền',
            dataIndex: 'price',
            sorter: (a, b) => a.price - b.price, //sort by price

            //Lọc sản phẩm theo giá (theo từng nhóm)
            filters: [
                {
                    text: '>= 50',
                    value: '>=',
                },
                {
                    text: '<= 50',
                    value: '<=',
                },
            ],
            onFilter: (value, record) => {
                if (value === '>=') {
                    return record.price >= 50
                } else if (value === '<=') {
                    return record.price <= 50
                }
            },
        },
        {
            title: 'Đánh giá',
            dataIndex: 'rating',
            sorter: (a, b) => a.rating - b.rating, //sort by price

            //Lọc sản phẩm theo đánh giá (rating) //Kịch bản chỉ lọc theo Sp nhỏ hơn 3 sao và lớn hơn 3 sao
            filters: [
                {
                    text: '>= 3',
                    value: '>=',
                },
                {
                    text: '<= 3',
                    value: '<=',
                },
            ],
            onFilter: (value, record) => {
                if (value === '>=') {
                    return record.rating >= 3
                } else if (value === '<=') {
                    return record.rating <= 3
                }
            },
        },
        {
            title: 'Loại sản phẩm',
            dataIndex: 'type',
            render: (type) => {
                const category = getCategoryById(type);
                if (!category) return type;
                // Nếu là category con
                if (category.parent) {
                    const parentCat = typeof category.parent === 'object'
                        ? getCategoryById(category.parent._id)
                        : getCategoryById(category.parent);
                    return (
                        <>
                            {parentCat && <Tag style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#B45309', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: 999 }}>{parentCat.name}</Tag>}
                            <Tag style={{ background: 'rgba(2, 132, 199, 0.12)', color: '#0369A1', borderColor: 'rgba(2, 132, 199, 0.3)', borderRadius: 999 }}>{category.name}</Tag>
                        </>
                    );
                }
                // Nếu là category cha
                return <Tag style={{ background: 'rgba(245, 158, 11, 0.14)', color: '#B45309', borderColor: 'rgba(245, 158, 11, 0.3)', borderRadius: 999 }}>{category.name}</Tag>;
            }
        },
        {
            title: 'Hình ảnh',
            dataIndex: ['images', 'image'],
            render: (text, record) => {
                const imageSrc = Array.isArray(record.images) && record.images.length > 0
                    ? record.images[0] // Render hình ảnh đầu tiên trong mảng images
                    : record.image; // Render trường image nếu không có images
                return (
                    <img
                        src={imageSrc}
                        style={{
                            height: '60px',
                            width: '60px',
                            borderRadius: '50%',
                            objectFit: 'cover',
                            marginLeft: '10px',
                        }}
                        alt='Product Image'
                    />
                );
            },
        },
        {
            title: 'Hành động',
            dataIndex: 'action',
            render: (text, record) => renderAction(record)
        },
    ];

    //Xuất dữ liệu ra từ bảng, số lượng được định nghĩa ở Controller Backend || set cứng 1000 sản phẩm ở ProductService.js frontend
    const dataTable = products?.data?.length && products?.data.map((product) => {
        return {
            ...product,
            key: product._id,
        }
    })


    const showModal = () => {
        setIsModalOpen(true);
    };


    const handleCancel = () => {
        setIsModalOpen(false);
        setStateProduct({
            name: '',
            price: '',
            description: '',
            rating: '',
            image: '',
            type: '',
            countInStock: '',
            sold: '',
            discount: ''
        })
        form.resetFields()

    };

    const handleCloseDrawer = () => {
        setStateDetailProduct({
            name: '',
            price: '',
            description: '',
            rating: '',
            image: '',
            type: '',
            countInStock: '',
            sold: '',
            discount: ''
        })
        form.resetFields()
        setIsModalOpen(false);
        setIsOpenDrawer(false)
    };

    const onFinish = () => {
        mutation.mutate(stateProduct, {
            onSettled: () => {
                queryProduct.refetch()
            }
        })
    };


    const handleOnChange = (e) => {
        setStateProduct({
            ...stateProduct,
            [e.target.name]: e.target.value
        })
    }

    const handleOnChangeDetailProduct = (e) => {
        setStateDetailProduct({
            ...stateDetailProduct,
            [e.target.name]: e.target.value
        })
    }

    const handleOnchangeAvatar = async ({ fileList }) => {
        const previews = await Promise.all(fileList.map(async (file) => {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj);
            }
            return file.preview;
        }));
        setStateProduct({
            ...stateProduct,
            images: previews,
            image: previews[0] || "" // Cập nhật trường image với hình ảnh đầu tiên
        });
    }

    const handleOnchangeDetailAvatar = async ({ fileList }) => {
        const previews = await Promise.all(fileList.map(async (file) => {
            if (!file.url && !file.preview) {
                file.preview = await getBase64(file.originFileObj);
            }
            return file.preview;
        }));
        setStateDetailProduct({
            ...stateDetailProduct,
            images: previews,
        });
    }

    const onUpdateProduct = () => {
        mutationUpdateProduct.mutate({ id: rowSelected, token: storageData, ...stateDetailProduct }, {
            onSettled: () => {
                queryProduct.refetch()
            }
        })
    }

    const handleChangeSelect = (value) => {
        if (value !== 'add_type') {
            setStateProduct({
                ...stateProduct,
                type: value,
            })
        } else {
            setTypeSelect(value)
        }
    }

    // Fetch all categories khi mở modal tạo sản phẩm
    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getAllCategories();
            setAllCategories(res?.data || []);
        };
        fetchCategories();
    }, []);

    const handleParentCategoryChange = (value) => {
        setParentCategory(value);
        // Lọc category con: parent phải tồn tại và trùng _id với value
        const children = allCategories.filter(cat => {
            if (!cat.parent) return false;
            // Nếu parent là object (populate), so sánh _id
            if (typeof cat.parent === 'object') {
                return cat.parent._id === value;
            }
            // Nếu parent là string (chứa _id)
            return cat.parent === value;
        });
        setChildCategories(children);
        setSelectedChildCategory('');
        setStateProduct({
            ...stateProduct,
            type: ''
        });
    };

    const handleChildCategoryChange = (value) => {
        setSelectedChildCategory(value);
        setStateProduct({
            ...stateProduct,
            type: value // type là _id của category con
        });
    };

    // Khi mở Drawer (chỉnh sửa), set giá trị ban đầu cho category cha/con
    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            setIsPendingUpdate(true);
            fetchGetDetailProduct(rowSelected).then(res => {
                const product = res?.data;
                if (product) {
                    const currentCategory = allCategories.find(cat => cat._id === product.type);
                    if (currentCategory) {
                        if (currentCategory.parent) {
                            const parentId = typeof currentCategory.parent === 'object'
                                ? currentCategory.parent._id
                                : currentCategory.parent;
                            setParentCategoryEdit(parentId);
                            setSelectedChildCategoryEdit(currentCategory._id);
                            const children = allCategories.filter(cat =>
                                cat.parent &&
                                ((typeof cat.parent === 'object'
                                    ? cat.parent._id
                                    : cat.parent) === parentId)
                            );
                            setChildCategoriesEdit(children);
                            // Set giá trị cho form
                            form.setFieldsValue({
                                parentCategoryEdit: parentId,
                                childCategoryEdit: currentCategory._id,
                                // ...các trường khác nếu cần
                            });
                        } else {
                            setParentCategoryEdit(currentCategory._id);
                            setSelectedChildCategoryEdit('');
                            setChildCategoriesEdit([]);
                            form.setFieldsValue({
                                parentCategoryEdit: currentCategory._id,
                                childCategoryEdit: undefined,
                                // ...các trường khác nếu cần
                            });
                        }
                    }
                }
            });
        }
    }, [rowSelected, isOpenDrawer, allCategories, form]);

    const handleParentCategoryEditChange = (value) => {
        setParentCategoryEdit(value);
        const children = allCategories.filter(cat => {
            if (!cat.parent) return false;
            return (cat.parent._id || cat.parent) === value;
        });
        setChildCategoriesEdit(children);
        setSelectedChildCategoryEdit('');
        setStateDetailProduct({
            ...stateDetailProduct,
            type: '' // reset type khi đổi cha
        });
    };
    const handleChildCategoryEditChange = (value) => {
        setSelectedChildCategoryEdit(value);
        setStateDetailProduct({
            ...stateDetailProduct,
            type: value // type là _id của category con
        });
    };

    return (
        <div className="admin-product-page">
            <WrapperHeader>Quản lý sản phẩm</WrapperHeader>
            <div className="admin-product-toolbar" style={{ marginTop: '10px' }}>
                <Button className="admin-product-add-btn" onClick={showModal} style={{ height: '50px', borderRadius: '6px', borderStyle: 'dashed' }}>
                    <PlusOutlined style={{ fontSize: '20px' }} />Thêm sản phẩm
                </Button>
            </div>
            <div className="admin-product-table-wrap" style={{ marginTop: '20px' }}>
                <TableComponent
                    handleDeleteMany={handleDeleteManyProduct}
                    columns={columns}
                    isPending={isLoadingProduct}
                    data={dataTable}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: (event) => {
                                setRowSelected(record._id)
                                setIsOpenDrawer(true)
                            }, // click row
                        };
                    }}
                />
            </div>

            <ModalComponent
                title={<div style={{ textAlign: 'center', fontWeight: 600, fontSize: 22 }}>Tạo sản phẩm mới</div>}
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
                className="admin-product-modal"
                okText={null}
                okType='none'
                loading={isloading}
            >
                <LoadingComponent isPending={isPending}>
                    <Form
                        layout="vertical"
                        style={{ maxWidth: 600 }}
                        onFinish={onFinish}
                        autoComplete="off"
                        form={form}
                    >
                        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]} style={{ marginBottom: 16 }}>
                            <Input value={stateProduct.name} onChange={handleOnChange} name='name' />
                        </Form.Item>
                        <Form.Item label="Phân loại" name="parentCategory" rules={[{ required: true, message: 'Chọn loại sản phẩm cha!' }]} style={{ marginBottom: 16 }}>
                            <Select
                                value={parentCategory}
                                onChange={handleParentCategoryChange}
                                options={allCategories.filter(cat => !cat.parent).map(cat => ({
                                    value: cat._id,
                                    label: cat.name
                                }))}
                            />
                        </Form.Item>
                        {childCategories.length > 0 && (
                            <Form.Item label="Nhóm" name="childCategory" rules={[{ required: true, message: 'Chọn loại sản phẩm con!' }]} style={{ marginBottom: 16 }}>
                                <Select
                                    value={selectedChildCategory}
                                    onChange={handleChildCategoryChange}
                                    options={childCategories.map(cat => ({
                                        value: cat._id,
                                        label: cat.name
                                    }))}
                                />
                            </Form.Item>
                        )}
                        <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Nhập giá!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateProduct.price} onChange={value => handleOnChange({ target: { name: 'price', value } })} name='price' min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Hàng tồn kho" name="countInStock" rules={[{ required: true, message: 'Nhập số lượng!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateProduct.countInStock} onChange={value => handleOnChange({ target: { name: 'countInStock', value } })} name='countInStock' min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Đánh giá" name="rating" rules={[{ required: true, message: 'Nhập đánh giá!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateProduct.rating} onChange={value => handleOnChange({ target: { name: 'rating', value } })} name='rating' min={0} max={5} step={0.1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Nhập mô tả!' }]} style={{ marginBottom: 16 }}>
                            <Input.TextArea value={stateProduct.description} onChange={handleOnChange} name='description' rows={3} />
                        </Form.Item>
                        <Form.Item label="Đã bán" name="sold" rules={[{ required: true, message: 'Nhập số đã bán!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateProduct.sold} onChange={value => handleOnChange({ target: { name: 'sold', value } })} name='sold' min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Giảm giá (%)" name="discount" rules={[{ required: true, message: 'Nhập giảm giá!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateProduct.discount} onChange={value => handleOnChange({ target: { name: 'discount', value } })} name='discount' min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Hình ảnh" name="images" rules={[{ required: true, message: 'Chọn hình ảnh!' }]} style={{ marginBottom: 16 }}>
                            <WrapperUploadFile onChange={handleOnchangeAvatar} maxCount={5} multiple>
                                <Button className="admin-product-upload-btn">Upload</Button>
                                {stateProduct?.images?.map((image, index) => (
                                    <img key={index} src={image} style={{
                                        height: '60px',
                                        width: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginLeft: '10px'
                                    }} alt={`Product Image ${index + 1}`} />
                                ))}
                            </WrapperUploadFile>
                        </Form.Item>
                        <Form.Item>
                            <Button className="admin-product-submit-btn" type="primary" htmlType="submit" icon={<PlusOutlined />} block size="large">
                                Xác nhận
                            </Button>
                        </Form.Item>
                    </Form>
                </LoadingComponent>
            </ModalComponent>
            <ModalComponent
                title={<div style={{ textAlign: 'center', fontWeight: 600, fontSize: 22 }}>Chi tiết sản phẩm</div>}
                open={isOpenDrawer}
                onCancel={() => setIsOpenDrawer(false)}
                width={600}
                className="admin-product-modal"
                footer={null}
            >
                <LoadingComponent isPending={isPendingUpdated}>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onUpdateProduct}
                        autoComplete="off"
                        style={{ maxWidth: 600 }}
                    >
                        <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Nhập tên sản phẩm!' }]} style={{ marginBottom: 16 }}>
                            <Input value={stateDetailProduct.name} onChange={handleOnChangeDetailProduct} name='name' />
                        </Form.Item>
                        <Form.Item label="Phân loại" name="parentCategoryEdit" rules={[{ required: true, message: 'Chọn loại sản phẩm cha!' }]} style={{ marginBottom: 16 }}>
                            <Select
                                value={parentCategoryEdit}
                                onChange={handleParentCategoryEditChange}
                                options={allCategories.filter(cat => !cat.parent).map(cat => ({
                                    value: cat._id,
                                    label: cat.name
                                }))}
                            />
                        </Form.Item>
                        {childCategoriesEdit.length > 0 && (
                            <Form.Item label="Nhóm" name="childCategoryEdit" rules={[{ required: true, message: 'Chọn loại sản phẩm con!' }]} style={{ marginBottom: 16 }}>
                                <Select
                                    value={selectedChildCategoryEdit}
                                    onChange={handleChildCategoryEditChange}
                                    options={childCategoriesEdit.map(cat => ({
                                        value: cat._id,
                                        label: cat.name
                                    }))}
                                />
                            </Form.Item>
                        )}
                        <Form.Item label="Giá tiền" name="price" rules={[{ required: true, message: 'Nhập giá!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateDetailProduct.price} onChange={value => handleOnChangeDetailProduct({ target: { name: 'price', value } })} name='price' min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Hàng tồn kho" name="countInStock" rules={[{ required: true, message: 'Nhập số lượng!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateDetailProduct.countInStock} onChange={value => handleOnChangeDetailProduct({ target: { name: 'countInStock', value } })} name='countInStock' min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Đánh giá" name="rating" rules={[{ required: true, message: 'Nhập đánh giá!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateDetailProduct.rating} onChange={value => handleOnChangeDetailProduct({ target: { name: 'rating', value } })} name='rating' min={0} max={5} step={0.1} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Mô tả" name="description" rules={[{ required: true, message: 'Nhập mô tả!' }]} style={{ marginBottom: 16 }}>
                            <Input.TextArea value={stateDetailProduct.description} onChange={handleOnChangeDetailProduct} name='description' rows={3} />
                        </Form.Item>
                        <Form.Item label="Đã bán" name="sold" rules={[{ required: true, message: 'Nhập số đã bán!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateDetailProduct.sold} onChange={value => handleOnChangeDetailProduct({ target: { name: 'sold', value } })} name='sold' min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Giảm giá (%)" name="discount" rules={[{ required: true, message: 'Nhập giảm giá!' }]} style={{ marginBottom: 16 }}>
                            <InputNumber value={stateDetailProduct.discount} onChange={value => handleOnChangeDetailProduct({ target: { name: 'discount', value } })} name='discount' min={0} max={100} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item label="Hình ảnh" name="images" rules={[{ required: true, message: 'Chọn hình ảnh!' }]} style={{ marginBottom: 16 }}>
                            <WrapperUploadFile onChange={handleOnchangeDetailAvatar} maxCount={5} multiple>
                                <Button className="admin-product-upload-btn">Upload</Button>
                                {stateDetailProduct?.images?.map((image, index) => (
                                    <img key={index} src={image} style={{
                                        height: '60px',
                                        width: '60px',
                                        borderRadius: '50%',
                                        objectFit: 'cover',
                                        marginLeft: '10px'
                                    }} alt={`Product Image ${index + 1}`} />
                                ))}
                            </WrapperUploadFile>
                        </Form.Item>
                        <Form.Item>
                            <Button className="admin-product-submit-btn" type="primary" htmlType="submit" block size="large">
                                Cập nhật
                            </Button>
                        </Form.Item>
                    </Form>
                </LoadingComponent>
            </ModalComponent>

            <ModalComponent
                title="Xóa sản phẩm"
                open={isModalOpenDelete}
                onCancel={handleCancelDelete}
                okText='Yes' onOk={handleDeleteProduct}
                className="admin-product-modal"
                loading={isloading}
            >
                <LoadingComponent isPending={isPendingDeleted}>
                    <div>Bạn có chắc muốn xóa sản phẩm này không?</div>
                </LoadingComponent>
            </ModalComponent>
            <style>{`
                .admin-product-page {
                    --admin-emerald: #10B981;
                    --admin-blue: #0284C7;
                    --admin-orange: #F59E0B;
                    --admin-bg: #F8FAFC;
                    --admin-text: #1E293B;
                    color: var(--admin-text);
                    padding: 18px;
                }
                .admin-product-page .admin-product-toolbar {
                    display: flex;
                    justify-content: flex-end;
                }
                .admin-product-page .admin-product-add-btn {
                    border-color: rgba(16, 185, 129, 0.54) !important;
                    color: #0F766E !important;
                    background: linear-gradient(120deg, rgba(16, 185, 129, 0.2), rgba(2, 132, 199, 0.1));
                    font-weight: 600;
                    transition: all 0.25s ease;
                }
                .admin-product-page .admin-product-add-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 12px 22px rgba(2, 132, 199, 0.16);
                }
                .admin-product-page .admin-product-table-wrap {
                    border: 1px solid rgba(2, 132, 199, 0.16);
                    border-radius: 16px;
                    padding: 12px;
                    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
                    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
                    animation: adminProductFadeIn 0.35s ease;
                }
                .admin-product-page .admin-product-table-wrap .ant-table-wrapper {
                    overflow: auto;
                    border-radius: 12px;
                }
                .admin-product-page .admin-product-table-wrap .ant-table-thead > tr > th {
                    color: #0369A1;
                    background: rgba(2, 132, 199, 0.08);
                    font-weight: 700;
                }
                .admin-product-page .admin-product-action-btn {
                    width: 36px;
                    height: 36px;
                    border-radius: 10px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    background: #fff;
                    border-color: rgba(2, 132, 199, 0.28);
                    color: #0369A1;
                    transition: all 0.2s ease;
                }
                .admin-product-page .admin-product-action-btn:hover {
                    border-color: rgba(2, 132, 199, 0.5) !important;
                    color: #0C4A6E !important;
                    transform: translateY(-1px);
                }
                .admin-product-page .admin-product-action-btn-danger {
                    border-color: rgba(245, 158, 11, 0.5) !important;
                    color: #B45309 !important;
                }
                .admin-product-page .admin-product-action-btn-danger:hover {
                    border-color: #F59E0B !important;
                    color: #92400E !important;
                }
                .admin-product-page .admin-product-submit-btn {
                    background: linear-gradient(135deg, #10B981, #0284C7) !important;
                    border: none !important;
                    box-shadow: 0 12px 22px rgba(16, 185, 129, 0.24);
                    min-height: 40px;
                    border-radius: 10px;
                    font-weight: 600;
                }
                .admin-product-page .admin-product-upload-btn {
                    border-color: rgba(2, 132, 199, 0.35);
                    color: #0369A1;
                    font-weight: 600;
                }
                .admin-product-page .admin-product-upload-btn:hover {
                    border-color: rgba(16, 185, 129, 0.55) !important;
                    color: #0F766E !important;
                }
                .admin-product-modal .ant-modal-content {
                    border-radius: 18px;
                    overflow: hidden;
                    border: 1px solid rgba(16, 185, 129, 0.18);
                }
                .admin-product-modal .ant-modal-header {
                    background: linear-gradient(130deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.12));
                    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
                }
                .admin-product-modal .ant-modal-footer {
                    border-top: 1px solid rgba(2, 132, 199, 0.12);
                    padding: 14px 20px;
                    display: flex;
                    justify-content: flex-end;
                    gap: 10px;
                }
                .admin-product-modal .ant-modal-footer .ant-btn {
                    height: 38px;
                    border-radius: 10px;
                    font-weight: 600;
                }
                .admin-product-modal .ant-modal-footer .ant-btn-default {
                    border-color: rgba(2, 132, 199, 0.28);
                    color: #0369A1;
                }
                .admin-product-modal .ant-modal-footer .ant-btn-primary {
                    border: none;
                    background: linear-gradient(135deg, #10B981, #0284C7);
                    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
                }
                @keyframes adminProductFadeIn {
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
                    .admin-product-page {
                        padding: 10px;
                    }
                    .admin-product-page .admin-product-toolbar {
                        justify-content: stretch;
                    }
                    .admin-product-page .admin-product-add-btn {
                        width: 100%;
                    }
                }
            `}</style>
        </div>
    )
}

export default AdminProductComponent