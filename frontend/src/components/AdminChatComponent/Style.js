import styled from "styled-components";

export const AdminChatShell = styled.div`
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 16px;
  padding: 18px;
  min-height: 520px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

export const AdminChatList = styled.div`
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(2, 132, 199, 0.2);
  border-radius: 16px;
  padding: 14px;
  box-shadow: 0 14px 32px rgba(2, 132, 199, 0.12);
  max-height: 560px;
  overflow-y: auto;
`;

export const AdminChatListItem = styled.button`
  width: 100%;
  border: none;
  text-align: left;
  padding: 12px 10px;
  border-radius: 12px;
  margin-bottom: 10px;
  background: ${(props) =>
    props.$active
      ? "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.15))"
      : "#f8fafc"};
  border: 1px solid rgba(148, 163, 184, 0.35);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 12px 24px rgba(2, 132, 199, 0.14);
  }
`;

export const ListTitle = styled.div`
  font-size: 13px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 4px;
`;

export const ListMeta = styled.div`
  font-size: 11px;
  color: #64748b;
`;

export const StatusBadge = styled.span`
  display: inline-block;
  margin-top: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  background: ${(props) => props.$color || "#e2e8f0"};
  color: #0f172a;
`;

export const AdminChatPanel = styled.div`
  border-radius: 18px;
  border: 1px solid rgba(16, 185, 129, 0.2);
  background: #ffffff;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 40px rgba(15, 23, 42, 0.1);
`;

export const AdminChatHeader = styled.div`
  padding: 16px 18px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.3);
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(2, 132, 199, 0.1));
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
`;

export const AdminChatBody = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.9), #ffffff);
`;

export const AdminChatFooter = styled.div`
  padding: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.3);
  display: flex;
  gap: 8px;
`;

export const AdminMessageRow = styled.div`
  display: flex;
  justify-content: ${(props) => (props.$isAdmin ? "flex-end" : "flex-start")};
  margin-bottom: 10px;
`;

export const AdminMessageBubble = styled.div`
  max-width: 80%;
  padding: 10px 12px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.4;
  color: ${(props) => (props.$isAdmin ? "#ffffff" : "#0f172a")};
  background: ${(props) =>
    props.$isAdmin
      ? "linear-gradient(135deg, rgba(2, 132, 199, 0.9), rgba(16, 185, 129, 0.92))"
      : "#f1f5f9"};
`;
