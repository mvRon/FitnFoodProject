import React, { useState, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import {
    BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer,
} from "recharts";
import * as RevenueService from "../../services/RevenueService";
import { convertPrice } from "../../utils";
import {
    RevenueGlobalStyle,
    COLORS, PIE_COLORS, RANK_COLORS,
    Shell, Header, Title,
    FilterBar, FilterBtn, RefreshBtn, DateInput,
    KpiGrid, KpiCard, KpiIcon, KpiValue, KpiLabel, KpiSub,
    SectionGrid, Card, CardTitle,
    AiImpactRow, SourceBadge,
    ProductRow, ProductImg, ProductInfo, ProductName, ProductMeta, Rank, ValueTag,
    AlertRow, AlertDot, StockBar, StockFill,
    EmptyState, LoadingShimmer,
} from "./Style";

const VN_OFFSET = 7 * 60 * 60 * 1000; // GMT+7 (Việt Nam)

const getVnTime = () => {
    return new Date(Date.now() + VN_OFFSET);
};

const getStartOfDayUTC = (vnDate) => {
    const msAtMidnightVN = Date.UTC(
        vnDate.getUTCFullYear(),
        vnDate.getUTCMonth(),
        vnDate.getUTCDate(),
        0, 0, 0, 0
    );
    return new Date(msAtMidnightVN - VN_OFFSET).toISOString();
};

const getEndOfDayUTC = (vnDate) => {
    const msAtEndOfDayVN = Date.UTC(
        vnDate.getUTCFullYear(),
        vnDate.getUTCMonth(),
        vnDate.getUTCDate(),
        23, 59, 59, 999
    );
    return new Date(msAtEndOfDayVN - VN_OFFSET).toISOString();
};

const getPresetRange = (preset) => {
    const nowVn = getVnTime();
    switch (preset) {
        case "today":
            return { from: getStartOfDayUTC(nowVn), to: getEndOfDayUTC(nowVn) };
        case "yesterday": {
            const d = new Date(nowVn.getTime() - 24 * 3600 * 1000);
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(d) };
        }
        case "7d": {
            const d = new Date(nowVn.getTime() - 6 * 24 * 3600 * 1000);
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(nowVn) };
        }
        case "month": {
            const d = new Date(Date.UTC(nowVn.getUTCFullYear(), nowVn.getUTCMonth(), 1));
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(nowVn) };
        }
        case "year": {
            const d = new Date(Date.UTC(nowVn.getUTCFullYear(), 0, 1));
            return { from: getStartOfDayUTC(d), to: getEndOfDayUTC(nowVn) };
        }
        default:
            return { from: null, to: null };
    }
};

const PRESETS = [
    { key: "all", label: "Tất cả" },
    { key: "today", label: "Hôm nay" },
    { key: "yesterday", label: "Hôm qua" },
    { key: "7d", label: "7 ngày" },
    { key: "month", label: "Tháng này" },
    { key: "year", label: "Năm nay" },
    { key: "custom", label: "Tùy chọn" },
];

// ─────────────────────────────────────────
// Custom Tooltip
// ─────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
        <div style={{
            background: COLORS.surfaceLight,
            border: `1px solid ${COLORS.border}`,
            borderRadius: 8,
            padding: "10px 14px",
            fontSize: 12,
            color: COLORS.text,
        }}>
            {label && <div style={{ color: COLORS.muted, marginBottom: 4 }}>{label}</div>}
            {payload.map((p, i) => (
                <div key={i} style={{ color: p.color || COLORS.text, fontWeight: 600 }}>
                    {p.name}: {typeof p.value === "number" && p.value > 999 ? convertPrice(p.value) : p.value}
                </div>
            ))}
        </div>
    );
};

