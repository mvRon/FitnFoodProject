import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Col, Divider, Form, Input, InputNumber, Row, Select, Space, Tag, message } from "antd";
import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined, SyncOutlined, ShoppingCartOutlined, ReloadOutlined } from "@ant-design/icons";
import TableComponent from "../TableComponent/TableComponent";
import LoadingComponent from "../LoadingComponent/LoadingComponent";
import ModalComponent from "../ModalComponent/ModalComponent";
import { useMutationHook } from "../../hooks/useMutationHook";
import { useQuery } from "@tanstack/react-query";
import {
    OrderGlobalStyle,
    DashboardShell,
    HeaderCard,
    HeaderTitle,
    HeaderDesc,
    StatsGrid,
    StatCard,
    StatLabel,
    StatValue,
    FilterBarShell
} from "./Style";
import * as OrderService from "../../services/OrderService";
import * as ProductService from "../../services/ProductService";
import * as UserService from "../../services/UserService";
import { useNavigate } from "react-router-dom";
import { FilterBar, FilterBtn, RefreshBtn, DateInput } from "./FilterStyles";

const VN_OFFSET = 7 * 60 * 60 * 1000; // GMT+7 (Việt Nam)

const getVnTime = () => {
    return new Date(Date.now() + VN_OFFSET);
};

const getStartOfDayUTC = (vnDate) => {
    const msAtMidnightVN = Date.UTC(
        vnDate.getUTCFullYear(),
        vnDate.getUTCMonth(),
        vnDate.getUTCDate(),
        0, 0, 0, 0
    );
    return new Date(msAtMidnightVN - VN_OFFSET).toISOString();
};

const getEndOfDayUTC = (vnDate) => {
    const msAtEndOfDayVN = Date.UTC(
        vnDate.getUTCFullYear(),
        vnDate.getUTCMonth(),
        vnDate.getUTCDate(),
        23, 59, 59, 999
    );
    return new Date(msAtEndOfDayVN - VN_OFFSET).toISOString();
};

const getPresetRange = (preset) => {
    const nowVn = getVnTime();
    switch (preset) {
        case "today":
            return { from: getStartOfDayUTC(nowVn), to: getEndOfDayUTC(nowVn) };
        case "yesterday": {
            const d = new Date(nowVn.getTime() - 24 * 3600 * 1000);
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(d) };
        }
        case "7d": {
            const d = new Date(nowVn.getTime() - 6 * 24 * 3600 * 1000);
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(nowVn) };
        }
        case "month": {
            const d = new Date(Date.UTC(nowVn.getUTCFullYear(), nowVn.getUTCMonth(), 1));
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(nowVn) };
        }
        case "year": {
            const d = new Date(Date.UTC(nowVn.getUTCFullYear(), 0, 1));
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(nowVn) };
        }
        default:
            return { from: null, to: null };
    }
};

const PRESETS = [
    { key: "all", label: "Tất cả" },
    { key: "today", label: "Hôm nay" },
    { key: "yesterday", label: "Hôm qua" },
    { key: "7d", label: "7 ngày" },
    { key: "month", label: "Tháng này" },
    { key: "year", label: "Năm nay" },
    { key: "custom", label: "Tùy chọn" },
];

const DELIVERY_STATUS_LABEL = {
    pending: "Chờ xử lý",
    processing: "Đang xử lý",
    shipping: "Đang giao hàng",
    delivered: "Đã giao hàng",
};

const DELIVERY_STATUS_STYLE = {
    pending: { background: "rgba(30, 41, 59, 0.08)", color: "#334155", borderColor: "rgba(30, 41, 59, 0.18)", borderRadius: 999 },
    processing: { background: "rgba(245, 158, 11, 0.16)", color: "#B45309", borderColor: "rgba(245, 158, 11, 0.36)", borderRadius: 999 },
    shipping: { background: "rgba(2, 132, 199, 0.14)", color: "#0369A1", borderColor: "rgba(2, 132, 199, 0.3)", borderRadius: 999 },
    delivered: { background: "rgba(16, 185, 129, 0.14)", color: "#047857", borderColor: "rgba(16, 185, 129, 0.3)", borderRadius: 999 },
};


