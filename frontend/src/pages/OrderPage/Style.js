import styled from "styled-components";
import { Button, Input, InputNumber } from "antd";




export const WrapperStyleHeader = styled.div`
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  span {
    color: rgb(36, 36, 36);
    font-weight: 400;
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
  background: rgb(255, 255, 255);
  padding: 9px 16px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  span {
    color: rgb(36, 36, 36);
    font-weight: 400;
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
  padding: 12px 8px;
  background: #fff;
  margin-top: 12px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.03);
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
  border: 1px solid #ccc;
  border-radius: 4px;
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
  border-bottom: 1px solid #f5f5f5;
  background: #fff;
  border-top-right-radius: 6px;
  border-top-left-radius: 6px;
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
  background: #fff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 6px;
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
  background: #f5f5fa;
  border: 1px solid #d9d9d9;
  color: #000;
  padding: 0 12px;
  height: 32px;
  font-size: 12px;
  border-radius: 4px;
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
