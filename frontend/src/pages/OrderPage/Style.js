import styled from "styled-components";
import { Button, Input, InputNumber } from "antd";




export const WrapperStyleHeader = styled.div`
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  padding: 11px 16px;
  border-radius: 14px;
  border: 1px solid rgba(2, 132, 199, 0.18);
  box-shadow: 0 10px 24px rgba(30, 41, 59, 0.06);
  display: flex;
  align-items: center;
  span {
    color: var(--color-text);
    font-weight: 500;
    font-size: 13px;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 8px;
  }
`;

export const WrapperStyleHeaderDelivery = styled.div`
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.14), rgba(2, 132, 199, 0.14));
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid rgba(16, 185, 129, 0.25);
  box-shadow: 0 10px 24px rgba(16, 185, 129, 0.14);
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  width: 100%;

  .ant-steps {
    width: 100%;
  }

  .ant-steps-item-title {
    color: var(--color-text) !important;
    font-weight: 700;
  }

  .ant-steps-item-description {
    color: #334155 !important;
  }

  .ant-steps-item-finish .ant-steps-item-icon,
  .ant-steps-item-process .ant-steps-item-icon {
    background: var(--color-primary) !important;
    border-color: var(--color-primary) !important;
  }

  .ant-steps-item-finish .ant-steps-item-tail::after {
    background-color: var(--color-primary) !important;
  }

  span {
    color: var(--color-text);
    font-weight: 500;
    font-size: 13px;
  }
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 8px;
  }
`;

export const WrapperLeft = styled.div`
  width: 910px;
  @media (max-width: 1200px) {
    width: 100%;
  }
`;

export const WrapperListOrder = styled.div`
  width: 100%;
`;

export const WrapperItemOrder = styled.div`
  display: flex;
  align-items: center;
  padding: 13px 10px;
  background: linear-gradient(145deg, #ffffff, #f8fafc);
  margin-top: 12px;
  border-radius: 12px;
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 12px 24px rgba(30, 41, 59, 0.06);
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 10px 4px;
  }
`;

export const WrapperPriceDiscount = styled.span`
  color: #999;
  font-size: 12px;
  text-decoration: line-through;
  margin-left: 4px;
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

export const WrapperCountOrder = styled.div`
  display: flex;
  align-items: center;
  width: 84px;
  border: 1px solid rgba(2, 132, 199, 0.35);
  border-radius: 8px;
  background: #fff;
  @media (max-width: 768px) {
    width: 84px;
    margin-top: 6px;
  }
`;

export const WrapperRight = styled.div`
  width: 320px;
  margin-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  @media (max-width: 1024px) {
    width: 100%;
    margin-left: 0;
    margin-top: 16px;
  }
`;

export const WrapperInfo = styled.div`
  padding: 17px 20px;
  border-bottom: 1px solid rgba(2, 132, 199, 0.12);
  background: linear-gradient(165deg, #ffffff, #f8fafc);
  border-top-right-radius: 14px;
  border-top-left-radius: 14px;
  width: 100%;
  @media (max-width: 768px) {
    padding: 10px 8px;
  }
`;

export const WrapperTotal = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 17px 20px;
  background: linear-gradient(165deg, #ffffff, #f8fafc);
  border-bottom-right-radius: 14px;
  border-bottom-left-radius: 14px;
  border-top: 1px solid rgba(16, 185, 129, 0.15);
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 8px;
    padding: 10px 8px;
  }
`;

export const WrapperInputNumber = styled(InputNumber)`
  &.ant-input-number.ant-input-number-sm {
    width: 40px;
    border-top: none;
    border-bottom: none;
    .ant-input-number-handler-wrap {
      display: none;
    }
  }
  @media (max-width: 768px) {
    &.ant-input-number.ant-input-number-sm {
      width: 32px;
    }
  }
`;

export const WrapperDiscountSection = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  gap: 10px;
`;

export const DiscountButton = styled(Button)`
  background: rgba(245, 158, 11, 0.12);
  border: 1px solid rgba(245, 158, 11, 0.55);
  color: #9a5f00;
  padding: 0 12px;
  height: 34px;
  font-size: 12px;
  border-radius: 10px;
  font-weight: 700;
  @media (max-width: 768px) {
    padding: 0 8px;
    font-size: 11px;
  }
`;

export const DiscountInput = styled(Input)`
  width: 120px;
  height: 32px;
  font-size: 12px;
  @media (max-width: 768px) {
    width: 100px;
    font-size: 11px;
  }
`;

export const DiscountApplyButton = styled(Button)`
  background: ${props => props.disabled ? '#ccc' : '#ff3945'};
  border: none;
  color: ${props => props.disabled ? '#888' : '#fff'};
  padding: 0 12px;
  height: 32px;
  font-size: 12px;
  border-radius: 4px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  @media (max-width: 768px) {
    padding: 0 8px;
    font-size: 11px;
  }
`;

export const DiscountModalContent = styled.div`
  padding: 16px;
  @media (max-width: 768px) {
    padding: 8px;
  }
`;

export const DiscountItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  opacity: ${props => props.disabled ? 0.5 : 1};
  pointer-events: ${props => props.disabled ? 'none' : 'auto'};
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 4px;
  }
`;

export const DiscountManualInput = styled(Input)`
  margin-bottom: 8px;
  height: 32px;
  font-size: 12px;
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

export const DiscountManualApplyButton = styled(Button)`
  background: #1890ff;
  border: none;
  color: #fff;
  padding: 0 12px;
  height: 32px;
  font-size: 12px;
  width: 100%;
  @media (max-width: 768px) {
    font-size: 11px;
  }
`
