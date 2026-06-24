
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, message, Modal } from "antd";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { decreaseAmount, increaseAmount, removeAllOrder, removeOrder, selectedOrder, syncCart } from "../../redux/slice/orderSlice";
import { convertPrice } from "../../utils";
import ModalComponent from "../../components/ModalComponent/ModalComponent";
import LoadingComponent from "../../components/LoadingComponent/LoadingComponent";
import { useMutationHook } from "../../hooks/useMutationHook";
import * as UserService from "../../services/UserService";
import * as DiscountService from "../../services/DiscountService";
import { updateUser } from "../../redux/slice/userSlice";
import { useNavigate } from "react-router-dom";
import StepComponent from "../../components/StepComponent/StepComponent";
import * as CartService from "../../services/CartService";
import isEqual from "lodash/isEqual";
import { jwtDecode } from "jwt-decode";
import RecommendationCarousel from "../../components/RecommendationCarousel/RecommendationCarousel";
import { useSystemSetting } from "../../context/SystemSettingContext";
import {
  WrapperCountOrder,
  WrapperInfo,
  WrapperItemOrder,
  WrapperLeft,
  WrapperListOrder,
  WrapperPriceDiscount,
  WrapperRight,
  WrapperStyleHeader,
  WrapperStyleHeaderDelivery,
  WrapperTotal,
  WrapperInputNumber,
  DiscountButton,
} from "./Style";

