import React, { useEffect, useState } from 'react'
import { Button, Card, Col, Divider, Input, Row, Space, Table, Tag, Timeline, Typography } from 'antd'
import { TRANSACTION_TYPE_LABEL, VOUCHER_STATUS_LABEL } from './constants'
import { formatDateTime, formatMoney } from './helpers'
import ModalComponent from '../ModalComponent/ModalComponent'

const { Text, Title } = Typography

const VoucherDetailModal = ({
  open,
  onCancel,
  voucher,
  isLoading,
  onConfirmVoucher,
  onCancelVoucher,
  onSaveNote,
  actionLoading,
}) => {
  const [editableNote, setEditableNote] = useState('')

  useEffect(() => {
    setEditableNote(voucher?.note || '')
  }, [voucher?.note, voucher?._id])

  const transactionLabel = TRANSACTION_TYPE_LABEL[voucher?.transactionType] || voucher?.transactionType || '--'
  const statusLabel = VOUCHER_STATUS_LABEL[voucher?.status] || voucher?.status || '--'
  const canUpdate = ['pending', 'draft'].includes(voucher?.status)
  const totalLine = voucher?.items?.length || 0
  const createdByName = voucher?.performedBy?.name || '--'
  const confirmedByName = voucher?.confirmedBy?.name || voucher?.performedBy?.name || '--'
  const cancelledByName = voucher?.cancelledBy?.name || '--'
  const timelineItems = [
    {
      color: 'blue',
      children: `Ngày phiếu: ${formatDateTime(voucher?.voucherDate)}`,
    },
    {
      color: 'green',
      children: `Tạo lúc: ${formatDateTime(voucher?.createdAt)} - ${createdByName}`,
    },
    voucher?.confirmedAt
      ? {
          color: 'green',
          children: `Xác nhận lúc: ${formatDateTime(voucher?.confirmedAt)} - ${confirmedByName}`,
        }
      : {
          color: 'orange',
          children: `Trạng thái hiện tại: ${statusLabel}`,
        },
    voucher?.cancelledAt
      ? {
          color: 'red',
          children: `Hủy lúc: ${formatDateTime(voucher?.cancelledAt)} - ${cancelledByName}`,
        }
      : null,
  ].filter(Boolean)

  const infoCards = [
    { label: 'Ngày phiếu', value: formatDateTime(voucher?.voucherDate) },
    { label: 'Người tạo phiếu', value: createdByName },
    {
      label: 'Mã đơn liên kết',
      value:
        typeof voucher?.linkedOrder === 'object'
          ? voucher?.linkedOrder?._id || '--'
          : voucher?.linkedOrder || '--',
    },
    { label: 'Số dòng hàng', value: totalLine },
  ]

  return (
    <ModalComponent
      open={open}
      onCancel={onCancel}
      width={980}
      title={voucher?.voucherCode ? `Chi tiết phiếu kho - ${voucher.voucherCode}` : 'Chi tiết phiếu kho'}
      className="admin-inventory-voucher-modal"
      centered
      footer={
        <Space>
          {canUpdate && (
            <>
              <Button
                type="primary"
                onClick={() => onConfirmVoucher?.(voucher)}
                loading={actionLoading === 'confirm'}
              >
                Xác nhận phiếu
              </Button>
              <Button danger onClick={() => onCancelVoucher?.(voucher)} loading={actionLoading === 'cancel'}>
                Hủy phiếu
              </Button>
            </>
          )}
          <Button onClick={onCancel}>Đóng</Button>
        </Space>
      }
    >
      <div className="inventory-voucher-shell">
        <div className="inventory-voucher-glow inventory-voucher-glow-left" />
        <div className="inventory-voucher-glow inventory-voucher-glow-right" />

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

        <Row gutter={[10, 10]} className="inventory-voucher-quick-grid">
          {infoCards.map((item) => (
            <Col xs={12} md={6} key={item.label}>
              <div className="inventory-voucher-quick-card">
                <Text className="inventory-voucher-quick-label">{item.label}</Text>
                <div className="inventory-voucher-quick-value">{item.value}</div>
              </div>
            </Col>
          ))}
        </Row>

        <Row gutter={[12, 12]} className="inventory-voucher-modal-info-grid">
          <Col xs={24} md={12}>
            <Card size="small" className="inventory-voucher-modal-info-card" title="Thông tin người thao tác">
              <p><Text strong>Người tạo:</Text> {createdByName}</p>
              <p><Text strong>Người xác nhận:</Text> {confirmedByName}</p>
              <p><Text strong>Người hủy:</Text> {cancelledByName}</p>
              <p><Text strong>Email:</Text> {voucher?.performedBy?.email || '--'}</p>
              <p><Text strong>Ngày tạo:</Text> {formatDateTime(voucher?.createdAt)}</p>
            </Card>
          </Col>

          <Col xs={24} md={12}>
            <Card size="small" className="inventory-voucher-modal-info-card" title="Thông tin nhà cung cấp">
              <p><Text strong>Nhà cung cấp:</Text> {voucher?.supplierName || '--'}</p>
              <p><Text strong>Liên hệ:</Text> {voucher?.supplierContact || '--'}</p>
              <p><Text strong>Xác nhận lúc:</Text> {voucher?.confirmedAt ? formatDateTime(voucher?.confirmedAt) : '--'}</p>
            </Card>
          </Col>
        </Row>

        <Card size="small" className="inventory-voucher-modal-note-card" title="Ghi chú xử lý">
          {canUpdate ? (
            <Space orientation="vertical" style={{ width: '100%' }} size={8}>
              <Input.TextArea
                rows={4}
                value={editableNote}
                onChange={(event) => setEditableNote(event.target.value)}
                placeholder="Nhập ghi chú cho phiếu"
              />
              <Button
                type="default"
                onClick={() => onSaveNote?.(voucher, editableNote)}
                loading={actionLoading === 'note'}
              >
                Cập nhật ghi chú
              </Button>
            </Space>
          ) : voucher?.note ? (
            <Text>{voucher.note}</Text>
          ) : (
            <Text type="secondary">Không có ghi chú cho phiếu này.</Text>
          )}
        </Card>

        <Divider orientation="left">Timeline xử lý</Divider>
        <Card size="small" className="inventory-voucher-modal-timeline-card">
          <Timeline items={timelineItems} />
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
      </div>
    </ModalComponent>
  )
}

export default VoucherDetailModal