const AdminOrderComponent = () => {
    const [rowSelected, setRowSelected] = useState("");
    const [isOpenDrawer, setIsOpenDrawer] = useState(false);
    const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
    const [isModalCreateOrderOpen, setIsModalCreateOrderOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stateDetailOrder, setStateDetailOrder] = useState({});
    const [form] = Form.useForm();
    const [createOrderForm] = Form.useForm();
    const searchInput = useRef(null);
    const [searchKeyword, setSearchKeyword] = useState("");

    const [preset, setPreset] = useState("all");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const dateRange = useMemo(() => {
        if (preset === "custom") {
            let fromIso = null;
            let toIso = null;
            if (customFrom) {
                const parts = customFrom.split("-");
                const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
                fromIso = getStartOfDayUTC(d);
            }
            if (customTo) {
                const parts = customTo.split("-");
                const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
                toIso = getEndOfDayUTC(d);
            }
            return { from: fromIso, to: toIso };
        }
        return getPresetRange(preset);
    }, [preset, customFrom, customTo]);

    let storageData = localStorage.getItem("access_token");

    if (storageData) {
        try {
            storageData = JSON.parse(storageData);
        } catch (e) {
            console.error("Failed to parse token:", e);
            storageData = null;
        }
    }

    const fetchGetDetailOrder = async (orderId) => {
        if (!storageData) return;
        setIsLoading(true);
        const res = await OrderService.getDetailOrder(storageData, orderId);
        if (res?.data) {
            setStateDetailOrder({
                orderId: res.data._id,
                customerName: res.data.shippingAddress?.fullName || res.data.user?.name || "Không xác định",
                // userName: res.data.user?.name || "Không xác định",
                phone: res.data.shippingAddress?.phone || "",
                shippingAddress: res.data.shippingAddress || {},
                total: res.data.totalPrice,
                isDelivered: res.data.isDelivered,
                isPaid: res.data.isPaid,
                createdAt: res.data.createdAt,
                orderItems: res.data.orderItems || [],
            });
        }
        setIsLoading(false);
    };


    useEffect(() => {
        if (rowSelected && isOpenDrawer) {
            fetchGetDetailOrder(rowSelected);
        }
    }, [rowSelected, isOpenDrawer]);

    useEffect(() => {
        form.setFieldsValue(stateDetailOrder);
    }, [form, stateDetailOrder]);

    const mutationDeleteOrder = useMutationHook((data) => {
        const { id, token } = data;
        return OrderService.deleteOrder(token, id);
    });

    const mutationUpdateOrder = useMutationHook((data) => {
        const { id, token, ...updateData } = data;
        return OrderService.updateOrder(id, token, updateData);
    });

    const mutationCreateOrder = useMutationHook((payload) => {
        return OrderService.createOrder(storageData, payload);
    });

    const getAllOrders = async () => {
        if (!storageData) return { data: [] };
        const res = await OrderService.getAllOrders(storageData, dateRange);
        return res;
    };

    const queryOrder = useQuery({
        queryKey: ["orders", dateRange.from, dateRange.to],
        queryFn: getAllOrders,
        retry: 3,
        retryDelay: 1000,
        onError: () => {
            message.error("Không thể tải danh sách đơn hàng.");
        },
    });

    const usersQuery = useQuery({
        queryKey: ["admin-users"],
        queryFn: () => UserService.getAllUser(storageData),
        enabled: Boolean(storageData),
    });

    const productsQuery = useQuery({
        queryKey: ["admin-order-products"],
        queryFn: () => ProductService.getAllProduct("", 1, 1000),
        enabled: Boolean(storageData),
    });
    const { data } = queryOrder

    // console.log('queryOrder', data?.data[0].shippingAddress.fullName)

    useEffect(() => {
        if (mutationDeleteOrder.isSuccess && mutationDeleteOrder.data?.status === "OK") {
            message.success(mutationDeleteOrder.data?.message);
            setIsModalOpenDelete(false);
            queryOrder.refetch();
        }
    }, [mutationDeleteOrder.isSuccess]);

    useEffect(() => {
        if (mutationUpdateOrder.isSuccess && mutationUpdateOrder.data?.status === "OK") {
            message.success(mutationUpdateOrder.data?.message);
            setIsOpenDrawer(false);
            queryOrder.refetch();
        }
    }, [mutationUpdateOrder.isSuccess]);

    useEffect(() => {
        if (mutationCreateOrder.isSuccess && mutationCreateOrder.data?.status === "OK") {
            message.success("Tạo đơn hàng tại quầy thành công");
            setIsModalCreateOrderOpen(false);
            createOrderForm.resetFields();
            queryOrder.refetch();
            productsQuery.refetch();
        }

        if (mutationCreateOrder.isSuccess && mutationCreateOrder.data?.status !== "OK") {
            message.error(mutationCreateOrder.data?.message || "Không thể tạo đơn hàng tại quầy");
        }
    }, [mutationCreateOrder.isSuccess]);

    const users = usersQuery?.data?.data || [];
    const products = productsQuery?.data?.data || [];
    const watchedOrderItems = Form.useWatch("orderItems", createOrderForm) || [];

    const userOptions = users
        .filter((user) => !user?.isAdmin)
        .map((user) => ({
            value: user._id,
            label: `${user.name} - ${user.phone || "--"}`,
        }));

    const getStockByProductId = (productId) => {
        const product = products.find((item) => item._id === productId);
        return Number(product?.countInStock || 0);
    };

    const selectedProductIds = useMemo(
        () => (watchedOrderItems || []).map((item) => item?.product).filter(Boolean),
        [watchedOrderItems]
    );

    const getProductOptionsByRow = (rowIndex) => {
        const rowProductId = watchedOrderItems?.[rowIndex]?.product;

        return products.map((product) => {
            const stock = Number(product.countInStock || 0);
            const selectedInOtherRow = selectedProductIds.includes(product._id) && rowProductId !== product._id;
            const outOfStock = stock <= 0;

            return {
                value: product._id,
                disabled: outOfStock || selectedInOtherRow,
                label: `${product.name} (${stock})${outOfStock ? " - Hết hàng" : ""}`,
            };
        });
    };

    const orderSummary = useMemo(() => {
        const rows = watchedOrderItems || [];
        const itemsPrice = rows.reduce((sum, row) => {
            const product = products.find((item) => item._id === row?.product);
            const unitPrice = Number(row?.unitPrice ?? product?.price ?? 0);
            const amount = Number(row?.amount || 0);
            return sum + unitPrice * amount;
        }, 0);

        return {
            itemsPrice,
            shippingPrice: 0,
            totalPrice: itemsPrice,
        };
    }, [watchedOrderItems, products]);

    const [searchText, setSearchText] = useState("");
    const [searchedColumn, setSearchedColumn] = useState("");

    const handleSearch = (selectedKeys, confirm, dataIndex) => {
        confirm();
        setSearchText(selectedKeys[0]);
        setSearchedColumn(dataIndex);
    };

    const handleReset = (clearFilters) => {
        clearFilters();
        setSearchText("");
    };

    const getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters, close }) => (
            <div className="admin-order-filter-dropdown" onKeyDown={(e) => e.stopPropagation()}>
                <Input
                    ref={searchInput}
                    placeholder={`Tìm ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
                    className="admin-order-filter-input"
                />
                <Space>
                    <Button className="admin-order-filter-btn admin-order-filter-btn-primary" type="primary" onClick={() => handleSearch(selectedKeys, confirm, dataIndex)} icon={<SearchOutlined />} size="small">
                        Tìm
                    </Button>
                    <Button className="admin-order-filter-btn" onClick={() => clearFilters && handleReset(clearFilters)} size="small">
                        Đặt lại
                    </Button>
                    <Button type="link" size="small" onClick={() => close()}>
                        Đóng
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: (filtered) => <SearchOutlined style={{ color: filtered ? "#0284C7" : undefined }} />,
        onFilter: (value, record) => record[dataIndex]?.toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownOpenChange: (open) => {
            if (open) {
                setTimeout(() => searchInput.current?.select(), 100);
            }
        },
    });

    const paidTagStyle = {
        true: { background: "rgba(2, 132, 199, 0.14)", color: "#0369A1", borderColor: "rgba(2, 132, 199, 0.3)", borderRadius: 999 },
        false: { background: "rgba(30, 41, 59, 0.08)", color: "#334155", borderColor: "rgba(30, 41, 59, 0.18)", borderRadius: 999 },
    };

    const columns = [
        // {
        //   title: "Mã đơn",
        //   dataIndex: "_id",
        // },
        {
            title: "Khách hàng",
            dataIndex: "customerName",
            ...getColumnSearchProps("customerName"),
        },
        {
            title: "SĐT",
            dataIndex: "phone",
        },
        {
            title: "Tổng tiền (VNĐ)",
            dataIndex: "total",
            sorter: (a, b) => a.total - b.total,
            render: (total) => total.toLocaleString('vi-VN')
        },
        {
            title: "Giao hàng",
            dataIndex: "isDelivered",
            filters: [
                { text: "Chờ xử lý", value: "pending" },
                { text: "Đang xử lý", value: "processing" },
                { text: "Đang giao hàng", value: "shipping" },
                { text: "Đã giao hàng", value: "delivered" },
            ],
            onFilter: (value, record) => record.isDelivered === value,
            render: (isDelivered) => (
                <Tag style={DELIVERY_STATUS_STYLE[isDelivered] || DELIVERY_STATUS_STYLE.pending}>
                    {DELIVERY_STATUS_LABEL[isDelivered] || "Chờ xử lý"}
                </Tag>
            ),
        },
        {
            title: "Thanh toán",
            dataIndex: "isPaid",
            filters: [
                { text: "Chưa thanh toán", value: false },
                { text: "Đã thanh toán", value: true },
            ],
            onFilter: (value, record) => record.isPaid === value,
            render: (isPaid) => <Tag style={paidTagStyle[String(isPaid)]}>{isPaid ? "Đã thanh toán" : "Chưa thanh toán"}</Tag>,
        },
        {
            title: "Ngày đặt",
            dataIndex: "createdAt",
            render: (date) => new Date(date).toLocaleString(),
            sorter: (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        },
        {
            title: "Hành động",
            render: (_, record) => (
                <Space>
                    <Button
                        className="admin-order-action-btn admin-order-action-btn-danger"
                        icon={<DeleteOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            setRowSelected(record._id);
                            setIsModalOpenDelete(true);
                        }}
                    />
                    <Button
                        className="admin-order-action-btn"
                        icon={<EditOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            setRowSelected(record._id);
                            setIsOpenDrawer(true);
                        }}
                    />
                </Space>
            ),
        },
    ];

    const stats = useMemo(() => {
        const orders = queryOrder?.data?.data || [];
        const total = orders.length;
        const processing = orders.filter(o => o.isDelivered === 'pending' || o.isDelivered === 'processing').length;
        const delivered = orders.filter(o => o.isDelivered === 'delivered').length;
        const revenue = orders.filter(o => o.isPaid).reduce((acc, curr) => acc + (curr.totalPrice || 0), 0);
        return { total, processing, delivered, revenue };
    }, [queryOrder?.data?.data]);

    const dataTable = (queryOrder?.data?.data || [])
        .map((order) => ({
            ...order,
            key: order._id,
            customerName: order?.shippingAddress?.fullName || order.user?.name || "Không xác định",
            phone: order.shippingAddress?.phone || "",
            total: order.totalPrice,
            isDelivered: order.isDelivered,
            isPaid: order.isPaid,
        }))
        .filter((order) => {
            if (!searchKeyword) return true;
            const term = searchKeyword.toLowerCase();
            return (
                order.customerName.toLowerCase().includes(term) ||
                order.phone.toLowerCase().includes(term) ||
                (order._id && order._id.toLowerCase().includes(term))
            );
        });

    const handleDeleteOrder = () => {
        if (storageData && rowSelected) {
            mutationDeleteOrder.mutate({ id: rowSelected, token: storageData });
        }
    };

    const handleUpdateOrder = (values) => {
        const { isDelivered, isPaid } = values;

        // Lấy trạng thái đơn hàng hiện tại
        const currentOrder = data?.data?.find(order => order._id === rowSelected);

        // Lấy giờ Việt Nam chuẩn ISO
        const getVietnamTimeISO = () => {
            const now = new Date();
            now.setHours(now.getHours() + 7);
            return now.toISOString();
        };

        let paidAtValue = currentOrder?.paidAt || null;
        // Nếu chuyển từ chưa thanh toán sang đã thanh toán thì cập nhật paidAt
        if (!currentOrder?.isPaid && isPaid) {
            paidAtValue = getVietnamTimeISO();
        }
        // Nếu chuyển từ đã thanh toán sang chưa thanh toán thì xóa paidAt
        if (currentOrder?.isPaid && !isPaid) {
            paidAtValue = null;
        }

        if (storageData && rowSelected) {
            mutationUpdateOrder.mutate({
                ...data,
                id: rowSelected,
                token: storageData,
                isDelivered,
                isPaid,
                paidAt: paidAtValue
            });
        }
    };


    const navigate = useNavigate()
    const handleGetDetailProduct = async (productId) => {
        navigate(`/productDetail/${productId}`)
    }

    const handleSelectCustomerForManualOrder = (userId) => {
        const selectedUser = users.find((item) => item._id === userId);
        if (!selectedUser) return;

        createOrderForm.setFieldsValue({
            user: userId,
            fullName: selectedUser.name || "",
            phone: selectedUser.phone || "",
            address: selectedUser.address || "",
            city: selectedUser.city || "",
        });
    };

    const handleSelectProductForManualOrder = (index, productId) => {
        const selectedProduct = products.find((item) => item._id === productId);
        if (!selectedProduct) return;

        const currentItems = createOrderForm.getFieldValue("orderItems") || [];
        const nextItems = [...currentItems];
        nextItems[index] = {
            ...(nextItems[index] || {}),
            product: productId,
            amount: Number(nextItems[index]?.amount || 1),
            unitPrice: Number(selectedProduct.price || 0),
        };

        createOrderForm.setFieldsValue({ orderItems: nextItems });
    };

    const onSubmitManualOrder = (values) => {
        const productIds = (values.orderItems || []).map((item) => item.product).filter(Boolean);
        if (new Set(productIds).size !== productIds.length) {
            message.error("Không thể chọn trùng sản phẩm trong cùng một đơn");
            return;
        }

        try {
            const normalizedItems = (values.orderItems || []).map((item) => {
                const productData = products.find((product) => product._id === item.product) || {};
                const amount = Number(item.amount || 0);
                const price = Number(item.unitPrice ?? productData.price ?? 0);
                const firstImage = Array.isArray(productData.images) && productData.images.length > 0
                    ? productData.images[0]
                    : "";

                if (amount > Number(productData.countInStock || 0)) {
                    throw new Error(`Sản phẩm ${productData.name || "không xác định"} vượt quá tồn kho`);
                }

                return {
                    product: item.product,
                    amount,
                    price,
                    name: productData.name || "",
                    image: firstImage,
                    countInStock: Number(productData.countInStock || 0),
                    discount: 0,
                };
            });

            if (normalizedItems.length === 0) {
                message.error("Vui lòng chọn ít nhất 1 sản phẩm");
                return;
            }

            const itemsPrice = normalizedItems.reduce((sum, item) => sum + item.amount * item.price, 0);
            const shippingPrice = 0;
            const totalPrice = itemsPrice;

            mutationCreateOrder.mutate({
                user: values.user,
                fullName: values.fullName,
                phone: values.phone,
                address: values.address,
                city: values.city,
                paymentMethod: values.paymentMethod,
                isPaid: Boolean(values.isPaid),
                paidAt: values.isPaid ? new Date().toISOString() : null,
                isDelivered: "delivered",
                orderItems: normalizedItems,
                itemsPrice,
                shippingPrice,
                totalPrice,
            });
        } catch (error) {
            message.error(error.message || "Dữ liệu đơn hàng không hợp lệ");
            return;
        }
    };


    return (
        <>
            <OrderGlobalStyle />
            <DashboardShell className="admin-order-page">
                <HeaderCard>
                    <HeaderTitle>
                        <ShoppingCartOutlined /> Quản lý Đơn hàng
                    </HeaderTitle>
                    <HeaderDesc>
                        Theo dõi, xử lý và cập nhật trạng thái đơn hàng của khách hàng theo thời gian thực.
                    </HeaderDesc>

                    <StatsGrid>
                        <StatCard>
                            <StatLabel>Tổng đơn hàng</StatLabel>
                            <StatValue>{stats.total}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Đang xử lý</StatLabel>
                            <StatValue>{stats.processing}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Đã giao</StatLabel>
                            <StatValue>{stats.delivered}</StatValue>
                        </StatCard>
                        <StatCard>
                            <StatLabel>Doanh thu</StatLabel>
                            <StatValue style={{ color: '#10B981' }}>{stats.revenue.toLocaleString('vi-VN')} đ</StatValue>
                        </StatCard>
                    </StatsGrid>
                </HeaderCard>

                <FilterBarShell>
                    <Input
                        placeholder="Tìm theo tên khách, SĐT, mã đơn..."
                        prefix={<SearchOutlined />}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        className="admin-order-search-input"
                        allowClear
                    />

                    <Space wrap style={{ flex: 1, justifyContent: 'flex-end' }}>
                        {PRESETS.map((p) => (
                            <FilterBtn
                                key={p.key}
                                $active={preset === p.key}
                                onClick={() => setPreset(p.key)}
                            >
                                {p.label}
                            </FilterBtn>
                        ))}
                        {preset === "custom" && (
                            <>
                                <DateInput
                                    type="date"
                                    value={customFrom}
                                    onChange={e => setCustomFrom(e.target.value)}
                                    title="Từ ngày"
                                />
                                <span style={{ color: "#64748B", fontSize: 12 }}>→</span>
                                <DateInput
                                    type="date"
                                    value={customTo}
                                    onChange={e => setCustomTo(e.target.value)}
                                    title="Đến ngày"
                                />
                            </>
                        )}
                        <Button
                            className="admin-order-submit-btn"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalCreateOrderOpen(true)}
                            type="primary"
                            style={{ height: 38 }}
                        >
                            Tạo đơn tại quầy
                        </Button>
                        <RefreshBtn onClick={() => queryOrder.refetch()} disabled={queryOrder.isFetching}>
                            <SyncOutlined spin={queryOrder.isFetching} style={{ marginRight: 6 }} />
                            {queryOrder.isFetching ? "Đang tải..." : "Làm mới"}
                        </RefreshBtn>
                    </Space>
                </FilterBarShell>

                <div className="admin-order-table-wrap">
                    <TableComponent
                        columns={columns}
                        isPending={queryOrder.isLoading}
                        data={dataTable}
                        onRow={(record) => ({
                            onClick: () => {
                                setRowSelected(record._id);
                                setIsOpenDrawer(true);
                            },
                        })}
                    />
                </div>

                <ModalComponent
                    title={`Chi tiết đơn hàng - ${stateDetailOrder?.orderId || ""}`}
                    open={isOpenDrawer}
                    width="50%"
                    onCancel={() => setIsOpenDrawer(false)}
                    footer={null}
                    className="admin-order-modal"
                >
                    <LoadingComponent isPending={isLoading || mutationUpdateOrder.isPending}>
                        <Form className="admin-order-form" layout="vertical" form={form} onFinish={handleUpdateOrder} forceRender >
                            <Form.Item label="Khách hàng" name="customerName">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="SĐT" name="phone">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Địa chỉ" name={["shippingAddress", "address"]}>
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Tổng tiền" name="total">
                                <Input disabled />
                            </Form.Item>
                            <Form.Item label="Giao hàng" name="isDelivered" rules={[{ required: true, message: "Chọn trạng thái" }]}>
                                <Select>
                                    <Select.Option value="pending">Chờ xử lý</Select.Option>
                                    <Select.Option value="processing">Đang xử lý</Select.Option>
                                    <Select.Option value="shipping">Đang giao hàng</Select.Option>
                                    <Select.Option value="delivered">Đã giao hàng</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item label="Thanh toán" name="isPaid" rules={[{ required: true, message: "Chọn trạng thái" }]}>
                                <Select>
                                    <Select.Option value={true}>Đã thanh toán</Select.Option>
                                    <Select.Option value={false}>Chưa thanh toán</Select.Option>
                                </Select>
                            </Form.Item>
                            <Form.Item>
                                <Button className="admin-order-submit-btn" type="primary" htmlType="submit">Cập nhật</Button>
                            </Form.Item>
                        </Form>

                        <div className="admin-order-item-list">
                            <b>Sản phẩm:</b>
                            <ul>
                                {(stateDetailOrder.orderItems || []).map((item, idx) => (

                                    <li key={idx}>
                                        <img
                                            className="admin-order-item-image"
                                            onClick={() => handleGetDetailProduct(item?.product)}
                                            src={item?.image}
                                            alt={item?.name} /> {item.name} x {item.amount}: {item.price.toLocaleString()} VNĐ (Giá chưa giảm)
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </LoadingComponent>
                </ModalComponent>

                <ModalComponent
                    title="Xóa đơn hàng"
                    open={isModalOpenDelete}
                    onCancel={() => setIsModalOpenDelete(false)}
                    okText="Xóa"
                    onOk={handleDeleteOrder}
                    className="admin-order-modal"
                >
                    <LoadingComponent isPending={mutationDeleteOrder.isPending}>
                        <div>Bạn có chắc muốn xóa đơn hàng này không?</div>
                    </LoadingComponent>
                </ModalComponent>

                <ModalComponent
                    title="Tạo đơn hàng tại quầy"
                    open={isModalCreateOrderOpen}
                    onCancel={() => setIsModalCreateOrderOpen(false)}
                    footer={null}
                    width={900}
                    className="admin-order-modal admin-order-create-modal"
                >
                    <LoadingComponent isPending={mutationCreateOrder.isPending || productsQuery.isLoading || usersQuery.isLoading}>
                        <Form
                            form={createOrderForm}
                            layout="vertical"
                            className="admin-order-form"
                            initialValues={{ paymentMethod: "cash", isPaid: true, orderItems: [{ amount: 1 }] }}
                            onFinish={onSubmitManualOrder}
                        >
                            <div className="admin-order-create-hero">
                                <div>
                                    <h3>Đơn hàng tại quầy</h3>
                                    <p>Tạo nhanh đơn mua trực tiếp tại cửa hàng. Không áp dụng mã giảm giá và phí giao hàng luôn bằng 0.</p>
                                </div>
                                <div className="admin-order-create-total-box">
                                    <span>Tổng tiền realtime</span>
                                    <strong>{orderSummary.totalPrice.toLocaleString("vi-VN")} VNĐ</strong>
                                </div>
                            </div>

                            <Row gutter={[12, 8]}>
                                <Col xs={24} md={12}>
                                    <Form.Item
                                        label="Khách hàng đã có tài khoản"
                                        name="user"
                                        rules={[{ required: true, message: "Vui lòng chọn khách hàng" }]}
                                    >
                                        <Select
                                            showSearch
                                            optionFilterProp="label"
                                            options={userOptions}
                                            onChange={handleSelectCustomerForManualOrder}
                                            placeholder="Chọn người dùng"
                                        />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item style={{ marginBottom: 8 }} label="Số điện thoại" name="phone" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item style={{ marginBottom: 8 }} label="Họ tên" name="fullName" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col xs={24} md={12}>
                                    <Form.Item style={{ marginBottom: 8 }} label="Thành phố" name="city" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                                <Col span={24}>
                                    <Form.Item style={{ marginBottom: 8 }} label="Địa chỉ" name="address" rules={[{ required: true }]}>
                                        <Input />
                                    </Form.Item>
                                </Col>
                            </Row>

                            <Divider style={{ margin: "8px 0 14px" }}>Sản phẩm</Divider>

                            <Form.List name="orderItems">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field) => (
                                            <div key={field.key} className="admin-order-create-item-row">
                                                <Form.Item
                                                    name={[field.name, "product"]}
                                                    rules={[{ required: true, message: "Chọn sản phẩm" }]}
                                                    style={{ flex: 1.8, minWidth: 260 }}
                                                >
                                                    <Select
                                                        placeholder="Sản phẩm"
                                                        showSearch
                                                        optionFilterProp="label"
                                                        options={getProductOptionsByRow(field.name)}
                                                        onChange={(value) => handleSelectProductForManualOrder(field.name, value)}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name={[field.name, "amount"]}
                                                    style={{ flex: 1, minWidth: 130 }}
                                                    rules={[
                                                        { required: true, message: "SL" },
                                                        ({ getFieldValue }) => ({
                                                            validator(_, value) {
                                                                const productId = getFieldValue(["orderItems", field.name, "product"]);
                                                                const stock = getStockByProductId(productId);
                                                                if (!value || value <= stock) {
                                                                    return Promise.resolve();
                                                                }
                                                                return Promise.reject(new Error(`Số lượng vượt tồn kho (${stock})`));
                                                            },
                                                        }),
                                                    ]}
                                                >
                                                    <InputNumber
                                                        min={1}
                                                        max={getStockByProductId(watchedOrderItems?.[field.name]?.product) || undefined}
                                                        placeholder="Số lượng"
                                                        style={{ width: "100%" }}
                                                    />
                                                </Form.Item>
                                                <Form.Item
                                                    name={[field.name, "unitPrice"]}
                                                    style={{ flex: 1.2, minWidth: 140 }}
                                                    rules={[{ required: true, message: "Đơn giá" }]}
                                                >
                                                    <InputNumber min={0} placeholder="Đơn giá" style={{ width: "100%" }} />
                                                </Form.Item>
                                                <Button danger type="text" onClick={() => remove(field.name)}>
                                                    Xóa
                                                </Button>
                                            </div>
                                        ))}
                                        <Button type="dashed" block onClick={() => add({ amount: 1 })}>
                                            Thêm sản phẩm
                                        </Button>
                                    </>
                                )}
                            </Form.List>

                            <Space style={{ width: "100%", marginTop: 12 }} size={12} wrap>
                                <Form.Item style={{ minWidth: 220 }} label="Phương thức thanh toán" name="paymentMethod" rules={[{ required: true }]}>
                                    <Select
                                        options={[
                                            { value: "cash", label: "Tiền mặt tại quầy" },
                                            { value: "card", label: "Thẻ" },
                                            { value: "transfer", label: "Chuyển khoản" },
                                        ]}
                                    />
                                </Form.Item>
                                <Form.Item style={{ minWidth: 220 }} label="Trạng thái thanh toán" name="isPaid" rules={[{ required: true }]}>
                                    <Select
                                        options={[
                                            { value: true, label: "Đã thanh toán" },
                                            { value: false, label: "Chưa thanh toán" },
                                        ]}
                                    />
                                </Form.Item>
                            </Space>

                            <div className="admin-order-create-summary">
                                <div>
                                    <span>Tạm tính</span>
                                    <strong>{orderSummary.itemsPrice.toLocaleString("vi-VN")} VNĐ</strong>
                                </div>
                                <div>
                                    <span>Phí giao hàng</span>
                                    <strong>{orderSummary.shippingPrice.toLocaleString("vi-VN")} VNĐ</strong>
                                </div>
                                <div className="total">
                                    <span>Tổng thanh toán</span>
                                    <strong>{orderSummary.totalPrice.toLocaleString("vi-VN")} VNĐ</strong>
                                </div>
                            </div>

                            <Button className="admin-order-submit-btn" type="primary" htmlType="submit" block>
                                Tạo đơn hàng
                            </Button>
                        </Form>
                    </LoadingComponent>
                </ModalComponent>
            </DashboardShell>
        </>
    );
};

export default AdminOrderComponent;