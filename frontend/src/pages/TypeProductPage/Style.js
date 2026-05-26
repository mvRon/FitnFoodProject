import styled, { keyframes } from "styled-components";
import { Button } from "antd";

const floatIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(14px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`;

export const PageRoot = styled.div`
  --fit-primary: #10b981;
  --fit-secondary: #0284c7;
  --fit-accent: #f59e0b;
  --fit-bg: #f8fafc;
  --fit-text: #1e293b;

  min-height: calc(100vh - 64px);
  background:
    radial-gradient(circle at 0% 0%, rgba(16, 185, 129, 0.14), transparent 35%),
    radial-gradient(circle at 95% 5%, rgba(2, 132, 199, 0.18), transparent 30%),
    linear-gradient(180deg, rgba(248, 250, 252, 0.98) 0%, rgba(240, 249, 255, 0.9) 100%);
  color: var(--fit-text);
`;

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
`;

export const PageBody = styled.div`
  width: 100%;
`;

export const ContentContainer = styled.div`
  max-width: 1270px;
  width: 100%;
  margin: 0 auto;
  padding: 0 16px 28px;

  @media (max-width: 768px) {
    padding: 0 12px 22px;
  }
`;

export const HeroCard = styled.div`
  margin-top: 10px;
  border-radius: 24px;
  padding: 24px;
  background: linear-gradient(120deg, rgba(16, 185, 129, 0.95) 0%, rgba(2, 132, 199, 0.95) 68%);
  box-shadow: 0 18px 32px rgba(2, 132, 199, 0.22);
  color: #ffffff;
  animation: ${floatIn} 360ms ease-out;

  @media (max-width: 768px) {
    border-radius: 18px;
    padding: 16px;
  }
`;

export const HeroTitle = styled.h1`
  margin: 0;
  font-size: clamp(24px, 4vw, 34px);
  font-weight: 800;
  letter-spacing: 0.2px;
`;

export const HeroMeta = styled.p`
  margin: 8px 0 0;
  opacity: 0.96;
  font-size: 14px;
`;

export const CategoryBar = styled.div`
  margin-top: 16px;
  padding: 12px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.78);
  border: 1px solid rgba(148, 163, 184, 0.22);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
`;

export const CategoryScroller = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  overflow-x: auto;
  overflow-y: hidden;
  white-space: nowrap;
  padding-bottom: 6px;

  &::-webkit-scrollbar {
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(2, 132, 199, 0.35);
    border-radius: 999px;
  }
`;

export const ParentCategory = styled.button`
  border: none;
  padding: 10px 16px;
  border-radius: 999px;
  font-weight: 700;
  font-size: 14px;
  color: #ffffff;
  background: linear-gradient(135deg, #10b981, #0284c7);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(2, 132, 199, 0.3);
    animation: ${pulse} 800ms ease-in-out;
  }
`;

export const ChildCategory = styled.button`
  border: 1px solid ${(props) => (props.$active ? "#0284c7" : "#cbd5e1")};
  padding: 9px 14px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 14px;
  color: ${(props) => (props.$active ? "#0369a1" : "#334155")};
  background: ${(props) => (props.$active ? "rgba(2, 132, 199, 0.14)" : "#ffffff")};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #10b981;
    color: #047857;
    box-shadow: 0 4px 10px rgba(16, 185, 129, 0.18);
  }
`;

export const ProductsPanel = styled.div`
  margin-top: 18px;
  background: transparent;
  border: none;
  padding: 0;
  box-shadow: none;
  animation: ${floatIn} 420ms ease-out;

  @media (max-width: 768px) {
    margin-top: 14px;
  }
`;

export const WrapperProducts = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(248, 250, 252, 0.98));
  border: 1px solid rgba(2, 132, 199, 0.12);
  border-radius: 24px;
  padding: 18px 14px 22px;
  box-shadow: 0 18px 45px rgba(30, 41, 59, 0.07);

  @media (max-width: 768px) {
    justify-content: center;
    gap: 10px;
    padding: 12px 8px 16px;
    border-radius: 16px;
  }
`;

export const EmptyState = styled.div`
  width: 100%;
  text-align: center;
  padding: 38px 12px;
  border: 1px dashed rgba(2, 132, 199, 0.35);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(241, 245, 249, 0.8), rgba(236, 253, 245, 0.8));
`;

export const EmptyTitle = styled.h3`
  margin: 0;
  color: #0f172a;
`;

export const EmptyDescription = styled.p`
  margin: 8px 0 0;
  color: #475569;
`;

export const PaginationWrap = styled.div`
  width: 100%;
  display: flex;
  justify-content: center;
  margin-top: 16px;

  .ant-pagination-item-active {
    border-color: #10b981;
  }

  .ant-pagination-item-active a {
    color: #047857;
  }

  .ant-pagination-options .ant-select-selector {
    border-color: rgba(2, 132, 199, 0.28) !important;
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