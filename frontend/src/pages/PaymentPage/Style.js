import { Button, Radio } from "antd";
import styled, { keyframes } from "styled-components";


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
`

export const WrapperLeft = styled.div`
    width: 910px;
    @media (max-width: 1200px) {
        width: 100%;
    }
`

export const WrapperListOrder = styled.div`
    width: 100%;
`

export const WrapperItemOrder = styled.div`
    display: flex;
    align-items: center;
    padding: 12px 8px;
    background: #fff;
    margin-top: 12px;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.03);
    @media (max-width: 768px) {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
        padding: 10px 4px;
    }
`

export const WrapperPriceDiscount = styled.span`
    color: #999;
    font-size: 12px;
    text-decoration: line-through;
    margin-left: 4px;
    @media (max-width: 768px) {
        font-size: 11px;
    }
`

export const WrapperCountOrder = styled.div`
    display: flex;
    align-items: center;
    width: 84px;
    border: 1px solid #ccc;
    border-radius: 4px;
    @media (max-width: 768px) {
        width: 100%;
        margin-top: 6px;
    }
`


export const WrapperRight = styled.div`
    width: 320px;
    margin-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: center;
    @media (max-width: 1024px) {
        width: 100%;
        max-width: 420px;
        margin: 0 auto;
        margin-top: 16px;
        align-items: stretch;
    }
`

export const WrapperInfo = styled.div`
    padding: 17px 20px;
    border-bottom: 1px solid rgba(2, 132, 199, 0.12);
    background: linear-gradient(165deg, #ffffff, #f8fafc);
    border-top-right-radius: 14px;
    border-top-left-radius: 14px;
    border: 1px solid rgba(16, 185, 129, 0.15);
    box-shadow: 0 10px 20px rgba(30, 41, 59, 0.06);
    width: 100%;
    @media (max-width: 768px) {
        padding: 10px 8px;
    }
`

export const WrapperTotal = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 17px 20px;
    background: linear-gradient(165deg, #ffffff, #f8fafc);
    border-bottom-right-radius: 14px;
    border-bottom-left-radius: 14px;
    border: 1px solid rgba(16, 185, 129, 0.15);
    box-shadow: 0 10px 20px rgba(30, 41, 59, 0.06);
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 8px;
        padding: 10px 8px;
    }
`

export const Lable = styled.span`
    font-size: 13px;
    color: #1e293b;
    font-weight: 700;
    letter-spacing: 0.2px;
`

export const WrapperRadio = styled(Radio.Group)`
    margin-top: 8px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.12));
    border: 1px solid rgba(16, 185, 129, 0.28);
    width: 100%;
    border-radius: 12px;
    min-height: 100px;
    padding: 16px;
    font-weight: normal;
    display: flex;
    flex-direction: column;
    gap: 10px;
    justify-content: center;

    .ant-radio-wrapper {
        color: #1e293b;
        font-weight: 500;
    }

    .ant-radio-checked .ant-radio-inner {
        border-color: #10b981;
        background-color: #10b981;
    }

    @media (max-width: 768px) {
        width: 100%;
        min-width: 0;
        height: auto;
        padding: 10px 8px;
    }
`

const paymentFadeIn = keyframes`
    from {
        opacity: 0;
        transform: translateY(14px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
`

const paymentFloat = keyframes`
    0% {
        transform: translateY(0px);
    }
    50% {
        transform: translateY(-8px);
    }
    100% {
        transform: translateY(0px);
    }
`

export const PaymentPageShell = styled.div`
    width: 100%;
    min-height: 100vh;
    background: radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 36%),
        radial-gradient(circle at 90% 20%, rgba(2, 132, 199, 0.16) 0%, rgba(2, 132, 199, 0) 34%),
        linear-gradient(180deg, #f8fafc 0%, #eefbf5 100%);
`

export const PaymentPageContainer = styled.div`
    width: 100%;
    max-width: 1270px;
    margin: 0 auto;
    padding: 14px 8px 28px;
`

export const PaymentHeroSection = styled.div`
    position: relative;
    overflow: hidden;
    border-radius: 18px;
    margin-bottom: 16px;
    padding: 16px 18px;
    border: 1px solid rgba(16, 185, 129, 0.28);
    background: linear-gradient(120deg, rgba(255, 255, 255, 0.92), rgba(240, 255, 250, 0.95));
    box-shadow: 0 18px 34px rgba(15, 23, 42, 0.08);
    animation: ${paymentFadeIn} 420ms ease-out;
`

export const PaymentHeroOrb = styled.div`
    position: absolute;
    right: -16px;
    top: -22px;
    width: 110px;
    height: 110px;
    border-radius: 999px;
    background: radial-gradient(circle, rgba(2, 132, 199, 0.28), rgba(2, 132, 199, 0));
    animation: ${paymentFloat} 4.8s ease-in-out infinite;
`

export const PaymentHeroTitle = styled.h2`
    color: #1e293b;
    font-weight: 800;
    margin-bottom: 6px;
`

export const PaymentHeroDescription = styled.div`
    color: #334155;
    font-size: 13px;
    margin-bottom: 10px;
`

export const PaymentHeroBadges = styled.div`
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
`

export const PaymentHeroBadge = styled.span`
    padding: 6px 10px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 700;
    background: ${({ $variant }) => ($variant === "info" ? "rgba(2, 132, 199, 0.16)" : "rgba(16, 185, 129, 0.16)")};
    color: ${({ $variant }) => ($variant === "info" ? "#0c4a6e" : "#166534")};
`

export const PaymentMainWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    flex-wrap: wrap;

    @media (max-width: 1024px) {
        flex-direction: column;
        gap: 0;
    }
`

export const PaymentContentColumn = styled.div`
    flex: 2;
    min-width: 320px;
    max-width: 900px;
    width: 100%;
    animation: ${paymentFadeIn} 500ms ease-out;
`

export const PaymentSummaryColumn = styled.div`
    flex: 1;
    min-width: 260px;
    max-width: 400px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 10px;
    align-items: stretch;
    animation: ${paymentFadeIn} 620ms ease-out;
`

export const PaymentSummaryHeader = styled.div`
    width: 100%;
    margin-bottom: 8px;
    padding: 10px 14px;
    border-radius: 12px;
    background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.15));
    border: 1px solid rgba(2, 132, 199, 0.24);
    color: #0f172a;
    font-weight: 700;
    font-size: 14px;
