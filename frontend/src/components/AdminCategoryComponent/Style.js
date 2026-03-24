import { Upload } from "antd";
import styled, { createGlobalStyle } from "styled-components";

export const CategoryGlobalStyle = createGlobalStyle`
  .category-parent-row {
    background-color: #fffbe6 !important;
  }
  .category-parent-tag {
    margin-left: 8px;
    background: #faad14;
    color: #fff;
    border-radius: 4px;
    padding: 2px 6px;
    font-size: 12px;
    font-weight: bold;
    letter-spacing: 1px;
  }
`;

export const WrapperHeader = styled.h1`
    color: #000;
    font-size: 14px;
    
`

export const WrapperUploadFile = styled(Upload)`
    & .ant-upload.ant-upload-select.ant-upload-select-picture-card {
        width: 60px;
        height: 60px;
        border-radius: 50%;
    }
    & .ant-upload-list-item-container {
        display: none;
    }
`