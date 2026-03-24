import styled from 'styled-components';
import { Button } from 'antd';

export const Container = styled.div`
  max-width: 1240px;
  margin: auto;
  padding: 20px 18px 32px;
  background:
    radial-gradient(circle at 5% 8%, rgba(16, 185, 129, 0.15), transparent 26%),
    radial-gradient(circle at 96% 20%, rgba(2, 132, 199, 0.14), transparent 28%),
    var(--color-bg);
  border-radius: 26px;
  @media (max-width: 768px) {
    padding: 14px;
    border-radius: 18px;
  }
`;

export const ProductImageWrapper = styled.div`
  text-align: center;
  padding: 14px;
  border-radius: 20px;
  background: linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid rgba(2, 132, 199, 0.15);
  box-shadow: 0 16px 34px rgba(30, 41, 59, 0.08);

  img {
    max-width: 100%;
    max-height: 450px;
    object-fit: contain;
    border-radius: 12px;
    box-shadow: 0 8px 20px rgba(30, 41, 59, 0.12);
  }
`;

export const ProductInfoWrapper = styled.div`
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: linear-gradient(160deg, #ffffff, rgba(248, 250, 252, 0.95));
  box-shadow: 0 16px 32px rgba(2, 132, 199, 0.1);

  h2 {
    font-size: 30px;
    font-weight: bold;
    margin-bottom: 12px;
    color: var(--color-text);
    letter-spacing: 0.2px;
  }

  .price {
    font-size: 26px;
    color: var(--color-accent);
    font-weight: 700;
    margin: 12px 0;
  }

  .label {
    font-weight: 600;
    color: var(--color-secondary);
  }

  .description {
    margin: 10px 0;
    font-size: 16px;
    line-height: 1.75;
    color: #334155;
  }

  .sold {
    font-size: 15px;
    color: #0f766e;
    font-weight: 600;
    margin-top: 8px;
  }
`;

export const StyledAddButton = styled(Button)`
  margin-top: 20px;
  background-color: var(--color-secondary);
  border-color: var(--color-secondary);
  color: #fff;
  font-size: 16px;
  height: 46px;
  padding: 0 24px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 10px 24px rgba(2, 132, 199, 0.28);

  &:hover {
    background-color: #0369a1 !important;
    border-color: #0369a1 !important;
    color: #fff !important;
    transform: translateY(-1px);
  }
`;
export const RatingSection = styled.div`
  background-color: #fff;
  padding: 18px;
  margin-top: 24px;
  border-radius: 16px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 12px 28px rgba(30, 41, 59, 0.08);
  max-width: 100%;
  width: 100%;
  margin-left: 0;

  @media (max-width: 768px) {
    padding: 12px;
    margin-top: 16px;
    max-width: 100%;
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
  gap: 18px;
`;

export const ProductDescriptionSection = styled.div`
  margin-top: 4px;
  padding: 20px;
  border-radius: 18px;
  border: 1px solid rgba(2, 132, 199, 0.2);
  background: linear-gradient(165deg, #ffffff, rgba(248, 250, 252, 0.96));
  box-shadow: 0 14px 30px rgba(30, 41, 59, 0.08);

  @media (max-width: 768px) {
    padding: 14px;
  }
`;

export const ProductDescriptionTitle = styled.h3`
  margin: 0 0 10px;
  color: var(--color-secondary);
  font-size: 20px;
  font-weight: 700;
`;

export const ProductDescriptionContent = styled.p`
  margin: 0;
  white-space: pre-line;
  color: var(--color-text);
  line-height: 1.8;
  font-size: 16px;
`;

export const ProductDescriptionToggleButton = styled(Button)`
  margin-top: 14px;
  border: 1px solid rgba(16, 185, 129, 0.35);
  color: #0F766E;
  background: rgba(16, 185, 129, 0.08);
  border-radius: 10px;
  font-weight: 600;

  &:hover {
    border-color: rgba(2, 132, 199, 0.4) !important;
    color: #0369A1 !important;
    background: rgba(2, 132, 199, 0.09) !important;
  }
`;

export const WrapperDiscountText = styled.span`
    color: var(--color-accent);
    font-size: 16px;
    font-weight: 700;
`