// ─────────────────────────────────────────
// Main Component
// ─────────────────────────────────────────
const AdminRevenueDashboard = () => {
    const user = useSelector((state) => state.user);
    const accessToken = useMemo(() => {
        const raw = localStorage.getItem("access_token");
        if (!raw) return null;
        try { return JSON.parse(raw); } catch { return raw; }
    }, []);

    const [preset, setPreset] = useState("all");
    const [customFrom, setCustomFrom] = useState("");
    const [customTo, setCustomTo] = useState("");

    const dateRange = useMemo(() => {
        if (preset === "custom") {
            let fromIso = null;
            let toIso = null;
            if (customFrom) {
                const parts = customFrom.split("-");
                const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
                fromIso = getStartOfDayUTC(d);
            }
            if (customTo) {
                const parts = customTo.split("-");
                const d = new Date(Date.UTC(parts[0], parts[1] - 1, parts[2], 0, 0, 0, 0));
                toIso = getEndOfDayUTC(d);
            }
            return { from: fromIso, to: toIso };
        }
        return getPresetRange(preset);
    }, [preset, customFrom, customTo]);

    const { data: statsData, isLoading, isError, isFetching, refetch } = useQuery({
        queryKey: ["revenueStats", dateRange.from, dateRange.to],
        queryFn: () => RevenueService.getRevenueStats(accessToken, dateRange),
        enabled: !!accessToken,
        staleTime: 2 * 60 * 1000,
        refetchOnWindowFocus: false,
    });

    const stats = statsData?.data || null;

    const handlePreset = useCallback((key) => setPreset(key), []);

    const aiPieData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "Chatbot AI", value: Math.max(stats.chatbotRevenue || 0, 0) },
            { name: "RAG Gợi ý", value: Math.max(stats.ragRevenue || 0, 0) },
            { name: "Tự tìm", value: Math.max(stats.organicRevenue || 0, 0) },
        ].filter(d => d.value > 0);
    }, [stats]);

    const revenueCompareData = useMemo(() => {
        if (!stats) return [];
        return [
            { name: "Thực tế", value: stats.actualRevenue || 0, fill: COLORS.success },
            { name: "Dự kiến", value: stats.expectedRevenue || 0, fill: COLORS.primary },
        ];
    }, [stats]);

    const renderLoading = (h = "80px") => <LoadingShimmer $h={h} />;

    return (
        <>
            <RevenueGlobalStyle />
            <Shell>
                {/* ── Header & Filter ── */}
                <Header>
                    <Title>📊 Doanh thu & AI Analytics</Title>
                    <FilterBar>
                        {PRESETS.map((p) => (
                            <FilterBtn
                                key={p.key}
                                $active={preset === p.key}
                                onClick={() => handlePreset(p.key)}
                            >
                                {p.label}
                            </FilterBtn>
                        ))}
                        {preset === "custom" && (
                            <>
                                <DateInput
                                    type="date"
                                    value={customFrom}
                                    onChange={e => setCustomFrom(e.target.value)}
                                    title="Từ ngày"
                                />
                                <span style={{ color: COLORS.muted, fontSize: 12 }}>→</span>
                                <DateInput
                                    type="date"
                                    value={customTo}
                                    onChange={e => setCustomTo(e.target.value)}
                                    title="Đến ngày"
                                />
                            </>
                        )}
                        <RefreshBtn onClick={() => refetch()} disabled={isFetching}>
                            {isFetching ? "🔄 Đang tải..." : "🔄 Làm mới"}
                        </RefreshBtn>
                    </FilterBar>
                </Header>

                {isError && (
                    <div style={{ textAlign: "center", padding: 24, color: COLORS.danger }}>
                        Không thể tải dữ liệu.{" "}
                        <button
                            onClick={refetch}
                            style={{ color: COLORS.info, background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}
                        >
                            Thử lại
                        </button>
                    </div>
                )}

                {/* ── KPI Cards ── */}
                <KpiGrid>
                    <KpiCard $accent={COLORS.success}>
                        <KpiIcon>💰</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={COLORS.success}>{convertPrice(stats?.netProductRevenue || 0)}</KpiValue>
                                <KpiLabel>Doanh thu Sản phẩm</KpiLabel>
                                <KpiSub>Thực nhận sau khi trừ Phí Ship & Voucher</KpiSub>
                            </>
                        )}
                    </KpiCard>

                    <KpiCard $accent={COLORS.secondary}>
                        <KpiIcon>🚚</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={COLORS.secondary}>{convertPrice(stats?.shippingRevenue || 0)}</KpiValue>
                                <KpiLabel>Doanh thu Vận chuyển</KpiLabel>
                                <KpiSub>Tổng phí vận chuyển đã thu</KpiSub>
                            </>
                        )}
                    </KpiCard>

                    <KpiCard $accent={COLORS.primary}>
                        <KpiIcon>📋</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={COLORS.primary}>{convertPrice(stats?.expectedRevenue || 0)}</KpiValue>
                                <KpiLabel>Doanh thu dự kiến</KpiLabel>
                                <KpiSub>Tất cả đơn đã đặt (bao gồm Ship)</KpiSub>
                            </>
                        )}
                    </KpiCard>

                    <KpiCard $accent={COLORS.info}>
                        <KpiIcon>✅</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={COLORS.info}>{stats?.paidOrders || 0}</KpiValue>
                                <KpiLabel>Đơn đã thanh toán</KpiLabel>
                                <KpiSub>Tổng: {stats?.totalOrders || 0} đơn</KpiSub>
                            </>
                        )}
                    </KpiCard>

                    <KpiCard $accent={stats?.unpaidRate > 30 ? COLORS.danger : COLORS.warning}>
                        <KpiIcon>⚠️</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={stats?.unpaidRate > 30 ? COLORS.danger : COLORS.warning}>
                                    {stats?.unpaidRate || 0}%
                                </KpiValue>
                                <KpiLabel>Tỷ lệ chưa thanh toán</KpiLabel>
                                <KpiSub $color={stats?.unpaidRate > 30 ? COLORS.danger : undefined}>
                                    {stats?.unpaidRate > 30 ? "⚡ Cần chú ý!" : "Trong ngưỡng ổn định"}
                                </KpiSub>
                            </>
                        )}
                    </KpiCard>

                    <KpiCard $accent={COLORS.chatbot}>
                        <KpiIcon>🤖</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={COLORS.chatbot}>{stats?.aiRevenuePercent || 0}%</KpiValue>
                                <KpiLabel>Tỷ lệ doanh thu từ AI</KpiLabel>
                                <KpiSub>{convertPrice(stats?.aiRevenue || 0)} / {stats?.aiOrderCount || 0} items</KpiSub>
                            </>
                        )}
                    </KpiCard>

                    <KpiCard $accent={COLORS.danger}>
                        <KpiIcon>📦</KpiIcon>
                        {isLoading ? renderLoading("40px") : (
                            <>
                                <KpiValue $color={(stats?.lowStockWarnings?.length || 0) > 0 ? COLORS.danger : COLORS.success}>
                                    {stats?.lowStockWarnings?.length || 0}
                                </KpiValue>
                                <KpiLabel>Cảnh báo tồn kho</KpiLabel>
                                <KpiSub>Sản phẩm dưới ngưỡng an toàn</KpiSub>
                            </>
                        )}
                    </KpiCard>
                </KpiGrid>

                {/* ── Row 2: Dòng tiền + AI Donut ── */}
                <SectionGrid $cols="1fr 1.2fr">
                    <Card>
                        <CardTitle>💵 Dòng tiền: Dự kiến vs Thực tế</CardTitle>
                        {isLoading ? renderLoading("200px") : (
                            <ResponsiveContainer width="100%" height={200}>
                                <BarChart data={revenueCompareData} barCategoryGap="40%">
                                    <CartesianGrid strokeDasharray="3 3" stroke={COLORS.border} />
                                    <XAxis dataKey="name" tick={{ fill: COLORS.muted, fontSize: 12 }} axisLine={false} tickLine={false} />
                                    <YAxis
                                        tickFormatter={v => `${(v / 1000000).toFixed(1)}M`}
                                        tick={{ fill: COLORS.muted, fontSize: 11 }}
                                        axisLine={false}
                                        tickLine={false}
                                    />
                                    <Tooltip content={<CustomTooltip />} />
                                    <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                                        {revenueCompareData.map((entry, idx) => (
                                            <Cell key={idx} fill={entry.fill} />
                                        ))}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </Card>

                    <Card>
                        <CardTitle>🤖 Phân bổ doanh thu theo nguồn gốc</CardTitle>
                        {isLoading ? renderLoading("200px") : (
                            <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                {aiPieData.length > 0 ? (
                                    <>
                                        <ResponsiveContainer width={160} height={160}>
                                            <PieChart>
                                                <Pie
                                                    data={aiPieData}
                                                    cx="50%" cy="50%"
                                                    innerRadius={45} outerRadius={70}
                                                    paddingAngle={3}
                                                    dataKey="value"
                                                >
                                                    {aiPieData.map((_, i) => (
                                                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip content={<CustomTooltip />} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                        <div style={{ flex: 1 }}>
                                            {[
                                                { label: "Chatbot AI", color: COLORS.chatbot, icon: "💬", rev: stats?.chatbotRevenue, count: stats?.chatbotOrderCount },
                                                { label: "RAG Gợi ý", color: COLORS.rag, icon: "✨", rev: stats?.ragRevenue, count: stats?.ragOrderCount },
                                                { label: "Tự tìm", color: COLORS.organic, icon: "🔍", rev: stats?.organicRevenue, count: stats?.organicOrderCount },
                                            ].map((src, i) => (
                                                <AiImpactRow key={i}>
                                                    <SourceBadge $bg={src.color + "22"} $color={src.color}>
                                                        {src.icon} {src.label}
                                                    </SourceBadge>
                                                    <div style={{ textAlign: "right" }}>
                                                        <div style={{ fontSize: 13, fontWeight: 700, color: src.color }}>
                                                            {convertPrice(Math.max(src.rev || 0, 0))}
                                                        </div>
                                                        <div style={{ fontSize: 11, color: COLORS.muted }}>{src.count || 0} items</div>
                                                    </div>
                                                </AiImpactRow>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <EmptyState>Chưa có dữ liệu trong khoảng thời gian này</EmptyState>
                                )}
                            </div>
                        )}
                    </Card>
                </SectionGrid>

                {/* ── Row 3: Top Products ── */}
                <SectionGrid $cols="1fr 1fr">
                    <Card>
                        <CardTitle>🏆 Top 5 — Số lượng bán</CardTitle>
                        {isLoading ? renderLoading("200px") : (
                            (stats?.topProductsByQty || []).length === 0
                                ? <EmptyState>Không có dữ liệu</EmptyState>
                                : (stats.topProductsByQty || []).map((p, i) => (
                                    <ProductRow key={p.productId || i}>
                                        <Rank $color={RANK_COLORS[i]}>#{i + 1}</Rank>
                                        <ProductImg src={p.image || ""} alt={p.productName} onError={e => { e.target.src = ""; }} />
                                        <ProductInfo>
                                            <ProductName>{p.productName}</ProductName>
                                            <ProductMeta>
                                                Tồn kho:{" "}
                                                <span style={{ color: (p.countInStock || 0) <= 5 ? COLORS.danger : COLORS.success }}>
                                                    {p.countInStock ?? "—"}
                                                </span>
                                            </ProductMeta>
                                        </ProductInfo>
                                        <ValueTag $color={COLORS.info}>{p.totalQty} sp</ValueTag>
                                    </ProductRow>
                                ))
                        )}
                    </Card>

                    <Card>
                        <CardTitle>💎 Top 5 — Doanh thu</CardTitle>
                        {isLoading ? renderLoading("200px") : (
                            (stats?.topProductsByRevenue || []).length === 0
                                ? <EmptyState>Không có dữ liệu</EmptyState>
                                : (stats.topProductsByRevenue || []).map((p, i) => (
                                    <ProductRow key={p.productId || i}>
                                        <Rank $color={RANK_COLORS[i]}>#{i + 1}</Rank>
                                        <ProductImg src={p.image || ""} alt={p.productName} onError={e => { e.target.src = ""; }} />
                                        <ProductInfo>
                                            <ProductName>{p.productName}</ProductName>
                                            <ProductMeta>{p.totalQty} sản phẩm</ProductMeta>
                                        </ProductInfo>
                                        <ValueTag $color={COLORS.success}>{convertPrice(p.totalRevenue || 0)}</ValueTag>
                                    </ProductRow>
                                ))
                        )}
                    </Card>
                </SectionGrid>

                {/* ── Row 4: Inventory Warnings ── */}
                <Card>
                    <CardTitle>⚠️ Cảnh báo tồn kho — Dưới ngưỡng an toàn</CardTitle>
                    {isLoading ? renderLoading("120px") : (
                        (stats?.lowStockWarnings || []).length === 0 ? (
                            <EmptyState style={{ color: COLORS.success }}>
                                ✅ Tất cả sản phẩm đang ở mức tồn kho an toàn
                            </EmptyState>
                        ) : (
                            <div>
                                {(stats.lowStockWarnings || []).map((w, i) => {
                                    const pct = w.safeStockLevel > 0 ? (w.countInStock / w.safeStockLevel) * 100 : 0;
                                    return (
                                        <AlertRow key={w.productId || i} $severity={w.severity}>
                                            <AlertDot $severity={w.severity} />
                                            <ProductImg src={w.image || ""} alt={w.productName} onError={e => { e.target.src = ""; }} />
                                            <ProductInfo>
                                                <ProductName style={{ fontSize: 13 }}>{w.productName}</ProductName>
                                                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
                                                    <StockBar>
                                                        <StockFill $pct={pct} $severity={w.severity} />
                                                    </StockBar>
                                                    <span style={{ fontSize: 11, color: COLORS.muted, whiteSpace: "nowrap" }}>
                                                        {w.countInStock}/{w.safeStockLevel} ngưỡng
                                                    </span>
                                                </div>
                                            </ProductInfo>
                                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                                                <ValueTag $color={w.severity === "critical" ? COLORS.danger : COLORS.warning}>
                                                    {w.countInStock === 0 ? "Hết hàng" : `Còn ${w.countInStock}`}
                                                </ValueTag>
                                                <div style={{ fontSize: 11, color: COLORS.muted }}>Đã bán: {w.sold}</div>
                                            </div>
                                        </AlertRow>
                                    );
                                })}
                            </div>
                        )
                    )}
                </Card>
            </Shell>
        </>
    );
};

export default AdminRevenueDashboard;
