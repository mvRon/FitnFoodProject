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
  }

  .admin-order-page .admin-order-search-input {
    max-width: 460px;
    border-radius: 12px;
    border-color: rgba(2, 132, 199, 0.3);
    min-height: 42px;
  }

  .admin-order-page .admin-order-search-input:hover,
  .admin-order-page .admin-order-search-input:focus,
  .admin-order-page .admin-order-search-input.ant-input-affix-wrapper-focused {
    border-color: #0284C7;
    box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
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

  .admin-order-create-modal .ant-modal-body {
    background:
      radial-gradient(circle at 8% 0%, rgba(16, 185, 129, 0.09), transparent 24%),
      radial-gradient(circle at 92% 8%, rgba(2, 132, 199, 0.08), transparent 24%),
      linear-gradient(180deg, rgba(248, 250, 252, 0.86), rgba(255, 255, 255, 0.96));
    border-bottom-left-radius: 18px;
    border-bottom-right-radius: 18px;
    padding-top: 14px;
  }

  .admin-order-create-hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    border: 1px solid rgba(2, 132, 199, 0.16);
    border-radius: 14px;
    padding: 12px 14px;
    margin-bottom: 10px;
    background: linear-gradient(130deg, rgba(16, 185, 129, 0.1), rgba(2, 132, 199, 0.08), rgba(255, 255, 255, 0.96));
  }

  .admin-order-create-hero h3 {
    margin: 0;
    font-size: 17px;
    color: #0F766E;
    font-weight: 700;
  }

  .admin-order-create-hero p {
    margin: 4px 0 0;
    color: rgba(30, 41, 59, 0.7);
    font-size: 13px;
  }

  .admin-order-create-total-box {
    text-align: right;
    min-width: 210px;
  }

  .admin-order-create-total-box span {
    display: block;
    color: rgba(30, 41, 59, 0.72);
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  .admin-order-create-total-box strong {
    font-size: 22px;
    color: #0F766E;
  }

  .admin-order-create-item-row {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    margin-bottom: 10px;
    border-radius: 12px;
    border: 1px solid rgba(2, 132, 199, 0.16);
    padding: 10px;
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
  }

  .admin-order-create-summary {
    margin-bottom: 12px;
    border-radius: 12px;
    border: 1px dashed rgba(2, 132, 199, 0.28);
    background: rgba(255, 255, 255, 0.85);
    padding: 10px 12px;
    display: grid;
    gap: 8px;
  }

  .admin-order-create-summary > div {
    display: flex;
    justify-content: space-between;
    font-size: 14px;
    color: #1E293B;
  }

  .admin-order-create-summary > div.total {
    border-top: 1px solid rgba(2, 132, 199, 0.18);
    padding-top: 8px;
  }

  .admin-order-create-summary > div.total strong {
    color: #0F766E;
    font-size: 16px;
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

    .admin-order-create-hero {
      flex-direction: column;
      align-items: flex-start;
    }

    .admin-order-create-total-box {
      text-align: left;
      min-width: unset;
    }

    .admin-order-create-item-row {
      flex-direction: column;
    }
  }
`;

export const OrderPageContainer = styled.div`
  background: transparent;
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
	grid-template-columns: repeat(4, minmax(0, 1fr));
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

export const FilterBarShell = styled.div`
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
