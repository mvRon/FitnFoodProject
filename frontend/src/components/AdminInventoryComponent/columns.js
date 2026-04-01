import React from 'react'
import { Button, Tag, Typography } from 'antd'
import { EyeOutlined } from '@ant-design/icons'
import { ALERT_TAG, TRANSACTION_TYPE_LABEL, VOUCHER_STATUS_LABEL } from './constants'
import { formatDateTime, formatMoney } from './helpers'

const { Text } = Typography

export const getVoucherColumns = ({ onOpenDetail }) => [
  {
    title: 'Mã phiếu',
    dataIndex: 'voucherCode',
    render: (_, record) => (
      <Button type="link" className="admin-inventory-link-btn" onClick={() => onOpenDetail(record)}>
        {record.voucherCode}
      </Button>
    ),
  },
  {
    title: 'Loại',
    dataIndex: 'transactionType',
    render: (value) => <Tag color={value === 'IMPORT' ? 'green' : 'blue'}>{TRANSACTION_TYPE_LABEL[value] || value}</Tag>,
  },
  {
    title: 'Trạng thái',
    dataIndex: 'status',
    render: (value) => <Tag color={value === 'confirmed' ? 'success' : 'warning'}>{VOUCHER_STATUS_LABEL[value] || value}</Tag>,
  },
  {
    title: 'Ngày tạo',
    dataIndex: 'voucherDate',
    render: (value) => formatDateTime(value),
  },
  {
    title: 'Số dòng',
    dataIndex: 'items',
    render: (items) => items?.length || 0,
  },
  {
    title: 'Tổng tiền',
    dataIndex: 'totalAmount',
    align: 'right',
    render: (value) => `${formatMoney(value)} đ`,
  },
  {
    title: 'Người thao tác',
    dataIndex: 'performedBy',
    render: (value) => value?.name || '--',
  },
  {
    title: 'Chi tiết',
    key: 'action',
    width: 130,
    render: (_, record) => (
      <Button type="default" icon={<EyeOutlined />} onClick={() => onOpenDetail(record)}>
        Xem chi tiết
      </Button>
    ),
  },
]

export const alertColumns = [
  {
    title: 'Loại cảnh báo',
    dataIndex: 'type',
    render: (type) => {
      const config = ALERT_TAG[type] || { color: 'default', label: type }
      return <Tag color={config.color}>{config.label}</Tag>
    },
  },
  {
    title: 'Sản phẩm',
    dataIndex: 'product',
    render: (product) => product?.name || '--',
  },
  {
    title: 'Tồn hiện tại',
    dataIndex: 'currentStock',
    render: (value, record) => value ?? record?.product?.countInStock ?? 0,
  },
  {
    title: 'Ngưỡng an toàn',
    dataIndex: 'safeStockLevel',
    render: (value) => value ?? 0,
  },
  {
    title: 'Mô tả',
    dataIndex: 'message',
    render: (value) => <Text type="secondary">{value}</Text>,
  },
]

export const stockCardColumns = [
  {
    title: 'Ngày',
    dataIndex: 'date',
    render: (value) => formatDateTime(value),
  },
  {
    title: 'Loại',
    dataIndex: 'transactionType',
    render: (value) => <Tag color={value === 'IMPORT' ? 'green' : value === 'EXPORT' ? 'blue' : 'orange'}>{value}</Tag>,
  },
  {
    title: 'Mã phiếu',
    dataIndex: 'voucherCode',
  },
  {
    title: 'Mô tả',
    dataIndex: 'description',
  },
  {
    title: 'Nhập',
    dataIndex: 'quantityIn',
    align: 'right',
  },
  {
    title: 'Xuất',
    dataIndex: 'quantityOut',
    align: 'right',
  },
  {
    title: 'Tồn sau GD',
    dataIndex: 'balanceAfter',
    align: 'right',
  },
]

export const discrepancyColumns = [
  {
    title: 'Sản phẩm',
    dataIndex: 'product',
    render: (product) => product?.name || '--',
  },
  {
    title: 'Tồn hệ thống',
    dataIndex: 'systemQty',
    align: 'right',
  },
  {
    title: 'Tồn thực tế',
    dataIndex: 'actualQty',
    align: 'right',
  },
  {
    title: 'Chênh lệch',
    dataIndex: 'difference',
    align: 'right',
    render: (value) => <Tag color={value > 0 ? 'blue' : 'volcano'}>{value}</Tag>,
  },
]
