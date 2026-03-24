import { Upload } from "antd";
import styled, { createGlobalStyle } from "styled-components";


export const AdminProductPageGlobalStyle = createGlobalStyle`
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
        margin-top: 10px;
    }

    .admin-product-page .admin-product-add-btn {
        height: 50px;
        border-radius: 6px;
        border-style: dashed;
        border-color: rgba(16, 185, 129, 0.54) !important;
        color: #0F766E !important;
        background: linear-gradient(120deg, rgba(16, 185, 129, 0.2), rgba(2, 132, 199, 0.1));
        font-weight: 600;
        transition: all 0.25s ease;
    }

    .admin-product-page .admin-product-add-btn .anticon {
        font-size: 20px;
    }

    .admin-product-page .admin-product-add-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 22px rgba(2, 132, 199, 0.16);
    }

    .admin-product-page .admin-product-table-wrap {
        margin-top: 20px;
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

    .admin-product-page .admin-product-filter-dropdown {
        padding: 8px;
    }

    .admin-product-page .admin-product-filter-input {
        margin-bottom: 8px;
        display: block;
    }

    .admin-product-page .admin-product-filter-btn {
        width: 90px;
    }

    .admin-product-page .admin-product-filter-icon-active {
        color: #1677ff;
    }

    .admin-product-page .admin-product-tag {
        border-radius: 999px;
    }

    .admin-product-page .admin-product-tag-parent {
        background: rgba(245, 158, 11, 0.14);
        color: #B45309;
        border-color: rgba(245, 158, 11, 0.3);
    }

    .admin-product-page .admin-product-tag-child {
        background: rgba(2, 132, 199, 0.12);
        color: #0369A1;
        border-color: rgba(2, 132, 199, 0.3);
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

    .admin-product-page .admin-product-modal-title {
        text-align: center;
        font-weight: 600;
        font-size: 22px;
    }

    .admin-product-page .admin-product-form,
    .admin-product-modal .admin-product-form {
        max-width: 600px;
    }

    .admin-product-page .admin-product-form .ant-form-item,
    .admin-product-modal .admin-product-form .ant-form-item {
        margin-bottom: 16px;
    }

    .admin-product-page .admin-product-form .ant-input-number,
    .admin-product-modal .admin-product-form .ant-input-number {
        width: 100%;
    }

    .admin-product-page .admin-product-preview-image,
    .admin-product-modal .admin-product-preview-image,
    .admin-product-page .admin-product-thumb-image {
        height: 60px;
        width: 60px;
        object-fit: cover;
    }

    .admin-product-page .admin-product-preview-image,
    .admin-product-modal .admin-product-preview-image {
        border-radius: 50%;
        margin-left: 10px;
    }

    .admin-product-page .admin-product-thumb-image {
        border-radius: 50%;
        margin-left: 10px;
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
`;



export const WrapperHeader = styled.h1`
    color: #000;
    font-size: 14px;
`

export const WrapperUploadFile = styled(Upload)`
    & .ant-upload.ant-upload-select.ant-upload-select-picture-card {
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }
    & .ant-upload-list-item-container {
        display: none;
    }
`