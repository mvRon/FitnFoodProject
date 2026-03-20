import styled from 'styled-components';
import { Button } from 'antd';

export const Container = styled.div`
  max-width: 1200px;
  margin: auto;
  padding: 24px;
  @media (max-width: 768px) {
    padding: 16px;
  }
`;

export const ProductImageWrapper = styled.div`
  text-align: center;
  img {
    max-width: 100%;
    max-height: 450px;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

export const ProductInfoWrapper = styled.div`
  padding: 12px 16px;

  h2 {
    font-size: 28px;
    font-weight: bold;
    margin-bottom: 12px;
    color: #1e1e1e;
  }

  .price {
    font-size: 24px;
    color: #f5222d;
    font-weight: 600;
    margin: 12px 0;
  }

  .label {
    font-weight: 600;
    color: #595959;
  }

  .description {
    margin: 8px 0;
    font-size: 16px;
    line-height: 1.6;
    color: #4a4a4a;
  }

  .sold {
    font-size: 15px;
    color: #555;
    margin-top: 8px;
  }
`;

export const StyledAddButton = styled(Button)`
  margin-top: 20px;
  background-color: #1677ff;
  color: #fff;
  font-size: 16px;
  height: 45px;
  padding: 0 24px;
  border-radius: 8px;
  font-weight: 500;

  &:hover {
    background-color: #0958d9;
    color: #fff;
  }
`;
export const RatingSection = styled.div`
  background-color: #fff;
  padding: 16px;
  margin-top: 24px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  max-width: 500px;
  width: 100%;
  margin-left: 0; /* giữ bên trái */

  @media (max-width: 768px) {
    padding: 12px;
    margin-top: 16px;
    max-width: 100%; /* cho mobile vẫn full width */
  }

  h3 {
    font-size: 16px;
    margin-bottom: 8px;
  }

  .ant-comment {
    margin-bottom: 8px;
  }

  .ant-rate {
    font-size: 18px;
  }

  .review-overview {
    font-size: 14px;
    margin-bottom: 8px;
  }
`;


export const RatingHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;

  .score {
    font-size: 36px;
    font-weight: bold;
    color: #faad14;
  }

  .total {
    font-size: 16px;
    color: #666;
  }
`;

export const RatingBreakdown = styled.div`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  .bar {
    display: flex;
    align-items: center;
    gap: 12px;

    .label {
      width: 32px;
    }

    .progress {
      flex: 1;
      height: 8px;
      background: #f0f0f0;
      border-radius: 4px;
      overflow: hidden;

      .fill {
        height: 100%;
        background-color: #1890ff;
      }
    }

    .percent {
      width: 40px;
      text-align: right;
      font-size: 13px;
      color: #666;
    }
  }
`;

export const ReviewList = styled.div`
  margin-top: 24px;
`;

export const ReviewItem = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #eaeaea;

  .user {
    font-weight: 600;
    margin-bottom: 4px;
    color: #1e1e1e;
  }

  .content {
    font-size: 15px;
    color: #444;
  }

  .meta {
    margin-top: 8px;
    font-size: 13px;
    color: #888;
    display: flex;
    gap: 12px;
    align-items: center;
  }

  
`;
export const LeftColumnWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const WrapperDiscountText = styled.span`
    color: rgb(255, 66, 78);
    font-size: 16px;
    font-weight: 500;
`