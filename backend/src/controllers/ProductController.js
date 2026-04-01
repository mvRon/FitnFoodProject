const ProducService = require('../services/ProductService');

const createProduct = async (req, res) => {
    try {
        const { name, images, type, price, unitPrice, countInStock, rating, description, sold, discount } = req.body;

        if (
            !name ||
            !images ||
            !type ||
            price == null ||
            unitPrice == null ||
            countInStock == null ||
            rating == null ||
            sold == null ||
            discount == null
        ) {
            return res.status(200).json({
                status: "ERR",
                message: "All fields required!"
            });
        }
        const response = await ProducService.createProduct(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = req.body;
        const userId = req.user?.id;
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            })
        }
        const response = await ProducService.updateProduct(productId, data, userId)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            })
        }
        const deletedProduct = await ProducService.deleteProduct(productId);
        return res.status(200).json(deletedProduct);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


const getDetailsProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            })
        }
        const productDetails = await ProducService.getDetailsProduct(productId);
        return res.status(200).json(productDetails);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const { limit, page, sort, filter, includeImages } = req.query;
        const products = await ProducService.getAllProducts(
            limit || 5,
            page || 1,
            sort,
            filter,
            includeImages === 'true'
        );
        return res.status(200).json(products);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}


const addComment = async (req, res) => {
    const { productId } = req.params;
    const { comment } = req.body;
    const user = req.user.id;
    const result = await ProducService.addComment(productId, { user, comment });
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

const updateComment = async (req, res) => {
    const { productId, commentId } = req.params;
    const { comment } = req.body;
    const user = req.user.id;
    const result = await ProducService.updateComment(productId, commentId, { user, comment });
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};


const addRating = async (req, res) => {
    const { productId } = req.params;
    const { rating, comment } = req.body;
    const user = req.user.id;
    const result = await ProducService.addRating(productId, { user, rating, comment });
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

const getReviews = async (req, res) => {
    const { productId } = req.params;
    const result = await ProducService.getReviews(productId);
    res.status(result.status === 'OK' ? 200 : 404).json(result);
};

// Thêm phản hồi cho review
const addReplyToReview = async (req, res) => {
    const { productId, reviewId } = req.params;
    const { comment } = req.body;
    const user = req.user.id;
    const result = await ProducService.addReplyToReview(productId, reviewId, { user, comment });
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

// Sửa phản hồi cho review
const updateReplyOfReview = async (req, res) => {
    const { productId, reviewId, replyId } = req.params;
    const { comment } = req.body;
    const user = req.user.id;
    const result = await ProducService.updateReplyOfReview(productId, reviewId, replyId, { user, comment });
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

// Xóa phản hồi cho review
const deleteReplyOfReview = async (req, res) => {
    const { productId, reviewId, replyId } = req.params;
    const user = req.user.id;
    const result = await ProducService.deleteReplyOfReview(productId, reviewId, replyId, user);
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

// xóa cmt của chính mình
const deleteReview = async (req, res) => {
    const { productId, reviewId } = req.params;
    const user = req.user.id;
    const result = await ProducService.deleteReview(productId, reviewId, user);
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

// Kiểm tra quyền đánh giá sản phẩm
const checkRatingPermission = async (req, res) => {
    const { productId } = req.params;
    const user = req.user.id;
    const result = await ProducService.checkRatingPermission(user, productId);
    res.status(result.status === 'OK' ? 200 : 400).json(result);
};

const getAllTypeProducts = async (req, res) => {
    try {
        const response = await ProducService.getAllTypeProducts()
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}




module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getDetailsProduct,
    getAllProducts,
    addComment,
    updateComment,
    addRating,
    getReviews,
    addReplyToReview,
    updateReplyOfReview,
    deleteReplyOfReview,
    deleteReview,
    checkRatingPermission,
    getAllTypeProducts
}