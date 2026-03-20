

import { Button } from "antd"
import styled from "styled-components"

export const WrapperTypeProduct = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  justify-content: flex-start;
  height: auto;
  margin-top: 10px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    justify-content: center;
    gap: 12px;
  }
`

export const WrapperButtonMore = styled(Button)`
  text-align: center;
  border: 1px solid #A6B28B;
  width: 240px;
  height: 46px;
  border-radius: 4px;

  background-color: ${(props) => (props.disabled ? '#d9d9d9' : '#fff')};
  color: ${(props) => (props.disabled ? 'red' : 'rgb(11, 116, 229)')};
  cursor: ${(props) => (props.disabled ? 'not-allowed' : 'pointer')};

  span {
    color: ${(props) => (props.disabled ? '#fff' : '#A6B28B')};
  }

  &:hover {
    background-color: ${(props) => props.disabled ? '#d9d9d9' : '#A6B28B'} !important;
    
    span {
      color: ${(props) => (props.disabled ? 'red' : '#fff')};
    }
  }
`;






export const WrapperProducts = styled.div`
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 768px) {
    gap: 10px;
  }
`

