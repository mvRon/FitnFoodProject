import React, { useEffect, useState, useCallback } from 'react';
import * as ProductService from '../../services/ProductService';
import RatingSection from './RatingSection';
import CommentSection from './CommentSection';

const ReviewComment = ({ refreshTrigger, productId, setRefreshTrigger }) => {
    const [reviews, setReviews] = useState([]);

    const fetchReviews = useCallback(async () => {
        try {
            const res = await ProductService.getAllComment(productId);
            if (res.status === 'OK') {
                setReviews(res.data || []);
            }
        } catch (err) {
            console.error('Lỗi khi tải bình luận:', err);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchReviews();
        }
    }, [productId, fetchReviews, refreshTrigger]);

    const refreshAll = () => {
        fetchReviews();
        setRefreshTrigger(prev => prev + 1);
    };

    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ background: 'linear-gradient(165deg, #FFFFFF, rgba(248,250,252,0.96))', border: '1px solid rgba(2,132,199,0.16)', borderRadius: 16, padding: 4, boxShadow: '0 12px 26px rgba(30,41,59,0.08)' }}>
                <RatingSection productId={productId} reviews={reviews} refreshAll={refreshAll} />
            </div>
            <div style={{ background: 'linear-gradient(165deg, #FFFFFF, rgba(248,250,252,0.96))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 4, boxShadow: '0 12px 26px rgba(2,132,199,0.08)' }}>
                <CommentSection productId={productId} reviews={reviews} refreshAll={refreshAll} />
            </div>
        </div>
    );
};

export default ReviewComment;