const express = require("express");
const router = express.Router();
const ProductController = require("../controllers/ProductController");
const { authMiddleWare, authUserMiddleWare } = require("../middleware/authMiddleware");

router.post('/create-product', authMiddleWare, ProductController.createProduct);
router.put('/update-product/:id', authMiddleWare, ProductController.updateProduct);
router.delete('/delete-product/:id', authMiddleWare, ProductController.deleteProduct);
router.get('/get-details-product/:id', ProductController.getDetailsProduct);
router.get('/get-all-products', ProductController.getAllProducts);
router.get('/get-all-type-products', ProductController.getAllTypeProducts);

// Toàn bộ phần này là phần review và comment của sản phẩm
router.post('/:productId/comment', authUserMiddleWare, ProductController.addComment);
router.put('/:productId/comment/:commentId', authUserMiddleWare, ProductController.updateComment);
router.post('/:productId/rating', authUserMiddleWare, ProductController.addRating);
router.get('/:productId/reviews', ProductController.getReviews);
// Kiểm tra quyền đánh giá sản phẩm
router.get('/:productId/check-rating-permission', authUserMiddleWare, ProductController.checkRatingPermission);
// Thêm phản hồi cho review
router.post('/:productId/reviews/:reviewId/replies', authUserMiddleWare, ProductController.addReplyToReview);
// Sửa phản hồi cho review
router.put('/:productId/reviews/:reviewId/replies/:replyId', authUserMiddleWare, ProductController.updateReplyOfReview);
// Xóa phản hồi cho review

router.delete('/:productId/reviews/:reviewId/replies/:replyId', authUserMiddleWare, ProductController.deleteReplyOfReview);

// Thương thêm vào để xóa cmt của chính mình
router.delete('/:productId/reviews/:reviewId', authUserMiddleWare, ProductController.deleteReview);

module.exports = router;