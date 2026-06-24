import styled from 'styled-components';

// ─── Wrapper chính ────────────────────────────────────────────────────────────
export const SettingWrapper = styled.div`
    max-width: 860px;
    margin: 0 auto;
    padding: 24px 0 48px;
`;

// ─── Header banner ────────────────────────────────────────────────────────────
export const SettingHeader = styled.div`
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
    border-radius: 18px;
    padding: 28px 32px;
    margin-bottom: 28px;
    color: #fff;
    display: flex;
    align-items: center;
    gap: 20px;
    box-shadow: 0 8px 32px rgba(99, 102, 241, 0.28);
`;

export const HeaderIcon = styled.div`
    width: 56px;
    height: 56px;
    background: rgba(255, 255, 255, 0.2);
    border-radius: 14px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 26px;
    flex-shrink: 0;
    backdrop-filter: blur(4px);
`;

export const HeaderText = styled.div`
    flex: 1;
`;

export const HeaderTitle = styled.h2`
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    color: #fff;
`;

export const HeaderSubtitle = styled.p`
    margin: 5px 0 0;
    font-size: 13px;
    color: rgba(255, 255, 255, 0.82);
`;

// ─── Tab content card ─────────────────────────────────────────────────────────
export const TabCard = styled.div`
    background: #fff;
    border-radius: 14px;
    padding: 28px 28px 24px;
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.07);

    .ant-tabs-nav {
        margin-bottom: 24px;
    }

    .ant-tabs-tab {
        font-size: 14px;
        font-weight: 500;
        padding: 10px 16px;
    }

    .ant-tabs-tab-active .ant-tabs-tab-btn {
        color: #6366f1 !important;
    }

    .ant-tabs-ink-bar {
        background: #6366f1 !important;
    }
`;

// ─── Section label trong mỗi tab ─────────────────────────────────────────────
export const SectionLabel = styled.div`
    font-size: 12px;
    font-weight: 600;
    color: #6366f1;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    margin-bottom: 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid #ede9fe;
`;

// ─── Logo preview ─────────────────────────────────────────────────────────────
export const LogoPreview = styled.div`
    width: 96px;
    height: 96px;
    border-radius: 12px;
    border: 2px dashed #c4b5fd;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    background: #faf5ff;
    cursor: pointer;
    transition: border-color 0.2s;
    position: relative;

    &:hover {
        border-color: #8b5cf6;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 10px;
    }
`;

export const LogoPlaceholder = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    color: #a78bfa;
    font-size: 12px;

    .anticon {
        font-size: 24px;
    }
`;

// ─── Payment method switch row ────────────────────────────────────────────────
export const PaymentMethodRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    border-radius: 10px;
    background: #faf5ff;
    border: 1px solid #ede9fe;
    margin-bottom: 10px;
    transition: background 0.2s;

    &:last-child {
        margin-bottom: 0;
    }
`;

export const PaymentMethodInfo = styled.div`
    display: flex;
    align-items: center;
    gap: 10px;

    .pm-icon {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 17px;
        background: #ede9fe;
        color: #7c3aed;
    }

    .pm-name {
        font-weight: 600;
        font-size: 14px;
        color: #1e1b4b;
    }

    .pm-desc {
        font-size: 12px;
        color: #7c7c9a;
        margin-top: 1px;
    }
`;

// ─── Nút Lưu ─────────────────────────────────────────────────────────────────
export const SaveButton = styled.button`
    background: linear-gradient(135deg, #6366f1, #8b5cf6);
    border: none;
    border-radius: 10px;
    height: 44px;
    padding: 0 32px;
    color: #fff;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 24px;
    transition: opacity 0.2s, transform 0.15s;
    box-shadow: 0 4px 14px rgba(99, 102, 241, 0.35);

    &:hover:not(:disabled) {
        opacity: 0.92;
        transform: translateY(-1px);
    }

    &:active:not(:disabled) {
        transform: translateY(0);
    }

    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;
