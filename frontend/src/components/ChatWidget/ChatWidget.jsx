import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { Button, Input, Form, Modal, message as toast } from "antd";
import { CloseOutlined, CustomerServiceOutlined, MessageOutlined, SendOutlined, CreditCardOutlined, ShoppingCartOutlined, CheckCircleOutlined, LinkOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { io } from "socket.io-client";
import * as ChatService from "../../services/ChatService";
import * as UserService from "../../services/UserService";
import { convertPrice } from "../../utils";
import { setCartFromSocket, clearOrder } from "../../redux/slice/orderSlice";
import { updateUser } from "../../redux/slice/userSlice";
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
  ActionButtonsRow,
  ActionButton,
  CartNotification,
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

const getOrCreateGuestId = () => {
  const storageKey = "guest_chat_id";
  const stored = localStorage.getItem(storageKey);
  if (stored) return stored;
  let generated = "";
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    generated = crypto.randomUUID();
  } else {
    generated = `guest_${Date.now()}_${Math.random().toString(16).slice(2)}`;
  }
  localStorage.setItem(storageKey, generated);
  return generated;
};

const formatStatus = (status, isGuest) => {
  if (isGuest) {
    if (status === "admin_active") return "Nhân viên đang hỗ trợ";
    return "Đang chờ nhân viên hỗ trợ";
  }

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
  const dispatch = useDispatch();
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
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isAdminTyping, setIsAdminTyping] = useState(false);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [botStatusText, setBotStatusText] = useState("");
  const [disabledActions, setDisabledActions] = useState(new Set());
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressForm] = Form.useForm();

  const bodyRef = useRef(null);
  const prevLastMessageIdRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const accessToken = useMemo(() => getAccessToken(), [user?.access_token]);
  const guestId = useMemo(() => getOrCreateGuestId(), []);
  const isGuest = !accessToken;

  const socketUrl = useMemo(() => {
    if (process.env.REACT_APP_SOCKET_URL) return process.env.REACT_APP_SOCKET_URL;
    const apiBase = process.env.REACT_APP_API_URL_BACKEND || "";
    return apiBase.replace(/\/api\/?$/, "");
  }, []);

  const formatMessageTime = (createdAt) => {
    if (!createdAt) return "";
    const date = new Date(createdAt);
    const today = new Date();

    const isToday =
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear();

    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });

    if (isToday) {
      return timeStr;
    } else {
      const dateStr = date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
      return `${timeStr} - ${dateStr}`;
    }
  };

  useEffect(() => {
    if (!isOpen) return undefined;

    const initChat = async () => {
      setHasAuth(true);
      setIsLoading(true);

      try {
        const response = accessToken
          ? await ChatService.getOrCreateConversation(accessToken)
          : await ChatService.getOrCreateGuestConversation(guestId);
        const data = response?.data || {};
        setConversation(data.conversation || null);
        setMessages(data.messages || []);
        setStatus(data.conversation?.status || "bot_active");

        if (accessToken) {
          if (data.messages && data.messages.length < 5) {
            setHasMore(false);
          } else {
            setHasMore(true);
          }
        } else {
          setHasMore(false);
        }

        if (!socketUrl) {
          toast.error("Chưa cấu hình socket URL");
          return;
        }

        const socket = io(socketUrl, {
          auth: accessToken ? { token: accessToken } : { guestId },
          transports: ["websocket"],
        });
        socketRef.current = socket;

        socket.on("chat:message", (message) => {
          setMessages((prev) => [...prev, message]);
          const sender = String(message.sender).toLowerCase();
          if (sender === "bot" || sender === "admin") {
            setIsBotTyping(false);
            setBotStatusText("");
          }
        });

        socket.on("chat:bot_status", ({ status }) => {
          setBotStatusText(status || "");
        });

        socket.on("chat:typing", ({ sender, isTyping }) => {
          if (sender === "admin") {
            setIsAdminTyping(isTyping);
          }
        });

        socket.on("chat:status", (payload) => {
          if (payload?.status) {
            setStatus(payload.status);
            setConversation((prev) =>
              prev ? { ...prev, status: payload.status, admin: payload.admin || null } : prev
            );
            if (payload.status !== "bot_active") {
              setIsBotTyping(false);
              setBotStatusText("");
            }
          }
        });

        socket.on("chat:conversation", ({ conversation: nextConversation }) => {
          if (nextConversation) {
            setConversation(nextConversation);
            setStatus(nextConversation.status || "bot_active");
            if (nextConversation.status !== "bot_active") {
              setIsBotTyping(false);
              setBotStatusText("");
            }
          }
        });

        // Lắng nghe cart update từ chatbot
        socket.on("chat:cart_updated", (payload) => {
          if (payload?.items) {
            dispatch(setCartFromSocket(payload.items));
          }
        });

        // Lắng nghe order created từ chatbot
        socket.on("chat:order_created", (payload) => {
          if (payload?.orderId) {
            dispatch(clearOrder());
            toast.success(`Đặt hàng thành công! Mã đơn: ${String(payload.orderId).slice(-8).toUpperCase()}`);
          }
        });

        // Lắng nghe PayOS payment link từ chatbot
        socket.on("chat:payos_link", (payload) => {
          if (payload?.checkoutUrl) {
            // Thêm tin nhắn ảo vào danh sách để hiển thị nút link
            const payosMessage = {
              _id: `payos-${Date.now()}`,
              sender: "bot",
              content: `Link thanh toán PayOS đã sẵn sàng! Nhấn nút bên dưới để mở trang thanh toán và quét mã QR. Link sẽ hết hạn sau 15 phút.`,
              createdAt: new Date().toISOString(),
              metadata: {
                payosLink: payload.checkoutUrl,
                orderId: payload.orderId,
                totalPrice: payload.totalPrice,
              },
            };
            setMessages((prev) => [...prev, payosMessage]);
          }
        });

        socket.on("disconnect", () => {
          setIsBotTyping(false);
          setBotStatusText("");
        });

        socket.on("connect_error", () => {
          setIsBotTyping(false);
          setBotStatusText("");
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
  }, [accessToken, guestId, isOpen, socketUrl]);

  useEffect(() => {
    if (!isOpen || messages.length === 0) return;

    const lastMessage = messages[messages.length - 1];
    const lastMessageId = lastMessage._id || `${lastMessage.sender}-${lastMessage.createdAt}`;

    if (prevLastMessageIdRef.current !== lastMessageId) {
      if (bodyRef.current) {
        bodyRef.current.scrollTo({
          top: bodyRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
      prevLastMessageIdRef.current = lastMessageId;
    }
  }, [messages, isOpen]);

  const handleScroll = async () => {
    const container = bodyRef.current;
    if (!container || isLoading || isLoadingMore || !hasMore || isGuest || !conversation?._id) return;

    if (container.scrollTop <= 5) {
      setIsLoadingMore(true);
      const oldScrollHeight = container.scrollHeight;
      const oldScrollTop = container.scrollTop;

      try {
        const oldestMessage = messages[0];
        const before = oldestMessage ? oldestMessage.createdAt : null;

        if (before) {
          const response = await ChatService.getConversationMessages(
            conversation._id,
            accessToken,
            before
          );
          const oldMessages = response?.data || [];

          if (oldMessages.length === 0) {
            setHasMore(false);
          } else {
            if (oldMessages.length < 5) {
              setHasMore(false);
            }
            setMessages((prev) => [...oldMessages, ...prev]);

            setTimeout(() => {
              if (bodyRef.current) {
                const newScrollHeight = bodyRef.current.scrollHeight;
                bodyRef.current.scrollTop = newScrollHeight - oldScrollHeight + oldScrollTop;
              }
            }, 0);
          }
        }
      } catch (error) {
        console.error("Lỗi tải tin nhắn cũ:", error);
      } finally {
        setIsLoadingMore(false);
      }
    }
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
    if (!socketRef.current || !conversation?._id) return;

    if (!typingTimeoutRef.current) {
      socketRef.current.emit("chat:typing", {
        conversationId: conversation._id,
        isTyping: true,
      });
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      if (socketRef.current && conversation?._id) {
        socketRef.current.emit("chat:typing", {
          conversationId: conversation._id,
          isTyping: false,
        });
      }
      typingTimeoutRef.current = null;
    }, 2000);
  };

  const handleSend = () => {
    const messageText = input.trim();
    if (!messageText || !socketRef.current) return;

    socketRef.current.emit("chat:send", {
      conversationId: conversation?._id,
      content: messageText,
    });
    setInput("");

    if (status === "bot_active" && !isGuest) {
      setIsBotTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    socketRef.current.emit("chat:typing", {
      conversationId: conversation?._id,
      isTyping: false,
    });
  };

  // Xử lý Quick Reply button clicks
  const handleAction = useCallback((actionType, payload = {}, messageId) => {
    if (!socketRef.current || !conversation?._id) return;

    if (actionType === "change_address") {
      // Mở modal đổi địa chỉ — KHÔNG disable nút, cho phép bấm nhiều lần
      addressForm.setFieldsValue({
        name: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
      });
      setIsAddressModalOpen(true);
      return;
    }

    // Với các action khác (confirm_order, confirm_cod, confirm_payos, select_voucher...) — disable sau khi bấm
    setDisabledActions((prev) => new Set([...prev, `${messageId}-${actionType}`]));

    // Emit action qua socket
    socketRef.current.emit("chat:action", {
      conversationId: conversation._id,
      actionType,
      payload,
    });

    if (status === "bot_active" && !isGuest) {
      setIsBotTyping(true);
    }
  }, [conversation?._id, status, isGuest, user, addressForm]);

  // Xử lý submit đổi địa chỉ
  const handleAddressSubmit = async () => {
    try {
      const values = await addressForm.validateFields();
      const accessTokenValue = accessToken;
      if (!accessTokenValue || !user?.id) {
        toast.error("Vui lòng đăng nhập để cập nhật thông tin");
        return;
      }

      await UserService.updateUser(user.id, accessTokenValue, {
        name: values.name,
        address: values.address,
        phone: values.phone,
        city: values.city,
      });

      dispatch(updateUser({
        _id: user?.id,
        name: values.name,
        email: user?.email,
        address: values.address,
        phone: values.phone,
        city: values.city,
        avatar: user?.avatar,
        isAdmin: user?.isAdmin,
        refresh_token: user?.refresh_token,
      }));

      setIsAddressModalOpen(false);
      toast.success("Cập nhật địa chỉ thành công! Bạn có thể tiếp tục xác nhận đặt hàng.");
    } catch (error) {
      if (error?.errorFields) return; // Form validation errors
      toast.error("Có lỗi xảy ra khi cập nhật địa chỉ");
    }
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
              <ChatStatus>{formatStatus(status, isGuest)}</ChatStatus>
            </ChatHeaderText>
            <Button
              type="text"
              onClick={() => setIsOpen(false)}
              icon={<CloseOutlined style={{ color: "#ffffff" }} />}
            />
          </ChatHeader>

          <ChatBody ref={bodyRef} onScroll={handleScroll}>
            {isLoadingMore && (
              <div style={{ textAlign: "center", fontSize: "11px", color: "#94a3b8", paddingBottom: "8px" }}>
                Đang tải tin nhắn cũ...
              </div>
            )}
            {isGuest && messages.length === 0 && !isLoading && (
              <LoginHint>Bạn đang chat với nhân viên hỗ trợ với tư cách khách.</LoginHint>
            )}

            {!isGuest && messages.length === 0 && !isLoading && (
              <LoginHint>Chào bạn! Hãy đặt câu hỏi về sản phẩm định dưỡng.</LoginHint>
            )}

            {messages.map((message, msgIndex) => {
              const sender = String(message.sender || "bot").toLowerCase();
              const isUser = sender === "user";
              const isAdmin = sender === "admin";
              const senderLabel = isUser ? "Bạn" : isAdmin ? "Nhân viên" : "FITnFOOD AI";
              const productCards = message?.metadata?.products || [];
              const actionButtons = message?.metadata?.actions || [];
              const cartUpdate = message?.metadata?.cartUpdate;
              const orderCreated = message?.metadata?.orderCreated;
              const timestamp = formatMessageTime(message?.createdAt);
              const messageId = message._id || `${message.sender}-${timestamp}`;
              const isLastMessage = msgIndex === messages.length - 1;

              return (
                <MessageRow key={messageId} $isUser={isUser}>
                  <MessageStack $isUser={isUser}>
                    <MessageLabel $isUser={isUser}>{senderLabel}</MessageLabel>
                    <MessageBubble $isUser={isUser}>{message.content}</MessageBubble>
                    {timestamp && <MessageMeta>{timestamp}</MessageMeta>}

                    {/* PayOS payment link */}
                    {message?.metadata?.payosLink && (
                      <CartNotification style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><CreditCardOutlined /> Link thanh toán PayOS</div>
                        <a
                          href={message.metadata.payosLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: 'inline-block',
                            background: 'linear-gradient(135deg, #0ea5e9, #6366f1)',
                            color: '#fff',
                            padding: '6px 16px',
                            borderRadius: '8px',
                            fontWeight: 600,
                            fontSize: '13px',
                            textDecoration: 'none',
                          }}
                        >
                          <><LinkOutlined /> Mở trang thanh toán</>
                        </a>
                      </CartNotification>
                    )}

                    {/* Cart update notification */}
                    {cartUpdate && cartUpdate.totalItems >= 0 && (
                      <CartNotification>
                        <ShoppingCartOutlined /> Giỏ hàng: {cartUpdate.totalItems} sản phẩm
                      </CartNotification>
                    )}

                    {/* Order created notification */}
                    {orderCreated && orderCreated.orderId && (
                      <CartNotification>
                        <CheckCircleOutlined /> Đơn hàng #{String(orderCreated.orderId).slice(-8).toUpperCase()} — {convertPrice(orderCreated.totalPrice)}
                      </CartNotification>
                    )}

                    {/* Product cards */}
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

                    {/* Quick Reply action buttons */}
                    {actionButtons.length > 0 && (
                      <ActionButtonsRow>
                        {actionButtons.map((action, actionIdx) => {
                          const actionKey = `${messageId}-${action.type}`;
                          // change_address không bao giờ bị disable — cho phép mở modal nhiều lần
                          const isDisabled = action.type === "change_address"
                            ? false
                            : (disabledActions.has(actionKey) || !isLastMessage);
                          return (
                            <ActionButton
                              key={`${actionKey}-${actionIdx}`}
                              $variant={
                                action.type === "confirm_order" || action.type === "confirm_cod" || action.type === "confirm_payos"
                                  ? "primary"
                                  : "secondary"
                              }
                              disabled={isDisabled}
                              onClick={() => handleAction(action.type, action.payload, messageId)}
                            >
                              {(action.type === "confirm_order" || action.type === "confirm_cod" || action.type === "confirm_payos") && <CheckCircleOutlined style={{ marginRight: 6 }} />}
                              {action.type === "change_address" && <EnvironmentOutlined style={{ marginRight: 6 }} />}
                              {action.type === "confirm_cod" && <CreditCardOutlined style={{ marginRight: 6 }} />}
                              {action.label}
                            </ActionButton>
                          );
                        })}
                      </ActionButtonsRow>
                    )}
                  </MessageStack>
                </MessageRow>
              );
            })}
            {isBotTyping && (
              <MessageRow $isUser={false}>
                <MessageStack $isUser={false}>
                  <MessageLabel $isUser={false}>FITnFOOD AI</MessageLabel>
                  <MessageBubble $isUser={false} style={{ opacity: 0.8, fontStyle: "italic", background: "#f1f5f9" }}>
                    {botStatusText || "FITnFOOD AI đang phân tích câu hỏi..."}
                  </MessageBubble>
                </MessageStack>
              </MessageRow>
            )}

            {isAdminTyping && (
              <MessageRow $isUser={false}>
                <MessageStack $isUser={false}>
                  <MessageLabel $isUser={false}>Nhân viên</MessageLabel>
                  <MessageBubble $isUser={false} style={{ opacity: 0.8, fontStyle: "italic", background: "#f1f5f9" }}>
                    Nhân viên đang nhập tin nhắn...
                  </MessageBubble>
                </MessageStack>
              </MessageRow>
            )}
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
                onChange={handleInputChange}
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

      {/* Modal đổi địa chỉ giao hàng */}
      <Modal
        title="Đổi địa chỉ giao hàng"
        open={isAddressModalOpen}
        onCancel={() => setIsAddressModalOpen(false)}
        onOk={handleAddressSubmit}
        okText="Cập nhật"
        cancelText="Hủy"
        destroyOnHidden
      >
        <Form
          form={addressForm}
          layout="vertical"
          style={{ marginTop: 16 }}
        >
          <Form.Item label="Họ tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Số điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập SĐT" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Tỉnh/Thành phố" name="city" rules={[{ required: true, message: "Vui lòng nhập tỉnh/TP" }]}>
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </ChatWidgetShell>
  );
};

export default ChatWidget;
