import { Form, Input, message, Radio } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Lable,
  PaymentAccentText,
  PaymentAddressAction,
  PaymentAddressRow,
  PaymentAddressText,
  PaymentContentColumn,
  PaymentHeroBadge,
  PaymentHeroBadges,
  PaymentHeroDescription,
  PaymentHeroOrb,
  PaymentHeroSection,
  PaymentHeroTitle,
  PaymentMainWrapper,
  PaymentMethodText,
  PaymentOrderButton,
  PaymentPageContainer,
  PaymentPageShell,
  PaymentRow,
  PaymentRowLabel,
  PaymentRowValue,
  PaymentTotalAmount,
  PaymentTotalNote,
  PaymentTotalValueBlock,
  PaymentSummaryColumn,
  PaymentSummaryHeader,
  WrapperInfo,
  WrapperRadio,
  WrapperTotal,
} from "./Style";
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

const resolveToken = (accessToken) => {
  if (!accessToken) return null;
  if (typeof accessToken !== "string") return accessToken;

  try {
    return JSON.parse(accessToken);
  } catch (error) {
    return accessToken;
  }
};

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

  const storageToken = useMemo(() => {
    return resolveToken(localStorage.getItem("access_token"));
  }, []);

  const orderState = useMemo(() => location.state || {}, [location.state]);
  const {
    priceMemo: orderPriceMemo,
    priceDiscountMemo: orderPriceDiscountMemo,
    deliveryMemo: orderDeliveryMemo,
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
    const itemDiscountMemo = order?.orderItemSelected?.reduce((total, current) => {
      return total + ((current?.discount || 0) * (current?.price || 0) * (current?.amount || 0)) / 100;
    }, 0);

    const couponDiscountMemo = !orderDiscount || !priceMemo
      ? 0
      : orderDiscount.type === "fixed"
        ? Math.min(Number(orderDiscount.value || 0), priceMemo)
        : (priceMemo * Number(orderDiscount.value || 0)) / 100;

    return Number((itemDiscountMemo || 0) + (couponDiscountMemo || 0));
  }, [order, orderPriceDiscountMemo, orderDiscount, priceMemo]);

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

  const appliedDiscountPayload = useMemo(() => {
    if (!orderDiscount?.code) {
      return null;
    }

    return {
      code: orderDiscount.code,
      orderValue: priceMemo,
    };
  }, [orderDiscount, priceMemo]);

  const mutationAddOrder = useMutationHook((data) => {
    const { token, ...rests } = data;
    const res = OrderService.createOrder(token, { ...rests });
    return res;
  });

  const { isPending: isPendingAddOrder, data: dataAddOrder, isSuccess, isError } = mutationAddOrder;

  const handleAddOrder = () => {
    if (!storageToken) {
      message.error("Vui lòng đăng nhập để đặt hàng");
      return;
    }
    if (!order?.orderItemSelected || !user?.name || !user?.address || !user?.phone || !user?.city || !priceMemo) {
      message.error("Vui lòng kiểm tra lại thông tin đặt hàng");
      return;
    }

    let userId = user?.id;
    if (!userId && storageToken) {
      try {
        const decoded = jwtDecode(storageToken);
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

    successHandledRef.current = false;

    mutationAddOrder.mutate({
      token: storageToken,
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
        if (!userId && storageToken) {
          try {
            const decoded = jwtDecode(storageToken);
            userId = decoded?.id;
          } catch (e) {
            console.error("decode error:", e);
          }
        }

        if (userId) {
          try {
            await CartService.deleteCart(userId, storageToken);
          } catch (e) {
            console.error(e);
          }
        }

        if (appliedDiscountPayload) {
          try {
            await DiscountService.applyDiscountUsage(appliedDiscountPayload, storageToken);
          } catch (e) {
            console.error("applyDiscountUsage error:", e);
          }
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
    if (!storageToken) {
      message.error("Vui lòng đăng nhập để cập nhật thông tin");
      return;
    }
    try {
      const values = await form.validateFields();

      let userId = user?.id;
      if (!userId && storageToken) {
        try {
          const decoded = jwtDecode(storageToken);
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
        token: storageToken,
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
    <PaymentPageShell>
      <LoadingComponent isPending={isPendingAddOrder}>
        <PaymentPageContainer>
          <PaymentHeroSection>
            <PaymentHeroOrb />
            <PaymentHeroTitle>Thanh toán đơn hàng</PaymentHeroTitle>
            <PaymentHeroDescription>Hoàn tất thông tin giao nhận để hệ thống xử lý đơn hàng nhanh hơn.</PaymentHeroDescription>
            <PaymentHeroBadges>
              <PaymentHeroBadge $variant="success">Phương thức thanh toán: COD</PaymentHeroBadge>
              <PaymentHeroBadge $variant="info">Tạm tính: {convertPrice(priceMemo)}</PaymentHeroBadge>
            </PaymentHeroBadges>
          </PaymentHeroSection>

          <PaymentMainWrapper>
            <PaymentContentColumn>
              <WrapperInfo>
                <div>
                  <Lable>1. Chọn phương thức giao hàng</Lable>
                  <WrapperRadio onChange={handleDelivery} value={delivery} defaultValue="fast">
                    <Radio value="fast">
                      <PaymentAccentText $color="#f59e0b">Nhanh</PaymentAccentText> - giao nhanh trong ngày (+{convertPrice(50000)})
                    </Radio>
                    <Radio value="gojek">
                      <PaymentAccentText $color="#0284c7">Tiết kiệm</PaymentAccentText> - giao hàng tiêu chuẩn (+{convertPrice(0)})
                    </Radio>
                  </WrapperRadio>
                </div>
              </WrapperInfo>

              <WrapperInfo>
                <Lable>2. Phương thức thanh toán</Lable>
                <PaymentMethodText>{paymentMethodLabel}</PaymentMethodText>
              </WrapperInfo>
            </PaymentContentColumn>

            <PaymentSummaryColumn>
              <PaymentSummaryHeader>Tóm tắt thanh toán</PaymentSummaryHeader>

              <WrapperInfo>
                <PaymentAddressRow>
                  <span>Địa chỉ nhận hàng:</span>
                  <PaymentAddressText>{`${user?.address || ""} ${user?.city || ""}`.trim()}</PaymentAddressText>
                  <PaymentAddressAction onClick={() => setIsOpenModalUpdateInfo(true)}>Thay đổi</PaymentAddressAction>
                </PaymentAddressRow>
              </WrapperInfo>

              <WrapperInfo>
                <PaymentRow>
                  <PaymentRowLabel>Tạm tính</PaymentRowLabel>
                  <PaymentRowValue>{convertPrice(priceMemo)}</PaymentRowValue>
                </PaymentRow>
                <PaymentRow>
                  <PaymentRowLabel>Giảm giá</PaymentRowLabel>
                  <PaymentRowValue>{convertPrice(priceDiscountMemo)}</PaymentRowValue>
                </PaymentRow>
                <PaymentRow>
                  <PaymentRowLabel>Phí giao hàng</PaymentRowLabel>
                  <PaymentRowValue>{convertPrice(deliveryMemo)}</PaymentRowValue>
                </PaymentRow>
                <PaymentRow $mt={4}>
                  <PaymentRowLabel $muted $small>
                    Phí cơ bản
                  </PaymentRowLabel>
                  <PaymentRowValue $color="#0284c7" $size="12px">
                    {convertPrice(baseDeliveryMemo)}
                  </PaymentRowValue>
                </PaymentRow>
                <PaymentRow $mt={2}>
                  <PaymentRowLabel $muted $small>
                    {deliveryMethodLabel}
                  </PaymentRowLabel>
                  <PaymentRowValue $color="#0284c7" $size="12px">
                    {convertPrice(deliverySurchargeMemo)}
                  </PaymentRowValue>
                </PaymentRow>
              </WrapperInfo>

              <WrapperTotal>
                <span>Tổng tiền</span>
                <PaymentTotalValueBlock>
                  <PaymentTotalAmount>{convertPrice(totalPriceMemo)}</PaymentTotalAmount>
                  <PaymentTotalNote>(Đã bao gồm thuế nếu có)</PaymentTotalNote>
                </PaymentTotalValueBlock>
              </WrapperTotal>

              <PaymentOrderButton onClick={handleAddOrder}>Xác nhận đặt hàng</PaymentOrderButton>
            </PaymentSummaryColumn>
          </PaymentMainWrapper>
        </PaymentPageContainer>

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
    </PaymentPageShell>
  );
};

export default PaymentPage;
