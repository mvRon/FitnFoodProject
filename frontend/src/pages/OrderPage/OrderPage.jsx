
import { DeleteOutlined, MinusOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Checkbox, Form, Input, List, message, Modal, Steps } from "antd";
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
  DiscountModalContent,
  DiscountItem,
} from "./Style";

const OrderPage = () => {
  const [form] = Form.useForm();
  const order = useSelector((state) => state.order);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const [listChecked, setListChecked] = useState([]);
  const [isOpenModalUpdateInfo, setIsOpenModalUpdateInfo] = useState(false);
  const [isOpenDiscountModal, setIsOpenDiscountModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
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
  const [productDiscounts, setProductDiscounts] = useState({});
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
    setProductDiscounts((prev) => {
      const newDiscounts = { ...prev };
      delete newDiscounts[idProduct];
      return newDiscounts;
    });
  };

  const handleDeleteAllOrder = async () => {
    if (listChecked?.length >= 1) {
      dispatch(removeAllOrder({ listChecked }));
      await CartService.deleteCart(user?.id, storageData);
      setProductDiscounts({});
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
    form.setFieldsValue(stateDetailUser);
  }, [form, stateDetailUser]);

  // Tính tổng giá gốc của các sản phẩm đã chọn
  const priceMemo = useMemo(() => {
    const result = order?.orderItems
      ?.filter((item) => listChecked.includes(item.product))
      ?.reduce((total, current) => total + current?.price * current?.amount, 0);
    return result || 0;
  }, [order, listChecked]);

  // Tính tổng giảm giá dựa trên discountedPrice của từng sản phẩm
  const priceDiscountMemo = useMemo(() => {
    const result = order?.orderItems
      ?.filter((item) => listChecked.includes(item.product))
      ?.reduce((total, current) => {
        const productDiscount = productDiscounts[current.product];
        const originalPrice = current.price * current.amount;
        const discountPercent = (current.discount || 0) / 100;
        let appliedDiscount = discountPercent * originalPrice;

        if (productDiscount) {
          appliedDiscount += productDiscount.type === "percent"
            ? (originalPrice * productDiscount.value) / 100
            : Math.min(productDiscount.value, originalPrice); // Đảm bảo không giảm quá giá gốc
        }

        return total + appliedDiscount;
      }, 0);
    return result || 0;
  }, [order, listChecked, productDiscounts]);

  // Tính phí giao hàng
  const deliveryMemo = useMemo(() => {
    if (priceMemo >= 500000 || order?.orderItems?.length === 0) {
      return 0;
    } else if (priceMemo >= 200000 && priceMemo < 500000) {
      return 10000;
    } else {
      return 20000;
    }
  }, [priceMemo]);

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
          productDiscounts: productDiscounts,
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
  const orderItems = useSelector((state) => state.order.orderItems);
  useEffect(() => {
    if (!user?.id) return;

    const prevOrderItems = prevOrderItemsRef.current;

    if (!isEqual(prevOrderItems, orderItems)) {
      dispatch(syncCart({ userId: user.id, cartItems: orderItems }));
      prevOrderItemsRef.current = orderItems;
    }
  }, [orderItems, user.id]);

  const handleGetDetailProduct = (productId) => {
    navigate(`/productDetail/${productId}`);
  };

  const handleOpenDiscountModal = (productId) => {
    setSelectedProductId(productId);
    setIsOpenDiscountModal(true);
  };

  const handleApplyDiscount = (code) => {
    applyDiscount(selectedProductId, code);
  };

  const applyDiscount = (productId, code) => {
    const selectedDiscount = discounts.find((d) => d.code === code);
    if (selectedDiscount) {
      const item = order?.orderItems?.find((item) => item.product === productId);
      if (!item) return;
      const itemPrice = item.price * item.amount;
      const now = new Date();
      const isValid =
        new Date(selectedDiscount.startDate) <= now &&
        new Date(selectedDiscount.endDate) >= now &&
        itemPrice >= selectedDiscount.minValue &&
        selectedDiscount.usesLeft > 0;

      if (isValid) {
        setProductDiscounts((prev) => ({
          ...prev,
          [productId]: selectedDiscount,
        }));
        message.success("Mã giảm giá đã được áp dụng thành công");
        setIsOpenDiscountModal(false);
      } else if (itemPrice < selectedDiscount.minValue) {
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
      title: "20.000 VND",
      description: "Dưới 200.000 VND",
    },
    {
      title: "10.000 VND",
      description: "Từ 200.000 VND đến dưới 500.000 VND",
    },
    {
      title: "0 VND",
      description: "Trên 500.000 VND",
    },
  ];



  //fetch cart
 



  return (
    <div
      style={{
        background: "#f5f5fa",
        width: "100%",
        minHeight: "100vh",
        padding: "20px 0",
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
        <h3 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "16px" }}>Giỏ hàng</h3>
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
              <StepComponent items={itemsDelivery} current={deliveryMemo === 20000 ? 0 : deliveryMemo === 10000 ? 1 : deliveryMemo === 0 || order?.orderItemSelected.length === 0 ? 3 : 2} />
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
                const productDiscount = productDiscounts[item?.product];
                const originalPrice = item.price * item.amount;
                const discountPercent = (item.discount || 0) / 100;
                let appliedDiscount = discountPercent * originalPrice;
                let discountedPrice = item.price;

                if (productDiscount) {
                  appliedDiscount += productDiscount.type === "percent"
                    ? (originalPrice * productDiscount.value) / 100
                    : Math.min(productDiscount.value, originalPrice);
                  discountedPrice = productDiscount.type === "percent"
                    ? item.price * (1 - productDiscount.value / 100)
                    : Math.max(0, item.price - productDiscount.value / item.amount);
                }

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
                    <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
                      <DiscountButton onClick={() => handleOpenDiscountModal(item?.product)}>
                        Mã giảm giá
                      </DiscountButton>
                    </div>
                    <Modal
                      title={<span style={{ fontSize: "18px", fontWeight: "bold", color: "#333" }}>Chọn mã giảm giá</span>}
                      open={isOpenDiscountModal && selectedProductId === item?.product}
                      onCancel={() => setIsOpenDiscountModal(false)}
                      footer={null}
                      width={450}
                      style={{ top: 20 }}
                      bodyStyle={{ padding: 0 }}
                    >
                      <Card
                        style={{
                          borderRadius: 8,
                          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                          overflow: "hidden",
                        }}
                      >
                        <List
                          style={{ maxHeight: "400px", overflowY: "auto" }}
                          dataSource={discounts}
                          renderItem={(discount) => {
                            const itemPrice = item.price * item.amount;
                            const now = new Date();
                            const isValid =
                              new Date(discount.startDate) <= now &&
                              new Date(discount.endDate) >= now &&
                              itemPrice >= discount.minValue &&
                              discount.usesLeft > 0;
                            const isApplied = productDiscounts[item?.product]?.code === discount.code;

                            return (
                              <List.Item
                                style={{
                                  padding: "12px 16px",
                                  borderBottom: "1px solid #f0f0f0",
                                  cursor: isValid ? "pointer" : "not-allowed",
                                  background: isApplied ? "#e6f7ff" : "transparent",
                                  transition: "background 0.3s",
                                }}
                                onClick={() => isValid && handleApplyDiscount(discount.code)}
                              >
                                <div style={{ display: "flex", justifyContent: "space-between", width: "100%", alignItems: "center" }}>
                                  <span style={{ fontSize: "14px", color: isValid ? "#333" : "#999" }}>
                                    {`${discount.code} - ${discount.type === "percent" ? `${discount.value}%` : convertPrice(discount.value)}`}
                                    <br />
                                    <span style={{ fontSize: "12px", color: "#666" }}>
                                      (Tối thiểu: {convertPrice(discount.minValue)}, Còn lại: {discount.usesLeft})
                                    </span>
                                  </span>
                                  {isApplied && (
                                    <Button type="primary" size="small" style={{ background: "#52c41a", borderColor: "#52c41a" }}>
                                      Đã áp dụng
                                    </Button>
                                  )}
                                </div>
                              </List.Item>
                            );
                          }}
                        />
                      </Card>
                    </Modal>
                  </WrapperItemOrder>
                );
              })}
            </WrapperListOrder>
          </div>
          <div style={{ flex: 1, minWidth: 260, maxWidth: 400, width: "100%" }}>
            <Card title="Thông tin đơn hàng" style={{ borderRadius: 8, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}>
              <WrapperInfo>
                <div>
                  <span>Địa chỉ: </span>
                  <span style={{ fontWeight: "bold" }}>{` ${user?.address}, ${user?.city} `}</span>
                  <span onClick={handleChangeAddress} style={{ color: "#1890ff", cursor: "pointer" }}>
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
              </WrapperInfo>
              <WrapperTotal>
                <span>Tổng tiền</span>
                <span style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ color: "rgb(254, 56, 52)", fontSize: 24, fontWeight: "bold" }}>{convertPrice(totalPriceMemo)}</span>
                  <span style={{ color: "#000", fontSize: 11 }}>(Đã bao gồm thuế nếu có)</span>
                </span>
              </WrapperTotal>
              <Button
                type="primary"
                onClick={() => handleAddCart()}
                style={{
                  background: "rgb(255, 57, 69)",
                  height: 48,
                  width: "100%",
                  border: "none",
                  borderRadius: 4,
                  fontWeight: "bold",
                  marginTop: 16,
                }}
              >
                Mua hàng
              </Button>
            </Card>
          </div>
        </div>
      </div>
      <ModalComponent
        forceRender
        title="Cập nhật thông tin giao hàng"
        open={isOpenModalUpdateInfo}
        onCancel={handleCancelUpdateInfo}
        okText="Yes"
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
            <Form.Item label="Name" name="name" rules={[{ required: true, message: "Please input your Name!" }]}>
              <Input value={stateDetailUser.name} onChange={handleOnChangeDetailUser} name="name" />
            </Form.Item>
            <Form.Item label="City" name="city" rules={[{ required: true, message: "Please input your Email!" }]}>
              <Input value={stateDetailUser.city} onChange={handleOnChangeDetailUser} name="city" />
            </Form.Item>
            <Form.Item label="Address" name="address" rules={[{ required: true, message: "Please input your Address!" }]}>
              <Input value={stateDetailUser.address} onChange={handleOnChangeDetailUser} name="address" />
            </Form.Item>
            <Form.Item label="Phone" name="phone" rules={[{ required: true, message: "Please input your Phone!" }]}>
              <Input value={stateDetailUser.phone} onChange={handleOnChangeDetailUser} name="phone" />
            </Form.Item>
          </Form>
        </LoadingComponent>
      </ModalComponent>
    </div>
  );
};

export default OrderPage;