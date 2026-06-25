import styled from 'styled-components';

export const OrderSuccessWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 64px);
    background: #F8FAFC; /* Nền chính Slate 50 */
    padding: 24px;

    .ant-result {
        background: #ffffff;
        padding: 60px 40px;
        border-radius: 16px;
        border: 1px solid rgba(2, 132, 199, 0.1);
        box-shadow: 0 10px 25px rgba(30, 41, 59, 0.05);
        max-width: 600px;
        width: 100%;
        text-align: center;
    }

    .ant-result-icon .anticon {
        font-size: 80px;
        color: #10B981; /* Emerald Green */
    }

    .ant-result-title {
        font-size: 32px;
        font-weight: 800;
        color: #1E293B; /* Slate 800 */
        margin-top: 16px;
        margin-bottom: 12px;
    }

    .ant-result-subtitle {
        font-size: 18px;
        color: #1E293B; /* Slate 800 */
        margin-bottom: 32px;
        max-width: 480px;
        margin-left: auto;
        margin-right: auto;
        line-height: 1.6;
    }

    .ant-result-extra {
        margin-top: 32px;
        display: flex;
        gap: 16px;
        justify-content: center;
        flex-wrap: wrap;
    }

    /* Nút CTA - Vitamin Orange */
    .ant-btn-primary {
        background-color: #F59E0B;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        font-size: 16px;
        height: 48px;
        padding: 0 32px;
        box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
        transition: all 0.3s;
    }

    .ant-btn-primary:hover {
        background-color: #D97706 !important;
        box-shadow: 0 6px 20px rgba(245, 158, 11, 0.4);
        transform: translateY(-2px);
    }

    /* Nút phụ - Ocean Blue (Outline) */
    .ant-btn-default {
        border-radius: 8px;
        border: 2px solid #0284C7;
        color: #0284C7;
        background: transparent;
        font-weight: 600;
        font-size: 16px;
        height: 48px;
        padding: 0 32px;
        transition: all 0.3s;
    }

    .ant-btn-default:hover {
        color: #fff !important;
        background-color: #0284C7 !important;
        border-color: #0284C7 !important;
        transform: translateY(-2px);
    }
`;