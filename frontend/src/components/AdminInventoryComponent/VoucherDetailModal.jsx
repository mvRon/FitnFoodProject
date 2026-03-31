import React from 'react'
import { Descriptions, Divider, Modal, Table, Tag, Timeline, Typography } from 'antd'
import { TRANSACTION_TYPE_LABEL, VOUCHER_STATUS_LABEL } from './constants'
import { formatDateTime, formatMoney } from './helpers'

const { Text } = Typography

const VoucherDetailModal = ({ open, onCancel, voucher, isLoading }) => {
  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={980}
      title={voucher?.voucherCode ? `Chi tiết phiếu kho - ${voucher.voucherCode}` : 'Chi tiết phiếu kho'}
      className="admin-inventory-voucher-modal"
    >
      <Descriptions bordered size="small" column={2}>
        <Descriptions.Item label="Loại giao dịch">
          <Tag color={voucher?.transactionType === 'IMPORT' ? 'green' : 'blue'}>
            {TRANSACTION_TYPE_LABEL[voucher?.transactionType] || voucher?.transactionType || '--'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <Tag color={voucher?.status === 'confirmed' ? 'success' : 'warning'}>
            {VOUCHER_STATUS_LABEL[voucher?.status] || voucher?.status || '--'}
          </Tag>
        </Descriptions.Item>
        <Descriptions.Item label="Người thao tác">
          {voucher?.performedBy?.name || '--'}
          {voucher?.performedBy?.email ? <Text type="secondary"> ({voucher?.performedBy?.email})</Text> : null}
        </Descriptions.Item>
        <Descriptions.Item label="Ngày phiếu">{formatDateTime(voucher?.voucherDate)}</Descriptions.Item>
        <Descriptions.Item label="Liên kết đơn hàng">
          {typeof voucher?.linkedOrder === 'object'
            ? voucher?.linkedOrder?._id || '--'
            : voucher?.linkedOrder || '--'}
        </Descriptions.Item>
        <Descriptions.Item label="Tổng giá trị">{formatMoney(voucher?.totalAmount)} đ</Descriptions.Item>
        <Descriptions.Item label="Nhà cung cấp">{voucher?.supplierName || '--'}</Descriptions.Item>
        <Descriptions.Item label="Liên hệ NCC">{voucher?.supplierContact || '--'}</Descriptions.Item>
        <Descriptions.Item label="Ghi chú" span={2}>{voucher?.note || '--'}</Descriptions.Item>
      </Descriptions>

      <Divider orientation="left">Timeline xử lý</Divider>
      <Timeline
        items={[
          {
            color: 'blue',
            children: `Ngày phiếu: ${formatDateTime(voucher?.voucherDate)}`,
          },
          {
            color: 'green',
            children: `Tạo lúc: ${formatDateTime(voucher?.createdAt)}`,
          },
          voucher?.confirmedAt
            ? {
                color: 'green',
                children: `Xác nhận lúc: ${formatDateTime(voucher?.confirmedAt)}`,
              }
            : {
                color: 'orange',
                children: `Trạng thái hiện tại: ${VOUCHER_STATUS_LABEL[voucher?.status] || voucher?.status || '--'}`,
              },
        ]}
      />

      <Divider orientation="left">Chi tiết mặt hàng</Divider>
      <Table
        loading={isLoading}
        rowKey={(record, index) => `${record.product?._id || record.product}-${index}`}
        size="small"
        pagination={false}
        dataSource={voucher?.items || []}
        columns={[
          {
            title: 'Sản phẩm',
            dataIndex: 'product',
            render: (value) => value?.name || '--',
          },
          {
            title: 'Số lượng',
            dataIndex: 'quantity',
            align: 'right',
          },
          {
            title: 'Đơn giá',
            dataIndex: 'unitPrice',
            align: 'right',
            render: (value) => `${formatMoney(value)} đ`,
          },
          {
            title: 'Thành tiền',
            dataIndex: 'amount',
            align: 'right',
            render: (value) => `${formatMoney(value)} đ`,
          },
        ]}
      />
    </Modal>
  )
}

export default VoucherDetailModal
