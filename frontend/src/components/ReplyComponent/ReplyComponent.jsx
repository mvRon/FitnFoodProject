import React, { useState } from 'react';
import { Avatar, Space, message, Dropdown, Button } from 'antd';
import { UserOutlined, MoreOutlined } from '@ant-design/icons';
import moment from 'moment';
import * as ProductService from '../../services/ProductService';

import {
    ReplyContainer,
    ReplyText,
    ReplyInput,
    ReplySubmitButton,
    ReplyEditButton,
    ReplyDeleteButton,
    CommentMetaWrapper,
    CommentUserName,
    CommentDate,
    AdminBadge,
    UserBadge,
} from './Style';

const ReplyComponent = ({ productId, reviewId, replies, access_token, userId, refreshAll }) => {
    const [replyContent, setReplyContent] = useState('');
    const [editingReplyId, setEditingReplyId] = useState(null);
    const [submittingReply, setSubmittingReply] = useState(false);
    const [showReplyBox, setShowReplyBox] = useState(false);

    const handleReplySubmit = async () => {
        const content = replyContent.trim();
        if (!access_token) return message.warning('Vui lòng đăng nhập để phản hồi.');
        if (!content) return message.warning('Nội dung phản hồi không được để trống.');

        setSubmittingReply(true);
        try {
            const res = editingReplyId
                ? await ProductService.updateReplyOfReview(productId, reviewId, editingReplyId, JSON.parse(access_token), { comment: content })
                : await ProductService.addReplyToReview(productId, reviewId, JSON.parse(access_token), { comment: content });

            if (res.status === 'OK') {
                if (typeof refreshAll === 'function') refreshAll();
                setReplyContent('');
                setEditingReplyId(null);
                setShowReplyBox(false);
                message.success(editingReplyId ? 'Sửa phản hồi thành công!' : 'Phản hồi thành công!');
            } else {
                message.error(res.message || 'Không thể gửi phản hồi.');
            }
        } catch (err) {
            message.error('Không thể gửi/sửa phản hồi.');
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleEdit = (id, text) => {
        setReplyContent(text);
        setEditingReplyId(id);
        setShowReplyBox(true);
    };

    const handleDelete = async (id) => {
        if (!access_token) return message.warning('Vui lòng đăng nhập để xóa phản hồi.');

        setSubmittingReply(true);
        try {
            const res = await ProductService.deleteReplyOfReview(productId, reviewId, id, JSON.parse(access_token));
            if (res.status === 'OK') {
                if (typeof refreshAll === 'function') refreshAll();
                message.success('Xóa phản hồi thành công!');
            } else {
                message.error(res.message || 'Không thể xóa phản hồi.');
            }
        } catch (err) {
            message.error('Không thể xóa phản hồi.');
        } finally {
            setSubmittingReply(false);
        }
    };

    // Hàm helper để lấy thông tin user an toàn
    const getUserInfo = (reply) => {
        const user = reply?.user;
        return {
            name: user?.name || 'Người dùng',
            avatar: user?.avatar || null,
            isAdmin: user?.isAdmin || false,
            userId: user?._id || user?.id || null
        };
    };


    return (
        <div>
            {replies?.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {replies.map((reply) => {
                        const userInfo = getUserInfo(reply);
                        return (
                            <ReplyContainer key={reply._id}>
                                <div style={{ display: 'flex', width: '100%', gap: '12px' }}>
                                    <div style={{ flexShrink: 0 }}>
                                        <Avatar
                                            src={userInfo.avatar}
                                            icon={!userInfo.avatar ? <UserOutlined /> : undefined}
                                            size="small"
                                            alt={userInfo.name}
                                        />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ marginBottom: 4 }}>
                                            <CommentMetaWrapper>
                                                <Space>
                                                    {userInfo.isAdmin ? <AdminBadge>Admin</AdminBadge> : <UserBadge>User</UserBadge>}
                                                    <CommentUserName>
                                                        {userInfo.name}
                                                    </CommentUserName>
                                                </Space>
                                                <CommentDate type="secondary">
                                                    {moment(reply.createdAt).format('DD/MM/YYYY HH:mm:ss')}
                                                </CommentDate>
                                            </CommentMetaWrapper>
                                        </div>
                                        <div>
                                            <ReplyText>
                                                {reply.comment} {userInfo.userId === userId && (
                                                    <Dropdown
                                                        menu={{
                                                            items: [
                                                                {
                                                                    key: '1',
                                                                    label: 'Sửa',
                                                                    onClick: () => handleEdit(reply._id, reply.comment)
                                                                },
                                                                {
                                                                    key: '2',
                                                                    label: 'Xóa',
                                                                    danger: true,
                                                                    onClick: () => handleDelete(reply._id)
                                                                },
                                                            ],
                                                        }}
                                                        trigger={['click']}
                                                        placement="bottomRight"
                                                    >
                                                        <Button
                                                            icon={<MoreOutlined />}
                                                            type="text"
                                                            size="small"
                                                            style={{ color: '#0284C7', borderRadius: 8 }}
                                                        />
                                                    </Dropdown>
                                                )}
                                            </ReplyText>
                                        </div>
                                    </div>
                                </div>
                            </ReplyContainer>
                        );
                    })}
                </div>
            )}

            {access_token && (
                <>
                    <ReplyText
                        onClick={() => setShowReplyBox(!showReplyBox)}
                        style={{ cursor: 'pointer', fontSize: 12, color: '#0284C7', marginTop: 6, fontWeight: 600 }}
                    >
                        Reply
                    </ReplyText>

                    {showReplyBox && (
                        <ReplyContainer style={{ marginTop: 8, border: '1px solid rgba(16,185,129,0.2)', background: 'linear-gradient(165deg, rgba(16,185,129,0.07), rgba(248,250,252,0.9))' }}>
                            <ReplyInput
                                rows={2}
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder={editingReplyId ? 'Sửa phản hồi của bạn...' : 'Viết phản hồi của bạn...'}
                                maxLength={500}
                            />
                            <ReplySubmitButton
                                type="primary"
                                onClick={handleReplySubmit}
                                loading={submittingReply}
                                disabled={!replyContent.trim()}
                            >
                                {editingReplyId ? 'Sửa phản hồi' : 'Gửi phản hồi'}
                            </ReplySubmitButton>
                        </ReplyContainer>
                    )}
                </>
            )}
        </div>
    );
};

export default ReplyComponent;