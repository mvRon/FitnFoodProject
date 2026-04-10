import React, { useEffect, useMemo, useRef, useState } from "react";
import { Button, Input, message as toast } from "antd";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import * as ChatService from "../../services/ChatService";
import {
  AdminChatBody,
  AdminChatFooter,
  AdminChatHeader,
  AdminChatList,
  AdminChatListItem,
  AdminChatPanel,
  AdminChatShell,
  AdminMessageBubble,
  AdminMessageRow,
  ListMeta,
  ListTitle,
  StatusBadge,
} from "./Style";

const getAccessToken = () => {
  const raw = localStorage.getItem("access_token");
  if (!raw) return "";
  try {
    return JSON.parse(raw);
  } catch (error) {
    return raw;
  }
};

const statusConfig = (status) => {
  switch (status) {
    case "waiting_for_admin":
      return { label: "Chờ tiếp nhận", color: "#fde68a" };
    case "admin_active":
      return { label: "Đang hỗ trợ", color: "#bbf7d0" };
    default:
      return { label: "Bot hỗ trợ", color: "#e2e8f0" };
  }
};

const AdminChatComponent = () => {
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);
  const activeConversationRef = useRef(null);

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const accessToken = useMemo(() => getAccessToken(), [user?.access_token]);

  const socketUrl = useMemo(() => {
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    const apiBase = process.env.REACT_APP_API_URL_BACKEND || "";
    return apiBase.replace(/\/api\/?$/, "");
  }, []);

  const refreshConversations = async () => {
    if (!accessToken) return;
    try {
      const response = await ChatService.getAdminConversations(accessToken);
      setConversations(response?.data || []);
    } catch (error) {
      toast.error("Không thể tải danh sách hội thoại");
    }
  };

  useEffect(() => {
    activeConversationRef.current = activeConversation;
  }, [activeConversation]);

  useEffect(() => {
    if (!accessToken || !user?.isAdmin) return undefined;

    refreshConversations();

    const socket = io(socketUrl, {
      auth: { token: accessToken },
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("chat:handoff_request", () => {
      refreshConversations();
    });

    socket.on("chat:message", (message) => {
      if (String(message?.conversation) === String(activeConversationRef.current?._id)) {
        setMessages((prev) => [...prev, message]);
      }
    });

    socket.on("chat:status", (payload) => {
      refreshConversations();
      if (payload?.conversationId && String(payload.conversationId) === String(activeConversationRef.current?._id)) {
        setActiveConversation((prev) =>
          prev ? { ...prev, status: payload.status, admin: payload.admin || null } : prev
        );
      }
    });

    socket.on("connect_error", () => {
      toast.error("Không thể kết nối socket admin");
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [accessToken, user?.isAdmin, socketUrl]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectConversation = async (conversation) => {
    if (!conversation?._id || !accessToken) return;

    setActiveConversation(conversation);
    setIsLoading(true);

    try {
      const response = await ChatService.getConversationMessages(conversation._id, accessToken);
      setMessages(response?.data || []);

      if (socketRef.current) {
        socketRef.current.emit("chat:join", { conversationId: conversation._id });
      }

      if (conversation.status === "waiting_for_admin" && socketRef.current) {
        socketRef.current.emit("admin:accept", { conversationId: conversation._id });
      }
    } catch (error) {
      toast.error("Không thể tải tin nhắn của hội thoại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = () => {
    const messageText = input.trim();
    if (!messageText || !socketRef.current || !activeConversation?._id) return;

    socketRef.current.emit("admin:send", {
      conversationId: activeConversation._id,
      content: messageText,
    });
    setInput("");
  };

  const handleCloseSupport = () => {
    if (!socketRef.current || !activeConversation?._id) return;
    socketRef.current.emit("chat:close", { conversationId: activeConversation._id });
  };

  if (!user?.isAdmin) {
    return <div style={{ padding: 18 }}>Bạn không có quyền truy cập kênh admin chat.</div>;
  }

  return (
    <AdminChatShell>
      <AdminChatList>
        {conversations.length === 0 && <ListMeta>Chưa có hội thoại cần hỗ trợ.</ListMeta>}
        {conversations.map((conversation) => {
          const customerName = conversation?.customer?.name || conversation?.customer?.email || "Khách hàng";
          const status = statusConfig(conversation?.status);
          return (
            <AdminChatListItem
              key={conversation._id}
              onClick={() => handleSelectConversation(conversation)}
              $active={String(activeConversation?._id) === String(conversation._id)}
            >
              <ListTitle>{customerName}</ListTitle>
              <ListMeta>{conversation?.customer?.email || ""}</ListMeta>
              <StatusBadge $color={status.color}>{status.label}</StatusBadge>
            </AdminChatListItem>
          );
        })}
      </AdminChatList>

      <AdminChatPanel>
        <AdminChatHeader>
          <div>
            <ListTitle>
              {activeConversation
                ? `Hỗ trợ: ${activeConversation?.customer?.name || activeConversation?.customer?.email || "Khách hàng"}`
                : "Chọn hội thoại để bắt đầu hỗ trợ"}
            </ListTitle>
            <ListMeta>{activeConversation?.status ? statusConfig(activeConversation.status).label : ""}</ListMeta>
          </div>
          <Button
            danger
            onClick={handleCloseSupport}
            disabled={!activeConversation || activeConversation?.status === "bot_active"}
          >
            Kết thúc hỗ trợ
          </Button>
        </AdminChatHeader>
        <AdminChatBody>
          {isLoading && <ListMeta>Đang tải tin nhắn...</ListMeta>}
          {!isLoading && messages.length === 0 && <ListMeta>Chưa có tin nhắn.</ListMeta>}
          {messages.map((message) => (
            <AdminMessageRow key={message._id} $isAdmin={message.sender === "admin"}>
              <AdminMessageBubble $isAdmin={message.sender === "admin"}>{message.content}</AdminMessageBubble>
            </AdminMessageRow>
          ))}
          <div ref={bottomRef} />
        </AdminChatBody>
        <AdminChatFooter>
          <Input
            value={input}
            placeholder="Nhập tin nhắn..."
            onChange={(event) => setInput(event.target.value)}
            onPressEnter={handleSend}
            disabled={!activeConversation}
          />
          <Button type="primary" onClick={handleSend} disabled={!input.trim() || !activeConversation}>
            Gửi
          </Button>
        </AdminChatFooter>
      </AdminChatPanel>
    </AdminChatShell>
  );
};

export default AdminChatComponent;
