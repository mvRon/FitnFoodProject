import { createGlobalStyle } from 'styled-components'

export const AdminInventoryGlobalStyle = createGlobalStyle`
	.admin-inventory-page {
		--admin-emerald: #10B981;
		--admin-blue: #0284C7;
		--admin-orange: #F59E0B;
		--admin-bg: #F8FAFC;
		--admin-text: #1E293B;
		color: var(--admin-text);
		padding: 18px;
		background:
			radial-gradient(circle at 6% 0%, rgba(16, 185, 129, 0.1), transparent 24%),
			radial-gradient(circle at 96% 12%, rgba(2, 132, 199, 0.1), transparent 24%),
			radial-gradient(circle at 60% 100%, rgba(245, 158, 11, 0.08), transparent 28%),
			var(--admin-bg);
		animation: adminInventoryFadeIn 0.4s ease;
	}

	.admin-inventory-title {
		margin: 0 !important;
		color: #0F766E !important;
		font-weight: 800 !important;
		letter-spacing: 0.2px;
	}

	.admin-inventory-subtitle {
		display: inline-block;
		margin-top: 6px;
		color: rgba(30, 41, 59, 0.74);
	}

	.admin-inventory-hero {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 12px;
		margin-bottom: 14px;
		padding: 16px;
		border-radius: 16px;
		border: 1px solid rgba(2, 132, 199, 0.22);
		background: linear-gradient(120deg, rgba(255, 255, 255, 0.96), rgba(240, 249, 255, 0.95));
		box-shadow: 0 16px 26px rgba(15, 23, 42, 0.07);
	}

	.admin-inventory-stat-card {
		border-radius: 14px !important;
		border: 1px solid rgba(2, 132, 199, 0.16) !important;
		box-shadow: 0 12px 20px rgba(15, 23, 42, 0.06);
		background: linear-gradient(145deg, rgba(255, 255, 255, 0.94), rgba(248, 250, 252, 0.96));
		overflow: hidden;
	}

	.admin-inventory-stat-card .ant-statistic-title {
		color: rgba(30, 41, 59, 0.7) !important;
		font-weight: 600;
	}

	.admin-inventory-stat-card .ant-statistic-content {
		color: #0369A1 !important;
		font-size: 26px;
		font-weight: 700;
	}

	.admin-inventory-stat-card-emerald {
		background: linear-gradient(145deg, rgba(16, 185, 129, 0.16), rgba(255, 255, 255, 0.96));
	}

	.admin-inventory-stat-card-orange {
		background: linear-gradient(145deg, rgba(245, 158, 11, 0.16), rgba(255, 255, 255, 0.96));
	}

	.admin-inventory-stat-card-blue {
		background: linear-gradient(145deg, rgba(2, 132, 199, 0.16), rgba(255, 255, 255, 0.96));
	}

	.admin-inventory-section-gap {
		margin-top: 14px;
	}

	.admin-inventory-panel {
		border-radius: 16px !important;
		border: 1px solid rgba(16, 185, 129, 0.16) !important;
		box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
		background: linear-gradient(175deg, rgba(255, 255, 255, 0.97), rgba(248, 250, 252, 0.94)) !important;
	}

	.admin-inventory-panel .ant-card-head {
		border-bottom: 1px solid rgba(2, 132, 199, 0.14);
		background: linear-gradient(130deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.06));
		border-top-left-radius: 16px;
		border-top-right-radius: 16px;
	}

	.admin-inventory-panel .ant-card-head-title {
		color: #0369A1;
		font-weight: 700;
	}

	.admin-inventory-panel .ant-table-thead > tr > th {
		color: #0369A1;
		background: rgba(2, 132, 199, 0.08);
		font-weight: 700;
	}

	.admin-inventory-panel .ant-table-tbody > tr:hover > td {
		background: rgba(16, 185, 129, 0.08) !important;
	}

	.admin-inventory-search-row {
		margin-bottom: 12px;
	}

	.admin-inventory-panel .ant-select-selector,
	.admin-inventory-panel .ant-input,
	.admin-inventory-panel .ant-input-number,
	.admin-inventory-panel .ant-picker {
		border-radius: 10px !important;
		border-color: rgba(2, 132, 199, 0.24) !important;
	}

	.admin-inventory-panel .ant-select-focused .ant-select-selector,
	.admin-inventory-panel .ant-input:focus,
	.admin-inventory-panel .ant-input-focused,
	.admin-inventory-panel .ant-picker-focused {
		border-color: #0284C7 !important;
		box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.15) !important;
	}

	.admin-inventory-btn-primary {
		border: none !important;
		border-radius: 10px !important;
		min-height: 40px !important;
		color: #fff !important;
		font-weight: 700 !important;
		background: linear-gradient(135deg, #10B981, #0284C7) !important;
		box-shadow: 0 10px 18px rgba(16, 185, 129, 0.25);
	}

	.admin-inventory-btn-outline {
		border-radius: 10px !important;
		min-height: 40px !important;
		border-color: rgba(2, 132, 199, 0.35) !important;
		color: #0369A1 !important;
		font-weight: 600 !important;
		background: #fff !important;
	}

	.admin-inventory-btn-outline:hover {
		border-color: rgba(16, 185, 129, 0.55) !important;
		color: #0F766E !important;
		transform: translateY(-1px);
	}

	.admin-inventory-list-wrap {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin-bottom: 12px;
		border: 1px dashed rgba(2, 132, 199, 0.3);
		border-radius: 12px;
		padding: 10px;
		background: rgba(255, 255, 255, 0.75);
	}

	.admin-inventory-line-item {
		width: 100%;
		flex-wrap: wrap;
		border-radius: 10px;
		border: 1px solid rgba(16, 185, 129, 0.16);
		padding: 8px;
		background: linear-gradient(145deg, rgba(16, 185, 129, 0.06), rgba(2, 132, 199, 0.03));
	}

	.admin-inventory-voucher-detail {
		margin-top: 14px;
		border: 1px solid rgba(2, 132, 199, 0.2);
		border-radius: 14px;
		padding: 12px;
		background: linear-gradient(170deg, rgba(240, 249, 255, 0.8), rgba(255, 255, 255, 0.95));
	}

	.admin-inventory-voucher-head {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		margin-bottom: 8px;
	}

	.admin-inventory-link-btn {
		padding: 0 !important;
		color: #0284C7 !important;
		font-weight: 600;
	}

	.admin-inventory-link-btn:hover {
		color: #0F766E !important;
	}

	.admin-inventory-voucher-modal .ant-modal-content {
		border-radius: 18px;
		overflow: hidden;
		border: 1px solid rgba(16, 185, 129, 0.18);
	}

	.admin-inventory-voucher-modal .ant-modal-header {
		background: linear-gradient(130deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.12));
		border-bottom: 1px solid rgba(2, 132, 199, 0.12);
	}

	.admin-inventory-voucher-modal .ant-modal-title {
		color: #0F766E;
		font-weight: 700;
	}

	.inventory-voucher-modal-hero {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		gap: 12px;
		padding: 14px;
		border-radius: 14px;
		border: 1px solid rgba(16, 185, 129, 0.22);
		background: linear-gradient(130deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08), rgba(255, 255, 255, 0.96));
	}

	.inventory-voucher-modal-eyebrow {
		display: inline-block;
		font-size: 12px;
		color: rgba(30, 41, 59, 0.72);
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.inventory-voucher-modal-code {
		margin: 4px 0 8px !important;
		color: #0369A1 !important;
	}

	.inventory-voucher-modal-badges {
		display: flex;
		gap: 6px;
		flex-wrap: wrap;
	}

	.inventory-voucher-modal-total {
		text-align: right;
	}

	.inventory-voucher-modal-total-number {
		margin-top: 6px;
		font-size: 24px;
		font-weight: 700;
		color: #0F766E;
	}

	.inventory-voucher-modal-info-grid {
		margin-top: 12px;
	}

	.inventory-voucher-modal-info-card,
	.inventory-voucher-modal-note-card,
	.inventory-voucher-modal-timeline-card {
		border-radius: 12px !important;
		border: 1px solid rgba(2, 132, 199, 0.16) !important;
		background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 250, 252, 0.96));
	}

	.inventory-voucher-modal-info-card .ant-card-head,
	.inventory-voucher-modal-note-card .ant-card-head,
	.inventory-voucher-modal-timeline-card .ant-card-head {
		min-height: 42px;
		background: rgba(2, 132, 199, 0.05);
		border-bottom: 1px solid rgba(2, 132, 199, 0.12);
	}

	.inventory-voucher-modal-info-card .ant-card-head-title,
	.inventory-voucher-modal-note-card .ant-card-head-title,
	.inventory-voucher-modal-timeline-card .ant-card-head-title {
		color: #0369A1;
		font-weight: 700;
	}

	.inventory-voucher-modal-info-card p {
		margin: 0 0 8px;
	}

	.inventory-voucher-modal-note-card {
		margin-top: 12px;
	}

	.inventory-voucher-modal-timeline-card .ant-timeline {
		margin-top: 6px;
	}

	.inventory-voucher-modal-items-table .ant-table-thead > tr > th {
		background: rgba(2, 132, 199, 0.08);
		color: #0369A1;
	}

	.inventory-voucher-modal-items-table .ant-table-summary {
		background: rgba(16, 185, 129, 0.08);
	}

	.admin-inventory-voucher-modal .ant-descriptions-item-label {
		font-weight: 600;
		color: #0369A1;
	}

	.admin-inventory-voucher-modal .ant-timeline-item-head {
		box-shadow: 0 0 0 2px rgba(2, 132, 199, 0.12);
	}

	@keyframes adminInventoryFadeIn {
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
		.admin-inventory-page {
			padding: 10px;
		}

		.admin-inventory-hero {
			flex-direction: column;
			align-items: flex-start;
		}
	}

	@media (max-width: 576px) {
		.admin-inventory-title {
			font-size: 22px !important;
		}

		.admin-inventory-line-item {
			flex-direction: column;
			align-items: stretch;
		}

		.inventory-voucher-modal-hero {
			flex-direction: column;
		}

		.inventory-voucher-modal-total {
			text-align: left;
		}

		.inventory-voucher-modal-total-number {
			font-size: 20px;
		}
	}
`
