import styled from "styled-components";

export const ChatWidgetShell = styled.div`
  position: fixed;
  right: 22px;
  bottom: 22px;
  z-index: 999;
  font-family: "Poppins", "Nunito", sans-serif;
`;

export const ChatLauncher = styled.button`
  width: 58px;
  height: 58px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  background: radial-gradient(circle at 30% 30%, #facc15, #10b981 55%, #0284c7);
  box-shadow: 0 12px 30px rgba(2, 132, 199, 0.35);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px) scale(1.02);
    box-shadow: 0 18px 40px rgba(16, 185, 129, 0.35);
  }
`;

export const ChatWindow = styled.div`
  width: min(92vw, 360px);
  height: min(78vh, 520px);
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 28px 60px rgba(15, 23, 42, 0.22);
  border: 1px solid rgba(2, 132, 199, 0.2);
  display: flex;
  flex-direction: column;
`;

export const ChatHeader = styled.div`
  padding: 14px 18px;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(2, 132, 199, 0.92));
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ChatHeaderText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const ChatTitle = styled.div`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.3px;
`;

export const ChatStatus = styled.div`
  font-size: 12px;
  opacity: 0.9;
`;

export const ChatBody = styled.div`
  flex: 1;
  padding: 14px 16px;
  overflow-y: auto;
  overflow-x: hidden;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.9));
`;

export const MessageRow = styled.div`
  display: flex;
  width: 100%;
  margin-bottom: 12px;
  align-items: flex-start;
  justify-content: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
`;

export const MessageBubble = styled.div`
  display: inline-block;
  max-width: 78%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
  color: ${(props) => (props.$isUser ? "#ffffff" : "#0f172a")};
  background: ${(props) =>
    props.$isUser
      ? "linear-gradient(135deg, rgba(2, 132, 199, 0.95), rgba(16, 185, 129, 0.95))"
      : "#ffffff"};
  box-shadow: ${(props) =>
    props.$isUser
      ? "0 10px 24px rgba(2, 132, 199, 0.3)"
      : "0 8px 20px rgba(15, 23, 42, 0.08)"};
`;

export const MessageStack = styled.div`
  display: flex;
  flex-direction: column;
  align-items: ${(props) => (props.$isUser ? "flex-end" : "flex-start")};
  gap: 4px;
  width: 100%;
  min-width: 0;
`;

export const MessageLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: ${(props) => (props.$isUser ? "#7dd3fc" : "#64748b")};
`;

export const MessageMeta = styled.div`
  font-size: 11px;
  color: #64748b;
  margin-top: 4px;
`;

export const ProductRail = styled.div`
  margin-top: 8px;
  display: flex;
  gap: 10px;
  overflow-x: auto;
  padding-bottom: 6px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  &::-webkit-scrollbar {
    height: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(16, 185, 129, 0.3);
    border-radius: 4px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(16, 185, 129, 0.5);
  }
`;

export const ProductCard = styled.div`
  min-width: 150px;
  border-radius: 12px;
  padding: 10px;
  background: #f8fafc;
  border: 1px solid rgba(16, 185, 129, 0.2);
  box-shadow: 0 10px 22px rgba(2, 132, 199, 0.12);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 26px rgba(2, 132, 199, 0.2);
  }

  img {
    width: 100%;
    height: 90px;
    object-fit: cover;
    border-radius: 10px;
    margin-bottom: 8px;
  }
`;

export const ProductName = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #0f172a;
  margin-bottom: 4px;
`;

export const ProductPrice = styled.div`
  font-size: 12px;
  color: #0284c7;
  font-weight: 700;
`;

export const ChatFooter = styled.div`
  padding: 12px 14px;
  background: #ffffff;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const ChatInputRow = styled.div`
  display: flex;
  gap: 8px;
`;

export const HandoffButton = styled.button`
  border: none;
  background: ${(props) => (props.disabled ? "#e2e8f0" : "linear-gradient(135deg, #f59e0b, #f97316)")};
  color: ${(props) => (props.disabled ? "#94a3b8" : "#ffffff")};
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-1px)")};
  }
`;

export const EndSupportButton = styled.button`
  border: none;
  background: ${(props) => (props.disabled ? "#e2e8f0" : "linear-gradient(135deg, #ef4444, #f97316)")};
  color: ${(props) => (props.disabled ? "#94a3b8" : "#ffffff")};
  padding: 8px 12px;
  font-size: 12px;
  border-radius: 12px;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  font-weight: 600;
  transition: transform 0.2s ease;

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-1px)")};
  }
`;

export const LoginHint = styled.div`
  font-size: 12px;
  color: #475569;
  padding: 8px 0 4px;
  text-align: center;
`;

export const ActionButtonsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
  width: 100%;
`;

export const ActionButton = styled.button`
  border: none;
  padding: 8px 14px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: ${(props) => (props.disabled ? "not-allowed" : "pointer")};
  transition: all 0.2s ease;
  opacity: ${(props) => (props.disabled ? 0.5 : 1)};
  white-space: nowrap;

  background: ${(props) => {
    if (props.disabled) return "#e2e8f0";
    if (props.$variant === "primary")
      return "linear-gradient(135deg, rgba(16, 185, 129, 0.95), rgba(2, 132, 199, 0.95))";
    return "#f1f5f9";
  }};
  color: ${(props) => {
    if (props.disabled) return "#94a3b8";
    if (props.$variant === "primary") return "#ffffff";
    return "#0f172a";
  }};
  box-shadow: ${(props) => {
    if (props.disabled) return "none";
    if (props.$variant === "primary")
      return "0 4px 14px rgba(2, 132, 199, 0.25)";
    return "0 2px 8px rgba(15, 23, 42, 0.08)";
  }};
  border: ${(props) =>
    props.$variant === "primary" ? "none" : "1px solid rgba(148, 163, 184, 0.3)"};

  &:hover {
    transform: ${(props) => (props.disabled ? "none" : "translateY(-1px)")};
    box-shadow: ${(props) => {
      if (props.disabled) return "none";
      if (props.$variant === "primary")
        return "0 8px 20px rgba(2, 132, 199, 0.35)";
      return "0 4px 12px rgba(15, 23, 42, 0.12)";
    }};
  }

  &:active {
    transform: ${(props) => (props.disabled ? "none" : "scale(0.97)")};
  }
`;

export const CartNotification = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  margin: 6px 0;
  border-radius: 10px;
  font-size: 12px;
  font-weight: 500;
  color: #065f46;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.08));
  border: 1px solid rgba(16, 185, 129, 0.25);
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