`

export const PaymentAddressRow = styled.div`
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
`

export const PaymentAddressText = styled.span`
    font-weight: 700;
    color: #0f172a;
`

export const PaymentAddressAction = styled.span`
    color: #0284c7;
    cursor: pointer;
    margin-left: 8px;
    font-weight: 600;
`

export const PaymentRow = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    margin-top: ${({ $mt }) => ($mt != null ? `${$mt}px` : "0")};
`

export const PaymentRowLabel = styled.span`
    color: ${({ $muted }) => ($muted ? "#64748b" : "#334155")};
    font-size: ${({ $small }) => ($small ? "12px" : "14px")};
    font-weight: ${({ $weight }) => $weight || 600};
`

export const PaymentRowValue = styled.span`
    color: ${({ $color }) => $color || "#000"};
    font-size: ${({ $size }) => $size || "14px"};
    font-weight: ${({ $weight }) => $weight || 700};
`

export const PaymentMethodText = styled.div`
    margin-top: 8px;
    color: #334155;
    font-weight: 600;
`

export const PaymentAccentText = styled.span`
    color: ${({ $color }) => $color || "#0284c7"};
    font-weight: 700;
`

export const PaymentOrderButton = styled(Button)`
    color: #fff;
    background: linear-gradient(120deg, #10b981, #0284c7, #0ea5e9);
    height: 48px;
    width: 100%;
    max-width: 320px;
    border: none;
    border-radius: 12px;
    font-weight: 700;
    margin-top: 12px;
    box-shadow: 0 16px 30px rgba(2, 132, 199, 0.3);

    &:hover,
    &:focus {
        color: #fff;
        border: none;
        background: linear-gradient(120deg, #10b981, #0284c7, #0ea5e9);
    }
`

export const PaymentTotalValueBlock = styled.span`
    display: flex;
    flex-direction: column;
    align-items: flex-end;
`

export const PaymentTotalAmount = styled.span`
    color: rgb(254, 56, 52);
    font-size: 24px;
    font-weight: bold;
`

export const PaymentTotalNote = styled.span`
    color: #000;
    font-size: 11px;
`