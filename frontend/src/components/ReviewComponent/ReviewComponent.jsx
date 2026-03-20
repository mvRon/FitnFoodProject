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
        <>
            <RatingSection productId={productId} refreshAll={refreshAll} />
            <CommentSection productId={productId} refreshTrigger={refreshTrigger} />
        </>
    );
};

export default ReviewComment;