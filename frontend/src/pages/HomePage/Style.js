

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
    color: #475569;
    font-weight: 500;
    font-size: 14px;
    transition: color 0.2s ease;
  }

  .ant-breadcrumb a:hover {
    color: #10B981;
  }

  .ant-breadcrumb > span:last-child .ant-breadcrumb-link {
    color: #1E293B;
    font-weight: 600;
  }

  .ant-breadcrumb-separator {
    color: #94A3B8;
    margin: 0 8px;
  }
`

export const CategoryBar = styled.div`
  margin-top: 16px;
  padding: 6px 12px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(2, 132, 199, 0.15); /* Ocean Blue border */
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.05);
  margin-bottom: 8px;
`;

export const WrapperTypeProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  
  /* Add padding specifically for scroll container to prevent clipping */
  padding: 10px 6px 14px 6px;

  /* Hide scrollbar for clean UI but keep it scrollable */
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(148, 163, 184, 0.4); /* Slate 400 */
    border-radius: 10px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
    margin: 0 16px; 
  }
`;

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

