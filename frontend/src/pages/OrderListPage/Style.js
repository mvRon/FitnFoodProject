import styled from 'styled-components';
import { Card } from 'antd';

export const OrderListWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 100vh;
  padding: 28px 20px 40px;
  background:
    radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0) 35%),
    radial-gradient(circle at 90% 20%, rgba(2, 132, 199, 0.16), rgba(2, 132, 199, 0) 35%),
    #f8fafc;
`;

export const StyledOrderListCard = styled(Card)`
  width: 100%;
  max-width: 1240px;
  border-radius: 16px;
  border: 1px solid rgba(2, 132, 199, 0.2);
  box-shadow: 0 18px 30px rgba(15, 23, 42, 0.08);
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  overflow: hidden;

  .ant-card-head {
    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
    background: linear-gradient(120deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.12));
    padding: 14px 22px;
  }

  .ant-card-head-title {
    color: #1e293b;
  }

  .ant-card-body {
    padding: 20px 22px;
  }

  .ant-table-wrapper {
    margin-top: 20px;
  }

  .ant-table {
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid rgba(2, 132, 199, 0.15);
  }

  .ant-table-thead > tr > th {
    background-color: #ecfeff;
    color: #1e293b;
    font-weight: 700;
    border-bottom: 1px solid rgba(2, 132, 199, 0.16);
  }

  .ant-table-tbody > tr:hover > td {
    background: rgba(16, 185, 129, 0.06) !important;
  }

  .ant-btn-primary {
    background: linear-gradient(135deg, #10b981, #0284c7);
    border: none;
    border-radius: 8px;
    font-weight: 700;
  }

  .ant-btn-danger,
  .ant-btn-dangerous {
    border-radius: 8px;
  }
`;