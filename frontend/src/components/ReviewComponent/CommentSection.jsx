
import React, { useEffect, useState, useCallback } from 'react';
import { Spin, Avatar, Space, message, Typography, Rate, Dropdown, Button } from 'antd';
import { UserOutlined, MoreOutlined } from '@ant-design/icons';
import { useSelector, useDispatch } from 'react-redux';
import * as ProductService from '../../services/ProductService';
import moment from 'moment';
import ReplyComponent from '../ReplyComponent/ReplyComponent';

import {
    CommentSectionWrapper,
    StyledCommentTitle,
    CommentInputCard,
    StyledTextArea,
    StyledCommentButton,
    CommentLoginPrompt,
    CommentListContainer,
    CommentListItem,
    CommentMetaWrapper,
    CommentUserName,
    CommentDate,
    CommentContentText,
} from './Style';

const { Text } = Typography;

const CommentSection = ({ productId, refreshTrigger }) => {
    const dispatch = useDispatch();
    const { access_token, id: userId, name: currentUserName, avatar: currentUserAvatar } = useSelector((state) => state.user);
    const [comments, setComments] = useState([]);
    const [content, setContent] = useState('');
    const [editingCommentId, setEditingCommentId] = useState(null);
    const [loadingComments, setLoadingComments] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);
    const [showAllComments, setShowAllComments] = useState(false);

    const fetchComments = useCallback(async () => {
        setLoadingComments(true);
        try {
            const res = await ProductService.getAllComment(productId);
            if (res.status === 'OK') {
                const onlyComments = (res.data || [])
                    .filter(r => r.comment && r.comment.trim())
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                setComments(onlyComments);
            } else {
                message.error(res.message || 'Không thể tải bình luận.');
            }
        } catch (err) {
            console.error('Lỗi khi tải bình luận:', err.response?.data || err.message);
            message.error('Không thể tải bình luận.');
        } finally {
            setLoadingComments(false);
        }
    }, [productId]);

    useEffect(() => {
        if (productId) {
            fetchComments();
        }
    }, [productId, fetchComments, refreshTrigger]);

    const handleComment = async () => {
        if (!access_token || access_token === '') {
            message.warning('Vui lòng đăng nhập để bình luận.');
            return;
        }
        if (!content.trim()) {
            message.warning('Nội dung bình luận không được để trống.');
            return;
        }

        setSubmittingComment(true);
        try {
            let parsedToken = access_token;
            try {
                parsedToken = JSON.parse(access_token);
            } catch (parseErr) {
                console.warn('Cannot parse token, using raw token:', access_token);
            }
            const res = editingCommentId
                ? await ProductService.updateCommentProduct(productId, editingCommentId, parsedToken, { comment: content })
                : await ProductService.addCommentProduct(productId, parsedToken, { comment: content });
            if (res.status === 'OK') {
                await fetchComments();
                setContent('');
                setEditingCommentId(null);
                message.success(editingCommentId ? 'Sửa bình luận thành công!' : 'Bình luận thành công!');
            } else {
                message.error(res.message || (editingCommentId ? 'Không thể sửa bình luận.' : 'Không thể gửi bình luận.'));
            }
        } catch (err) {
            console.error('Lỗi khi gửi/sửa bình luận:', err.response?.data || err.message);
            message.error('Không thể gửi/sửa bình luận.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const handleEditComment = (commentId, commentText) => {
        setContent(commentText);
        setEditingCommentId(commentId);
    };

    const handleDeleteComment = async (commentId) => {
        if (!access_token || access_token === '') {
            message.warning('Vui lòng đăng nhập để xóa bình luận.');
            return;
        }

        setSubmittingComment(true);
        try {
            let parsedToken = access_token;
            try {
                parsedToken = JSON.parse(access_token);
            } catch (parseErr) {
                console.warn('Cannot parse token, using raw token:', access_token);
            }
            const res = await ProductService.deleteCommentProduct(productId, commentId, parsedToken);
            if (res.status === 'OK') {
                await fetchComments();
                message.success('Xóa bình luận thành công!');
            } else {
                message.error(res.message || 'Không thể xóa bình luận.');
            }
        } catch (err) {
            console.error('Lỗi khi xóa bình luận:', err.response?.data || err.message);
            message.error('Không thể xóa bình luận.');
        } finally {
            setSubmittingComment(false);
        }
    };

    const visibleComments = showAllComments ? comments : comments.slice(0, 2);


    return (
        <CommentSectionWrapper>
            <StyledCommentTitle>Bình luận sản phẩm</StyledCommentTitle>

            <CommentInputCard>
                {access_token && access_token !== '' ? (
                    <Space orientation="vertical" style={{ width: '100%' }}>
                        <StyledTextArea
                            rows={4}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder={editingCommentId ? 'Sửa bình luận của bạn...' : 'Viết bình luận của bạn...'}
                            maxLength={500}
                        />
                        <StyledCommentButton
                            onClick={handleComment}
                            type="primary"
                            loading={submittingComment}
                            disabled={!content.trim()}
                        >
                            {editingCommentId ? 'Sửa bình luận' : 'Gửi bình luận'}
                        </StyledCommentButton>
                    </Space>
                ) : (
                    <CommentLoginPrompt>Vui lòng đăng nhập để bình luận.</CommentLoginPrompt>
                )}
            </CommentInputCard>

            <CommentListContainer>
                <Spin spinning={loadingComments}>
                    {visibleComments.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '20px', color: '#999' }}>Chưa có bình luận nào.</div>
                    ) : (
                        visibleComments.map((item) => (
                            <CommentListItem key={item._id}>
                                <div style={{ display: 'flex', width: '100%', gap: '16px' }}>
                                    <div className="ant-list-item-meta-avatar">
                                        <Avatar
                                            src={item.user?.avatar}
                                            icon={!item.user?.avatar ? <UserOutlined /> : undefined}
                                            alt={item.user?.name || 'Người dùng'}
                                        />
                                    </div>
                                    <div className="ant-list-item-meta-content" style={{ flex: 1 }}>
                                        <h4 className="ant-list-item-meta-title" style={{ marginBottom: 4 }}>
                                            <CommentMetaWrapper>
                                                <CommentUserName>{item.user?.name || 'Người dùng'}</CommentUserName>
                                                {item.createdAt && (
                                                    <CommentDate type="secondary">
                                                        {moment(item.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                                    </CommentDate>
                                                )}
                                            </CommentMetaWrapper>
                                        </h4>
                                        <div className="ant-list-item-meta-description">
                                            {item.rating > 0 && (
                                                <div style={{ marginBottom: 6 }}>
                                                    <Rate disabled value={Number(item.rating)} style={{ fontSize: 16, color: '#F59E0B' }} />
                                                </div>
                                            )}
                                            <CommentContentText>{item.comment}</CommentContentText>

                                            <Space style={{ justifyContent: 'space-between', marginTop: 10, width: '100%', padding: '8px 10px', borderRadius: 10, background: 'linear-gradient(90deg, rgba(2,132,199,0.06), rgba(16,185,129,0.06))', border: '1px solid rgba(2,132,199,0.14)' }}>
                                                <ReplyComponent
                                                    productId={productId}
                                                    reviewId={item._id}
                                                    replies={item.replies || []}
                                                    access_token={localStorage.getItem('access_token')}
                                                    userId={userId}
                                                    fetchComments={fetchComments}
                                                />
                                                {item.user?._id === userId && (
                                                    <Dropdown
                                                        trigger={['click']}
                                                        placement="bottomRight"
                                                        menu={{
                                                            items: [
                                                                {
                                                                    key: 'edit',
                                                                    label: 'Sửa',
                                                                    onClick: () => handleEditComment(item._id, item.comment),
                                                                },
                                                                {
                                                                    key: 'delete',
                                                                    label: 'Xóa',
                                                                    danger: true,
                                                                    onClick: () => handleDeleteComment(item._id),
                                                                },
                                                            ],
                                                        }}
                                                    >
                                                        <Button icon={<MoreOutlined />} type="text" size="small" style={{ color: '#0284C7', borderRadius: 8 }} />
                                                    </Dropdown>
                                                )}
                                            </Space>
                                        </div>
                                    </div>
                                </div>
                            </CommentListItem>
                        ))
                    )}
                </Spin>

                {!showAllComments && comments.length > 2 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem' }}>
                        <StyledCommentButton type="link" onClick={() => setShowAllComments(true)}>
                            Xem thêm {comments.length - 2} bình luận
                        </StyledCommentButton>
                    </div>
                )}
            </CommentListContainer>
        </CommentSectionWrapper>
    );
};

export default CommentSection;