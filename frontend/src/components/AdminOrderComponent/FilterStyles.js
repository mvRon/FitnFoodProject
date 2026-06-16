import styled from "styled-components";

export const FilterBar = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    align-items: center;
    margin-bottom: 16px;
`;

export const FilterBtn = styled.button`
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid ${p => p.$active ? "#10B981" : "rgba(2, 132, 199, 0.16)"};
    background: ${p => p.$active ? "#10B981" : "transparent"};
    color: ${p => p.$active ? "#fff" : "#64748B"};
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    &:hover { border-color: #10B981; color: ${p => p.$active ? "#fff" : "#10B981"}; }
`;

export const RefreshBtn = styled.button`
    padding: 6px 14px;
    border-radius: 20px;
    border: 1px solid #10B981;
    background: #ffffff;
    color: #10B981;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    gap: 6px;
    &:hover {
        background: #10B981;
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
    border: 1px solid rgba(2, 132, 199, 0.16);
    background: #ffffff;
    color: #1E293B;
    font-size: 12px;
    cursor: pointer;
    &:focus { outline: none; border-color: #10B981; }
`;
