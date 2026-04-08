import React, { useEffect, useState, useCallback } from 'react';
import { Typography, Rate, message, Tooltip } from 'antd';
import { useSelector } from 'react-redux';
import axios from 'axios';
import {
    RatingSectionWrapper,
    RatingAverageContainer,
    RatingAverageScore,
    RatingAverageText,
    RatingStarsDisplay,
    RatingBreakdown,
    RatingBreakdownItem,
    RatingStarLabel,
    StyledProgress,
    RatingCount,
    StyledDivider,
    RatingInputContainer,
    StyledRate,
    StyledRatingSubmitButton,
    StyledTextArea,
} from './Style';
import * as ProductService from '../../services/ProductService';

const { Title } = Typography;

const RatingSection = ({ productId, refreshAll }) => {
    const access_token = useSelector(state => state.user.access_token);
    const [reviews, setReviews] = useState([]);
    const [userRating, setUserRating] = useState(0);
    const [showCommentBox, setShowCommentBox] = useState(false);
    const [commentContent, setCommentContent] = useState('');
    const [canRate, setCanRate] = useState(false);
    const [isCheckingPermission, setIsCheckingPermission] = useState(false);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL_BACKEND}/product/${productId}/reviews`);
            setReviews(res?.data?.data || []);
        } catch (err) {
            console.error('Lỗi khi lấy đánh giá:', err);
            setReviews([]);
        }
    }, [productId]);

    // Kiểm tra quyền đánh giá
    const checkRatingPermission = useCallback(async () => {
        if (!access_token) {
            setCanRate(false);
            return;
        }

        setIsCheckingPermission(true);
        try {
            const res = await ProductService.checkRatingPermission(productId, JSON.parse(access_token));
            setCanRate(res.status === 'OK');
        } catch (err) {
            console.error('Lỗi khi kiểm tra quyền đánh giá:', err);
            setCanRate(false);
        } finally {
            setIsCheckingPermission(false);
        }
    }, [productId, access_token]);

    useEffect(() => {
        fetchReviews();
    }, [fetchReviews]);

    useEffect(() => {
        checkRatingPermission();
    }, [checkRatingPermission]);

    const handleStarChange = (value) => {
        if (!canRate) {
            message.warning('Bạn cần có đơn hàng đã giao và đã thanh toán để đánh giá sản phẩm này!');
            return;
        }
        setUserRating(value);
        setShowCommentBox(true);
    };

    const handleSubmitRating = async () => {
        if (!access_token) {
            return message.warning('Vui lòng đăng nhập để đánh giá.');
        }

        if (!canRate) {
            return message.warning('Bạn cần có đơn hàng đã giao và đã thanh toán để đánh giá sản phẩm này!');
        }

        if (userRating === 0) {
            return message.warning('Vui lòng chọn số sao để đánh giá.');
        }

        if (!commentContent.trim()) {
            return message.warning('Vui lòng nhập nội dung đánh giá.');
        }

        try {
            const res = await ProductService.addRatingProduct(productId, JSON.parse(access_token), { rating: userRating, comment: commentContent });

            // Kiểm tra kết quả từ API
            if (res.status === 'OK') {
                message.success('Đánh giá thành công!');
                setUserRating(0);
                setCommentContent('');
                setShowCommentBox(false);

                // Cập nhật danh sách đánh giá và quyền đánh giá
                try {
                    await fetchReviews();
                    if (typeof refreshAll === 'function') {
                        refreshAll();
                    }
                    await checkRatingPermission();
                } catch (updateError) {
                    console.error('Lỗi khi cập nhật dữ liệu sau đánh giá:', updateError);
                    // Không hiển thị lỗi cho user vì đánh giá đã thành công
                }
            } else {
                // Nếu API trả về lỗi
                message.error(res.message || 'Đánh giá thất bại!');
            }
        } catch (err) {
            // Xử lý lỗi network hoặc lỗi khác
            const errorMessage = err?.response?.data?.message || err?.message || 'Có lỗi xảy ra khi đánh giá!';
            message.error(errorMessage);
        }
    };

    const safeReviews = reviews || [];
    // Chỉ lấy các review có rating hợp lệ

    const ratingReviews = safeReviews.filter(r => typeof r.rating === 'number' && !isNaN(r.rating));
    const totalReviews = ratingReviews.length;
    // const averageRating = totalReviews
    //   ? ratingReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews
    //   : 0;
    const validReviews = safeReviews.filter(r => Number(r.rating) > 0);
    const totalValidReviews = validReviews.length;
    const averageRating = totalValidReviews
        ? validReviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalValidReviews
        : 0;

    const ratingCount = [5, 4, 3, 2, 1].map(
        (star) => ratingReviews.filter((r) => r.rating === star).length
    );

    return (
        <RatingSectionWrapper>
            <Title level={4} style={{ textAlign: 'center', marginBottom: '25px', color: '#1E293B', fontWeight: 700, letterSpacing: 0.2 }}>
                Đánh giá sản phẩm
            </Title>

            <RatingAverageContainer>
                <RatingAverageScore>{averageRating.toFixed(1)}</RatingAverageScore>
                <RatingStarsDisplay>
                    <Rate disabled allowHalf value={averageRating} style={{ fontSize: '22px', color: '#F59E0B' }} />
                </RatingStarsDisplay>
                <RatingAverageText>Tổng {totalValidReviews} lượt đánh giá</RatingAverageText>
            </RatingAverageContainer>

            <RatingBreakdown>
                {ratingCount.map((count, index) => {
                    const star = 5 - index;
                    const percent = totalValidReviews ? (count / totalValidReviews) * 100 : 0;
                    return (
                        <RatingBreakdownItem key={star}>
                            <RatingStarLabel>
                                <Tooltip title={`${star} sao`}>
                                    <Rate disabled defaultValue={star} count={1} style={{ fontSize: 16, color: '#F59E0B' }} />
                                </Tooltip>
                            </RatingStarLabel>
                            <StyledProgress percent={percent} showInfo={false} />
                            <RatingCount>{count}</RatingCount>
                        </RatingBreakdownItem>
                    );
                })}
            </RatingBreakdown>

            {access_token && (
                <>
                    <StyledDivider />
                    <RatingInputContainer>
                        <Title level={5} style={{ margin: 0, whiteSpace: 'nowrap' }}>Đánh giá của bạn:</Title>
                        {isCheckingPermission ? (
                            <div style={{ textAlign: 'center', padding: '20px', width: '100%', border: '1px dashed rgba(2,132,199,0.28)', borderRadius: 12, background: 'rgba(248,250,252,0.86)' }}>
                                <Typography.Text style={{ color: '#0284C7' }}>Đang kiểm tra quyền đánh giá...</Typography.Text>
                            </div>
                        ) : canRate ? (
                            <>
                                <StyledRate onChange={handleStarChange} value={userRating} />
                                {showCommentBox && (
                                    <div style={{ width: '100%', marginTop: 10, padding: 12, borderRadius: 12, border: '1px solid rgba(16,185,129,0.24)', background: 'linear-gradient(160deg, rgba(16,185,129,0.08), rgba(248,250,252,0.7))' }}>
                                        <Typography.Text style={{ color: '#0F766E', fontWeight: 600 }}>Bạn nghĩ gì về sản phẩm này?</Typography.Text>
                                        <StyledTextArea
                                            rows={3}
                                            value={commentContent}
                                            onChange={(e) => setCommentContent(e.target.value)}
                                            placeholder="Nhập nội dung đánh giá..."
                                            maxLength={500}
                                        />
                                    </div>
                                )}
                                <StyledRatingSubmitButton onClick={handleSubmitRating} type="primary">
                                    Gửi đánh giá
                                </StyledRatingSubmitButton>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center', padding: '20px', color: '#B45309', width: '100%', border: '1px solid rgba(245,158,11,0.35)', borderRadius: 12, background: 'rgba(245,158,11,0.08)' }}>
                                <Typography.Text style={{ color: '#B45309' }}>
                                    Bạn cần có đơn hàng đã giao và đã thanh toán để có thể đánh giá sản phẩm này.
                                </Typography.Text>
                            </div>
                        )}
                    </RatingInputContainer>
                </>
            )}
            <StyledDivider />
        </RatingSectionWrapper>
    );
};

export default RatingSection;