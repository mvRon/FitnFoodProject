import {
  Alert,
  Button,
  Card,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  message,
} from 'antd'
import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  FundOutlined,
  SearchOutlined,
  ReloadOutlined,
  RiseOutlined,
  SwapOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import React, { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useMutationHook } from '../../hooks/useMutationHook'
import * as ProductService from '../../services/ProductService'
import * as InventoryService from '../../services/InventoryService'
import * as OrderService from '../../services/OrderService'
import { AdminInventoryGlobalStyle } from './Style'
import { EXPORT_REASONS, SOURCE_TYPES } from './constants'
import {
  discrepancyColumns,
  getVoucherColumns,
  alertColumns,
  stockCardColumns,
} from './columns'
import {
  getAccessToken,
  includesKeyword,
  toDayRangeFilter,
} from './helpers'
import VoucherDetailModal from './VoucherDetailModal'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

const inRange = (value, fromDate, toDate) => {
  if (!value) return false

  const current = new Date(value)
  if (fromDate && current < new Date(fromDate)) return false
  if (toDate) {
    const end = new Date(toDate)
    end.setHours(23, 59, 59, 999)
    if (current > end) return false
  }

  return true
}

const AdminInventoryComponent = () => {
  const accessToken = getAccessToken()

  const [importForm] = Form.useForm()
  const [exportForm] = Form.useForm()
  const [thresholdForm] = Form.useForm()
  const [discrepancyForm] = Form.useForm()

  const [voucherFilters, setVoucherFilters] = useState({
    transactionType: undefined,
    status: undefined,
  })
  const [voucherSearch, setVoucherSearch] = useState({
    keyword: '',
    productId: undefined,
    fromDate: undefined,
    toDate: undefined,
  })
  const [alertSearch, setAlertSearch] = useState({
    keyword: '',
    productId: undefined,
    fromDate: undefined,
    toDate: undefined,
  })
  const [stockCardFilters, setStockCardFilters] = useState({
    productId: undefined,
    fromDate: undefined,
    toDate: undefined,
  })
  const [isVoucherModalOpen, setIsVoucherModalOpen] = useState(false)
  const [voucherSelected, setVoucherSelected] = useState(null)
  const [actionLoadingId, setActionLoadingId] = useState('')
  const [modalActionLoading, setModalActionLoading] = useState('')

  const getProducts = async () => {
    const res = await ProductService.getAllProduct('', 1, 1000)
    return res
  }

  const productsQuery = useQuery({
    queryKey: ['inventory-products'],
    queryFn: getProducts,
    retry: 2,
    retryDelay: 800,
  })

  const products = useMemo(() => productsQuery?.data?.data || [], [productsQuery?.data])

  const ordersQuery = useQuery({
    queryKey: ['inventory-orders', accessToken],
    queryFn: () => OrderService.getAllOrders(accessToken),
    enabled: Boolean(accessToken),
  })

  const orders = useMemo(() => ordersQuery?.data?.data || [], [ordersQuery?.data])

  const productOptions = useMemo(
    () =>
      products.map((item) => ({
        value: item._id,
        label: `${item.name} (${item.countInStock || 0})`,
      })),
    [products]
  )

  const orderOptions = useMemo(
    () =>
      orders.map((order) => ({
        value: order._id,
        label: `${order._id?.slice(-8)} - ${order?.shippingAddress?.fullName || 'Khách hàng'}`,
      })),
    [orders]
  )

  const vouchersQuery = useQuery({
    queryKey: ['inventory-vouchers', voucherFilters, accessToken],
    queryFn: () => InventoryService.getAllVouchers(accessToken, voucherFilters),
    enabled: Boolean(accessToken),
  })

  const alertsQuery = useQuery({
    queryKey: ['inventory-alerts', accessToken],
    queryFn: () => InventoryService.getInventoryAlerts(accessToken),
    enabled: Boolean(accessToken),
  })

  const stockCardQuery = useQuery({
    queryKey: ['stock-card', stockCardFilters, accessToken],
    queryFn: () =>
      InventoryService.getStockCardByProduct(
        stockCardFilters.productId,
        accessToken,
        stockCardFilters.fromDate,
        stockCardFilters.toDate
      ),
    enabled: Boolean(accessToken && stockCardFilters.productId),
  })

  const voucherDetailQuery = useQuery({
    queryKey: ['inventory-voucher-detail', voucherSelected?._id, accessToken],
    queryFn: () => InventoryService.getVoucherDetails(voucherSelected?._id, accessToken),
    enabled: Boolean(accessToken && voucherSelected?._id && isVoucherModalOpen),
  })

  const importMutation = useMutationHook((payload) => InventoryService.createImportVoucher(payload, accessToken))
  const exportMutation = useMutationHook((payload) => InventoryService.createExportVoucher(payload, accessToken))
  const thresholdMutation = useMutationHook(({ productId, payload }) =>
    InventoryService.upsertThreshold(productId, payload, accessToken)
  )
  const discrepancyMutation = useMutationHook((actualCounts) =>
    InventoryService.checkInventoryDiscrepancy(actualCounts, accessToken)
  )
  const confirmVoucherMutation = useMutationHook((voucherId) =>
    InventoryService.confirmVoucher(voucherId, accessToken)
  )
  const cancelVoucherMutation = useMutationHook(({ voucherId, reason }) =>
    InventoryService.cancelVoucher(voucherId, reason, accessToken)
  )
  const updateVoucherNoteMutation = useMutationHook(({ voucherId, note }) =>
    InventoryService.updateVoucherNote(voucherId, note, accessToken)
  )

  const refreshInventoryData = () => {
    vouchersQuery.refetch()
    alertsQuery.refetch()
    productsQuery.refetch()
    ordersQuery.refetch()
    stockCardQuery.refetch()
    voucherDetailQuery.refetch()
  }

  useEffect(() => {
    if (importMutation.isSuccess) {
      if (importMutation.data?.status === 'OK') {
        message.success(importMutation.data?.message || 'Tạo phiếu nhập thành công')
        importForm.resetFields()
        vouchersQuery.refetch()
        alertsQuery.refetch()
        productsQuery.refetch()
      } else {
        message.error(importMutation.data?.message || 'Không thể tạo phiếu nhập')
      }
    }
  }, [importMutation.isSuccess])

  useEffect(() => {
    if (exportMutation.isSuccess) {
      if (exportMutation.data?.status === 'OK') {
        message.success(exportMutation.data?.message || 'Tạo phiếu xuất thành công')
        exportForm.resetFields()
        vouchersQuery.refetch()
        alertsQuery.refetch()
        productsQuery.refetch()
      } else {
        message.error(exportMutation.data?.message || 'Không thể tạo phiếu xuất')
      }
    }
  }, [exportMutation.isSuccess])

  useEffect(() => {
    if (thresholdMutation.isSuccess) {
      if (thresholdMutation.data?.status === 'OK') {
        message.success(thresholdMutation.data?.message || 'Cập nhật ngưỡng tồn kho thành công')
        thresholdForm.resetFields()
        alertsQuery.refetch()
      } else {
        message.error(thresholdMutation.data?.message || 'Không thể cập nhật ngưỡng tồn kho')
      }
    }
  }, [thresholdMutation.isSuccess])

  useEffect(() => {
    if (discrepancyMutation.isSuccess) {
      if (discrepancyMutation.data?.status === 'OK') {
        message.success('Đã kiểm tra chênh lệch kiểm kê')
      } else {
        message.error(discrepancyMutation.data?.message || 'Không thể kiểm tra chênh lệch')
      }
    }
  }, [discrepancyMutation.isSuccess])

  useEffect(() => {
    if (voucherDetailQuery.isError) {
      message.error('Không thể tải chi tiết phiếu kho')
    }
  }, [voucherDetailQuery.isError])

  useEffect(() => {
    if (!confirmVoucherMutation.isSuccess) return

    if (confirmVoucherMutation.data?.status === 'OK') {
      message.success(confirmVoucherMutation.data?.message || 'Đã xác nhận phiếu kho')
      refreshInventoryData()
    } else {
      message.error(confirmVoucherMutation.data?.message || 'Không thể xác nhận phiếu kho')
    }
  }, [confirmVoucherMutation.isSuccess])

  useEffect(() => {
    if (!cancelVoucherMutation.isSuccess) return

    if (cancelVoucherMutation.data?.status === 'OK') {
      message.success(cancelVoucherMutation.data?.message || 'Đã hủy phiếu kho')
      refreshInventoryData()
    } else {
      message.error(cancelVoucherMutation.data?.message || 'Không thể hủy phiếu kho')
    }
  }, [cancelVoucherMutation.isSuccess])

  useEffect(() => {
    if (!updateVoucherNoteMutation.isSuccess) return

    if (updateVoucherNoteMutation.data?.status === 'OK') {
      message.success(updateVoucherNoteMutation.data?.message || 'Đã cập nhật ghi chú phiếu')
      vouchersQuery.refetch()
      voucherDetailQuery.refetch()
    } else {
      message.error(updateVoucherNoteMutation.data?.message || 'Không thể cập nhật ghi chú phiếu')
    }
  }, [updateVoucherNoteMutation.isSuccess])

  const alertList = useMemo(() => alertsQuery?.data?.data || [], [alertsQuery?.data])
  const vouchersRaw = useMemo(() => vouchersQuery?.data?.data || [], [vouchersQuery?.data])

  const filteredVoucherData = useMemo(() => {
    return vouchersRaw.filter((voucher) => {
      const keywordMatched =
        includesKeyword(voucher?.voucherCode, voucherSearch.keyword) ||
        includesKeyword(voucher?.performedBy?.name, voucherSearch.keyword)

      const productMatched =
        !voucherSearch.productId ||
        (voucher?.items || []).some(
          (item) => (item?.product?._id || item?.product) === voucherSearch.productId
        )

      const dateMatched =
        (!voucherSearch.fromDate && !voucherSearch.toDate) ||
        inRange(voucher?.voucherDate, voucherSearch.fromDate, voucherSearch.toDate)

      return keywordMatched && productMatched && dateMatched
    })
  }, [vouchersRaw, voucherSearch])

  const filteredAlertData = useMemo(() => {
    return alertList.filter((alertItem) => {
      const keywordMatched =
        includesKeyword(alertItem?.product?.name, alertSearch.keyword) ||
        includesKeyword(alertItem?.message, alertSearch.keyword)

      const productMatched =
        !alertSearch.productId || alertItem?.product?._id === alertSearch.productId

      const movementDate = alertItem?.product?.lastStockMovementAt || alertItem?.product?.updatedAt
      const dateMatched =
        (!alertSearch.fromDate && !alertSearch.toDate) ||
        inRange(movementDate, alertSearch.fromDate, alertSearch.toDate)

      return keywordMatched && productMatched && dateMatched
    })
  }, [alertList, alertSearch])

  const discrepancyAlerts = useMemo(
    () => (discrepancyMutation.data?.data || []).filter((item) => item.type === 'STOCK_DISCREPANCY'),
    [discrepancyMutation.data]
  )

  const summary = useMemo(() => {
    const totalSku = products.length
    const totalStock = products.reduce((total, item) => total + Number(item.countInStock || 0), 0)
    const lowStockCount = filteredAlertData.filter((item) => ['LOW_STOCK', 'OUT_OF_STOCK', 'NEGATIVE_STOCK'].includes(item.type)).length
    const pendingVoucherCount = filteredVoucherData.filter((item) => item.status === 'pending').length

    return {
      totalSku,
      totalStock,
      lowStockCount,
      pendingVoucherCount,
    }
  }, [products, filteredAlertData, filteredVoucherData])

  const onSubmitImport = (values) => {
    const payload = {
      sourceType: values.sourceType,
      linkedOrder: values.linkedOrder,
      supplierName: values.supplierName,
      supplierContact: values.supplierContact,
      note: values.note,
      status: values.status,
      items: (values.items || []).map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice || 0),
      })),
    }
    importMutation.mutate(payload)
  }

  const onSubmitExport = (values) => {
    const payload = {
      exportReason: values.exportReason,
      linkedOrder: values.linkedOrder,
      insufficientAction: values.insufficientAction,
      note: values.note,
      items: (values.items || []).map((item) => ({
        product: item.product,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice || 0),
      })),
    }
    exportMutation.mutate(payload)
  }

  const onSubmitThreshold = (values) => {
    thresholdMutation.mutate({
      productId: values.product,
      payload: {
        safeStockLevel: Number(values.safeStockLevel || 0),
        maxStorageDays: Number(values.maxStorageDays || 90),
        note: values.note,
      },
    })
  }

  const onSubmitDiscrepancy = (values) => {
    const actualCounts = (values.items || []).map((item) => ({
      product: item.product,
      actualCount: Number(item.actualCount || 0),
    }))
    discrepancyMutation.mutate(actualCounts)
  }

  const handleSelectImportProduct = (index, productId) => {
    const selectedProduct = products.find((item) => item._id === productId)
    if (!selectedProduct) return

    const currentItems = importForm.getFieldValue('items') || []
    const nextItems = [...currentItems]
    nextItems[index] = {
      ...(nextItems[index] || {}),
      product: productId,
      unitPrice: Number(selectedProduct.unitPrice ?? selectedProduct.price ?? 0),
    }

    importForm.setFieldsValue({ items: nextItems })
  }

  const handleSelectExportProduct = (index, productId) => {
    const selectedProduct = products.find((item) => item._id === productId)
    if (!selectedProduct) return

    const currentItems = exportForm.getFieldValue('items') || []
    const nextItems = [...currentItems]
    nextItems[index] = {
      ...(nextItems[index] || {}),
      product: productId,
      unitPrice: Number(selectedProduct.price || 0),
    }

    exportForm.setFieldsValue({ items: nextItems })
  }

  const handleSelectImportLinkedOrder = (orderId) => {
    const selectedOrder = orders.find((order) => order._id === orderId)
    if (!selectedOrder) {
      return
    }

    const orderItems = (selectedOrder.orderItems || []).map((item) => ({
      product: item.product,
      quantity: Number(item.amount || 1),
      unitPrice: Number(item.price || 0),
    }))

    importForm.setFieldsValue({
      linkedOrder: orderId,
      supplierName: selectedOrder?.shippingAddress?.fullName || undefined,
      supplierContact: selectedOrder?.shippingAddress?.phone || undefined,
      items: orderItems.length > 0 ? orderItems : [{}],
    })
  }

  const handleConfirmVoucher = (record, fromModal = false) => {
    if (!record?._id) return

    if (fromModal) {
      setModalActionLoading('confirm')
    } else {
      setActionLoadingId(`confirm-${record._id}`)
    }

    confirmVoucherMutation.mutate(record._id, {
      onSettled: () => {
        setActionLoadingId('')
        setModalActionLoading('')
      },
    })
  }

  const handleCancelVoucher = (record, fromModal = false) => {
    if (!record?._id) return

    const reason = window.prompt('Nhập lý do hủy phiếu (có thể bỏ trống):', '')
    if (reason === null) return

    if (fromModal) {
      setModalActionLoading('cancel')
    } else {
      setActionLoadingId(`cancel-${record._id}`)
    }

    cancelVoucherMutation.mutate(
      {
        voucherId: record._id,
        reason,
      },
      {
        onSettled: () => {
          setActionLoadingId('')
          setModalActionLoading('')
        },
      }
    )
  }

  const handleSaveVoucherNote = (record, note) => {
    if (!record?._id) return

    setModalActionLoading('note')
    updateVoucherNoteMutation.mutate(
      {
        voucherId: record._id,
        note,
      },
      {
        onSettled: () => {
          setModalActionLoading('')
        },
      }
    )
  }

  const voucherColumns = useMemo(
    () =>
      getVoucherColumns({
        onOpenDetail: (record) => {
          setVoucherSelected(record)
          setIsVoucherModalOpen(true)
        },
        onConfirmVoucher: handleConfirmVoucher,
        onCancelVoucher: handleCancelVoucher,
        actionLoadingId,
      }),
    [actionLoadingId]
  )

  return (
    <div className="admin-inventory-page">
      <AdminInventoryGlobalStyle />

      {!accessToken && (
        <Alert
          type="warning"
          showIcon
          message="Chưa tìm thấy token đăng nhập"
          description="Vui lòng đăng nhập lại để sử dụng đầy đủ tính năng quản lý kho."
          style={{ marginBottom: 16 }}
        />
      )}

      <div className="admin-inventory-hero">
        <div>
          <Title level={3} className="admin-inventory-title">Quản lý kho thông minh</Title>
          <Text className="admin-inventory-subtitle">
            Đồng bộ dữ liệu nhập xuất, cảnh báo tồn kho và kiểm kê theo thời gian thực.
          </Text>
        </div>
        <Space>
          <Button
            icon={<ReloadOutlined />}
            className="admin-inventory-btn-outline"
            onClick={refreshInventoryData}
          >
            Làm mới dữ liệu
          </Button>
        </Space>
      </div>

      <Row gutter={[14, 14]}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-inventory-stat-card">
            <Statistic title="Tổng SKU" value={summary.totalSku} prefix={<FundOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-inventory-stat-card admin-inventory-stat-card-emerald">
            <Statistic title="Tổng tồn kho" value={summary.totalStock} prefix={<RiseOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-inventory-stat-card admin-inventory-stat-card-orange">
            <Statistic title="Cảnh báo tồn" value={summary.lowStockCount} prefix={<AlertOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="admin-inventory-stat-card admin-inventory-stat-card-blue">
            <Statistic title="Phiếu chờ xử lý" value={summary.pendingVoucherCount} prefix={<ClockCircleOutlined />} />
          </Card>
        </Col>
      </Row>

      <Row gutter={[14, 14]} className="admin-inventory-section-gap">
        <Col xs={24} lg={16}>
          <Card
            className="admin-inventory-panel"
            title="Cảnh báo tồn kho"
            extra={<Tag color="processing">{filteredAlertData.length} cảnh báo</Tag>}
          >
            <Row gutter={[10, 10]} className="admin-inventory-search-row">
              <Col xs={24} md={8}>
                <Input
                  prefix={<SearchOutlined />}
                  placeholder="Tìm theo sản phẩm hoặc mô tả"
                  value={alertSearch.keyword}
                  onChange={(event) =>
                    setAlertSearch((prev) => ({ ...prev, keyword: event.target.value }))
                  }
                />
              </Col>
              <Col xs={24} md={8}>
                <Select
                  allowClear
                  placeholder="Lọc theo sản phẩm"
                  options={productOptions}
                  showSearch
                  optionFilterProp="label"
                  value={alertSearch.productId}
                  onChange={(value) => setAlertSearch((prev) => ({ ...prev, productId: value }))}
                  style={{ width: '100%' }}
                />
              </Col>
              <Col xs={24} md={8}>
                <RangePicker
                  style={{ width: '100%' }}
                  format="DD/MM/YYYY"
                  onChange={(dates) =>
                    setAlertSearch((prev) => ({ ...prev, ...toDayRangeFilter(dates) }))
                  }
                />
              </Col>
            </Row>
            <Table
              rowKey={(record, index) => `${record.type}-${record.product?._id || index}`}
              loading={alertsQuery.isLoading}
              columns={alertColumns}
              dataSource={filteredAlertData}
              pagination={{ pageSize: 5 }}
              locale={{ emptyText: <Empty description="Không có cảnh báo" /> }}
            />
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="admin-inventory-panel" title="Thiết lập ngưỡng tồn">
            <Form layout="vertical" form={thresholdForm} onFinish={onSubmitThreshold}>
              <Form.Item
                name="product"
                label="Sản phẩm"
                rules={[{ required: true, message: 'Vui lòng chọn sản phẩm' }]}
              >
                <Select options={productOptions} showSearch placeholder="Chọn sản phẩm" optionFilterProp="label" />
              </Form.Item>

              <Form.Item
                name="safeStockLevel"
                label="Ngưỡng an toàn"
                rules={[{ required: true, message: 'Vui lòng nhập ngưỡng an toàn' }]}
              >
                <InputNumber min={0} style={{ width: '100%' }} placeholder="Ví dụ: 20" />
              </Form.Item>

              <Form.Item
                name="maxStorageDays"
                label="Số ngày lưu kho tối đa"
                rules={[{ required: true, message: 'Vui lòng nhập số ngày' }]}
              >
                <InputNumber min={1} style={{ width: '100%' }} placeholder="Ví dụ: 90" />
              </Form.Item>

              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Ghi chú cho cấu hình ngưỡng" />
              </Form.Item>

              <Button
                htmlType="submit"
                className="admin-inventory-btn-primary"
                loading={thresholdMutation.isPending}
                icon={<CheckCircleOutlined />}
                block
              >
                Lưu ngưỡng tồn kho
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card className="admin-inventory-panel admin-inventory-section-gap" title="Danh sách phiếu kho">
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} md={8}>
            <Input
              prefix={<SearchOutlined />}
              placeholder="Tìm theo mã phiếu hoặc người thao tác"
              value={voucherSearch.keyword}
              onChange={(event) =>
                setVoucherSearch((prev) => ({ ...prev, keyword: event.target.value }))
              }
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Lọc theo sản phẩm trong phiếu"
              options={productOptions}
              showSearch
              optionFilterProp="label"
              value={voucherSearch.productId}
              onChange={(value) =>
                setVoucherSearch((prev) => ({ ...prev, productId: value }))
              }
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              onChange={(dates) =>
                setVoucherSearch((prev) => ({ ...prev, ...toDayRangeFilter(dates) }))
              }
            />
          </Col>
        </Row>

        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Lọc theo giao dịch"
              value={voucherFilters.transactionType}
              onChange={(value) => setVoucherFilters((prev) => ({ ...prev, transactionType: value }))}
              options={[
                { value: 'IMPORT', label: 'Phiếu nhập' },
                { value: 'EXPORT', label: 'Phiếu xuất' },
              ]}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Select
              allowClear
              placeholder="Lọc theo trạng thái"
              value={voucherFilters.status}
              onChange={(value) => setVoucherFilters((prev) => ({ ...prev, status: value }))}
              options={[
                { value: 'draft', label: 'Nháp' },
                { value: 'pending', label: 'Chờ xử lý' },
                { value: 'confirmed', label: 'Đã xác nhận' },
                { value: 'cancelled', label: 'Đã hủy' },
              ]}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={8}>
            <Button
              icon={<ReloadOutlined />}
              className="admin-inventory-btn-outline"
              onClick={() => vouchersQuery.refetch()}
              block
            >
              Tải lại danh sách phiếu
            </Button>
          </Col>
        </Row>

        <Table
          rowKey="_id"
          loading={vouchersQuery.isLoading}
          columns={voucherColumns}
          dataSource={filteredVoucherData}
          pagination={{ pageSize: 6 }}
        />
      </Card>

      <Row gutter={[14, 14]} className="admin-inventory-section-gap">
        <Col xs={24} xl={12}>
          <Card title={<Space><UploadOutlined /> Phiếu nhập kho</Space>} className="admin-inventory-panel">
            <Form
              form={importForm}
              layout="vertical"
              onFinish={onSubmitImport}
              initialValues={{ sourceType: 'SUPPLIER', status: 'confirmed', items: [{}] }}
            >
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="sourceType" label="Nguồn nhập" rules={[{ required: true }]}> 
                    <Select options={SOURCE_TYPES} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="status" label="Trạng thái" rules={[{ required: true }]}> 
                    <Select
                      options={[
                        { value: 'confirmed', label: 'Xác nhận ngay' },
                        { value: 'draft', label: 'Lưu nháp' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="linkedOrder" label="Mã đơn hàng liên kết (nếu có)">
                <Select
                  allowClear
                  placeholder="Chọn đơn hàng để tự điền sản phẩm"
                  options={orderOptions}
                  showSearch
                  optionFilterProp="label"
                  onChange={handleSelectImportLinkedOrder}
                />
              </Form.Item>

              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="supplierName" label="Nhà cung cấp">
                    <Input placeholder="Ví dụ: Green Farm" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="supplierContact" label="Liên hệ">
                    <Input placeholder="SĐT hoặc email" />
                  </Form.Item>
                </Col>
              </Row>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="admin-inventory-list-wrap">
                    {fields.map((field) => (
                      <Space key={field.key} align="baseline" className="admin-inventory-line-item">
                        <Form.Item
                          name={[field.name, 'product']}
                          rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                        >
                          <Select
                            style={{ width: 220 }}
                            placeholder="Sản phẩm"
                            options={productOptions}
                            showSearch
                            optionFilterProp="label"
                            onChange={(value) => handleSelectImportProduct(field.name, value)}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'quantity']}
                          rules={[{ required: true, message: 'Nhập số lượng' }]}
                        >
                          <InputNumber min={1} placeholder="Số lượng" />
                        </Form.Item>
                        <Form.Item name={[field.name, 'unitPrice']}>
                          <InputNumber min={0} placeholder="Đơn giá" />
                        </Form.Item>
                        <Button danger type="text" onClick={() => remove(field.name)}>Xóa</Button>
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<DownloadOutlined />} block>
                      Thêm dòng nhập
                    </Button>
                  </div>
                )}
              </Form.List>

              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Thông tin thêm cho phiếu nhập" />
              </Form.Item>

              <Button
                htmlType="submit"
                className="admin-inventory-btn-primary"
                loading={importMutation.isPending}
                block
              >
                Tạo phiếu nhập
              </Button>
            </Form>
          </Card>
        </Col>

        <Col xs={24} xl={12}>
          <Card title={<Space><SwapOutlined /> Phiếu xuất kho</Space>} className="admin-inventory-panel">
            <Form
              form={exportForm}
              layout="vertical"
              onFinish={onSubmitExport}
              initialValues={{ exportReason: 'SALE', insufficientAction: 'error', items: [{}] }}
            >
              <Row gutter={10}>
                <Col span={12}>
                  <Form.Item name="exportReason" label="Lý do xuất" rules={[{ required: true }]}> 
                    <Select options={EXPORT_REASONS} />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item name="insufficientAction" label="Khi thiếu hàng">
                    <Select
                      options={[
                        { value: 'error', label: 'Báo lỗi' },
                        { value: 'pending', label: 'Tạo phiếu chờ' },
                      ]}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item name="linkedOrder" label="Mã đơn hàng liên kết (nếu có)">
                <Input placeholder="Nhập ObjectId đơn hàng" />
              </Form.Item>

              <Form.List name="items">
                {(fields, { add, remove }) => (
                  <div className="admin-inventory-list-wrap">
                    {fields.map((field) => (
                      <Space key={field.key} align="baseline" className="admin-inventory-line-item">
                        <Form.Item
                          name={[field.name, 'product']}
                          rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                        >
                          <Select
                            style={{ width: 220 }}
                            placeholder="Sản phẩm"
                            options={productOptions}
                            showSearch
                            optionFilterProp="label"
                            onChange={(value) => handleSelectExportProduct(field.name, value)}
                          />
                        </Form.Item>
                        <Form.Item
                          name={[field.name, 'quantity']}
                          rules={[{ required: true, message: 'Nhập số lượng' }]}
                        >
                          <InputNumber min={1} placeholder="Số lượng" />
                        </Form.Item>
                        <Form.Item name={[field.name, 'unitPrice']}>
                          <InputNumber min={0} placeholder="Đơn giá" />
                        </Form.Item>
                        <Button danger type="text" onClick={() => remove(field.name)}>Xóa</Button>
                      </Space>
                    ))}
                    <Button type="dashed" onClick={() => add()} icon={<UploadOutlined />} block>
                      Thêm dòng xuất
                    </Button>
                  </div>
                )}
              </Form.List>

              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={3} placeholder="Thông tin thêm cho phiếu xuất" />
              </Form.Item>

              <Button
                htmlType="submit"
                className="admin-inventory-btn-primary"
                loading={exportMutation.isPending}
                block
              >
                Tạo phiếu xuất
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>

      <Card className="admin-inventory-panel admin-inventory-section-gap" title="Thẻ kho theo sản phẩm">
        <Row gutter={[12, 12]} style={{ marginBottom: 12 }}>
          <Col xs={24} md={10}>
            <Select
              placeholder="Chọn sản phẩm cần xem thẻ kho"
              options={productOptions}
              showSearch
              optionFilterProp="label"
              value={stockCardFilters.productId}
              onChange={(value) => setStockCardFilters((prev) => ({ ...prev, productId: value }))}
              style={{ width: '100%' }}
            />
          </Col>
          <Col xs={24} md={10}>
            <RangePicker
              style={{ width: '100%' }}
              format="DD/MM/YYYY"
              onChange={(dates) => {
                setStockCardFilters((prev) => ({
                  ...prev,
                  ...toDayRangeFilter(dates),
                }))
              }}
            />
          </Col>
          <Col xs={24} md={4}>
            <Button
              className="admin-inventory-btn-outline"
              icon={<ReloadOutlined />}
              onClick={() => stockCardQuery.refetch()}
              block
            >
              Xem
            </Button>
          </Col>
        </Row>

        <Table
          rowKey={(record, index) => `${record.voucherCode}-${index}`}
          loading={stockCardQuery.isLoading}
          dataSource={stockCardQuery?.data?.data?.records || []}
          columns={stockCardColumns}
          pagination={{ pageSize: 6 }}
          locale={{
            emptyText: stockCardFilters.productId ? 'Chưa có giao dịch cho sản phẩm này' : 'Chọn sản phẩm để xem thẻ kho',
          }}
        />
      </Card>

      <Card className="admin-inventory-panel admin-inventory-section-gap" title="Kiểm kê và phát hiện chênh lệch tồn kho">
        <Form
          layout="vertical"
          form={discrepancyForm}
          onFinish={onSubmitDiscrepancy}
          initialValues={{ items: [{}] }}
        >
          <Form.List name="items">
            {(fields, { add, remove }) => (
              <div className="admin-inventory-list-wrap">
                {fields.map((field) => (
                  <Space key={field.key} align="baseline" className="admin-inventory-line-item">
                    <Form.Item
                      name={[field.name, 'product']}
                      rules={[{ required: true, message: 'Chọn sản phẩm' }]}
                    >
                      <Select style={{ width: 260 }} placeholder="Sản phẩm" options={productOptions} showSearch optionFilterProp="label" />
                    </Form.Item>
                    <Form.Item
                      name={[field.name, 'actualCount']}
                      rules={[{ required: true, message: 'Nhập số lượng thực tế' }]}
                    >
                      <InputNumber min={0} placeholder="SL thực tế" />
                    </Form.Item>
                    <Button danger type="text" onClick={() => remove(field.name)}>Xóa</Button>
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add()} block>
                  Thêm dòng kiểm kê
                </Button>
              </div>
            )}
          </Form.List>

          <Button
            className="admin-inventory-btn-primary"
            htmlType="submit"
            loading={discrepancyMutation.isPending}
            icon={<AlertOutlined />}
          >
            Kiểm tra chênh lệch
          </Button>
        </Form>

        <Table
          rowKey={(record, index) => `${record.product?._id || index}`}
          style={{ marginTop: 14 }}
          dataSource={discrepancyAlerts}
          columns={discrepancyColumns}
          pagination={false}
          locale={{ emptyText: 'Chưa có kết quả kiểm kê hoặc không có chênh lệch' }}
        />
      </Card>

      <VoucherDetailModal
        open={isVoucherModalOpen}
        onCancel={() => {
          setIsVoucherModalOpen(false)
          setVoucherSelected(null)
        }}
        voucher={voucherDetailQuery?.data?.data || voucherSelected}
        isLoading={voucherDetailQuery.isLoading}
        onConfirmVoucher={(record) => handleConfirmVoucher(record, true)}
        onCancelVoucher={(record) => handleCancelVoucher(record, true)}
        onSaveNote={handleSaveVoucherNote}
        actionLoading={modalActionLoading}
      />
    </div>
  )
}

export default AdminInventoryComponent
