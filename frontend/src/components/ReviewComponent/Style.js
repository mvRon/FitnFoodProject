
import styled from 'styled-components';
import { Input, Button, Progress, Rate, Typography, Divider as AntdDivider } from 'antd';

const { Text } = Typography;

// --- Layout & Containers ---
export const ReviewCommentContainer = styled.div`
  max-width: 900px;
  margin: 24px auto;
  padding: 24px;
  background-color: #f5f7fa;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
`;

// --- Rating Section ---
export const RatingSectionWrapper = styled.div`
  background-color: #ffffff;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  margin-bottom: 24px;
`;

export const RatingAverageContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
`;

export const RatingAverageScore = styled.span`
  font-size: 40px;
  font-weight: 700;
  color: #1a202c;
`;

export const RatingAverageText = styled.span`
  font-size: 18px;
  color: #718096;
`;

export const RatingStarsDisplay = styled.div`
  margin-bottom: 20px;
`;

export const RatingBreakdown = styled.div`
  width: 100%;
`;

export const RatingBreakdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const RatingStarLabel = styled.span`
  width: 60px;
  text-align: right;
`;

export const StyledProgress = styled(Progress)`
  flex: 1;
  .ant-progress-bg {
    background-color: #4299e1;
  }
`;

export const RatingCount = styled.span`
  width: 40px;
  text-align: left;
`;

export const StyledDivider = styled(AntdDivider)`
  margin: 24px 0 !important;
`;

export const RatingInputContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const StyledRate = styled(Rate)`
  font-size: 26px;
  color: #f6ad55;
`;

export const StyledRatingSubmitButton = styled(Button)`
  background-color: #4299e1 !important;
  border-color: #4299e1 !important;
  font-weight: 600;

  &:hover {
    background-color: #3182ce !important;
    border-color: #3182ce !important;
  }
`;

export const StyledTextArea = styled(Input.TextArea)`
  border-radius: 8px !important;
  min-height: 100px !important;
  font-size: 15px;
  resize: vertical;
  border-color: #cbd5e0 !important;

  &:focus, &:hover {
    border-color: #4299e1 !important;
    box-shadow: 0 0 0 2px rgba(66, 153, 225, 0.2) !important;
  }
`;

// --- Comment Section ---
export const CommentSectionWrapper = styled.div`
  background-color: #fff;
  padding: 24px;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

export const StyledCommentTitle = styled.h3`
  font-size: 22px;
  color: #2d3748;
  margin-bottom: 20px;
  text-align: center;
`;

export const CommentInputCard = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  border-radius: 10px;
  background-color: #f7fafc;
  border: 1px solid #e2e8f0;
`;

export const StyledCommentButton = styled(Button)`
  background-color: #48bb78 !important;
  border-color: #48bb78 !important;
  color: #fff !important;
  font-weight: 600;
  min-width: 120px;

  &:hover {
    background-color: #38a169 !important;
    border-color: #38a169 !important;
  }
`;

export const CommentLoginPrompt = styled.p`
  text-align: center;
  color: #718096;
  font-size: 15px;
  padding: 16px;
`;

export const CommentListContainer = styled.div`
  margin-top: 16px;
`;

export const CommentListItem = styled.div`
  background-color: #fff;
  padding: 16px 20px;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 12px;
`;

export const CommentMetaWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
`;

export const CommentUserName = styled(Text)`
  font-weight: 600;
  color: #2d3748;
`;

export const CommentDate = styled(Text)`
  color: #a0aec0;
  font-size: 13px;
  margin-left: auto;
`;

export const CommentContentText = styled(Text)`
  color: #4a5568;
  font-size: 15px;
  line-height: 1.6;
`;

export const CommentEditButton = styled(Button)`
  color: #4299e1 !important;
  border-color: #4299e1 !important;
  font-size: 13px;

  &:hover {
    color: #3182ce !important;
    border-color: #3182ce !important;
  }
`;

export const CommentDeleteButton = styled(Button)`
  color: #e53e3e !important;
  border-color: #e53e3e !important;
  font-size: 13px;

  &:hover {
    color: #c53030 !important;
    border-color: #c53030 !important;
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