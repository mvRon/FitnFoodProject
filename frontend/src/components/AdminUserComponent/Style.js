import styled, { createGlobalStyle } from 'styled-components'

export const AdminUserPageGlobalStyle = createGlobalStyle`
	.admin-user-page {
		--admin-emerald: #10B981;
		--admin-blue: #0284C7;
		--admin-orange: #F59E0B;
		--admin-bg: #F8FAFC;
		--admin-text: #1E293B;
		color: var(--admin-text);
	}

	.admin-user-page .admin-user-table-wrap {
		margin-top: 18px;
		border: 1px solid rgba(2, 132, 199, 0.18);
		border-radius: 18px;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.95));
		box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
		overflow: hidden;
		animation: adminUserFadeIn 0.35s ease;
	}

	.admin-user-page .admin-user-table-wrap .ant-table-thead > tr > th {
		background: rgba(2, 132, 199, 0.08);
		color: #0369A1;
		font-weight: 700;
	}

	.admin-user-page .admin-user-table-wrap .ant-table-row:hover > td {
		background: rgba(16, 185, 129, 0.06) !important;
	}

	.admin-user-page .admin-user-search-input {
		max-width: 460px;
		border-radius: 12px;
		border-color: rgba(2, 132, 199, 0.3);
		min-height: 42px;
	}

	.admin-user-page .admin-user-search-input:hover,
	.admin-user-page .admin-user-search-input:focus,
	.admin-user-page .admin-user-search-input.ant-input-affix-wrapper-focused {
		border-color: #0284C7;
		box-shadow: 0 0 0 3px rgba(2, 132, 199, 0.15);
	}

	.admin-user-page .admin-user-filter-btn {
		border-radius: 10px;
		border-color: rgba(2, 132, 199, 0.28);
		color: #0369A1;
		min-height: 38px;
		font-weight: 600;
	}

	.admin-user-page .admin-user-filter-btn.active {
		border: none;
		color: #fff;
		background: linear-gradient(135deg, #10B981, #0284C7);
		box-shadow: 0 10px 20px rgba(2, 132, 199, 0.18);
	}

	.admin-user-page .admin-user-refresh-btn {
		border-radius: 10px;
		min-height: 38px;
		color: #B45309;
		border-color: rgba(245, 158, 11, 0.5);
		background: rgba(245, 158, 11, 0.08);
		font-weight: 600;
	}

	.admin-user-page .admin-user-refresh-btn:hover {
		color: #92400E !important;
		border-color: #F59E0B !important;
	}

	.admin-user-page .admin-user-detail-btn {
		border-radius: 10px;
		border: none;
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(2, 132, 199, 0.16));
		color: #0C4A6E;
		font-weight: 600;
		min-height: 34px;
	}

	.admin-user-page .admin-user-detail-btn:hover {
		transform: translateY(-1px);
		color: #075985 !important;
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.24), rgba(2, 132, 199, 0.22)) !important;
	}

	.admin-user-page .admin-user-edit-btn {
		border-radius: 10px;
		border: 1px solid rgba(245, 158, 11, 0.4);
		background: rgba(245, 158, 11, 0.1);
		color: #B45309;
		font-weight: 600;
		min-height: 34px;
	}

	.admin-user-page .admin-user-edit-btn:hover {
		transform: translateY(-1px);
		border-color: #F59E0B !important;
		color: #92400E !important;
		background: rgba(245, 158, 11, 0.16) !important;
	}

	.admin-user-role-tag,
	.admin-user-verify-tag {
		border-radius: 999px;
		font-weight: 600;
		padding-inline: 10px;
	}

	.admin-user-role-tag.admin {
		background: rgba(2, 132, 199, 0.14);
		border-color: rgba(2, 132, 199, 0.32);
		color: #0369A1;
	}

	.admin-user-role-tag.customer {
		background: rgba(16, 185, 129, 0.14);
		border-color: rgba(16, 185, 129, 0.34);
		color: #047857;
	}

	.admin-user-verify-tag.verified {
		background: rgba(16, 185, 129, 0.14);
		border-color: rgba(16, 185, 129, 0.32);
		color: #047857;
	}

	.admin-user-verify-tag.pending {
		background: rgba(245, 158, 11, 0.16);
		border-color: rgba(245, 158, 11, 0.34);
		color: #B45309;
	}

	.admin-user-detail-drawer .ant-drawer-content-wrapper {
		max-width: 94vw;
	}

	.admin-user-detail-drawer .ant-drawer-header {
		background: linear-gradient(130deg, rgba(16, 185, 129, 0.14), rgba(2, 132, 199, 0.12));
		border-bottom: 1px solid rgba(2, 132, 199, 0.12);
	}

	.admin-user-detail-drawer .ant-drawer-title {
		color: #0C4A6E;
		font-weight: 700;
	}

	.admin-user-edit-modal .ant-modal-content {
		border-radius: 18px;
		overflow: hidden;
		border: 1px solid rgba(2, 132, 199, 0.2);
		box-shadow: 0 18px 38px rgba(15, 23, 42, 0.16);
	}

	.admin-user-edit-modal .ant-modal-header {
		padding: 16px 20px;
		background: linear-gradient(130deg, rgba(16, 185, 129, 0.14), rgba(2, 132, 199, 0.12));
		border-bottom: 1px solid rgba(2, 132, 199, 0.14);
	}

	.admin-user-edit-modal .ant-modal-title {
		color: #0C4A6E;
		font-weight: 800;
	}

	.admin-user-edit-modal .ant-modal-body {
		padding: 18px 20px 10px;
		background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), rgba(255, 255, 255, 0.96));
	}

	.admin-user-edit-modal .ant-modal-footer {
		padding: 14px 20px 18px;
		border-top: 1px solid rgba(2, 132, 199, 0.14);
	}

	.admin-user-edit-modal .ant-modal-footer .ant-btn {
		height: 38px;
		border-radius: 10px;
		font-weight: 600;
	}

	.admin-user-edit-modal .ant-modal-footer .ant-btn-default {
		border-color: rgba(2, 132, 199, 0.32);
		color: #0369A1;
	}

	.admin-user-edit-modal .ant-modal-footer .ant-btn-primary {
		border: none;
		background: linear-gradient(135deg, #10B981, #0284C7);
		box-shadow: 0 10px 20px rgba(2, 132, 199, 0.2);
	}

	.admin-user-edit-form .ant-form-item-label > label {
		color: #0F172A;
		font-weight: 600;
	}

	.admin-user-edit-form .ant-input,
	.admin-user-edit-form .ant-input-affix-wrapper {
		border-radius: 10px;
		border-color: rgba(2, 132, 199, 0.3);
		min-height: 40px;
	}

	.admin-user-edit-form .ant-input:hover,
	.admin-user-edit-form .ant-input:focus,
	.admin-user-edit-form .ant-input-affix-wrapper:hover,
	.admin-user-edit-form .ant-input-affix-wrapper-focused {
		border-color: #0284C7;
		box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.14);
	}

	.admin-user-edit-form .ant-input[disabled] {
		color: #334155;
		background: rgba(148, 163, 184, 0.12);
	}

	.admin-user-edit-form .ant-switch.ant-switch-checked {
		background: #10B981;
	}

	@keyframes adminUserFadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	@media (max-width: 992px) {
		.admin-user-page .admin-user-search-input {
			max-width: 100%;
		}
	}
`

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

export const UserDetailGrid = styled.div`
	display: grid;
	gap: 14px;

	.admin-user-detail-item {
		border-radius: 12px;
		border: 1px solid rgba(2, 132, 199, 0.16);
		background: rgba(248, 250, 252, 0.92);
		padding: 12px;
		display: flex;
		flex-direction: column;
		gap: 6px;
	}
`
