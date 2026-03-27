
import styled from 'styled-components';
import { Form, Button } from 'antd';

export const Container = styled.div`
  --primary: #10b981;
  --secondary: #0284c7;
  --accent: #f59e0b;
  --bg: #f8fafc;
  --text: #1e293b;
  --muted: #64748b;

  max-width: 980px;
  margin: 28px auto 48px;
  padding: 0 18px;
`;

export const HeroSection = styled.section`
  position: relative;
  overflow: hidden;
  border-radius: 22px;
  padding: 28px 24px;
  color: #fff;
  background: linear-gradient(120deg, var(--secondary), var(--primary));
  box-shadow: 0 16px 36px rgba(2, 132, 199, 0.25);
  margin-bottom: 18px;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 999px;
    pointer-events: none;
  }

  &::before {
    width: 170px;
    height: 170px;
    right: -35px;
    top: -45px;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.34) 0%, rgba(255, 255, 255, 0) 72%);
  }

  &::after {
    width: 210px;
    height: 210px;
    left: -70px;
    bottom: -90px;
    background: radial-gradient(circle, rgba(245, 158, 11, 0.24) 0%, rgba(245, 158, 11, 0) 75%);
  }
`;

export const HeroBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.2);
`;

export const HeroTitle = styled.h1`
  margin: 12px 0 6px;
  font-size: 32px;
  line-height: 1.2;
  font-weight: 800;
`;

export const HeroSubtitle = styled.p`
  margin: 0;
  max-width: 620px;
  color: rgba(255, 255, 255, 0.92);
  font-size: 15px;
  line-height: 1.6;
`;

export const ProfileCard = styled.section`
  background: #ffffff;
  border-radius: 22px;
  padding: 22px;
  box-shadow: 0 18px 36px rgba(15, 23, 42, 0.08);
  border: 1px solid #e2e8f0;
`;

export const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
  margin-bottom: 20px;
`;

export const AvatarRing = styled.div`
  width: 96px;
  height: 96px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(145deg, var(--primary), var(--secondary));
  box-shadow: 0 10px 22px rgba(16, 185, 129, 0.3);

  .ant-image {
    width: 84px;
    height: 84px;
    border-radius: 50%;
    overflow: hidden;
    border: 3px solid #ffffff;
  }
`;

export const HeaderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

export const HeaderName = styled.h2`
  margin: 0;
  color: var(--text);
  font-size: 24px;
  font-weight: 700;
`;

export const HeaderRole = styled.span`
  display: inline-flex;
  width: fit-content;
  padding: 6px 12px;
  border-radius: 999px;
  font-weight: 600;
  font-size: 13px;
  color: #075985;
  background: rgba(2, 132, 199, 0.16);
`;

export const CardTitle = styled.h3`
  margin: 4px 0 16px;
  font-size: 20px;
  font-weight: 700;
  color: var(--text);
`;

export const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const InfoRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  min-height: 84px;
  padding: 14px;
  border-radius: 14px;
  border: 1px solid #e2e8f0;
  background: linear-gradient(180deg, #ffffff 0%, #f8fafc 100%);

  @media (max-width: 760px) {
    min-height: auto;
    padding: 12px;
  }
`;

export const FieldLabel = styled.span`
  font-weight: 600;
  color: var(--muted);
  font-size: 13px;
`;

export const FieldValue = styled.span`
  color: var(--text);
  font-size: 16px;
  font-weight: 600;
  word-break: break-word;
`;

export const ProfileForm = styled(Form)`
  .ant-form-item-label > label {
    color: var(--text);
    font-weight: 600;
  }

  .ant-input {
    border-radius: 10px;
    border-color: #dbe5ef;
    padding: 9px 12px;
  }

  .ant-input:focus,
  .ant-input-focused {
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(16, 185, 129, 0.18);
  }
`;

export const FormActions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;

  @media (max-width: 540px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

export const PrimaryButton = styled(Button)`
  border-radius: 10px;
  height: 42px;
  font-weight: 700;
  border: none;
  background: linear-gradient(110deg, var(--primary), #0ea271);
  box-shadow: 0 10px 18px rgba(16, 185, 129, 0.25);

  &:hover,
  &:focus {
    background: linear-gradient(110deg, #0fb57e, #0c9d6e) !important;
    color: #fff !important;
  }
`;

export const SecondaryButton = styled(Button)`
  border-radius: 10px;
  height: 42px;
  font-weight: 700;
  color: #9a6700;
  border: 1px solid rgba(245, 158, 11, 0.46);
  background: rgba(245, 158, 11, 0.12);

  &:hover,
  &:focus {
    color: #9a6700 !important;
    border-color: rgba(245, 158, 11, 0.7) !important;
    background: rgba(245, 158, 11, 0.22) !important;
  }
`;

export const EmptyText = styled.span`
  color: #ffffff;
  font-weight: 700;
  font-size: 30px;
`;
