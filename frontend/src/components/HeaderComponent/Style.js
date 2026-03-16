// import styled from 'styled-components';
// import { Row } from 'antd';

// export const WrapperHeader = styled(Row)`
//   padding: 10px 20px;
//   background-color: rgb(26, 148, 255);
//   align-items: center;
//   gap: 16px;
//   flex-wrap: nowrap;
//   width: 100%;

//   @media (max-width: 768px) {
//     justify-content: space-between;
//   }
// `;

// export const WrapperHeaderAccount = styled.div`
//   display: flex;
//   align-items: center;
//   color: #fff;
//   gap: 10px;

//   @media (max-width: 768px) {
//     span, div:not(:has(img)) {
//       display: none;
//     }
//   }
// `;

// export const WrapperTextHeader = styled.span`
//   font-size: 18px;
//   color: #fff;
//   font-weight: bold;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   gap: 8px;
// `;

// export const WrapperSpanHeader = styled.span`
//   font-size: 12px;
//   color: #fff;
//   white-space: nowrap;
// `;

// export const WrapperContentPopup = styled.p`
//   cursor: pointer;
//   &:hover {
//     color: rgb(26, 148, 255);
//   }
// `;

//VER 2
import styled from 'styled-components';
import { Row } from 'antd';

export const WrapperHeader = styled(Row)`
  padding: 10px 20px;
  background-color: var(--color-primary);
  align-items: center;
  gap: 16px;
  flex-wrap: nowrap;
  width: 100%;

  @media (max-width: 1024px) {
    flex-direction: column !important;
    gap: 8px;
    padding: 10px 4px;
    .ant-col {
      width: 100% !important;
      max-width: 100%;
      display: flex;
      justify-content: center;
      margin-bottom: 6px;
    }
  }

  @media (max-width: 768px) {
    gap: 4px;
    padding: 8px 2px;
    .ant-col {
      margin-bottom: 4px;
    }
    .hidden-mobile {
      display: none;
    }
  }
`;

// export const WrapperHeaderAccount = styled.div`
//   display: flex;
//   align-items: center;
//   color: #fff;
//   gap: 10px;

//   @media (max-width: 768px) {
//     span, div:not(:has(img)) {
//       display: none;
//     }
//   }
// `;

export const WrapperTextHeader = styled.span`
  font-size: 18px;
  color: #fff;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  @media (max-width: 768px) {
    font-size: 15px;
    gap: 4px;
    img {
      height: 38px !important;
      width: 38px !important;
    }
  }
`;

export const WrapperSpanHeader = styled.span`
  font-size: 12px;
  color: #fff;
  white-space: nowrap;
  @media (max-width: 768px) {
    &.cart-label {
      display: none;
    }
    font-size: 11px;
  }
`;

export const WrapperContentPopup = styled.p`
  cursor: pointer;
  &:hover {
    color: var(--color-secondary);
  }
`;


//VER 3
// import styled from 'styled-components';
// import { Row } from 'antd';

// export const WrapperHeader = styled(Row)`
//   padding: 10px 20px;
//   background-color: rgb(26, 148, 255);
//   align-items: center;
//   gap: 16px;
//   flex-wrap: nowrap;
//   width: 100%;

//   @media (max-width: 768px) {
//     justify-content: space-between;
//   }
// `;

export const WrapperEmailUser = styled.span`
  color: #fff;
  font-size: 13px;
  white-space: nowrap;
  @media (max-width: 768px) {
    display: none;
  }
`;

export const WrapperHeaderAccount = styled.div`
  display: flex;
  align-items: center;
  color: #fff;
  gap: 10px;
  @media (max-width: 1024px) {
    justify-content: center;
    width: 100%;
  }
  @media (max-width: 768px) {
    gap: 6px;
    span, div:not(:has(img)) {
      display: none;
    }
  }
`;

// ✅ Avatar styled
export const AvatarImage = styled.img`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
  cursor: pointer;
  @media (max-width: 768px) {
    width: 26px;
    height: 26px;
  }
`;

// ✅ Login action wrapper
export const LoginAction = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #fff;
  cursor: pointer;
`;



// ✅ Login text
export const LoginText = styled.span`
  font-size: 12px;
  white-space: none;
  color: #fff;
  @media (max-width: 768px) {
    font-size: 11px;
  }
`;

// export const WrapperTextHeader = styled.span`
//   font-size: 18px;
//   color: #fff;
//   font-weight: bold;
//   cursor: pointer;
//   display: flex;
//   align-items: center;
//   gap: 8px;
// `;

// export const WrapperSpanHeader = styled.span`
//   font-size: 12px;
//   color: #fff;
//   white-space: nowrap;
// `;

// export const WrapperContentPopup = styled.p`
//   cursor: pointer;
//   &:hover {
//     color: rgb(26, 148, 255);
//   }
// `;