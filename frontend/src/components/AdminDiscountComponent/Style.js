// frontend/src/components/AdminDiscountComponent/style.js
import styled, { createGlobalStyle } from 'styled-components';

export const AdminDiscountGlobalStyle = createGlobalStyle`
    .admin-discount-page {
        color: #1E293B;
    }

    .admin-discount-toolbar {
        margin-top: 10px;
        display: flex;
        justify-content: flex-end;
    }

    .admin-discount-add-btn {
        min-height: 48px;
        border-radius: 12px;
        border-style: dashed;
        border-color: rgba(16, 185, 129, 0.5) !important;
        color: #0F766E !important;
        background: linear-gradient(130deg, rgba(16, 185, 129, 0.16), rgba(2, 132, 199, 0.1));
        font-weight: 700;
        transition: all 0.25s ease;
    }

    .admin-discount-add-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 22px rgba(2, 132, 199, 0.16);
    }

    .admin-discount-add-btn .anticon {
        font-size: 18px;
    }

    .admin-discount-table-wrap {
        margin-top: 18px;
        border: 1px solid rgba(2, 132, 199, 0.18);
        border-radius: 16px;
        padding: 12px;
        background: linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,250,252,0.96));
        box-shadow: 0 14px 28px rgba(30, 41, 59, 0.08);
    }

    .admin-discount-table-wrap .ant-table-wrapper {
        overflow: auto;
        border-radius: 12px;
    }

    .admin-discount-table-wrap .ant-table-thead > tr > th {
        color: #0369A1;
        background: rgba(2, 132, 199, 0.08);
        font-weight: 700;
    }
    
    .admin-discount-table-wrap .ant-table-tbody > tr > td {
        transition: background 0.2s ease, box-shadow 0.2s ease;
    }

    .admin-discount-table-wrap .ant-table-tbody > tr:hover > td {
        background: rgba(16, 185, 129, 0.10) !important;
    }

    .admin-discount-table-wrap .ant-table-tbody > tr:hover > td:first-child {
        box-shadow: inset 4px 0 0 #10B981;
    }

    .admin-discount-action-btn {
        width: 36px;
        height: 36px;
        border-radius: 10px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        border: 1px solid rgba(2, 132, 199, 0.28);
        color: #0369A1;
        background: #fff;
        transition: all 0.2s ease;
    }

    .admin-discount-action-btn:hover {
        transform: translateY(-1px);
        border-color: rgba(16, 185, 129, 0.52) !important;
        color: #0F766E !important;
    }

    .admin-discount-action-btn-danger {
        border-color: rgba(245, 158, 11, 0.5) !important;
        color: #B45309 !important;
    }

    .admin-discount-action-btn-danger:hover {
        border-color: #F59E0B !important;
        color: #92400E !important;
    }

    .admin-discount-modal-title {
        text-align: center;
        font-size: 22px;
        font-weight: 700;
    }

    .admin-discount-modal .ant-modal-content {
        border-radius: 18px;
        overflow: hidden;
        border: 1px solid rgba(16, 185, 129, 0.18);
    }

    .admin-discount-modal .ant-modal-header {
        background: linear-gradient(130deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.12));
        border-bottom: 1px solid rgba(2, 132, 199, 0.12);
    }

    .admin-discount-modal .ant-modal-footer {
        border-top: 1px solid rgba(2, 132, 199, 0.12);
        padding: 14px 20px;
        display: flex;
        justify-content: flex-end;
        gap: 10px;
    }

    .admin-discount-modal .ant-modal-footer .ant-btn {
        height: 38px;
        border-radius: 10px;
        font-weight: 600;
    }

    .admin-discount-modal .ant-modal-footer .ant-btn-default {
        border-color: rgba(2, 132, 199, 0.28);
        color: #0369A1;
    }

    .admin-discount-modal .ant-modal-footer .ant-btn-primary {
        border: none;
        background: linear-gradient(135deg, #10B981, #0284C7);
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
    }

    .admin-discount-form .ant-form-item-label > label {
        color: #0369A1;
        font-weight: 600;
    }

    .admin-discount-form .ant-input,
    .admin-discount-form .ant-select-selector,
    .admin-discount-form .ant-picker,
    .admin-discount-form .ant-input-number {
        border-radius: 10px !important;
    }

    .admin-discount-submit-btn {
        background: linear-gradient(135deg, #10B981, #0284C7) !important;
        border: none !important;
        border-radius: 10px;
        font-weight: 700;
        box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
        min-height: 40px;
    }

    .admin-discount-delete-content {
        padding: 12px;
        border: 1px solid rgba(245, 158, 11, 0.28);
        border-radius: 10px;
        background: rgba(245, 158, 11, 0.08);
        color: #92400E;
        font-weight: 600;
    }
`;

export const WrapperHeader = styled.h1`
    color: #1E293B;
    font-size: 22px;
    font-weight: 700;
    text-align: left;
    margin-bottom: 12px;
    @media (max-width: 576px) {
        font-size: 18px;
        text-align: center;
        margin-bottom: 10px;
    }
`;