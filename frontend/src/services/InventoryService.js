import { axiosJWT } from './UserService';

const INVENTORY_BASE = `${process.env.REACT_APP_API_URL_BACKEND}/inventory`;

const authHeaders = (accessToken) => ({
    headers: {
        token: `Bearer ${accessToken}`,
    },
});

export const createImportVoucher = async (payload, accessToken) => {
    const res = await axiosJWT.post(`${INVENTORY_BASE}/import`, payload, authHeaders(accessToken));
    return res.data;
};

export const createExportVoucher = async (payload, accessToken) => {
    const res = await axiosJWT.post(`${INVENTORY_BASE}/export`, payload, authHeaders(accessToken));
    return res.data;
};

export const getAllVouchers = async (accessToken, filters = {}) => {
    const queryParams = new URLSearchParams();

    if (filters.transactionType) {
        queryParams.append('transactionType', filters.transactionType);
    }

    if (filters.status) {
        queryParams.append('status', filters.status);
    }

    if (filters.fromDate) {
        queryParams.append('fromDate', filters.fromDate);
    }

    if (filters.toDate) {
        queryParams.append('toDate', filters.toDate);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString ? `${INVENTORY_BASE}/vouchers?${queryString}` : `${INVENTORY_BASE}/vouchers`;

    const res = await axiosJWT.get(endpoint, authHeaders(accessToken));
    return res.data;
};

export const getVoucherDetails = async (voucherId, accessToken) => {
    const res = await axiosJWT.get(`${INVENTORY_BASE}/vouchers/${voucherId}`, authHeaders(accessToken));
    return res.data;
};

export const confirmVoucher = async (voucherId, accessToken) => {
    const res = await axiosJWT.patch(`${INVENTORY_BASE}/vouchers/${voucherId}/confirm`, {}, authHeaders(accessToken));
    return res.data;
};

export const cancelVoucher = async (voucherId, reason, accessToken) => {
    const res = await axiosJWT.patch(
        `${INVENTORY_BASE}/vouchers/${voucherId}/cancel`,
        { reason },
        authHeaders(accessToken)
    );
    return res.data;
};

export const updateVoucherNote = async (voucherId, note, accessToken) => {
    const res = await axiosJWT.patch(
        `${INVENTORY_BASE}/vouchers/${voucherId}/note`,
        { note },
        authHeaders(accessToken)
    );
    return res.data;
};

export const getInventoryAlerts = async (accessToken) => {
    const res = await axiosJWT.get(`${INVENTORY_BASE}/alerts`, authHeaders(accessToken));
    return res.data;
};

export const checkInventoryDiscrepancy = async (actualCounts, accessToken) => {
    const res = await axiosJWT.post(
        `${INVENTORY_BASE}/alerts/discrepancy`,
        { actualCounts },
        authHeaders(accessToken)
    );
    return res.data;
};

export const upsertThreshold = async (productId, payload, accessToken) => {
    const res = await axiosJWT.put(`${INVENTORY_BASE}/threshold/${productId}`, payload, authHeaders(accessToken));
    return res.data;
};

export const getStockCardByProduct = async (productId, accessToken, fromDate, toDate) => {
    const queryParams = new URLSearchParams();

    if (fromDate) {
        queryParams.append('fromDate', fromDate);
    }

    if (toDate) {
        queryParams.append('toDate', toDate);
    }

    const queryString = queryParams.toString();
    const endpoint = queryString
        ? `${INVENTORY_BASE}/stock-card/${productId}?${queryString}`
        : `${INVENTORY_BASE}/stock-card/${productId}`;

    const res = await axiosJWT.get(endpoint, authHeaders(accessToken));
    return res.data;
};
