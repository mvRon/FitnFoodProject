import styled, { createGlobalStyle } from 'styled-components';

export const OrderGlobalStyle = createGlobalStyle`
  .admin-order-page {
    --admin-emerald: #10B981;
    --admin-blue: #0284C7;
    --admin-orange: #F59E0B;
    --admin-bg: #F8FAFC;
    --admin-text: #1E293B;
    --admin-border: rgba(15, 23, 42, 0.1);
    color: var(--admin-text);
    padding: 18px;
    animation: adminOrderFadeIn 0.35s ease;
  }

  .admin-order-page .ant-table {
    font-size: 14px;
  }

  .admin-order-page .ant-table-tbody > tr:hover > td {
    background: rgba(2, 132, 199, 0.05) !important;
  }

  .admin-order-table-wrap {
    border: 1px solid rgba(2, 132, 199, 0.16);
    border-radius: 16px;
    padding: 12px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.96), rgba(248, 250, 252, 0.96));
    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
    overflow: hidden;
  }

  .admin-order-table-wrap .ant-table-wrapper {
    overflow: auto;
    border-radius: 12px;
  }

  .admin-order-table-wrap .ant-table-thead > tr > th {
    color: #0369A1;
    background: rgba(2, 132, 199, 0.08);
    font-weight: 700;
    font-size: 14px;
  }

  .admin-order-filter-dropdown {
    padding: 10px;
    border-radius: 12px;
    border: 1px solid rgba(2, 132, 199, 0.16);
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.98));
    min-width: 250px;
  }

  .admin-order-filter-input {
    margin-bottom: 8px;
    display: block;
    border-radius: 8px;
  }

  .admin-order-filter-btn {
    width: 90px;
    border-color: rgba(2, 132, 199, 0.28);
    color: #0369A1;
  }

  .admin-order-filter-btn-primary {
    border: none !important;
    color: #fff !important;
    background: linear-gradient(135deg, #10B981, #0284C7) !important;
  }

  .admin-order-form .ant-form-item {
    margin-bottom: 14px;
  }

  .admin-order-form .ant-form-item-label > label {
    font-weight: 600;
    color: #1E293B;
    font-size: 14px;
  }

  .admin-order-form .ant-input,
  .admin-order-form .ant-select-selector {
    border-radius: 10px !important;
    border-color: rgba(2, 132, 199, 0.22) !important;
  }

  .admin-order-form .ant-input:focus,
  .admin-order-form .ant-input-focused,
  .admin-order-form .ant-select-focused .ant-select-selector {
    border-color: #0284C7 !important;
    box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.16) !important;
  }

  .admin-order-action-btn {
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

  .admin-order-action-btn:hover {
    border-color: rgba(2, 132, 199, 0.5) !important;
    color: #0C4A6E !important;
    transform: translateY(-1px);
  }

  .admin-order-action-btn-danger {
    border-color: rgba(245, 158, 11, 0.5) !important;
    color: #B45309 !important;
  }

  .admin-order-action-btn-danger:hover {
    border-color: #F59E0B !important;
    color: #92400E !important;
  }

  .admin-order-modal .ant-modal-content {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(16, 185, 129, 0.18);
  }

  .admin-order-modal .ant-modal-header {
    background: linear-gradient(130deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.12));
    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
  }

  .admin-order-submit-btn {
    background: linear-gradient(135deg, #10B981, #0284C7) !important;
    border: none !important;
    box-shadow: 0 12px 22px rgba(16, 185, 129, 0.24);
    min-height: 40px;
    border-radius: 10px;
    font-weight: 600;
  }

  .admin-order-modal .ant-modal-footer {
    border-top: 1px solid rgba(2, 132, 199, 0.12);
    padding: 14px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .admin-order-modal .ant-modal-footer .ant-btn {
    height: 38px;
    border-radius: 10px;
    font-weight: 600;
  }

  .admin-order-modal .ant-modal-footer .ant-btn-default {
    border-color: rgba(2, 132, 199, 0.28);
    color: #0369A1;
  }

  .admin-order-modal .ant-modal-footer .ant-btn-primary {
    border: none;
    background: linear-gradient(135deg, #10B981, #0284C7);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
  }

  .admin-order-item-list {
    margin-top: 24px;
    border-top: 1px dashed rgba(2, 132, 199, 0.22);
    padding-top: 16px;
  }

  .admin-order-item-list ul {
    padding-left: 0;
    list-style: none;
    margin: 12px 0 0;
    display: grid;
    gap: 10px;
  }

  .admin-order-item-list li {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
    border-radius: 12px;
    border: 1px solid rgba(16, 185, 129, 0.14);
    background: linear-gradient(130deg, rgba(16, 185, 129, 0.06), rgba(2, 132, 199, 0.04));
  }

  .admin-order-item-image {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 10px;
    cursor: pointer;
    border: 2px solid rgba(2, 132, 199, 0.18);
    transition: transform 0.2s ease;
  }

  .admin-order-item-image:hover {
    transform: translateY(-2px);
  }

  @keyframes adminOrderFadeIn {
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
    .admin-order-page {
      padding: 10px;
    }
  }
`;

export const OrderPageContainer = styled.div`
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(255, 255, 255, 0.86));
`;

export const WrapperHeader = styled.h2`
  font-size: 24px;
  font-weight: 700;
  margin-bottom: 14px;
  color: #0F766E;
  letter-spacing: 0.2px;
`;
