import styled from 'styled-components';
import { Select, Card, Layout, Form} from 'antd';
const { Footer } = Layout;

export const WrapperH1 = styled.h1`
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  color: #ffd400;
  margin-top: 20px;
`;

export const WrapperP = styled.p`
  font-size: 16px;
  text-align: center;
  margin: 10px 0;
  color: #333;
`;
export const HeaderWrapper = styled.div`
  background-color: #0055a5;
  color: white;
`;

export const TopBanner = styled.div`
  height: 30px;
  background: #007acc;
`;

export const NavBar = styled.div`
  display: flex;
  align-items: center;
  padding: 10px 24px;
`;

export const Logo = styled.div`
  display: flex;
  align-items: center;
  font-size: 26px;
  font-weight: bold;
  color: white;
`;

export const LogoImage = styled.img`
  height: 80px; 
  width: auto; 
  margin-right: 5px;
`;



export const MenuButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-size: 16px;
  margin-right: 24px;
`;

export const RightActions = styled.div`
  display: flex;
  gap: 16px;
  align-items: center;
  margin-left: auto;
`;

export const Location = styled.div`
  font-size: 14px;
  color: white;
`;

export const CategoryList = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  background-color: #f5f5f5;
  padding: 12px 0;
`;

export const CategoryItem = styled.div`
  margin: 0 10px;
  font-size: 14px;
  color: #000;
  cursor: pointer;

  &:hover {
    color: #0050b3;
    text-decoration: underline;
  }
`;


export const LocationWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: white;
`;

export const LocationLabel = styled.span`
  font-size: 14px;
  color: white;
`;

export const LocationSelect = styled(Select)`
  .ant-select-selector {
    background-color: white !important;
    color: black;
    border-radius: 4px;
    height: 32px !important;
    display: flex;
    align-items: center;
  }
`;
//Footer
export const StyledFooter = styled(Footer)`
  background-color: #1C352D;
  color: #fff;
  padding: 40px 80px;
`;

// Login
export const LoginWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 60px 0; // Thay min-height bằng padding
  background: #f0f2f5;
`;
export const StyledCard = styled(Card)`
  width: 400px;
  .ant-card-body {
    padding: 32px;
  }
`;

//Register

export const Container = styled.div`
  min-height: 100vh;
  background-color: #f0f2f5;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const RegisterWrapper = styled.div`
  width: 100%;
  max-width: 500px;
`;

export const Styled1Card = styled(Card)`
  border-radius: 12px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15);
`;

export const StyledForm = styled(Form)`
  .ant-form-item {
    margin-bottom: 16px;
  }

  .ant-input,
  .ant-input-password {
    border-radius: 8px;
    padding: 10px;
  }

  .ant-btn {
    border-radius: 8px;
    padding: 10px;
    font-weight: bold;
  }
`;

export const Title = styled.h2`
  text-align: center;
  font-size: 24px;
  margin-bottom: 24px;
  color: #1890ff;
`;