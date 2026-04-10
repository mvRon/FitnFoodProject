import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Button, Input, message as toast } from "antd";
import { CloseOutlined, CustomerServiceOutlined, MessageOutlined, SendOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import * as ChatService from "../../services/ChatService";
import { convertPrice } from "../../utils";
import {
  ChatBody,
  ChatFooter,
  ChatHeader,
  ChatHeaderText,
  ChatInputRow,
  ChatLauncher,
  ChatStatus,
  ChatTitle,
  ChatWidgetShell,
  ChatWindow,
  HandoffButton,
  LoginHint,
  MessageBubble,
  MessageMeta,
  MessageLabel,
  MessageRow,
  MessageStack,
  ProductCard,
  ProductName,
  ProductPrice,
  ProductRail,
  EndSupportButton,
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

const formatStatus = (status) => {
  switch (status) {
    case "waiting_for_admin":
      return "Đang chờ nhân viên tham gia";
    case "admin_active":
      return "Nhân viên đang hỗ trợ";
    default:
      return "FitnFood AI đang hỗ trợ";
  }
};

const ChatWidget = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.user);
  const socketRef = useRef(null);
  const bottomRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [status, setStatus] = useState("bot_active");
  const [input, setInput] = useState("");
  const [hasAuth, setHasAuth] = useState(true);

  const accessToken = useMemo(() => getAccessToken(), [user?.access_token]);

  const socketUrl = useMemo(() => {
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    const apiBase = process.env.REACT_APP_API_URL_BACKEND || "";
    return apiBase.replace(/\/api\/?$/, "");
  }, []);

  useEffect(() => {
    if (!isOpen) return undefined;

    const initChat = async () => {
      if (!accessToken) {
        setHasAuth(false);
        return;
      }

      setHasAuth(true);
      setIsLoading(true);

      try {
        const response = await ChatService.getOrCreateConversation(accessToken);
        const data = response?.data || {};
        setConversation(data.conversation || null);
        setMessages(data.messages || []);
        setStatus(data.conversation?.status || "bot_active");

        if (!socketUrl) {
          toast.error("CHưa cấu hình socket URL");
          return;
        }

        const socket = io(socketUrl, {
          auth: { token: accessToken },
          transports: ["websocket"],
        });
        socketRef.current = socket;

        socket.on("chat:message", (message) => {
          setMessages((prev) => [...prev, message]);
        });

        socket.on("chat:status", (payload) => {
          if (payload?.status) {
            setStatus(payload.status);
            setConversation((prev) =>
              prev ? { ...prev, status: payload.status, admin: payload.admin || null } : prev
            );
          }
        });

        socket.on("chat:conversation", ({ conversation: nextConversation }) => {
          if (nextConversation) {
            setConversation(nextConversation);
            setStatus(nextConversation.status || "bot_active");
          }
        });

        socket.on("connect_error", () => {
          toast.error("Không thể kết nối chat. Vui lòng thử lại.");
        });

        if (data.conversation?._id) {
          socket.emit("chat:join", { conversationId: data.conversation._id });
        }
      } catch (error) {
        toast.error("Không thể tải đoạn chat. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    initChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [accessToken, isOpen, socketUrl]);

  useEffect(() => {
    if (!isOpen) return;
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = () => {
    const messageText = input.trim();
    if (!messageText || !socketRef.current) return;

    socketRef.current.emit("chat:send", {
      conversationId: conversation?._id,
      content: messageText,
    });
    setInput("");
  };

  const handleHandoff = () => {
    if (!conversation?._id || !socketRef.current) return;
    socketRef.current.emit("chat:handoff", { conversationId: conversation._id });
  };

  const handleEndSupport = () => {
    if (!conversation?._id || !socketRef.current) return;
    socketRef.current.emit("chat:close", { conversationId: conversation._id });
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <ChatWidgetShell>
      {!isOpen && (
        <ChatLauncher onClick={() => setIsOpen(true)} aria-label="Mo chat">
          <MessageOutlined style={{ fontSize: 22 }} />
        </ChatLauncher>
      )}

      {isOpen && (
        <ChatWindow>
          <ChatHeader>
            <ChatHeaderText>
              <ChatTitle>FitnFood Chat</ChatTitle>
              <ChatStatus>{formatStatus(status)}</ChatStatus>
            </ChatHeaderText>
            <Button
              type="text"
              onClick={() => setIsOpen(false)}
              icon={<CloseOutlined style={{ color: "#ffffff" }} />}
            />
          </ChatHeader>

          <ChatBody>
            {!hasAuth && (
              <LoginHint>
                Bạn cần đăng nhập để bắt đầu chat. <br />
                <Button type="link" onClick={() => navigate("/login")}>
                  Đăng nhập ngay
                </Button>
              </LoginHint>
            )}

            {hasAuth && messages.length === 0 && !isLoading && (
              <LoginHint>Chào bạn! Hãy đặt câu hỏi về sản phẩm định dưỡng.</LoginHint>
            )}

            {messages.map((message) => {
              const sender = String(message.sender || "bot").toLowerCase();
              const isUser = sender === "user";
              const isAdmin = sender === "admin";
              const senderLabel = isUser ? "Bạn" : isAdmin ? "Nhân viên" : "FITnFOOD AI";
              const productCards = message?.metadata?.products || [];
              const timestamp = message?.createdAt
                ? new Date(message.createdAt).toLocaleTimeString("vi-VN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })
                : "";

              return (
                <MessageRow key={message._id || `${message.sender}-${timestamp}`} $isUser={isUser}>
                  <MessageStack $isUser={isUser}>
                    <MessageBubble $isUser={isUser}>
                      {!isUser && <MessageLabel $isUser={false}>{senderLabel}:</MessageLabel>}
                      {message.content}
                    </MessageBubble>
                    {timestamp && <MessageMeta>{timestamp}</MessageMeta>}
                    {productCards.length > 0 && (
                      <ProductRail>
                        {productCards.map((product) => {
                          const image = product?.images?.[0] || "";
                          const priceAfterDiscount = product?.price
                            ? product.price - (product.price * (product.discount || 0)) / 100
                            : 0;
                          return (
                            <ProductCard
                              key={product._id}
                              onClick={() => navigate(`/productDetail/${product._id}`)}
                            >
                              {image && <img src={image} alt={product.name} />}
                              <ProductName>{product.name}</ProductName>
                              <ProductPrice>
                                {priceAfterDiscount ? convertPrice(priceAfterDiscount) : "Liên hệ"}
                              </ProductPrice>
                            </ProductCard>
                          );
                        })}
                      </ProductRail>
                    )}
                  </MessageStack>
                </MessageRow>
              );
            })}
            <div ref={bottomRef} />
          </ChatBody>

          <ChatFooter>
            {status === "bot_active" ? (
              <HandoffButton
                onClick={handleHandoff}
                disabled={!conversation?._id}
              >
                <CustomerServiceOutlined style={{ marginRight: 6 }} />
                Gặp nhân viên hỗ trợ
              </HandoffButton>
            ) : (
              <EndSupportButton
                onClick={handleEndSupport}
                disabled={!conversation?._id}
              >
                Kết thúc hỗ trợ
              </EndSupportButton>
            )}
            <ChatInputRow>
              <Input.TextArea
                rows={1}
                value={input}
                placeholder="Nhập tin nhắn..."
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                disabled={!hasAuth}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                disabled={!input.trim() || !hasAuth}
              />
            </ChatInputRow>
          </ChatFooter>
        </ChatWindow>
      )}
    </ChatWidgetShell>
  );
};

export default ChatWidget;
