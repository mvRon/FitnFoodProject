import React, { useMemo } from "react";
import { StarFilled } from "@ant-design/icons";
import { useQuery } from "@tanstack/react-query";
import { Image, message, Spin } from "antd";
import { jwtDecode } from "jwt-decode";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { addOrder, syncCart } from "../../redux/slice/orderSlice";
import * as RecommendationService from "../../services/RecommendationService";
import { convertPrice } from "../../utils";
import {
  CardBody,
  CardImageWrapper,
  CarouselWrapper,
  PriceRow,
  ProductName,
  QuickAddButton,
  RatingRow,
  RecommendationCard,
  ReasonBadge,
  SectionHeader,
  SectionSubtitle,
  SectionTitle,
  SectionWrapper,
  SliderWrapper,
} from "./Style";

const resolveToken = (token) => {
  if (!token) return null;
  if (typeof token !== "string") return token;
  try {
    return JSON.parse(token);
  } catch (error) {
    return token;
  }
};

const CONTEXT_CONFIG = {
  product: {
    title: "Gợi ý tương tự",
    subtitle: "Được cá nhân hóa dựa trên sản phẩm bạn đang xem",
    reason: "Tương tự sản phẩm bạn đang xem",
  },
  cart: {
    title: "Gợi ý cho giỏ hàng",
    subtitle: "Phù hợp với những món bạn đang có",
    reason: "Phù hợp với giỏ hàng của bạn",
  },
  history: {
    title: "Gợi ý riêng cho bạn",
    subtitle: "Được cá nhân hóa từ lịch sử mua hàng",
    reason: "Dựa trên lịch sử mua hàng của bạn",
  },
};

const RecommendationCarousel = ({
  context,
  productId,
  cartItems,
  limit = 5,
  title,
  subtitle,
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const orderItems = useSelector((state) => state.order?.orderItems || []);
  const user = useSelector((state) => state.user);
  const accessTokenRaw = localStorage.getItem("access_token");
  const accessToken = resolveToken(accessTokenRaw);

  const productIds = useMemo(() => {
    return (cartItems || [])
      .map((item) => item?.product)
      .filter(Boolean);
  }, [cartItems]);

  const productIdsKey = useMemo(() => productIds.join("|"), [productIds]);

  const config = CONTEXT_CONFIG[context] || CONTEXT_CONFIG.product;
  const headerTitle = title || config.title;
  const headerSubtitle = subtitle || config.subtitle;

  const sliderSettings = useMemo(
    () => ({
      dots: false,
      infinite: false,
      speed: 500,
      slidesToShow: 4,
      slidesToScroll: 1,
      arrows: true,
      responsive: [
        {
          breakpoint: 1200,
          settings: { slidesToShow: 3 },
        },
        {
          breakpoint: 900,
          settings: { slidesToShow: 2 },
        },
        {
          breakpoint: 600,
          settings: { slidesToShow: 1 },
        },
      ],
    }),
    []
  );

  const { data: recommendationsData, isLoading: loading } = useQuery({
    queryKey: ["recommendations", context, productId, productIdsKey, accessToken, limit],
    queryFn: async () => {
      let response = null;
      if (context === "product") {
        response = await RecommendationService.getRecommendationsByProduct(productId, limit);
      } else if (context === "cart") {
        response = await RecommendationService.getRecommendationsByCart(productIds, limit, accessToken);
      } else if (context === "history") {
        response = await RecommendationService.getRecommendationsByHistory(accessToken, limit);
      }
      if (response?.status === "OK") {
        return response.data || [];
      }
      return [];
    },
    enabled:
      (context === "product" && !!productId) ||
      (context === "cart" && !!accessToken && productIds.length > 0) ||
      (context === "history" && !!accessToken),
    staleTime: 5 * 60 * 1000,
  });

  const items = recommendationsData || [];

  const handleQuickAdd = async (item) => {
    if (!accessToken) {
      message.warning("Vui lòng đăng nhập để thêm vào giỏ hàng!");
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const stock = Number(item?.countInStock || 0);
    if (stock <= 0) {
      message.warning("Sản phẩm hiện đang hết hàng!");
      return;
    }

    const existedItem = orderItems.find((order) => order.product === item?._id);
    const existedAmount = Number(existedItem?.amount || 0);

    if (existedAmount >= stock) {
      message.warning("Số lượng trong giỏ đã đạt mức tồn kho cho phép.");
      return;
    }

    const orderItem = {
      name: item?.name,
      amount: 1,
      image: item?.image || item?.images?.[0],
      price: item?.price,
      product: item?._id,
      discount: item?.discount,
      countInStock: item?.countInStock,
    };

    dispatch(addOrder({ orderItem }));

    let userId = user?.id;
    if (!userId) {
      try {
        const decoded = jwtDecode(accessToken);
        userId = decoded?.id;
      } catch (error) {
        userId = null;
      }
    }

    if (userId) {
      await dispatch(syncCart({ userId }));
    }

    message.success("Đã thêm vào giỏ hàng!");
  };

  const handleNavigate = (id) => {
    navigate(`/productDetail/${id}`);
  };

  if (!items.length && !loading) {
    return null;
  }

  return (
    <SectionWrapper>
      <SectionHeader>
        <div>
          <SectionTitle>{headerTitle}</SectionTitle>
          <SectionSubtitle>{headerSubtitle}</SectionSubtitle>
        </div>
        {loading && (
          <Spin size="small" style={{ marginLeft: 12 }} />
        )}
      </SectionHeader>
      <CarouselWrapper>
        <SliderWrapper {...sliderSettings}>
          {(items || []).map((item) => {
            const reason = item?.reason || config.reason;
            const priceAfterDiscount = Number(item?.price || 0) * (1 - Number(item?.discount || 0) / 100);
            const ratingValue = Number.isFinite(item?.rating)
              ? item?.rating
              : Number.parseFloat(item?.rating) || 0;
            return (
              <RecommendationCard key={item?._id} onClick={() => handleNavigate(item?._id)}>
                <CardImageWrapper>
                  <Image
                    src={item?.image || item?.images?.[0]}
                    alt={item?.name}
                    preview={false}
                    height={170}
                    style={{ objectFit: "contain" }}
                  />
                  <ReasonBadge>{reason}</ReasonBadge>
                </CardImageWrapper>
                <CardBody>
                  <ProductName>{item?.name}</ProductName>
                  <RatingRow>
                    <span>{ratingValue.toFixed(1).replace(".", ",")}</span>
                    <StarFilled />
                    <span className="muted">Đã bán {item?.sold || 0}</span>
                  </RatingRow>
                  <PriceRow>
                    <span className="sale">{convertPrice(priceAfterDiscount)}</span>
                    <span className="origin">{convertPrice(item?.price)}</span>
                  </PriceRow>
                  <QuickAddButton
                    onClick={(event) => {
                      event.stopPropagation();
                      handleQuickAdd(item);
                    }}
                  >
                    Thêm nhanh
                  </QuickAddButton>
                </CardBody>
              </RecommendationCard>
            );
          })}
        </SliderWrapper>
      </CarouselWrapper>
    </SectionWrapper>
  );
};

export default RecommendationCarousel;