const OrderPage = () => {
  const [form] = Form.useForm();
  const order = useSelector((state) => state.order);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  // Lấy phí ship từ cài đặt hệ thống
  const { setting } = useSystemSetting();
  const shippingFee = setting?.shippingFee ?? 30000;
  const freeShippingThreshold = setting?.freeShippingThreshold ?? 200000;
  const [listChecked, setListChecked] = useState([]);
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
  const [isOpenDiscountModal, setIsOpenDiscountModal] = useState(false);
  const navigate = useNavigate();
  let storageData = localStorage.getItem("access_token");
  storageData = storageData ? JSON.parse(storageData) : null;
  const [stateDetailUser, setStateDetailUser] = useState({
    id: user?.id,
    access_token: user?.access_token ? JSON.parse(user.access_token) : null,
    name: "",
    address: "",
    phone: "",
    city: "",
  });
  const [selectedDiscount, setSelectedDiscount] = useState(null);
  const [discounts, setDiscounts] = useState([]);




  useEffect(() => {
    const fetchDiscounts = async () => {
      try {
        const res = await DiscountService.getAllDiscount();
        if (res.status === "OK") {
          setDiscounts(res.data || []);
        } else {
          message.error("Không thể lấy danh sách mã giảm giá");
          setDiscounts([]);
        }
      } catch (error) {
        console.error("Lỗi khi lấy danh sách mã giảm giá:", error);
        message.error("Lỗi khi lấy danh sách mã giảm giá");
        setDiscounts([]);
      }
    };
    fetchDiscounts();
  }, []);

  const onChange = (e) => {
    const value = e.target.value;
    if (!value) return;

    if (listChecked.includes(value)) {
      setListChecked(listChecked.filter((item) => item !== value));
    } else {
      setListChecked([...listChecked, value]);
    }
  };

  const handleChaneCount = (type, idProduct, checkFlag) => {
    if (type === "increase" && !checkFlag) {
      dispatch(increaseAmount({ idProduct }));
    }
    if (type === "decrease" && !checkFlag) {
      dispatch(decreaseAmount({ idProduct }));
    }
  };

  const handleOnchangeCheckAll = (e) => {
    if (e.target.checked) {
      const newListChecked = [];
      order?.orderItems?.forEach((item) => {
        newListChecked.push(item?.product);
      });
      setListChecked(newListChecked);
    } else {
      setListChecked([]);
    }
  };

  const handleDeleteOrder = async (idProduct) => {
    dispatch(removeOrder({ idProduct: idProduct }));
    await CartService.deleteCart(user?.id, storageData);
  };

  const handleDeleteAllOrder = async () => {
    if (listChecked?.length >= 1) {
      dispatch(removeAllOrder({ listChecked }));
      await CartService.deleteCart(user?.id, storageData);
      setSelectedDiscount(null);
    }
  };

  useEffect(() => {
    dispatch(selectedOrder({ listChecked }));
  }, [listChecked]);

  useEffect(() => {
    if (isOpenModalUpdateInfo) {
      setStateDetailUser({
        ...stateDetailUser,
        name: user?.name,
        phone: user?.phone,
        address: user?.address,
        city: user?.city,
        avatar: user?.avatar,
      });
    }
  }, [isOpenModalUpdateInfo]);

  useEffect(() => {
    if (!selectedDiscount || !user?.id) return;

    const userHasUsedDiscount = selectedDiscount.usersUsed?.some(
      (id) => id?.toString() === user.id?.toString()
    );

    if (userHasUsedDiscount) {
      setSelectedDiscount(null);
      message.warning("Mã giảm giá này đã được bạn sử dụng trước đó");
    }
  }, [discounts, selectedDiscount, user?.id]);

  useEffect(() => {
    form.setFieldsValue(stateDetailUser);
  }, [form, stateDetailUser]);

  // Tính tổng giá gốc của các sản phẩm đã chọn
  const priceMemo = useMemo(() => {
    const result = order?.orderItems
      ?.filter((item) => listChecked.includes(item.product))
      ?.reduce((total, current) => total + current?.price * current?.amount, 0);
    return result || 0;
  }, [order, listChecked]);

  const itemDiscountMemo = useMemo(() => {
    const itemDiscount = order?.orderItems
      ?.filter((item) => listChecked.includes(item.product))
      ?.reduce((total, current) => {
        const originalPrice = current.price * current.amount;
        const discountPercent = (current.discount || 0) / 100;
        return total + discountPercent * originalPrice;
      }, 0);

    return Number(itemDiscount || 0);
  }, [order, listChecked]);

  const couponDiscountMemo = useMemo(() => {
    if (!selectedDiscount || !priceMemo) {
      return 0;
    }

    const discountByCoupon =
      selectedDiscount.type === "percent"
        ? (priceMemo * selectedDiscount.value) / 100
        : Math.min(selectedDiscount.value, priceMemo);

    return Number(discountByCoupon || 0);
  }, [selectedDiscount, priceMemo]);

  // Tính tổng giảm giá cho toàn bộ đơn hàng: giảm giá sản phẩm + 1 mã giảm giá toàn đơn
  const priceDiscountMemo = useMemo(() => {
    return Number(itemDiscountMemo + couponDiscountMemo);
  }, [itemDiscountMemo, couponDiscountMemo]);

  // Tính phí giao hàng dựa trên cài đặt hệ thống
  const deliveryMemo = useMemo(() => {
    if (order?.orderItems?.length === 0 || priceMemo === 0) return 0;
    if (priceMemo >= freeShippingThreshold) return 0;
    return shippingFee;
  }, [priceMemo, shippingFee, freeShippingThreshold, order?.orderItems?.length]);

  // Tính tổng tiền cuối cùng
  const totalPriceMemo = useMemo(() => {
    return Number(priceMemo - priceDiscountMemo + deliveryMemo);
  }, [priceMemo, priceDiscountMemo, deliveryMemo]);

  const handleAddCart = () => {
    if (!order?.orderItemSelected?.length) {
      message.error("Bạn chưa chọn bất kỳ sản phẩm nào!");
    } else if (!user?.name || !user?.phone || !user?.address || !user?.city) {
      setIsOpenModalUpdateInfo(true);
    } else {
      // Truyền các biến tính tiền vào PaymentPage
      navigate("/payment", {
        state: {
          priceMemo: priceMemo,
          priceDiscountMemo: priceDiscountMemo,
          deliveryMemo: deliveryMemo,
          totalPriceMemo: totalPriceMemo,
          orderDiscount: selectedDiscount,
          listChecked: listChecked
        }
      });
    }
  };

  const handleCancelUpdateInfo = () => {
    setStateDetailUser({
      name: "",
      email: "",
      address: "",
      phone: "",
      avatar: "",
    });
    form.resetFields();
    setIsOpenModalUpdateInfo(false);
  };

  const mutationUpdateUser = useMutationHook((data) => {
    const { id, token, ...rests } = data;
    const res = UserService.updateUser(id, token, { ...rests });
    return res;
  });

  const handleUpdateUserInfo = () => {
    const { name, address, phone, city } = stateDetailUser;

    if (!storageData) {
      message.error("Vui lòng đăng nhập để cập nhật thông tin");
      return;
    }

    if (name && address && city && phone) {
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
        name: stateDetailUser.name,
        address: stateDetailUser.address,
        phone: stateDetailUser.phone,
        city: stateDetailUser.city,
      };

      mutationUpdateUser.mutate(updateData, {
        onSuccess: () => {
          dispatch(
            updateUser({
              name,
              address,
              phone,
              city,
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
    } else {
      message.error("Vui lòng điền đầy đủ thông tin");
    }
  };

  const { isPending, data } = mutationUpdateUser;

  const handleOnChangeDetailUser = (e) => {
    setStateDetailUser({
      ...stateDetailUser,
      [e.target.name]: e.target.value,
    });
  };

  const prevOrderItemsRef = useRef();
  const syncCartTimeoutRef = useRef(null);
  const orderItems = useSelector((state) => state.order.orderItems);
  useEffect(() => {
    if (!user?.id) return;

    const prevOrderItems = prevOrderItemsRef.current;

    if (!isEqual(prevOrderItems, orderItems)) {
      if (syncCartTimeoutRef.current) {
        clearTimeout(syncCartTimeoutRef.current);
      }

      // Debounce để tránh gọi API liên tục khi người dùng bấm tăng/giảm nhanh.
      syncCartTimeoutRef.current = setTimeout(() => {
        dispatch(syncCart({ userId: user.id, cartItems: orderItems }));
      }, 500);

      prevOrderItemsRef.current = orderItems;
    }

    return () => {
      if (syncCartTimeoutRef.current) {
        clearTimeout(syncCartTimeoutRef.current);
      }
    };
  }, [orderItems, user.id]);

  const handleGetDetailProduct = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  const handleOpenDiscountModal = () => {
    setIsOpenDiscountModal(true);
  };

  const handleApplyDiscount = (code) => {
    applyDiscount(code);
  };

  const applyDiscount = (code) => {
    const selectedDiscount = discounts.find((d) => d.code === code);
    if (selectedDiscount) {
      if (!priceMemo || !listChecked.length) {
        message.error("Vui lòng chọn sản phẩm trước khi áp dụng mã giảm giá");
        return;
      }
      const now = new Date();
      const userHasUsedDiscount = selectedDiscount.usersUsed?.some(
        (id) => id?.toString() === user?.id?.toString()
      );
      const isValid =
        new Date(selectedDiscount.startDate) <= now &&
        new Date(selectedDiscount.endDate) >= now &&
        priceMemo >= selectedDiscount.minValue &&
        selectedDiscount.usesLeft > 0 &&
        !userHasUsedDiscount;

      if (isValid) {
        setSelectedDiscount(selectedDiscount);
        message.success(`Đã áp dụng mã ${selectedDiscount.code} cho toàn bộ đơn hàng`);
        setIsOpenDiscountModal(false);
      } else if (userHasUsedDiscount) {
        message.error("Bạn đã dùng mã giảm giá này rồi!");
      } else if (priceMemo < selectedDiscount.minValue) {
        message.error(`Giá trị đơn hàng tối thiểu phải là ${convertPrice(selectedDiscount.minValue)}`);
      } else if (selectedDiscount.usesLeft <= 0) {
        message.error("Mã giảm giá này đã hết lượt sử dụng");
      } else {
        message.error("Mã giảm giá không hợp lệ hoặc đã hết hạn");
      }
    } else {
      message.error("Mã giảm giá không hợp lệ");
    }
  };

  const handleChangeAddress = () => {
    setIsOpenModalUpdateInfo(true);
  };

  const itemsDelivery = [
    {
      title: `${(shippingFee).toLocaleString('vi-VN')} VND`,
      description: `Dưới ${(freeShippingThreshold).toLocaleString('vi-VN')} VND`,
    },
    {
      title: '0 VND',
      description: `Từ ${(freeShippingThreshold).toLocaleString('vi-VN')} VND trở lên – Miễn phí ship`,
    },
  ];



  //fetch cart
 



  return (
    <div
      style={{
        background:
          "radial-gradient(circle at 12% 8%, rgba(16, 185, 129, 0.2), rgba(16, 185, 129, 0) 34%), radial-gradient(circle at 92% 14%, rgba(2, 132, 199, 0.16), rgba(2, 132, 199, 0) 34%), linear-gradient(180deg, #f8fafc 0%, #eefbf5 100%)",
        width: "100%",
        minHeight: "100vh",
        padding: "14px 0 20px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 1270,
          margin: "0 auto",
          padding: "0 16px",
        }}
      >
        <div
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
            style={{
              position: "absolute",
              right: -14,
              top: -20,
              width: 110,
              height: 110,
              borderRadius: "999px",
              background: "radial-gradient(circle, rgba(2,132,199,0.28), rgba(2,132,199,0))",
            }}
          />
          <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "6px", color: "#1e293b" }}>Giỏ hàng</h3>
          <div style={{ color: "#334155", fontSize: 13 }}>
            Chọn sản phẩm, áp dụng một mã giảm giá cho toàn bộ đơn hàng và tiếp tục thanh toán.
          </div>
        </div>
        <div
          className="orderpage-main-wrapper"
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "center",
            alignItems: "flex-start",
            gap: 20,
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: 2, minWidth: 320, maxWidth: 900, width: "100%" }}>
            <WrapperStyleHeaderDelivery>
              <StepComponent items={itemsDelivery} current={deliveryMemo === 20000 ? 0 : deliveryMemo === 10000 ? 1 : 2} />
            </WrapperStyleHeaderDelivery>
            <WrapperStyleHeader>
              <span style={{ display: "inline-block", minWidth: 180, width: "40%" }}>
                <Checkbox onChange={handleOnchangeCheckAll} checked={listChecked?.length === order?.orderItems?.length}>
                  Tất cả ({order?.orderItems.length} sản phẩm)
                </Checkbox>
              </span>
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 8,
                  flexWrap: "wrap",
                  fontSize: window.innerWidth <= 768 ? 13 : 15,
                  padding: window.innerWidth <= 768 ? "8px 0" : "0"
                }}
              >
                <span style={{ minWidth: 70, textAlign: window.innerWidth <= 768 ? "center" : "left" }}>Đơn giá</span>
                <span style={{ minWidth: 70, textAlign: window.innerWidth <= 768 ? "center" : "left" }}>Số lượng</span>
                <span style={{ minWidth: 70, textAlign: window.innerWidth <= 768 ? "center" : "left" }}>Thành tiền</span>
                <DeleteOutlined style={{ cursor: "pointer", fontSize: window.innerWidth <= 768 ? 18 : 20 }} onClick={() => handleDeleteAllOrder()} />
              </div>
            </WrapperStyleHeader>
            <WrapperListOrder>
              {order?.orderItems?.map((item) => {
                const discountPercent = (item.discount || 0) / 100;
                const discountedPrice = item.price * (1 - discountPercent);

                const totalItemPrice = discountedPrice * item.amount;

                return (
                  <WrapperItemOrder key={item?.product}>
                    <div style={{ minWidth: 120, width: "40%", display: "flex", alignItems: "center", gap: 12 }}>
                      <Checkbox onChange={onChange} value={item?.product} checked={listChecked.includes(item?.product)} />
                      <img src={item?.image} style={{ width: 60, height: 60, objectFit: "cover", borderRadius: 8 }} alt={item?.name} />
                      <div
                        onClick={() => handleGetDetailProduct(item?.product)}
                        style={{
                          width: "100%",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          fontSize: 14,
                          cursor: "pointer",
                          color: "#1890ff",
                        }}
                      >
                        {item?.name}
                      </div>
                    </div>
                    <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
                      <span style={{ fontSize: 13, color: "#242424" }}>{convertPrice(discountedPrice)}</span>
                      <WrapperCountOrder>
                        <button
                          style={{ border: "none", background: "transparent", cursor: "pointer" }}
                          onClick={() => handleChaneCount("decrease", item?.product, item?.amount <= 1)}
                        >
                          <MinusOutlined style={{ color: "#000", fontSize: 12 }} />
                        </button>
                        <WrapperInputNumber defaultValue={item?.amount} value={item?.amount} size="small" min={1} max={item?.countInStock} />
                        <button
                          style={{ border: "none", background: "transparent", cursor: "pointer" }}
                          onClick={() => handleChaneCount("increase", item?.product, item?.amount === item?.countInStock)}
                        >
                          <PlusOutlined style={{ color: "#000", fontSize: 12 }} />
                        </button>
                      </WrapperCountOrder>
                      <span style={{ color: "rgb(255, 66, 78)", fontSize: 13, fontWeight: 500 }}>{convertPrice(totalItemPrice)}</span>
                      <DeleteOutlined style={{ cursor: "pointer", fontSize: 16 }} onClick={() => handleDeleteOrder(item?.product)} />
                    </div>
                    {/* <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                      <span style={{ fontSize: 12, color: "#64748b" }}>Ưu đãi sản phẩm sẽ cộng dồn với mã giảm giá toàn đơn</span>
                    </div> */}
                  </WrapperItemOrder>
                );
              })}
            </WrapperListOrder>
            <RecommendationCarousel context="cart" cartItems={order?.orderItems} />
          </div>
          <div style={{ flex: 1, minWidth: 260, maxWidth: 400, width: "100%" }}>
            <WrapperRight>
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    width: "100%",
                    marginBottom: 8,
                    padding: "10px 14px",
                    borderRadius: 12,
                    background: "linear-gradient(135deg, rgba(16, 185, 129, 0.16), rgba(2, 132, 199, 0.16))",
                    border: "1px solid rgba(16, 185, 129, 0.28)",
                    color: "#0f172a",
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  Thông tin đơn hàng
                </div>
                <WrapperInfo>
                  <div>
                    <span>Địa chỉ: </span>
                    <span style={{ fontWeight: "bold" }}>{` ${user?.address}, ${user?.city} `}</span>
                    <span onClick={handleChangeAddress} style={{ color: "#0284c7", cursor: "pointer", marginLeft: 8 }}>
                      Thay đổi
                    </span>
                  </div>
                </WrapperInfo>
                <WrapperInfo>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ color: "#334155", fontWeight: 700 }}>Mã giảm giá toàn đơn</span>
                    {selectedDiscount ? (
                      <span style={{ color: "#16a34a", fontSize: 12, fontWeight: 700 }}>{selectedDiscount.code}</span>
                    ) : (
                      <span style={{ color: "#94a3b8", fontSize: 12 }}>Chưa áp dụng</span>
                    )}
                  </div>
                  <DiscountButton
                    onClick={handleOpenDiscountModal}
                    style={{
                      height: 36,
                      borderRadius: 12,
                      fontWeight: 700,
                      background: "linear-gradient(135deg, rgba(245, 158, 11, 0.16), rgba(251, 191, 36, 0.1))",
                      border: "1px solid rgba(245, 158, 11, 0.55)",
                    }}
                  >
                    {selectedDiscount ? "Đổi mã giảm giá" : "Chọn mã giảm giá"}
                  </DiscountButton>
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
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 4 }}>
                    <span style={{ color: "#64748b", fontSize: 12 }}>Giảm giá sản phẩm</span>
                    <span style={{ color: "#0284c7", fontSize: 12, fontWeight: 600 }}>{convertPrice(itemDiscountMemo)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 2 }}>
                    <span style={{ color: "#64748b", fontSize: 12 }}>Giảm từ mã toàn đơn</span>
                    <span style={{ color: "#0284c7", fontSize: 12, fontWeight: 600 }}>{convertPrice(couponDiscountMemo)}</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span>Phí giao hàng</span>
                    <span style={{ color: "#000", fontSize: 14, fontWeight: "bold" }}>{convertPrice(deliveryMemo)}</span>
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
                type="primary"
                onClick={() => handleAddCart()}
                style={{
                  background: "linear-gradient(135deg, #10b981, #0284c7)",
                  height: 48,
                  width: "100%",
                  border: "none",
                  borderRadius: 12,
                  fontWeight: "bold",
                  marginTop: 12,
                  boxShadow: "0 12px 24px rgba(2, 132, 199, 0.25)",
                }}
              >
                Mua hàng
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
        <LoadingComponent isPending={isPending}>
          <Form
            name="basic"
            labelCol={{ span: 4 }}
            wrapperCol={{ span: 20 }}
            style={{ maxWidth: 600 }}
            autoComplete="off"
            form={form}
          >
            <Form.Item label="Tên" name="name" rules={[{ required: true, message: "Vui lòng nhập họ tên" }]}>
              <Input value={stateDetailUser.name} onChange={handleOnChangeDetailUser} name="name" />
            </Form.Item>
            <Form.Item label="Tỉnh/TP" name="city" rules={[{ required: true, message: "Vui lòng nhập tỉnh/thành phố" }]}>
              <Input value={stateDetailUser.city} onChange={handleOnChangeDetailUser} name="city" />
            </Form.Item>
            <Form.Item label="Địa chỉ" name="address" rules={[{ required: true, message: "Vui lòng nhập địa chỉ" }]}>
              <Input value={stateDetailUser.address} onChange={handleOnChangeDetailUser} name="address" />
            </Form.Item>
            <Form.Item label="Điện thoại" name="phone" rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}>
              <Input value={stateDetailUser.phone} onChange={handleOnChangeDetailUser} name="phone" />
            </Form.Item>
          </Form>
        </LoadingComponent>
      </ModalComponent>

      <Modal
        title={<span style={{ fontSize: "18px", fontWeight: "bold", color: "#1e293b" }}>Chọn mã giảm giá cho toàn bộ đơn hàng</span>}
        open={isOpenDiscountModal}
        onCancel={() => setIsOpenDiscountModal(false)}
        footer={null}
        width={500}
        style={{ top: 20 }}
        bodyStyle={{ padding: 0 }}
      >
        <Card
          style={{
            borderRadius: 10,
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            overflow: "hidden",
          }}
        >
          {selectedDiscount && (
            <div style={{ padding: "10px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
              <span style={{ color: "#334155", fontSize: 12, marginRight: 8 }}>Đang áp dụng:</span>
              <span style={{ fontWeight: 700, color: "#16a34a", marginRight: 10 }}>{selectedDiscount.code}</span>
              <Button
                size="small"
                type="text"
                onClick={() => {
                  setSelectedDiscount(null);
                  message.success("Đã bỏ mã giảm giá");
                }}
                style={{ color: "#dc2626", fontWeight: 600 }}
              >
                Bỏ mã
              </Button>
            </div>
          )}
          <div style={{ maxHeight: "420px", overflowY: "auto", display: "flex", flexDirection: "column" }}>
            {discounts.map((discount) => {
              const now = new Date();
              const userHasUsedDiscount = discount.usersUsed?.some(
                (id) => id?.toString() === user?.id?.toString()
              );
              const isValid =
                new Date(discount.startDate) <= now &&
                new Date(discount.endDate) >= now &&
                priceMemo >= discount.minValue &&
                discount.usesLeft > 0 &&
                !userHasUsedDiscount;
              const isApplied = selectedDiscount?.code === discount.code;

              return (
                <div
                  key={discount.code || discount._id}
                  style={{
                    padding: "12px 16px",
                    borderBottom: "1px solid #f0f0f0",
                    cursor: isValid ? "pointer" : "not-allowed",
                    background: isApplied ? "#ecfeff" : "transparent",
                    transition: "background 0.25s",
                    opacity: isValid || isApplied ? 1 : 0.6,
                  }}
                  onClick={() => isValid && handleApplyDiscount(discount.code)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center", gap: 10 }}>
                    <span style={{ fontSize: "14px", color: "#1e293b" }}>
                      {`${discount.code} - ${discount.type === "percent" ? `${discount.value}%` : convertPrice(discount.value)}`}
                      <br />
                      <span style={{ fontSize: "12px", color: "#64748b" }}>
                        (Tối thiểu: {convertPrice(discount.minValue)}, Còn lại: {discount.usesLeft})
                      </span>
                      {userHasUsedDiscount && (
                        <>
                          <br />
                          <span style={{ fontSize: "12px", color: "#dc2626", fontWeight: 600 }}>
                            Bạn đã dùng mã này rồi
                          </span>
                        </>
                      )}
                    </span>
                    {isApplied ? (
                      <Button type="primary" size="small" style={{ background: "#16a34a", borderColor: "#16a34a" }}>
                        Đã áp dụng
                      </Button>
                    ) : userHasUsedDiscount ? (
                      <Button
                        size="small"
                        disabled
                        style={{
                          borderColor: "#dc2626",
                          color: "#dc2626",
                        }}
                      >
                        Đã dùng
                      </Button>
                    ) : (
                      <Button
                        size="small"
                        style={{
                          borderColor: isValid ? "#0284c7" : "#94a3b8",
                          color: isValid ? "#0284c7" : "#94a3b8",
                        }}
                      >
                        Chọn
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </Modal>
    </div>
  );
};

export default OrderPage;