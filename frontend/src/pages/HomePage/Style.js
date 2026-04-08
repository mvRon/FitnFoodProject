

import { Button } from "antd"
import styled from "styled-components"

export const BreadcrumbWrap = styled.div`
  max-width: 1270px;
  width: 100%;
  margin: 0 auto;
  padding: 10px 16px 4px;

  .ant-breadcrumb {
    padding: 10px 14px;
    border-radius: 12px;
    border: 1px solid rgba(2, 132, 199, 0.16);
    background: rgba(255, 255, 255, 0.72);
    backdrop-filter: blur(4px);
  }

  .ant-breadcrumb a,
  .ant-breadcrumb-link {
    color: #0369a1;
    font-weight: 600;
    cursor: pointer;
  }

  .ant-breadcrumb-separator {
    color: #0ea5e9;
  }
`

export const WrapperTypeProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  justify-content: flex-start;
  height: auto;
  margin-top: 10px;
  flex-wrap: wrap;
  padding: 8px;
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.25);

  @media (max-width: 768px) {
    justify-content: center;
    gap: 12px;
  }
`

export const WrapperButtonMore = styled(Button)`
  text-align: center;
  border: 1px solid var(--color-accent);
  width: 240px;
  height: 48px;
  border-radius: 999px;
  box-shadow: 0 10px 24px rgba(245, 158, 11, 0.25);

  background-color: ${(props) => (props.disabled ? '#d9d9d9' : 'var(--color-accent)')};
  color: ${(props) => (props.disabled ? '#888' : '#fff')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  span {
    color: ${(props) => (props.disabled ? '#fff' : '#fff')};
    font-weight: 700;
    letter-spacing: 0.2px;
  }

  &:hover {
    background-color: ${(props) => props.disabled ? '#d9d9d9' : '#dd8d0a'} !important;
    border-color: ${(props) => props.disabled ? '#d9d9d9' : '#dd8d0a'} !important;
    transform: ${(props) => props.disabled ? 'none' : 'translateY(-1px)'};
    
    span {
      color: ${(props) => (props.disabled ? '#fff' : '#fff')};
    }
  }
`;






export const WrapperProducts = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(2, 132, 199, 0.12);
  border-radius: 24px;
  padding: 18px 14px 22px;
  box-shadow: 0 18px 45px rgba(30, 41, 59, 0.07);

  @media (max-width: 768px) {
    gap: 10px;
    padding: 12px 8px 16px;
    border-radius: 16px;
  }
`

