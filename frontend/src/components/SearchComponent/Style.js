import styled, { keyframes } from 'styled-components';

const glowIn = keyframes`
  0% {
    transform: translateY(6px);
    opacity: 0.6;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

export const SearchShell = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  gap: 10px;
  width: min(720px, 100%);
  padding: 6px 8px 6px 14px;
  border-radius: 999px;
  background: rgba(248, 250, 252, 0.92);
  border: 1px solid rgba(2, 132, 199, 0.2);
  box-shadow: 0 18px 35px rgba(2, 132, 199, 0.18);
  backdrop-filter: blur(10px);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
  animation: ${glowIn} 0.4s ease;

  &::before {
    content: '';
    position: absolute;
    inset: -2px;
    border-radius: 999px;
    padding: 2px;
    background: linear-gradient(120deg, rgba(16, 185, 129, 0.6), rgba(2, 132, 199, 0.6), rgba(245, 158, 11, 0.55));
    mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    mask-composite: exclude;
    opacity: 0.65;
    pointer-events: none;
  }

  &:focus-within {
    border-color: rgba(245, 158, 11, 0.7);
    box-shadow: 0 22px 45px rgba(16, 185, 129, 0.25);
    transform: translateY(-1px);
  }

  @media (max-width: 768px) {
    gap: 6px;
    padding: 4px 6px 4px 12px;
  }
`;

export const SearchIconWrap = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--color-secondary);
  font-size: 16px;
  background: rgba(2, 132, 199, 0.12);
  border-radius: 999px;
  padding: 6px;

  @media (max-width: 768px) {
    font-size: 14px;
    padding: 4px;
  }
`;

export const InputContainer = styled.div`
  position: relative;
  flex: 1;
  display: flex;
  align-items: center;
  overflow: hidden;
`;

export const GhostText = styled.span`
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(30, 41, 59, 0.35);
  font-size: 14px;
  font-weight: 500;
  pointer-events: none;
  white-space: pre;
  user-select: none;
  z-index: 0;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const SearchInput = styled.input`
  flex: 1;
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  z-index: 1;

  &::placeholder {
    color: rgba(30, 41, 59, 0.55);
    font-weight: 400;
  }

  &:disabled {
    color: rgba(30, 41, 59, 0.45);
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const SearchButton = styled.button`
  border: none;
  cursor: pointer;
  padding: 8px 18px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.3px;
  color: #ffffff;
  background: linear-gradient(120deg, var(--color-accent), rgba(245, 158, 11, 0.75));
  box-shadow: 0 12px 24px rgba(245, 158, 11, 0.3);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 16px 28px rgba(245, 158, 11, 0.38);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
    box-shadow: none;
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 11px;
  }
`;

export const ClearButton = styled.button`
  border: none;
  background: transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: rgba(30, 41, 59, 0.5);
  font-size: 16px;
  padding: 4px;
  border-radius: 999px;
  transition: color 0.2s ease, background 0.2s ease;

  &:hover {
    color: var(--color-secondary);
    background: rgba(2, 132, 199, 0.12);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.4;
  }

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

export const SuggestionsPanel = styled.div`
  position: fixed;
  background: #ffffff;
  border-radius: 18px;
  padding: 10px;
  box-shadow: 0 20px 50px rgba(2, 132, 199, 0.18);
  border: 1px solid rgba(2, 132, 199, 0.18);
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 20;
  max-height: min(420px, 52vh);
  overflow: auto;

  @media (max-width: 768px) {
    border-radius: 14px;
    padding: 8px;
  }
`;

export const SuggestionItem = styled.button`
  border: none;
  background: rgba(248, 250, 252, 0.9);
  border-radius: 14px;
  padding: 8px 10px;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  text-align: left;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(16, 185, 129, 0.18);
  }
`;

export const SuggestionThumb = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 12px;
  object-fit: cover;
  background: #f8fafc;
  border: 1px solid rgba(2, 132, 199, 0.12);

  @media (max-width: 768px) {
    width: 36px;
    height: 36px;
  }
`;

export const SuggestionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
  flex: 1;
  overflow: hidden;
`;

export const SuggestionTitleRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  width: 100%;
`;

export const SuggestionName = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 0 1 auto;
`;

export const SemanticBadge = styled.span`
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.2);
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 600;
  white-space: nowrap;
  flex-shrink: 0;
`;

export const SuggestionMeta = styled.span`
  font-size: 11px;
  color: rgba(30, 41, 59, 0.6);
`;

export const SuggestionStatus = styled.div`
  font-size: 12px;
  padding: 10px;
  text-align: center;
  color: rgba(30, 41, 59, 0.6);
`;

export const SuggestionsFooter = styled.button`
  border: none;
  background: linear-gradient(120deg, rgba(16, 185, 129, 0.16), rgba(2, 132, 199, 0.12));
  color: var(--color-secondary);
  font-weight: 600;
  padding: 8px;
  border-radius: 999px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 20px rgba(2, 132, 199, 0.18);
  }
`;
