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

    .admin-discount-page .admin-discount-refresh-btn {
        border-radius: 10px;
        min-height: 38px;
        color: #B45309;
        border-color: rgba(245, 158, 11, 0.5);
        background: rgba(245, 158, 11, 0.08);
        font-weight: 600;
    }

    .admin-discount-page .admin-discount-refresh-btn:hover {
        color: #92400E !important;
        border-color: #F59E0B !important;
    }

    .admin-discount-page .admin-discount-search-input {
        max-width: 460px;
        border-radius: 12px;
        border-color: rgba(2, 132, 199, 0.3);
        min-height: 42px;
    }

    .admin-discount-page .admin-discount-search-input:hover,
    .admin-discount-page .admin-discount-search-input:focus,
    .admin-discount-page .admin-discount-search-input.ant-input-affix-wrapper-focused {
        border-color: #0284C7;
        box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
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

export const DashboardShell = styled.div`
	display: flex;
	flex-direction: column;
	gap: 16px;
`

export const HeaderCard = styled.div`
	position: relative;
	overflow: hidden;
	border-radius: 22px;
	padding: 22px;
	border: 1px solid rgba(2, 132, 199, 0.2);
	background:
		radial-gradient(circle at 10% -10%, rgba(16, 185, 129, 0.28), transparent 42%),
		radial-gradient(circle at 90% 0%, rgba(245, 158, 11, 0.2), transparent 42%),
		linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.08));
`

export const HeaderTitle = styled.h2`
	margin: 0;
	display: inline-flex;
	align-items: center;
	gap: 10px;
	color: #0F766E;
	font-size: 24px;
	font-weight: 800;
`

export const HeaderDesc = styled.p`
	margin: 8px 0 0;
	color: #334155;
	max-width: 760px;
`

export const StatsGrid = styled.div`
	margin-top: 18px;
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;

	@media (max-width: 992px) {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}

	@media (max-width: 560px) {
		grid-template-columns: repeat(1, minmax(0, 1fr));
	}
`

export const StatCard = styled.div`
	border-radius: 14px;
	border: 1px solid rgba(2, 132, 199, 0.2);
	background: rgba(255, 255, 255, 0.78);
	backdrop-filter: blur(4px);
	padding: 14px;
`

export const StatLabel = styled.div`
	color: #0369A1;
	font-size: 13px;
	font-weight: 600;
`

export const StatValue = styled.div`
	margin-top: 6px;
	color: #1E293B;
	font-size: 28px;
	font-weight: 800;
`

export const FilterBar = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	gap: 12px;
	flex-wrap: wrap;
	border-radius: 16px;
	padding: 14px;
	border: 1px solid rgba(2, 132, 199, 0.15);
	background: #fff;
`