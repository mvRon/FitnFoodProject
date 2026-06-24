import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Spin, Row, Col, Typography, Divider, message,
    InputNumber, Breadcrumb, Image,
} from 'antd';
import { BellOutlined, CheckOutlined } from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { addOrder, syncCart } from '../../redux/slice/orderSlice';
import ReviewComponent from '../../components/ReviewComponent/ReviewComponent';

import {
    Container, ProductImageWrapper, ProductInfoWrapper,
    StyledAddButton, RatingSection,
    LeftColumnWrapper, ProductDescriptionContent, ProductDescriptionSection,
    ProductDescriptionTitle, ProductDescriptionToggleButton, WrapperDiscountText, BreadcrumbWrap,
} from './Style';
import * as CategoryService from '../../services/CategoryService';
import * as ProductService from '../../services/ProductService';
import * as NotificationService from '../../services/NotificationService';
import { slugify } from '../../utils';
import SliderComponent from '../../components/SliderComponent/SliderComponent';
import RecommendationCarousel from '../../components/RecommendationCarousel/RecommendationCarousel';
import { useNotification } from '../../context/NotificationContext';



const { Text } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isRestockSubscribed, setIsRestockSubscribed] = useState(false);
    const [isSubscribing, setIsSubscribing] = useState(false);
    // const access_token = useSelector((state) => state.user.access_token);
    const access_token = localStorage.getItem('access_token');
    const user = useSelector((state) => state.user);
    const orderItems = useSelector((state) => state.order?.orderItems || []);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [productImageList, setProductImageList] = useState([]);
    const { socket } = useNotification();
    const [realTimeStock, setRealTimeStock] = useState(0);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await ProductService.getDetailProduct(id);
                setProduct(res?.data);
                const normalizedImages = (
                    res?.data?.images && Array.isArray(res.data.images) && res.data.images.length > 0
                        ? res.data.images
                        : [res?.data?.image]
                ).filter(Boolean);
                setProductImageList(normalizedImages);
                setSelectedImage(normalizedImages[0] || null);
                setRealTimeStock(res?.data?.countInStock || 0);
            } catch (err) {
                console.error('Lỗi khi lấy chi tiết sản phẩm:', err);
                message.error('Không thể tải sản phẩm.');
            } finally {
                setLoading(false);
            }
        };

        const fetchCategories = async () => {
            const res = await CategoryService.getAllCategories();
            setCategories(res?.data || []);
        };


        fetchProduct();
        fetchCategories();
    }, [id]);

    useEffect(() => {
        if (!socket || !id) return;

        socket.emit("joinProductRoom", id);

        const handleStockUpdate = (data) => {
            if (data.productId === id) {
                setRealTimeStock(data.countInStock);
            }
        };

        socket.on("product:stock_updated", handleStockUpdate);

        return () => {
            socket.emit("leaveProductRoom", id);
            socket.off("product:stock_updated", handleStockUpdate);
        };
    }, [socket, id]);

    const handleAddToCart = async () => {
        if (!access_token) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/login', { state: { from: `/productDetail/${id}` } });
            return;
        }

        const stock = Number(realTimeStock || 0);
        if (stock <= 0) {
            message.warning('Sản phẩm hiện đang hết hàng!');
            return;
        }

        const existedItem = orderItems.find((item) => item.product === product?._id);
        const existedAmount = Number(existedItem?.amount || 0);
        const requestedAmount = Number(quantity || 1);

        if (existedAmount >= stock || existedAmount + requestedAmount > stock) {
            message.warning('Số lượng trong giỏ đã đạt mức tồn kho cho phép.');
            return;
        }

        const orderItem = {
            name: product?.name,
            amount: quantity,
            image: product?.image || productImageList[0],
            price: product?.price,
            product: product?._id,
            discount: product?.discount,
            countInStock: product?.countInStock
        };

        let userId = user?.id;
        if (!userId) {
            try {
                userId = jwtDecode(JSON.parse(access_token))?.id;
            } catch (error) {
                userId = null;
            }
        }

        dispatch(addOrder({
            orderItem
        }));

        if (userId) {
            await dispatch(syncCart({ userId }));
        }
        message.success('Đã thêm vào giỏ hàng!');
    };

    const handleBuyNow = () => {
        if (!access_token) {
            message.warning('Vui lòng đăng nhập để mua hàng!');
            navigate('/login', { state: { from: `/productDetail/${id}` } });
            return;
        }

        const stock = Number(realTimeStock || 0);
        if (stock <= 0) {
            message.warning('Sản phẩm hiện đang hết hàng!');
            return;
        }

        const existedItem = orderItems.find((item) => item.product === product?._id);
        const existedAmount = Number(existedItem?.amount || 0);
        const requestedAmount = Number(quantity || 1);

        if (existedAmount >= stock || existedAmount + requestedAmount > stock) {
            message.warning('Số lượng trong giỏ đã đạt mức tồn kho cho phép.');
            return;
        }

        dispatch(addOrder({
            orderItem: {
                name: product?.name,
                amount: quantity,
                image: product?.image || productImageList[0],
                price: product?.price,
                product: product?._id,
                discount: product?.discount,
                countInStock: product?.countInStock
            }
        }));
        navigate('/order');
    };

    const handleSubscribeRestock = async () => {
        if (!access_token) {
            message.warning('Vui lòng đăng nhập để nhận thông báo!');
            navigate('/login', { state: { from: `/productDetail/${id}` } });
            return;
        }
        setIsSubscribing(true);
        try {
            const token = (() => { const r = localStorage.getItem('access_token'); try { return JSON.parse(r); } catch { return r; } })();
            const res = await NotificationService.subscribeRestock(product?._id, token);
            if (res?.status === 'OK') {
                setIsRestockSubscribed(res.subscribed);
                message.success(res.message);
            } else {
                message.warning(res?.message || 'Không thể đăng ký!');
            }
        } catch (err) {
            message.error('Có lỗi xảy ra.');
        } finally {
            setIsSubscribing(false);
        }
    };

    const getCategoryPath = (category, allCategories) => {
        const path = [];
        let current = category;
        while (current) {
            path.unshift(current);
            if (!current.parent) break;
            current = allCategories.find(
                (cat) =>
                    (typeof current.parent === 'object'
                        ? current.parent._id
                        : current.parent) === cat._id
            );
        }
        return path;
    };

    const handleNavigateHome = () => {
        navigate('/');
    };

    const handleNavigateCategory = (cat) => {
        navigate(`/product/${slugify(cat.name)}-${cat._id}`, { state: cat._id });
    };

    const productCategory = categories.find(cat => cat._id === (product?.type?._id || product?.type));
    const categoryPath = productCategory ? getCategoryPath(productCategory, categories) : [];

    if (loading) {
        return (
            <Container style={{ textAlign: 'center', paddingTop: 50 }}>
                <Spin size="large" />
            </Container>
        );
    }

    if (!product) {
        return (
            <Container>
                <Text type="danger">Không tìm thấy sản phẩm.</Text>
            </Container>
        );
    }

    const fullDescription = product?.description || '';
    const previewLength = Math.ceil(fullDescription.length / 3);
    const shortDescription = fullDescription.length > previewLength
        ? `${fullDescription.slice(0, previewLength).trim()}...`
        : fullDescription;
    const shouldShowToggle = fullDescription.length > previewLength;

    const priceAfterDiscount = product.price - (product.price * (product.discount / 100));
    return (
        <Container>
            {/* <Breadcrumb style={{ margin: '0 auto', padding: '0 16px', cursor: 'pointer' }}>
        <Breadcrumb.Item onClick={handleNavigateHome}>Trang chủ</Breadcrumb.Item>
        {categoryPath.map((cat) => (
          <Breadcrumb.Item
            key={cat._id}
            onClick={() => handleNavigateCategory(cat)}
          >
            {cat.name}
          </Breadcrumb.Item>
        ))}
        <Breadcrumb.Item>{product?.name}</Breadcrumb.Item>
      </Breadcrumb> */}

            <BreadcrumbWrap>
                <Breadcrumb items={[
                    { title: <span onClick={handleNavigateHome} style={{cursor: 'pointer'}}>Trang chủ</span> },
                    ...categoryPath.map((cat) => ({
                        title: <span onClick={() => handleNavigateCategory(cat)} style={{cursor: 'pointer'}}>{cat.name}</span>,
                        key: cat._id
                    })),
                    { title: product?.name }
                ]} />
            </BreadcrumbWrap>

            <Row gutter={[32, 32]} justify="center">
                {/* Ảnh sản phẩm */}
                <Col xs={{ span: 24, order: 1 }} md={{ span: 10, order: 1 }}>
                    <LeftColumnWrapper>
                        <ProductImageWrapper>
                            {productImageList.length > 1
                                ? <SliderComponent arrImages={productImageList} selectedImage={selectedImage} /> // Hiển thị slider nếu có nhiều hình ảnh
                                : productImageList.length === 1
                                    ? <Image src={productImageList[0]} alt={product?.name} preview />
                                    : <Text type="secondary">Sản phẩm chưa có hình ảnh.</Text>
                            }
                        </ProductImageWrapper>
                        <div style={{ width: '100%', marginTop: 16, display: 'flex', gap: 10, border: '1px solid rgba(2,132,199,0.2)', padding: 10, borderRadius: 12, background: 'linear-gradient(160deg, #FFFFFF, #F8FAFC)' }}>
                            {productImageList.map((image, index) => (
                                <Image
                                    key={index}
                                    src={image}
                                    alt={`${product?.name} - ${index + 1}`}
                                    style={{ width: 62, height: 62, objectFit: 'cover', borderRadius: 10, cursor: 'pointer', border: selectedImage === image ? '2px solid #10B981' : '1px solid rgba(2,132,199,0.16)', boxShadow: selectedImage === image ? '0 8px 14px rgba(16,185,129,0.2)' : 'none' }}
                                    onClick={() => setSelectedImage(image)}
                                    preview={false}
                                />
                            ))}
                        </div>
                    </LeftColumnWrapper>
                </Col>

                {/* Thông tin sản phẩm */}
                <Col xs={{ span: 24, order: 2 }} md={{ span: 10, order: 2 }}>
                    <ProductInfoWrapper>
                        <h2>{product.name}</h2>
                        <Divider />
                        <Text delete className="price" style={{ color: '#64748B' }}>{product.price.toLocaleString('vi-VN')} VNĐ</Text>
                        <div className="price">{priceAfterDiscount.toLocaleString('vi-VN')} VNĐ <WrapperDiscountText> - {product.discount}%</WrapperDiscountText></div>
                        <div className="sold">Đã bán: {product.sold || 0}</div>
                        <div style={{ margin: '20px 0', padding: '10px 12px', borderRadius: 10, border: '1px solid rgba(2,132,199,0.16)', background: 'rgba(248,250,252,0.8)' }}>
                            <span className="label">Số lượng: </span>
                            <InputNumber disabled={realTimeStock <= 0} min={1} max={realTimeStock || 1} value={quantity} onChange={(value) => setQuantity(value)} />
                        </div>
                        <StyledAddButton disabled={realTimeStock <= 0} onClick={() => realTimeStock !== 0 ? handleAddToCart() : message.warning('Sản phẩm hiện đang hết hàng!')} style={{ marginRight: 16, background: realTimeStock > 0 ? '#F59E0B' : '#d1d5db', borderColor: realTimeStock > 0 ? '#F59E0B' : '#d1d5db', boxShadow: realTimeStock > 0 ? '0 10px 22px rgba(245,158,11,0.32)' : 'none', cursor: realTimeStock > 0 ? 'pointer' : 'not-allowed' }}>
                            Thêm vào giỏ hàng
                        </StyledAddButton>
                        <StyledAddButton disabled={realTimeStock <= 0} onClick={() => realTimeStock !== 0 ? handleBuyNow() : message.warning('Sản phẩm hiện đang hết hàng!')} style={{ background: realTimeStock > 0 ? '#10B981' : '#d1d5db', borderColor: realTimeStock > 0 ? '#10B981' : '#d1d5db', boxShadow: realTimeStock > 0 ? '0 10px 22px rgba(16,185,129,0.28)' : 'none', cursor: realTimeStock > 0 ? 'pointer' : 'not-allowed' }}>
                            Mua ngay
                        </StyledAddButton>

                        {/* Nút đăng ký nhận thông báo hàng về */}
                        {realTimeStock <= 0 && (
                            <button
                                id="subscribe-restock-btn"
                                onClick={handleSubscribeRestock}
                                disabled={isSubscribing}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    marginTop: 12,
                                    padding: '10px 20px',
                                    borderRadius: 10,
                                    border: `2px solid ${isRestockSubscribed ? '#6366f1' : '#e2e8f0'}`,
                                    background: isRestockSubscribed
                                        ? 'linear-gradient(135deg, #6366f1, #8b5cf6)'
                                        : '#f8fafc',
                                    color: isRestockSubscribed ? '#fff' : '#64748b',
                                    fontWeight: 600,
                                    fontSize: 13,
                                    cursor: isSubscribing ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.2s',
                                    width: '100%',
                                    justifyContent: 'center',
                                }}
                            >
                                <BellOutlined />
                                {isSubscribing
                                    ? 'Đang xử lý...'
                                    : isRestockSubscribed
                                        ? <><CheckOutlined /> Đã đăng ký – Nhấn để hủy</>
                                        : 'Thông báo khi có hàng'
                                }
                            </button>
                        )}
                    </ProductInfoWrapper>
                </Col>

                <Col xs={{ span: 24, order: 3 }} md={{ span: 20, order: 3 }}>
                    <ProductDescriptionSection>
                        <ProductDescriptionTitle>Mô tả sản phẩm</ProductDescriptionTitle>
                        <ProductDescriptionContent>
                            {isDescriptionExpanded ? fullDescription : shortDescription}
                        </ProductDescriptionContent>
                        {shouldShowToggle && (
                            <ProductDescriptionToggleButton onClick={() => setIsDescriptionExpanded((prev) => !prev)}>
                                {isDescriptionExpanded ? 'Thu gọn' : 'Xem thêm'}
                            </ProductDescriptionToggleButton>
                        )}
                    </ProductDescriptionSection>
                </Col>

                <Col xs={{ span: 24, order: 4 }} md={{ span: 20, order: 4 }}>
                    <RecommendationCarousel context="product" productId={product?._id} />
                </Col>

                {/* Đánh giá sản phẩm */}
                <Col xs={{ span: 24, order: 5 }} md={{ span: 20, order: 5 }}>
                    <RatingSection>
                        <ReviewComponent
                            productId={product._id}
                            reviews={reviews}
                            setReviews={setReviews}
                        />
                    </RatingSection>
                </Col>
            </Row>


        </Container>
    );
};

export default ProductDetailPage;