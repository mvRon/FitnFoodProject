import React from 'react'
import { Card, Col, Divider, Modal, Row, Table, Tag, Timeline, Typography } from 'antd'
import { TRANSACTION_TYPE_LABEL, VOUCHER_STATUS_LABEL } from './constants'
import { formatDateTime, formatMoney } from './helpers'

const { Text, Title } = Typography

const VoucherDetailModal = ({ open, onCancel, voucher, isLoading }) => {
  const transactionLabel = TRANSACTION_TYPE_LABEL[voucher?.transactionType] || voucher?.transactionType || '--'
  const statusLabel = VOUCHER_STATUS_LABEL[voucher?.status] || voucher?.status || '--'

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={980}
      title={voucher?.voucherCode ? `Chi tiết phiếu kho - ${voucher.voucherCode}` : 'Chi tiết phiếu kho'}
      className="admin-inventory-voucher-modal"
    >
      <div className="inventory-voucher-modal-hero">
        <div>
          <Text className="inventory-voucher-modal-eyebrow">Mã phiếu</Text>
          <Title level={4} className="inventory-voucher-modal-code">{voucher?.voucherCode || '--'}</Title>
          <div className="inventory-voucher-modal-badges">
            <Tag color={voucher?.transactionType === 'IMPORT' ? 'green' : 'blue'}>{transactionLabel}</Tag>
            <Tag color={voucher?.status === 'confirmed' ? 'success' : 'warning'}>{statusLabel}</Tag>
          </div>
        </div>
        <div className="inventory-voucher-modal-total">
          <Text className="inventory-voucher-modal-eyebrow">Tổng giá trị</Text>
          <div className="inventory-voucher-modal-total-number">{formatMoney(voucher?.totalAmount)} đ</div>
        </div>
      </div>

      <Row gutter={[12, 12]} className="inventory-voucher-modal-info-grid">
        <Col xs={24} md={12}>
          <Card size="small" className="inventory-voucher-modal-info-card" title="Thông tin người thao tác">
            <p><Text strong>Họ tên:</Text> {voucher?.performedBy?.name || '--'}</p>
            <p><Text strong>Email:</Text> {voucher?.performedBy?.email || '--'}</p>
            <p><Text strong>Ngày phiếu:</Text> {formatDateTime(voucher?.voucherDate)}</p>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card size="small" className="inventory-voucher-modal-info-card" title="Thông tin liên kết">
            <p>
              <Text strong>Đơn hàng:</Text>{' '}
              {typeof voucher?.linkedOrder === 'object'
                ? voucher?.linkedOrder?._id || '--'
                : voucher?.linkedOrder || '--'}
            </p>
            <p><Text strong>Nhà cung cấp:</Text> {voucher?.supplierName || '--'}</p>
            <p><Text strong>Liên hệ:</Text> {voucher?.supplierContact || '--'}</p>
          </Card>
        </Col>
      </Row>

      <Card size="small" className="inventory-voucher-modal-note-card" title="Ghi chú">
        {voucher?.note ? <Text>{voucher.note}</Text> : <Text type="secondary">Không có ghi chú cho phiếu này.</Text>}
      </Card>

      <Divider orientation="left">Timeline xử lý</Divider>
      <Card size="small" className="inventory-voucher-modal-timeline-card">
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
                  children: `Trạng thái hiện tại: ${statusLabel}`,
                },
          ]}
        />
      </Card>

      <Divider orientation="left">Chi tiết mặt hàng</Divider>
      <Table
        loading={isLoading}
        rowKey={(record, index) => `${record.product?._id || record.product}-${index}`}
        size="small"
        pagination={false}
        className="inventory-voucher-modal-items-table"
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
        summary={() => (
          <Table.Summary.Row>
            <Table.Summary.Cell index={0} colSpan={3}>
              <Text strong>Tổng cộng</Text>
            </Table.Summary.Cell>
            <Table.Summary.Cell index={3} align="right">
              <Text strong>{formatMoney(voucher?.totalAmount)} đ</Text>
            </Table.Summary.Cell>
          </Table.Summary.Row>
        )}
      />
    </Modal>
  )
}

export default VoucherDetailModal
