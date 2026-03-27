import { Button, Form, Input, message, Radio } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Lable, WrapperInfo, WrapperRadio, WrapperRight, WrapperTotal } from "./Style";
import { useDispatch, useSelector } from "react-redux";
import { removeAllOrder } from "../../redux/slice/orderSlice";
import { convertPrice } from "../../utils";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as UserService from "../../services/UserService";
import { updateUser } from "../../redux/slice/userSlice";
import * as OrderService from "../../services/OrderService";
import * as CartService from "../../services/CartService";
import * as DiscountService from "../../services/DiscountService";
import { useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PaymentPage = () => {
  const [form] = Form.useForm();
  const order = useSelector((state) => state.order);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
  const [delivery, setDelivery] = useState("fast");

  const successHandledRef = useRef(false);

  let storageData = localStorage.getItem("access_token");
  storageData = storageData ? JSON.parse(storageData) : null;

  const orderState = useMemo(() => location.state || {}, [location.state]);
  const {
    priceMemo: orderPriceMemo,
    priceDiscountMemo: orderPriceDiscountMemo,
    deliveryMemo: orderDeliveryMemo,
    productDiscounts: orderProductDiscounts,
    orderDiscount,
  } = orderState;
  const hasOrderState = useMemo(() => Object.keys(orderState).length > 0, [orderState]);

  useEffect(() => {
    if (!hasOrderState && (!order?.orderItemSelected || order?.orderItemSelected?.length === 0)) {
      message.warning("Vui lòng chọn sản phẩm từ giỏ hàng trước khi thanh toán");
      navigate("/order");
    }
  }, [hasOrderState, order, navigate]);

  useEffect(() => {
    if (isOpenModalUpdateInfo) {
      form.setFieldsValue({
        name: user?.name || "",
        phone: user?.phone || "",
        address: user?.address || "",
        city: user?.city || "",
      });
    }
  }, [isOpenModalUpdateInfo, user, form]);

  const priceMemo = useMemo(() => {
    if (orderPriceMemo !== undefined) return orderPriceMemo;
    const result = order?.orderItemSelected?.reduce((total, current) => {
      return total + current?.price * current?.amount;
    }, 0);
    return result || 0;
  }, [order, orderPriceMemo]);

  const priceDiscountMemo = useMemo(() => {
    if (orderPriceDiscountMemo !== undefined) return orderPriceDiscountMemo;
    const result = order?.orderItemSelected?.reduce((total, current) => {
      return total + (current?.discount * current?.price * current?.amount) / 100;
    }, 0);
    return Number(result) || 0;
  }, [order, orderPriceDiscountMemo]);

  const deliveryMethodLabel = useMemo(() => {
    return delivery === "fast" ? "Nhanh - giao nhanh trong ngày" : "Tiết kiệm";
  }, [delivery]);

  const baseDeliveryMemo = useMemo(() => {
    if (orderDeliveryMemo !== undefined) return Number(orderDeliveryMemo) || 0;
    if (priceMemo >= 500000 || order?.orderItemSelected?.length === 0) return 0;
    if (priceMemo >= 200000 && priceMemo < 500000) return 10000;
    return 20000;
  }, [orderDeliveryMemo, priceMemo, order?.orderItemSelected?.length]);

  const deliverySurchargeMemo = useMemo(() => {
    return delivery === "fast" ? 50000 : 0;
  }, [delivery]);

  const deliveryMemo = useMemo(() => {
    return Number(baseDeliveryMemo + deliverySurchargeMemo);
  }, [baseDeliveryMemo, deliverySurchargeMemo]);

  const totalPriceMemo = useMemo(() => {
    return Number(priceMemo - priceDiscountMemo + deliveryMemo);
  }, [priceMemo, priceDiscountMemo, deliveryMemo]);

  const paymentMethodLabel = "Thanh toán khi nhận hàng (COD)";

  const mutationAddOrder = useMutationHook((data) => {
    const { token, ...rests } = data;
    const res = OrderService.createOrder(token, { ...rests });
    return res;
  });

  const { isPending: isPendingAddOrder, data: dataAddOrder, isSuccess, isError } = mutationAddOrder;

  const handleAddOrder = () => {
    if (!storageData) {
      message.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    if (!order?.orderItemSelected || !user?.name || !user?.address || !user?.phone || !user?.city || !priceMemo) {
      message.error("Vui lòng kiểm tra lại thông tin đặt hàng");
      return;
    }

    let userId = user?.id;
    if (!userId && storageData) {
      try {
        const decoded = jwtDecode(storageData);
        userId = decoded?.id;
      } catch (error) {
        console.error("Error decoding token:", error);
        message.error("Có lỗi xảy ra khi xác thực người dùng");
        return;
      }
    }
    if (!userId) {
      message.error("Không thể xác định người dùng");
      return;
    }

    mutationAddOrder.mutate({
      token: storageData,
      orderItems: order?.orderItemSelected,
      fullName: user?.name,
      address: user?.address,
      phone: user?.phone,
      city: user?.city,
      paymentMethod: "cash",
      itemsPrice: priceMemo,
      shippingPrice: deliveryMemo,
      totalPrice: totalPriceMemo,
      user: userId,
      email: user?.email,
    });
  };

  useEffect(() => {
    if (isSuccess && !successHandledRef.current) {
      successHandledRef.current = true;

      const orderArray = (order?.orderItemSelected || []).map((e) => e?.product).filter(Boolean);
      if (orderArray.length) {
        dispatch(removeAllOrder({ listChecked: orderArray }));
      }

      (async () => {
        let userId = user?.id;
        if (!userId && storageData) {
          try {
            const decoded = jwtDecode(storageData);
            userId = decoded?.id;
          } catch (e) {
            console.error("decode error:", e);
          }
        }

        if (userId) {
          try {
            await CartService.deleteCart(userId);
          } catch (e) {
            console.error(e);
          }
        }

        try {
          const discountList = [];

          if (orderDiscount && orderDiscount._id) {
            discountList.push(orderDiscount);
          }

          const appliedDiscounts = orderProductDiscounts || {};
          for (const [, discount] of Object.entries(appliedDiscounts)) {
            if (discount && discount._id) {
              discountList.push(discount);
            }
          }

          const uniqueDiscounts = discountList.filter(
            (discount, index, arr) => arr.findIndex((item) => item?._id === discount?._id) === index
          );

          for (const discount of uniqueDiscounts) {
            if (discount && discount._id && userId) {
              try {
                await DiscountService.updateDiscountUsage(discount._id, userId, storageData);
              } catch (e) {
                console.error(`Update discount ${discount?.code} error:`, e);
              }
            }
          }
        } catch (e) {
          console.error("updateDiscountUsage wrapper error:", e);
        }
      })().finally(() => {
        message.success("Đơn hàng đã được đặt thành công!");
        navigate("/orderSuccess", {
          replace: true,
          state: {
            delivery,
            paymentMethod: "cash",
            orders: order?.orderItemSelected,
            totalPriceMemo,
          },
        });
      });
    }

    if (isError && !successHandledRef.current) {
      successHandledRef.current = true;
      message.error(dataAddOrder?.message || "Có lỗi xảy ra khi đặt hàng");
    }
    // eslint-disable-next-line
  }, [isSuccess, isError]);

  const mutationUpdateUser = useMutationHook((data) => {
    const { id, token, ...rests } = data;
    const res = UserService.updateUser(id, token, { ...rests });
    return res;
  });

  const handleUpdateUserInfo = async () => {
    if (!storageData) {
      message.error("Vui lòng đăng nhập để cập nhật thông tin");
      return;
    }
    try {
      const values = await form.validateFields();

      let userId = user?.id;
      if (!userId && storageData) {
        try {
          const decoded = jwtDecode(storageData);
          userId = decoded?.id;
        } catch (error) {
          console.error("Error decoding token:", error);
          message.error("Có lỗi xảy ra khi xác thực người dùng");
          return;
        }
      }
      if (!userId) {
        message.error("Không thể xác định người dùng");
        return;
      }

      const updateData = {
        id: userId,
        token: storageData,
        name: values.name,
        address: values.address,
        phone: values.phone,
        city: values.city,
      };

      mutationUpdateUser.mutate(updateData, {
        onSuccess: () => {
          dispatch(
            updateUser({
              name: values.name,
              address: values.address,
              phone: values.phone,
              city: values.city,
              avatar: user?.avatar,
            })
          );
          setIsOpenModalUpdateInfo(false);
          message.success("Cập nhật thông tin thành công");
        },
        onError: (error) => {
          console.error("Update user error:", error);
          message.error("Có lỗi xảy ra khi cập nhật thông tin");
        },
      });
    } catch {
      // validateFields đã hiển thị lỗi
    }
  };

  const handleCancelUpdateInfo = () => {
    form.resetFields();
    setIsOpenModalUpdateInfo(false);
  };

  const handleDelivery = (e) => setDelivery(e.target.value);

  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 10% 10%, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0) 36%), radial-gradient(circle at 90% 20%, rgba(2, 132, 199, 0.16) 0%, rgba(2, 132, 199, 0) 34%), linear-gradient(180deg, #f8fafc 0%, #eefbf5 100%)",
        width: "100%",
        minHeight: "100vh",
      }}
    >
      <style>{`
        @keyframes paymentFloat {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }
        @keyframes paymentFadeIn {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 1024px) {
          .paymentpage-main-wrapper {
            flex-direction: column !important;
            gap: 0 !important;
          }
        }
        .paymentpage-hero {
          animation: paymentFadeIn 420ms ease-out;
        }
        .paymentpage-floating {
          animation: paymentFloat 4.8s ease-in-out infinite;
        }
      `}</style>
      <LoadingComponent isPending={isPendingAddOrder}>
        <div style={{ width: "100%", maxWidth: 1270, margin: "0 auto", padding: "14px 8px 28px" }}>
          <div
            className="paymentpage-hero"
            style={{
              position: "relative",
              overflow: "hidden",
              borderRadius: 18,
              marginBottom: 16,
              padding: "16px 18px",
              border: "1px solid rgba(16, 185, 129, 0.28)",
              background: "linear-gradient(120deg, rgba(255,255,255,0.92), rgba(240,255,250,0.95))",
              boxShadow: "0 18px 34px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div
              className="paymentpage-floating"
              style={{
                position: "absolute",
                right: -16,
                top: -22,
                width: 110,
                height: 110,
                borderRadius: "999px",
                background: "radial-gradient(circle, rgba(2,132,199,0.28), rgba(2,132,199,0))",
              }}
            />
            <h2 style={{ color: "#1e293b", fontWeight: 800, marginBottom: 6 }}>Thanh toán đơn hàng</h2>
            <div style={{ color: "#334155", fontSize: 13, marginBottom: 10 }}>
              Hoàn tất thông tin giao nhận để hệ thống xử lý đơn hàng nhanh hơn.
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "rgba(16, 185, 129, 0.16)",
                  color: "#166534",
                }}
              >
                Phương thức thanh toán: COD
              </span>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                  background: "rgba(2, 132, 199, 0.16)",
                  color: "#0c4a6e",
                }}
              >
                Tạm tính: {convertPrice(priceMemo)}
              </span>
            </div>
          </div>

          <div
            className="paymentpage-main-wrapper"
            style={{ display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "flex-start", gap: 20, flexWrap: "wrap" }}
          >
            <div style={{ flex: 2, minWidth: 320, maxWidth: 900, width: "100%", animation: "paymentFadeIn 500ms ease-out" }}>
              <WrapperInfo>
                <div>
                  <Lable>1. Chọn phương thức giao hàng</Lable>
                  <WrapperRadio onChange={handleDelivery} value={delivery} defaultValue={"fast"}>
                    <Radio value="fast">
                      <span style={{ color: "#f59e0b", fontWeight: 700 }}>Nhanh</span> - giao nhanh trong ngày (+{convertPrice(50000)})
                    </Radio>
                    <Radio value="gojek">
                      <span style={{ color: "#0284c7", fontWeight: 700 }}>Tiết kiệm</span> - giao hàng tiêu chuẩn (+{convertPrice(0)})
                    </Radio>
                  </WrapperRadio>
                </div>
              </WrapperInfo>

              <WrapperInfo>
                <Lable>2. Phương thức thanh toán</Lable>
                <div style={{ marginTop: 8, color: "#334155", fontWeight: 600 }}>{paymentMethodLabel}</div>
              </WrapperInfo>
            </div>

            <div style={{ flex: 1, minWidth: 260, maxWidth: 400, width: "100%", animation: "paymentFadeIn 620ms ease-out" }}>
              <WrapperRight>
                <div style={{ width: "100%" }}>
                  <div
                    style={{
                      width: "100%",
                      marginBottom: 8,
                      padding: "10px 14px",
                      borderRadius: 12,
                      background: "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(2, 132, 199, 0.15))",
                      border: "1px solid rgba(2, 132, 199, 0.24)",
                      color: "#0f172a",
                      fontWeight: 700,
                      fontSize: 14,
                    }}
                  >
                    Tóm tắt thanh toán
                  </div>
                  <WrapperInfo>
                    <div>
                      <span>Địa chỉ nhận hàng: </span>
                      <span style={{ fontWeight: "bold" }}>{` ${user?.address} ${user?.city} `}</span>
                      <span onClick={() => setIsOpenModalUpdateInfo(true)} style={{ color: "#0284c7", cursor: "pointer", marginLeft: 8 }}>
                        Thay đổi
                      </span>
                    </div>
                  </WrapperInfo>

                  <WrapperInfo>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Tạm tính</span>
                      <span style={{ color: "#000", fontSize: 14, fontWeight: "bold" }}>{convertPrice(priceMemo)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Giảm giá</span>
                      <span style={{ color: "#000", fontSize: 14, fontWeight: "bold" }}>{convertPrice(priceDiscountMemo)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>Phí giao hàng</span>
                      <span style={{ color: "#000", fontSize: 14, fontWeight: "bold" }}>{convertPrice(deliveryMemo)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                      <span style={{ color: "#64748b", fontSize: 12 }}>Phí cơ bản</span>
                      <span style={{ color: "#0284c7", fontSize: 12, fontWeight: 600 }}>{convertPrice(baseDeliveryMemo)}</span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                      <span style={{ color: "#64748b", fontSize: 12 }}>{`${deliveryMethodLabel}`}</span>
                      <span style={{ color: "#0284c7", fontSize: 12, fontWeight: 600 }}>{convertPrice(deliverySurchargeMemo)}</span>
                    </div>
                  </WrapperInfo>

                  <WrapperTotal>
                    <span>Tổng tiền</span>
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ color: "rgb(254, 56, 52)", fontSize: 24, fontWeight: "bold" }}>{convertPrice(totalPriceMemo)}</span>
                      <span style={{ color: "#000", fontSize: 11 }}>(Đã bao gồm thuế nếu có)</span>
                    </span>
                  </WrapperTotal>
                </div>

                <Button
                  onClick={handleAddOrder}
                  style={{
                    color: "#fff",
                    background: "linear-gradient(120deg, #10b981, #0284c7, #0ea5e9)",
                    height: 48,
                    width: "100%",
                    maxWidth: 320,
                    border: "none",
                    borderRadius: 12,
                    fontWeight: "bold",
                    marginTop: 12,
                    boxShadow: "0 16px 30px rgba(2, 132, 199, 0.3)",
                  }}
                >
                  Xác nhận đặt hàng
                </Button>
              </WrapperRight>
            </div>
          </div>
        </div>

        <ModalComponent
          forceRender
          title="Cập nhật thông tin giao hàng"
          open={isOpenModalUpdateInfo}
          onCancel={handleCancelUpdateInfo}
          okText="Cập nhật"
          cancelText="Hủy"
          onOk={handleUpdateUserInfo}
        >
          <LoadingComponent isPending={mutationUpdateUser.isPending}>
            <Form
              name="basic"
              labelCol={{ span: 4 }}
              wrapperCol={{ span: 20 }}
              style={{ maxWidth: 600 }}
              autoComplete="off"
              form={form}
            >
              <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Tỉnh/TP" name="city" rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
                <Input />
              </Form.Item>
              <Form.Item label="Điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
                <Input />
              </Form.Item>
            </Form>
          </LoadingComponent>
        </ModalComponent>
      </LoadingComponent>
    </div>
  );
};

export default PaymentPage;
