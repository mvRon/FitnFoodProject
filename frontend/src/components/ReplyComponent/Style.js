// src/components/ReviewComponent/ReplyComponentStyle.js

import styled from 'styled-components';
import { Typography, Button, Input } from 'antd';

const { Text } = Typography;

export const ReplyContainer = styled.div`
  margin-left: 40px;
  margin-top: 12px;
  padding: 12px;
  border-left: 2px solid #e2e8f0;
  background-color: #f7fafc;
  border-radius: 8px;
`;

export const ReplyText = styled(Text)`
  color: #4a5568;
  font-size: 14px;
  line-height: 1.6;
`;

export const ReplyInput = styled(Input.TextArea)`
  border-radius: 8px !important;
  min-height: 60px !important;
  font-size: 14px;
  resize: vertical;
  border-color: #cbd5e0 !important;

  &:focus, &:hover {
    border-color: #4299e1 !important;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2) !important;
  }
`;

export const ReplySubmitButton = styled(Button)`
  background-color: #4299e1 !important;
  border-color: #4299e1 !important;
  font-weight: 600;
  margin-top: 8px;

  &:hover {
    background-color: #3182ce !important;
    border-color: #3182ce !important;
  }
`;

export const ReplyEditButton = styled(Button)`
  color: #4299e1 !important;
  border-color: #4299e1 !important;
  font-size: 13px;

  &:hover {
    color: #3182ce !important;
    border-color: #3182ce !important;
  }
`;

export const ReplyDeleteButton = styled(Button)`
  color: #e53e3e !important;
  border-color: #e53e3e !important;
  font-size: 13px;

  &:hover {
    color: #c53030 !important;
    border-color: #c53030 !important;
  }
`;

export const CommentMetaWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  
  @media (max-width: 576px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }
`;

export const CommentUserName = styled(Text)`
  font-weight: 600;
  color: #2d3748;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;
  
  @media (max-width: 576px) {
    max-width: 100%;
  }
`;

export const CommentDate = styled(Text)`
  color: #a0aec0;
  font-size: 13px;
  margin-left: auto;
  white-space: nowrap;
  
  @media (max-width: 576px) {
    margin-left: 0;
    font-size: 12px;
  }
`;

export const AdminBadge = styled.span`
  background-color: #ff4d4f;
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  font-weight: 500;
`;


export const UserBadge = styled.span`
  background-color:rgb(53, 129, 201);
  color: #fff;
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  margin-left: 8px;
  font-weight: 500;
`;