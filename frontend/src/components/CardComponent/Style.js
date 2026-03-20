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
  background-color: ${props => props.disabled ? '#ccc' : '#fff'};
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};

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
    font-weight: 400;
    font-size: 12px;
    line-height: 16px;
    color: rgb(56, 56, 61);
    font-weight: 400;
`

export const WrapperReportText = styled.div`
    font-size: 11px;
    color: rgb(128, 128, 137);
    display: flex;
    align-items: center;
    margin: 6px 0;
`

export const WrapperPriceText = styled.div`
    color: rgb(255, 66, 78);
    font-size: 16px;
    font-weight: 500;
    display: flex;
    flex-direction: column;
`

export const WrapperDiscountText = styled.span`
    color: rgb(255, 66, 78);
    font-size: 12px;
    font-weight: 500;
`

export const WrapperStyleTextSell = styled.span`
    font-size: 15px;
    line-height: 24px;
    color: rgb(120, 120, 120);
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