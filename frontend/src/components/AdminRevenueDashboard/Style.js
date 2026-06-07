import styled, { createGlobalStyle } from "styled-components";

// ─────────────────────────────────────────
// Design Tokens (Based on colors.txt)
// ─────────────────────────────────────────
export const COLORS = {
    primary: "#10B981",     // Xanh Ngọc Tươi (Emerald Green)
    secondary: "#0284C7",   // Xanh Lam Y Tế (Ocean Blue)
    accent: "#F59E0B",      // Cam Năng Lượng (Vitamin Orange)
    
    bg: "#F8FAFC",          // Nền chính sáng
    surface: "#ffffff",     // Nền card trắng
    surfaceLight: "#F1F5F9",// Xám cực nhạt cho hover/shimmer
    border: "rgba(2, 132, 199, 0.16)", // Viền xanh lam nhạt
    text: "#1E293B",        // Màu chữ chính êm dịu
    muted: "#64748B",       // Xám phụ
    
    success: "#10B981",
    warning: "#F59E0B",
    danger: "#EF4444",
    info: "#0284C7",
    
    chatbot: "#8B5CF6",     // Tím (để tách biệt AI)
    rag: "#06B6D4",         // Xanh ngọc lam (RAG)
    organic: "#64748B",     // Xám (Tự tìm)
};

export const PIE_COLORS = [COLORS.chatbot, COLORS.rag, COLORS.organic];
export const RANK_COLORS = ["#f59e0b", "#94a3b8", "#cd7c39", "#6366f1", "#10b981"];

// ─────────────────────────────────────────
// Global Style (Google Font)
// ─────────────────────────────────────────
export const RevenueGlobalStyle = createGlobalStyle`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
`;

// ─────────────────────────────────────────
// Layout
// ─────────────────────────────────────────
export const Shell = styled.div`
    font-family: 'Inter', sans-serif;
    background: ${COLORS.bg};
    color: ${COLORS.text};
    min-height: 100%;
    padding: 24px;
    border-radius: 16px;
`;

export const Header = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 28px;
`;

export const Title = styled.h2`
    margin: 0;
    font-size: 22px;
    font-weight: 700;
    background: linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary});
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
`;

// ─────────────────────────────────────────
// Filter Bar
// ─────────────────────────────────────────
export const FilterBar = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
`;

export const FilterBtn = styled.button`
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid ${p => p.$active ? COLORS.primary : COLORS.border};
    background: ${p => p.$active ? COLORS.primary : "transparent"};
    color: ${p => p.$active ? "#fff" : COLORS.muted};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover { border-color: ${COLORS.primary}; color: ${p => p.$active ? "#fff" : COLORS.primary}; }
`;

export const RefreshBtn = styled.button`
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid ${COLORS.primary};
    background: ${COLORS.surface};
    color: ${COLORS.primary};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    &:hover {
        background: ${COLORS.primary};
        color: #fff;
    }
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

export const DateInput = styled.input`
    padding: 5px 10px;
    border-radius: 8px;
    border: 1px solid ${COLORS.border};
    background: ${COLORS.surface};
    color: ${COLORS.text};
    font-size: 12px;
    cursor: pointer;
    &:focus { outline: none; border-color: ${COLORS.primary}; }
`;

// ─────────────────────────────────────────
// KPI Cards
// ─────────────────────────────────────────
export const KpiGrid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 24px;
`;

export const KpiCard = styled.div`
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 20px;
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    &:hover {
        transform: translateY(-2px);
        box-shadow: 0 8px 30px rgba(0,0,0,0.3);
    }
    &::before {
        content: '';
        position: absolute;
        top: 0; left: 0; right: 0;
        height: 3px;
        background: ${p => p.$accent || COLORS.primary};
        border-radius: 14px 14px 0 0;
    }
`;

export const KpiIcon = styled.div`
    font-size: 24px;
    margin-bottom: 10px;
`;

export const KpiValue = styled.div`
    font-size: 22px;
    font-weight: 800;
    color: ${p => p.$color || COLORS.text};
    letter-spacing: -0.5px;
    line-height: 1.1;
`;

