import { Card, Image } from "antd";
import styled from "styled-components";

// export const WrapperCardStyle = styled(Card)`
//     width: 200px;
//     & img {
//         height: 230px;
//         width: 230px;
//     };
//     position: relative;
//     background-color: ${props => props.disabled ? '#ccc' : '#fff'};
//     cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

//     //liên quan đến responsive
//     @media (max-width: 768px) {
//         width: 100%;
//     }
// `


export const WrapperCardStyle = styled(Card)`
  width: 200px;
  min-width: 150px;
  max-width: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: ${props => props.disabled ? '#E2E8F0' : '#FFFFFF'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  border: 1px solid ${props => props.disabled ? 'rgba(148, 163, 184, 0.45)' : 'rgba(2, 132, 199, 0.3)'};
  border-radius: 16px;
  box-shadow: ${props => props.disabled ? 'none' : '0 12px 26px rgba(30, 41, 59, 0.1)'};
  overflow: hidden;
  transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    border-radius: 16px;
    box-shadow: inset 0 0 0 1px ${props => props.disabled ? 'transparent' : 'rgba(16, 185, 129, 0.08)'};
    transition: box-shadow 0.24s ease;
  }

  .ant-card-cover {
    border-bottom: 1px solid rgba(2, 132, 199, 0.16);
    background: linear-gradient(180deg, rgba(248, 250, 252, 0.98), #ffffff);
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    overflow: hidden;
    transition: background 0.24s ease;
  }

  .ant-card-cover img {
    height: 200px;
    object-fit: contain;
    padding: 10px;
  }

  .ant-card-body {
    padding: 10px;
    transition: background 0.24s ease;
  }

  &:hover {
    transform: ${props => props.disabled ? 'none' : 'translateY(-3px)'};
    border-color: ${props => props.disabled ? 'rgba(148, 163, 184, 0.45)' : 'rgba(16, 185, 129, 0.5)'};
    box-shadow: ${props => props.disabled ? 'none' : '0 18px 34px rgba(2, 132, 199, 0.2), 0 6px 16px rgba(16, 185, 129, 0.14)'};
    background: ${props => props.disabled ? '#E2E8F0' : 'linear-gradient(170deg, rgba(16, 185, 129, 0.08), rgba(2, 132, 199, 0.06) 45%, #ffffff 100%)'};
  }

  &:hover::before {
    box-shadow: ${props => props.disabled ? 'inset 0 0 0 1px transparent' : 'inset 0 0 0 1px rgba(16, 185, 129, 0.22)'};
  }

  &:hover .ant-card-cover {
    background: ${props => props.disabled ? 'linear-gradient(180deg, rgba(248, 250, 252, 0.98), #ffffff)' : 'linear-gradient(180deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.1), #ffffff)'};
  }

  &:hover .ant-card-body {
    background: ${props => props.disabled ? 'transparent' : 'rgba(248, 250, 252, 0.8)'};
  }

  & img {
    height: auto;
    width: 100%;
    object-fit: contain;
  }

  @media (max-width: 600px) {
    width: 48%;
    min-width: 140px;
    margin-bottom: 10px;
  }
`

export const StyleNameProduct = styled.div`
  font-size: 13px;
  line-height: 18px;
  color: #1E293B;
  font-weight: 500;
  min-height: 36px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

export const WrapperReportText = styled.div`
    font-size: 11px;
    color: #64748B;
    display: flex;
    align-items: center;
    margin: 6px 0;
`

export const WrapperPriceText = styled.div`
    color: #0284C7;
    font-size: 16px;
    font-weight: 600;
    display: flex;
    flex-direction: column;
`

export const WrapperDiscountText = styled.span`
    color: #F59E0B;
    font-size: 12px;
    font-weight: 700;
`

export const WrapperStyleTextSell = styled.span`
    font-size: 12px;
    line-height: 18px;
    color: #64748B;
`

export const RatingValueText = styled.span`
  color: #0284C7;
  font-weight: 600;
`

export const StyledRatingStar = styled.span`
  color: #F59E0B;
  font-size: 12px;
`

export const OriginalPriceText = styled.span`
  color: #64748B;
  margin-right: 8px;
`

export const SalePriceText = styled.span`
  color: #0284C7;
  margin-right: 8px;
  font-weight: 700;
`

//Liên quan đến responsive
export const StyledLogo = styled(Image)`
  width: 200px;
  height: 200px;
  position: absolute;
  bottom: 25px;
  left: -11px;

  @media (max-width: 768px) {
    width: 100px;
    height: 100px;
    left: 0;
  }
`