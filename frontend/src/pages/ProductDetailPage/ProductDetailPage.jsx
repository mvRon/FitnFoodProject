import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Spin, Row, Col, Typography, Divider, message,
    InputNumber, Breadcrumb, Image,
} from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { jwtDecode } from 'jwt-decode';
import { addOrder, syncCart } from '../../redux/slice/orderSlice';
import ReviewComponent from '../../components/ReviewComponent/ReviewComponent';

import {
    Container, ProductImageWrapper, ProductInfoWrapper,
    StyledAddButton, RatingSection,
    LeftColumnWrapper, WrapperDiscountText,
} from './Style';
import * as CategoryService from '../../services/CategoryService';
import * as ProductService from '../../services/ProductService';
import { slugify } from '../../utils';
import SliderComponent from '../../components/SliderComponent/SliderComponent';



const { Text } = Typography;

const ProductDetailPage = () => {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [reviews, setReviews] = useState([]);
    const [selectedImage, setSelectedImage] = useState(null);
    // const access_token = useSelector((state) => state.user.access_token);
    const access_token = localStorage.getItem('access_token');
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [productImageList, setProductImageList] = useState([])

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await ProductService.getDetailProduct(id);
                setProduct(res?.data);
                setProductImageList(
                    res?.data?.images && Array.isArray(res.data.images) && res.data.images.length > 0
                        ? res.data.images
                        : [res?.data?.image]
                );
                setSelectedImage(
                    res?.data?.images && Array.isArray(res.data.images) && res.data.images.length > 0
                        ? res.data.images[0]
                        : res?.data?.image
                );
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

    const handleAddToCart = async () => {
        if (!access_token) {
            message.warning('Vui lòng đăng nhập để thêm vào giỏ hàng!');
            navigate('/login', { state: { from: `/productDetail/${id}` } });
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

            <div style={{ maxWidth: '1270px', width: '100%', margin: '0 auto', padding: '0 16px' }}>
                <Breadcrumb style={{ background: 'transparent', padding: 0, marginBottom: 12, cursor: 'pointer' }}>
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
                </Breadcrumb>
            </div>

            <Row gutter={[32, 32]} justify="center">
                {/* Ảnh sản phẩm */}
                <Col xs={{ span: 24, order: 1 }} md={{ span: 10, order: 1 }}>
                    <LeftColumnWrapper>
                        <ProductImageWrapper>
                            {productImageList.length > 1
                                ? <SliderComponent arrImages={productImageList} selectedImage={selectedImage} /> // Hiển thị slider nếu có nhiều hình ảnh
                                : <Image src={productImageList[0]} alt={product?.name} preview /> // Hiển thị hình ảnh đơn nếu chỉ có một hình ảnh
                            }
                        </ProductImageWrapper>
                        <div style={{ width: '100%', marginTop: 16, display: 'flex', gap: 8, border: '1px solid #e8e8e8', padding: 8, borderRadius: 6, backgroundColor: '#fff' }}>
                            {productImageList.map((image, index) => (
                                <Image
                                    key={index}
                                    src={image}
                                    alt={`${product?.name} - ${index + 1}`}
                                    style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, cursor: 'pointer', border: selectedImage === image ? '2px solid #1890ff' : 'none' }}
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
                        <Text delete className="price" style={{ color: 'black' }}>{product.price.toLocaleString('vi-VN')} VNĐ</Text>
                        <div className="price">{priceAfterDiscount.toLocaleString('vi-VN')} VNĐ <WrapperDiscountText> - {product.discount}%</WrapperDiscountText></div>
                        <div>
                            <span className="label">Mô tả:</span>
                            <div className="description">{product.description}</div>
                        </div>
                        <div className="sold">Đã bán: {product.sold || 0}</div>
                        <div style={{ margin: '20px 0' }}>
                            <span className="label">Số lượng: </span>
                            <InputNumber min={1} value={quantity} onChange={(value) => setQuantity(value)} />
                        </div>
                        <StyledAddButton onClick={handleAddToCart} style={{ marginRight: 16 }}>
                            Thêm vào giỏ hàng
                        </StyledAddButton>
                        <StyledAddButton onClick={handleBuyNow} style={{ background: '#78C841' }}>
                            Mua ngay
                        </StyledAddButton>
                    </ProductInfoWrapper>
                </Col>

                {/* Đánh giá sản phẩm */}
                <Col xs={{ span: 24, order: 3 }} md={{ span: 20, order: 3 }}>
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