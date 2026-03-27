import styled from 'styled-components';
import { Card } from 'antd';

export const OrderDetailWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: calc(100vh - 64px);
  padding: 28px 20px 40px;
  background:
    radial-gradient(circle at 12% 8%, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0) 34%),
    radial-gradient(circle at 88% 16%, rgba(2, 132, 199, 0.16), rgba(2, 132, 199, 0) 36%),
    #f8fafc;
`;

export const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
  max-width: 1240px;

  .left-column,
  .right-column {
    animation: fadeInUp 0.45s ease-out;
  }

  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(14px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (min-width: 992px) {
    flex-direction: row;
    .left-column {
      flex: 2;
    }
    .right-column {
      flex: 1;
    }
  }
`;

export const SectionCard = styled(Card)`
  border-radius: 16px;
  border: 1px solid rgba(2, 132, 199, 0.18);
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.08);
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  margin-bottom: 18px;
  overflow: hidden;

  .ant-card-head {
    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
    background: linear-gradient(120deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.12));
    padding: 14px 20px;
  }

  .ant-card-head-title {
    color: #1e293b;
  }

  .ant-card-body {
    padding: 18px 20px;
  }
`;

export const ProductItem = styled.div`
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 12px 8px;
    border-bottom: 1px dashed rgba(2, 132, 199, 0.2);
    border-radius: 12px;
    transition: transform 0.2s ease, background 0.2s ease;

    &:hover {
        transform: translateY(-1px);
        background: rgba(2, 132, 199, 0.05);
    }

    &:last-child {
        border-bottom: none;
    }

    img {
        width: 80px;
        height: 80px;
        object-fit: cover;
        border-radius: 10px;
        border: 1px solid rgba(2, 132, 199, 0.2);
    }

    .product-info {
        flex-grow: 1;
    }

    .product-name {
      font-weight: 600;
        font-size: 16px;
      color: #1e293b;
    }

    .product-price {
        font-size: 14px;
      color: #475569;
    }

    .product-amount {
        font-size: 14px;
        color: #888;
    }
`;

export const PriceDetail = styled.div`
    display: flex;
    justify-content: space-between;
    padding: 8px 0;
  border-bottom: 1px dashed rgba(2, 132, 199, 0.2);

    &:last-child {
        border-bottom: none;
    }

    .label {
      color: #475569;
    }

    .value {
      font-weight: 700;
      color: #1e293b;
    }

    &.total {
        font-size: 18px;
        font-weight: bold;
        .value {
        color: #f59e0b;
        }
    }
`;