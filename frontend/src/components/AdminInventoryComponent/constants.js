export const SOURCE_TYPES = [
  { value: 'SUPPLIER', label: 'Nhà cung cấp' },
  { value: 'RETURN', label: 'Nhập trả hàng' },
  { value: 'ADJUSTMENT', label: 'Điều chỉnh' },
  { value: 'PRODUCTION', label: 'Sản xuất' },
  { value: 'OTHER', label: 'Khác' },
]

export const EXPORT_REASONS = [
  { value: 'SALE', label: 'Bán hàng' },
  { value: 'ORDER_CANCEL', label: 'Hủy đơn' },
  { value: 'RETURN_SUPPLIER', label: 'Trả nhà cung cấp' },
  { value: 'DAMAGE', label: 'Hư hỏng' },
  { value: 'LOSS', label: 'Thất thoát' },
  { value: 'ADJUSTMENT', label: 'Điều chỉnh' },
  { value: 'OTHER', label: 'Khác' },
]

export const TRANSACTION_TYPE_LABEL = {
  IMPORT: 'Nhập kho',
  EXPORT: 'Xuất kho',
}

export const VOUCHER_STATUS_LABEL = {
  draft: 'Nháp',
  pending: 'Chờ xử lý',
  confirmed: 'Đã xác nhận',
  cancelled: 'Đã hủy',
}

export const ALERT_TAG = {
  NEGATIVE_STOCK: { color: 'red', label: 'Âm kho' },
  OUT_OF_STOCK: { color: 'red', label: 'Hết hàng' },
  LOW_STOCK: { color: 'orange', label: 'Sắp hết' },
  SLOW_MOVING: { color: 'blue', label: 'Chậm luân chuyển' },
  STOCK_DISCREPANCY: { color: 'magenta', label: 'Lệch kiểm kê' },
}
