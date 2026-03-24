import styled, { createGlobalStyle } from 'styled-components';

export const AdminPageShell = styled.div`
	--admin-emerald: #10B981;
	--admin-blue: #0284C7;
	--admin-orange: #F59E0B;
	--admin-bg: #F8FAFC;
	--admin-text: #1E293B;
	--admin-border: rgba(15, 23, 42, 0.1);
	background:
		radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.16), transparent 28%),
		radial-gradient(circle at 100% 20%, rgba(2, 132, 199, 0.14), transparent 30%),
		radial-gradient(circle at 50% 100%, rgba(245, 158, 11, 0.13), transparent 34%),
		var(--admin-bg);
	color: var(--admin-text);
`;

export const AdminPageGlobalStyle = createGlobalStyle`
	.adminpage-main {
		display: flex;
		min-height: 100vh;
	}
	.adminpage-brand-card {
		width: 256px;
		margin: 14px 0 14px;
		padding: 16px;
		border-radius: 16px;
		background: linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(2, 132, 199, 0.14));
		border: 1px solid rgba(16, 185, 129, 0.28);
		box-shadow: 0 12px 24px rgba(2, 132, 199, 0.08);
		animation: adminFadeIn 0.45s ease;
	}
	.adminpage-brand-title {
		font-size: 18px;
		font-weight: 700;
		color: #0F766E;
		letter-spacing: 0.3px;
	}
	.adminpage-brand-subtitle {
		margin-top: 4px;
		font-size: 13px;
		color: rgba(30, 41, 59, 0.82);
	}
	.adminpage-menu-wrapper {
		min-width: 0;
		padding: 10px 12px;
	}
	.adminpage-menu {
		width: 256px;
		box-shadow: 1px 1px 2px #ccc;
		height: calc(100vh - 118px);
		max-width: 100vw;
		border-radius: 16px;
		border: 1px solid var(--admin-border);
		background: rgba(255, 255, 255, 0.82);
		backdrop-filter: blur(6px);
	}
	.adminpage-menu .ant-menu-item-selected {
		background: linear-gradient(90deg, rgba(16, 185, 129, 0.2), rgba(2, 132, 199, 0.2)) !important;
		color: #0369A1 !important;
		font-weight: 600;
	}
	.adminpage-menu .ant-menu-submenu-title:hover,
	.adminpage-menu .ant-menu-item:hover {
		color: #0F766E !important;
	}
	.adminpage-content-wrapper {
		flex: 1;
		padding: 20px;
	}
	.adminpage-content-head {
		padding: 18px 22px;
		border-radius: 18px;
		border: 1px solid rgba(2, 132, 199, 0.2);
		background: linear-gradient(120deg, rgba(255, 255, 255, 0.95), rgba(237, 249, 255, 0.92));
		box-shadow: 0 16px 34px rgba(2, 132, 199, 0.08);
	}
	.adminpage-content-head h2 {
		margin: 0;
		font-size: 24px;
		color: #0F766E;
	}
	.adminpage-content-head p {
		margin: 7px 0 0;
		color: rgba(30, 41, 59, 0.8);
		font-size: 14px;
	}
	.adminpage-content-card {
		margin-top: 16px;
		border-radius: 18px;
		border: 1px solid rgba(16, 185, 129, 0.16);
		background: rgba(255, 255, 255, 0.88);
		box-shadow: 0 18px 40px rgba(15, 23, 42, 0.08);
		backdrop-filter: blur(4px);
		overflow: hidden;
		animation: adminFadeIn 0.5s ease;
	}
	@keyframes adminFadeIn {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}
	@media (max-width: 1024px) {
		.adminpage-main {
			flex-direction: column;
			min-height: unset;
		}
		.adminpage-menu-wrapper {
			width: 100%;
			max-width: 100vw;
		}
		.adminpage-brand-card {
			width: 100%;
			margin-bottom: 10px;
		}
		.adminpage-menu {
			width: 100%;
			max-width: 100vw;
			height: auto;
			box-shadow: none;
		}
		.adminpage-content-wrapper {
			padding: 10px 4px;
		}
	}
	@media (max-width: 600px) {
		.adminpage-content-wrapper {
			padding: 4px 2px;
		}
		.adminpage-content-head {
			padding: 14px;
		}
		.adminpage-content-head h2 {
			font-size: 20px;
		}
		.adminpage-menu {
			font-size: 15px;
		}
	}
`;
