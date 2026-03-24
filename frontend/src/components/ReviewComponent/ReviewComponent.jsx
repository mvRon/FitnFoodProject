import React, { useRef } from 'react';
import RatingSection from './RatingSection';
import CommentSection from './CommentSection';

const ReviewComment = ({ refreshTrigger, productId, setRefreshTrigger }) => {
    const commentRef = useRef();

    // Hàm làm mới lại toàn bộ reviews/comments
    const refreshAll = () => {
        if (commentRef.current && typeof commentRef.current.fetchComments === 'function') {
            commentRef.current.fetchComments();
        }
        // Nếu muốn làm mới reviews, có thể thêm logic ở đây(đã thêm)
        setRefreshTrigger(prev => prev + 1);
    };


    return (
        <div style={{ display: 'grid', gap: 18 }}>
            <div style={{ background: 'linear-gradient(165deg, #FFFFFF, rgba(248,250,252,0.96))', border: '1px solid rgba(2,132,199,0.16)', borderRadius: 16, padding: 4, boxShadow: '0 12px 26px rgba(30,41,59,0.08)' }}>
                <RatingSection productId={productId} refreshAll={refreshAll} />
            </div>
            <div style={{ background: 'linear-gradient(165deg, #FFFFFF, rgba(248,250,252,0.96))', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 16, padding: 4, boxShadow: '0 12px 26px rgba(2,132,199,0.08)' }}>
                <CommentSection productId={productId} refreshTrigger={refreshTrigger} />
            </div>
        </div>
    );
};

export default ReviewComment;