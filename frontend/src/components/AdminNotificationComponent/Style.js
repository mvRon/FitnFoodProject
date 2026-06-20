import styled from 'styled-components';

export const PanelWrapper = styled.div`
    max-width: 600px;
    margin: 0 auto;
    padding: 24px 0;
`;

export const PanelHeader = styled.div`
    background: linear-gradient(135deg, #f97316, #ef4444);
    border-radius: 16px;
    padding: 24px 28px;
    margin-bottom: 24px;
    color: #fff;
`;

export const HeaderIcon = styled.div`
    font-size: 28px;
    margin-bottom: 4px;
`;

export const HeaderTitle = styled.h2`
    color: #fff;
    margin: 0;
    font-size: 22px;
    font-weight: 700;
`;

export const HeaderSubtitle = styled.p`
    color: rgba(255, 255, 255, 0.85);
    margin: 6px 0 0;
    font-size: 13px;
`;

export const FormWrapper = styled.div`
    background: #fff;
    border-radius: 12px;
    padding: 24px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.07);
`;

export const SubmitButton = styled.button`
    background: linear-gradient(135deg, #f97316, #ef4444);
    border: none;
    border-radius: 10px;
    font-weight: 600;
    height: 46px;
    width: 100%;
    color: #fff;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 16px;
    transition: opacity 0.2s;

    &:hover {
        opacity: 0.9;
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const TemplateBadge = styled.div`
    padding: 6px 12px;
    background: rgba(249, 115, 22, 0.1);
    color: #ea580c;
    border: 1px solid rgba(249, 115, 22, 0.2);
    border-radius: 20px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background: #f97316;
        color: #fff;
    }
`;
