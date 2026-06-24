import styled, { createGlobalStyle } from 'styled-components';

export const NotificationGlobalStyle = createGlobalStyle`
    .admin-notification-page {
        color: #1E293B;
    }

    .admin-notification-form .ant-form-item-label > label {
        color: #0369A1;
        font-weight: 600;
    }

    .admin-notification-form .ant-input,
    .admin-notification-form .ant-input-number,
    .admin-notification-form .ant-select-selector,
    .admin-notification-form .ant-picker {
        border-radius: 10px !important;
    }
`;

export const DashboardShell = styled.div`
    display: flex;
    flex-direction: column;
    gap: 16px;
    max-width: 800px;
    margin: 0 auto;
`;

export const HeaderCard = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 22px;
    padding: 26px;
    border: 1px solid rgba(2, 132, 199, 0.2);
    background:
        radial-gradient(circle at 10% -10%, rgba(16, 185, 129, 0.28), transparent 42%),
        radial-gradient(circle at 90% 0%, rgba(245, 158, 11, 0.2), transparent 42%),
        linear-gradient(135deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.08));
`;

export const HeaderTitle = styled.h2`
    margin: 0;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    color: #0F766E;
    font-size: 24px;
    font-weight: 800;
`;

export const HeaderDesc = styled.p`
    margin: 8px 0 0;
    color: #334155;
    max-width: 760px;
`;

export const FormWrapper = styled.div`
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 14px 28px rgba(30, 41, 59, 0.08);
    border: 1px solid rgba(2, 132, 199, 0.15);
`;

export const SubmitButton = styled.button`
    background: linear-gradient(135deg, #10B981, #0284C7);
    border: none;
    border-radius: 10px;
    font-weight: 700;
    height: 48px;
    width: 100%;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    transition: all 0.25s ease;
    box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2);

    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 12px 22px rgba(2, 132, 199, 0.16);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
    }
`;