export const KpiLabel = styled.div`
    font-size: 12px;
    color: ${COLORS.muted};
    margin-top: 6px;
    font-weight: 500;
`;

export const KpiSub = styled.div`
    font-size: 11px;
    color: ${p => p.$color || COLORS.muted};
    margin-top: 4px;
    font-weight: 500;
`;

// ─────────────────────────────────────────
// Section Cards
// ─────────────────────────────────────────
export const SectionGrid = styled.div`
    display: grid;
    grid-template-columns: ${p => p.$cols || "1fr 1fr"};
    gap: 16px;
    margin-bottom: 24px;

    @media (max-width: 900px) {
        grid-template-columns: 1fr;
    }
`;

export const Card = styled.div`
    background: ${COLORS.surface};
    border: 1px solid ${COLORS.border};
    border-radius: 14px;
    padding: 20px;
`;

export const CardTitle = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: ${COLORS.muted};
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
`;

// ─────────────────────────────────────────
// AI Impact
// ─────────────────────────────────────────
export const AiImpactRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid ${COLORS.border};
    &:last-child { border-bottom: none; }
`;

export const SourceBadge = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 600;
    background: ${p => p.$bg};
    color: ${p => p.$color || "#fff"};
`;

// ─────────────────────────────────────────
// Product Rows
// ─────────────────────────────────────────
export const ProductRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid ${COLORS.border};
    &:last-child { border-bottom: none; }
`;

// Removed ProductImg as it's no longer used

export const ProductInfo = styled.div`
    flex: 1;
    min-width: 0;
`;

export const ProductName = styled.div`
    font-size: 13px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    color: ${COLORS.text};
    cursor: pointer;
    transition: color 0.2s ease;
    &:hover {
        color: ${COLORS.primary};
        text-decoration: underline;
    }
`;

export const ProductMeta = styled.div`
    font-size: 11px;
    color: ${COLORS.muted};
    margin-top: 2px;
`;

export const Rank = styled.div`
    font-size: 16px;
    font-weight: 800;
    color: ${p => p.$color || COLORS.muted};
    width: 24px;
    text-align: center;
    flex-shrink: 0;
`;

export const ValueTag = styled.div`
    font-size: 13px;
    font-weight: 700;
    color: ${p => p.$color || COLORS.text};
    white-space: nowrap;
    flex-shrink: 0;
`;

// ─────────────────────────────────────────
// Inventory Alert Rows
// ─────────────────────────────────────────
export const AlertRow = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px 12px;
    border-radius: 10px;
    background: ${p => p.$severity === "critical" ? "rgba(239,68,68,0.08)" : "rgba(245,158,11,0.08)"};
    border: 1px solid ${p => p.$severity === "critical" ? "rgba(239,68,68,0.2)" : "rgba(245,158,11,0.2)"};
    margin-bottom: 8px;
`;

export const AlertDot = styled.div`
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: ${p => p.$severity === "critical" ? COLORS.danger : COLORS.warning};
    flex-shrink: 0;
    animation: ${p => p.$severity === "critical" ? "revenuePulse 1.5s infinite" : "none"};
    @keyframes revenuePulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
    }
`;

export const StockBar = styled.div`
    height: 4px;
    background: ${COLORS.surfaceLight};
    border-radius: 4px;
    overflow: hidden;
    margin-top: 4px;
    flex: 1;
`;

export const StockFill = styled.div`
    height: 100%;
    width: ${p => Math.min(p.$pct, 100)}%;
    background: ${p => p.$severity === "critical" ? COLORS.danger : COLORS.warning};
    border-radius: 4px;
    transition: width 0.6s ease;
`;

// ─────────────────────────────────────────
// States
// ─────────────────────────────────────────
export const EmptyState = styled.div`
    text-align: center;
    padding: 32px;
    color: ${COLORS.muted};
    font-size: 13px;
`;

export const LoadingShimmer = styled.div`
    background: linear-gradient(90deg, ${COLORS.surface} 25%, ${COLORS.surfaceLight} 50%, ${COLORS.surface} 75%);
    background-size: 200% 100%;
    animation: revenueShimmer 1.5s infinite;
    border-radius: 8px;
    height: ${p => p.$h || "80px"};
    @keyframes revenueShimmer {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
    }
`;
