import styled from "styled-components";
import Slider from "react-slick";
import { Button } from "antd";

export const SectionWrapper = styled.section`
  margin-top: 24px;
  padding: 18px 20px 22px;
  border-radius: 22px;
  background: radial-gradient(circle at 10% 8%, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0) 34%),
    radial-gradient(circle at 92% 18%, rgba(2, 132, 199, 0.14), rgba(2, 132, 199, 0) 34%),
    linear-gradient(180deg, #ffffff, #f8fafc);
  border: 1px solid rgba(2, 132, 199, 0.16);
  box-shadow: 0 16px 34px rgba(30, 41, 59, 0.08);

  @media (max-width: 768px) {
    padding: 14px 12px 18px;
  }
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
`;

export const SectionTitle = styled.h3`
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #0f172a;
`;

export const SectionSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #475569;
`;

export const CarouselWrapper = styled.div`
  .slick-list {
    margin: 0 -8px;
  }
`;

export const SliderWrapper = styled(Slider)`
  .slick-slide > div {
    padding: 0 8px;
  }

  .slick-prev,
  .slick-next {
    width: 36px;
    height: 36px;
    z-index: 2;
  }

  .slick-prev::before,
  .slick-next::before {
    color: #0f766e;
    font-size: 36px;
  }
`;

export const RecommendationCard = styled.div`
  cursor: pointer;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: linear-gradient(160deg, #ffffff, rgba(248, 250, 252, 0.96));
  box-shadow: 0 12px 24px rgba(30, 41, 59, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 18px 32px rgba(2, 132, 199, 0.18);
  }
`;

export const CardImageWrapper = styled.div`
  position: relative;
  padding: 12px;
  background: linear-gradient(180deg, rgba(16, 185, 129, 0.1), rgba(2, 132, 199, 0.08));
  border-bottom: 1px solid rgba(2, 132, 199, 0.18);
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 190px;

  .ant-image {
    width: 100%;
  }
`;

export const ReasonBadge = styled.span`
  position: absolute;
  left: 12px;
  bottom: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  color: #0f172a;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(2, 132, 199, 0.25);
  box-shadow: 0 6px 12px rgba(2, 132, 199, 0.12);
`;

export const CardBody = styled.div`
  padding: 12px 14px 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const RatingRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: #0ea5e9;
  font-size: 12px;
  font-weight: 700;

  .muted {
    color: #64748b;
    font-weight: 500;
    margin-left: 4px;
  }
`;

export const PriceRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;

  .sale {
    color: #0f766e;
    font-weight: 800;
    font-size: 16px;
  }

  .origin {
    color: #94a3b8;
    text-decoration: line-through;
    font-size: 12px;
  }
`;

export const QuickAddButton = styled(Button)`
  background: linear-gradient(135deg, #10b981, #0284c7);
  border: none;
  color: #ffffff;
  height: 36px;
  border-radius: 12px;
  font-weight: 700;
  box-shadow: 0 10px 20px rgba(2, 132, 199, 0.2);

  &:hover {
    background: linear-gradient(135deg, #0f766e, #0ea5e9) !important;
    color: #ffffff !important;
  }
`;
