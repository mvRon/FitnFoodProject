import { Upload } from "antd";
import styled, { createGlobalStyle } from "styled-components";

export const CategoryGlobalStyle = createGlobalStyle`
  .category-parent-row {
    background-color: #fffbe6 !important;
  }
  .category-parent-tag {
    margin-left: 8px;
    background: #faad14;
    color: #fff;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 1px;
  }
`;

export const AdminCategoryPageGlobalStyle = createGlobalStyle`
  .admin-category-page {
    --admin-emerald: #10B981;
    --admin-blue: #0284C7;
    --admin-orange: #F59E0B;
    --admin-bg: #F8FAFC;
    --admin-text: #1E293B;
    color: var(--admin-text);
    padding: 18px;
  }

  .admin-category-name-child {
    padding-left: 32px;
    color: #0284C7;
    font-weight: 600;
  }

  .admin-category-name-parent {
    color: #F59E0B;
    font-weight: 700;
  }

  .admin-category-star {
    margin-right: 6px;
  }

  .admin-category-parent-tag {
    background: rgba(2, 132, 199, 0.12) !important;
    color: #0369A1 !important;
    border-color: rgba(2, 132, 199, 0.3) !important;
    border-radius: 999px;
  }

  .admin-category-root-tag {
    background: rgba(245, 158, 11, 0.14) !important;
    color: #B45309 !important;
    border-color: rgba(245, 158, 11, 0.3) !important;
    border-radius: 999px;
  }

  .admin-category-page .admin-category-toolbar {
    display: flex;
    justify-content: flex-end;
    margin-top: 10px;
  }

  .admin-category-page .admin-category-add-btn {
    height: 50px;
    border-radius: 6px;
    border-style: dashed;
    border-color: rgba(16, 185, 129, 0.5) !important;
    color: #0F766E !important;
    background: linear-gradient(140deg, rgba(16, 185, 129, 0.18), rgba(2, 132, 199, 0.08));
    font-weight: 600;
    transition: all 0.25s ease;
  }

  .admin-category-page .admin-category-add-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 18px rgba(2, 132, 199, 0.16);
  }

  .admin-category-page .admin-category-table-wrap {
    margin-top: 20px;
    border: 1px solid rgba(2, 132, 199, 0.16);
    border-radius: 16px;
    padding: 12px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.95), rgba(248, 250, 252, 0.95));
    box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
    animation: adminCategoryFadeIn 0.35s ease;
  }

  .admin-category-page .admin-category-table-wrap .ant-table-wrapper {
    overflow: auto;
    border-radius: 12px;
  }

  .admin-category-page .admin-category-table-wrap .ant-table-thead > tr > th {
    color: #0369A1;
    background: rgba(2, 132, 199, 0.08);
    font-weight: 700;
  }

  .admin-category-page .admin-category-action-btn {
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

  .admin-category-page .admin-category-action-btn:hover {
    border-color: rgba(2, 132, 199, 0.5) !important;
    color: #0C4A6E !important;
    transform: translateY(-1px);
  }

  .admin-category-page .admin-category-action-btn-danger {
    border-color: rgba(245, 158, 11, 0.5) !important;
    color: #B45309 !important;
  }

  .admin-category-page .admin-category-action-btn-danger:hover {
    border-color: #F59E0B !important;
    color: #92400E !important;
  }

  .admin-category-page .admin-category-submit-btn {
    background: linear-gradient(135deg, #10B981, #0284C7) !important;
    border: none !important;
    box-shadow: 0 12px 22px rgba(16, 185, 129, 0.24);
    min-height: 40px;
    border-radius: 10px;
    font-weight: 600;
  }

  .admin-category-modal .ant-modal-content {
    border-radius: 18px;
    overflow: hidden;
    border: 1px solid rgba(16, 185, 129, 0.18);
  }

  .admin-category-modal .ant-modal-header {
    background: linear-gradient(130deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.12));
    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
  }

  .admin-category-modal .ant-modal-footer {
    border-top: 1px solid rgba(2, 132, 199, 0.12);
    padding: 14px 20px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .admin-category-modal .ant-modal-footer .ant-btn {
    height: 38px;
    border-radius: 10px;
    font-weight: 600;
  }

  .admin-category-modal .ant-modal-footer .ant-btn-default {
    border-color: rgba(2, 132, 199, 0.28);
    color: #0369A1;
  }

  .admin-category-modal .ant-modal-footer .ant-btn-primary {
    border: none;
    background: linear-gradient(135deg, #10B981, #0284C7);
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);
  }

  .admin-category-modal .ant-modal-confirm-btns {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
  }

  .admin-category-modal .admin-common-modal-ok {
    border: none !important;
    border-radius: 10px !important;
    min-height: 38px !important;
    font-weight: 600 !important;
    background: linear-gradient(135deg, #10B981, #0284C7) !important;
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2) !important;
  }

  .admin-category-modal .admin-common-modal-cancel {
    border-radius: 10px !important;
    min-height: 38px !important;
    border-color: rgba(2, 132, 199, 0.4) !important;
    color: #0369A1 !important;
    font-weight: 600 !important;
  }

  @keyframes adminCategoryFadeIn {
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
    .admin-category-page {
      padding: 10px;
    }

    .admin-category-page .admin-category-toolbar {
      justify-content: stretch;
    }

    .admin-category-page .admin-category-add-btn {
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