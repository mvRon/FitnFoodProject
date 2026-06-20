import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
`;

export const BellContainer = styled.div`
    position: relative;
`;

export const BellButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    position: relative;
    padding: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
`;

export const UnreadBadge = styled.span`
    position: absolute;
    top: -4px;
    right: -4px;
    background: #ef4444;
    color: #fff;
    border-radius: 50%;
    width: 18px;
    height: 18px;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    border: 2px solid var(--color-primary);
    animation: ${props => props.$hasUnread ? pulse : 'none'} 2s infinite;
`;

export const DropdownWrapper = styled.div`
    position: absolute;
    top: calc(100% + 10px);
    right: -10px;
    width: 340px;
    max-width: calc(100vw - 20px);
    max-height: calc(100vh - 80px);
    background: #fff;
    border-radius: 16px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.15);
    z-index: 9999;
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(0,0,0,0.06);
`;

export const DropdownHeader = styled.div`
    padding: 14px 16px 10px;
    border-bottom: 1px solid #f1f5f9;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 16px 16px 0 0;
`;

export const HeaderTitle = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
    font-weight: 700;
    font-size: 15px;
`;

export const HeaderBadge = styled.span`
    background: rgba(255,255,255,0.25);
    color: #fff;
    border-radius: 20px;
    padding: 1px 8px;
    font-size: 11px;
    font-weight: 600;
`;

export const MarkAllReadButton = styled.button`
    background: rgba(255,255,255,0.15);
    border: 1px solid rgba(255,255,255,0.3);
    border-radius: 8px;
    color: #fff;
    font-size: 11px;
    padding: 4px 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 4px;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
        background: rgba(255,255,255,0.25);
    }
`;

export const NotificationList = styled.div`
    overflow-y: auto;
    flex: 1;
    max-height: 400px;

    &::-webkit-scrollbar {
        width: 6px;
    }
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    &::-webkit-scrollbar-thumb {
        background: rgba(0,0,0,0.15);
        border-radius: 4px;
    }
    &::-webkit-scrollbar-thumb:hover {
        background: rgba(0,0,0,0.25);
    }
`;

export const EmptyState = styled.div`
    padding: 40px 20px;
    text-align: center;
    color: #94a3b8;
`;

export const NotificationItemWrapper = styled.div`
    padding: 12px 16px;
    cursor: pointer;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    border-bottom: 1px solid #f8fafc;
    background: ${props => props.$isRead ? '#fff' : '#f0f4ff'};
    transition: background 0.15s;
    position: relative;

    &:hover {
        background: ${props => props.$isRead ? '#f8fafc' : '#e8eeff'};
    }
`;

export const IconContainer = styled.div`
    width: 38px;
    height: 38px;
    border-radius: 50%;
    background: ${props => props.$color}18;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
    flex-shrink: 0;
`;

export const ContentWrapper = styled.div`
    flex: 1;
    min-width: 0;
`;

export const TitleContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 4px;
`;

export const NotificationTitle = styled.h4`
    margin: 0;
    font-size: 14px;
    font-weight: ${props => props.$isRead ? 600 : 700};
    color: ${props => props.$isRead ? '#334155' : '#0f172a'};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const TimeText = styled.span`
    font-size: 11px;
    color: #94a3b8;
    flex-shrink: 0;
`;

export const MessageText = styled.p`
    margin: 0 0 6px 0;
    font-size: 13px;
    color: #64748b;
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
`;

export const TagContainer = styled.div`
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
`;

export const MetaTag = styled.span`
    background: #f1f5f9;
    color: #64748b;
    font-size: 11px;
    padding: 2px 8px;
    border-radius: 12px;
    font-weight: 500;
`;

export const UnreadDot = styled.div`
    width: 8px;
    height: 8px;
    background: #3b82f6;
    border-radius: 50%;
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
`;

export const DropdownFooter = styled.div`
    padding: 10px;
    text-align: center;
    border-top: 1px solid #f1f5f9;
    background: #f8fafc;
    border-radius: 0 0 16px 16px;
    font-size: 12px;
    color: #64748b;
`;
