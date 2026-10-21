const ProducService = require('../services/ProductService');
const RecommendationService = require('../services/RecommendationService');
const Product = require('../models/ProductModel');

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

const searchProducts = async (req, res) => {
    try {
        const { q, limit, page, includeImages, typeId } = req.query;
        const result = await ProducService.searchProducts(q, {
            limit,
            page,
            typeId,
            includeImages: includeImages === 'true'
        });
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || e
        });
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
    res.status(200).json(result);
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

const getRecommendationsByProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const limit = Number(req.query.limit);
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            });
        }

        const response = await RecommendationService.getRecommendationsByProduct(productId, { limit });
        return res.status(response.status === "OK" ? 200 : 404).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!"
        });
    }
};

const getRecommendationsByCart = async (req, res) => {
    try {
        const { productIds, limit } = req.body || {};
        const response = await RecommendationService.getRecommendationsByCart(productIds || [], { limit });
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!"
        });
    }
};

const getRecommendationsByHistory = async (req, res) => {
    try {
        const userId = req.user?.id;
        const limit = Number(req.query.limit);
        if (!userId) {
            return res.status(401).json({
                status: "ERR",
                message: "User authentication required!"
            });
        }

        const response = await RecommendationService.getRecommendationsByHistory(userId, { limit });
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!"
        });
    }
};

const getRecommendationsByGuest = async (req, res) => {
    try {
        const guestId = String(req.query?.guestId || "").trim();
        const limit = Number(req.query.limit);
        if (!guestId) {
            return res.status(400).json({
                status: "ERR",
                message: "Guest ID is required!"
            });
        };

        const response = await RecommendationService.getRecommendationsByGuest(guestId, { limit });
        return res.status(200).json(response);
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!"
        });
    }
}

const rebuildProductEmbeddings = async (req, res) => {
    try {
        const limit = Number(req.body?.limit || req.query?.limit || 0);
        const result = await RecommendationService.rebuildProductEmbeddings({ limit });
        return res.status(200).json({
            status: "OK",
            message: "Product embeddings rebuilt successfully!",
            data: result
        });
    } catch (e) {
        return res.status(500).json({
            status: "ERR",
            message: e.message || "Something went wrong!"
        });
    }
};


// Đăng ký / hủy đăng ký nhận thông báo hàng về
const subscribeRestock = async (req, res) => {
    try {
        const { productId } = req.params;
        const userId = req.user?.id;

        if (!productId || !userId) {
            return res.status(200).json({ status: "ERR", message: "Product ID and user required!" });
        }

        const product = await Product.findById(productId).select('countInStock restockSubscribers name');
        if (!product) {
            return res.status(404).json({ status: "ERR", message: "Product not found!" });
        }

        if (product.countInStock > 0) {
            return res.status(200).json({ status: "ERR", message: "Sản phẩm đang còn hàng, không cần đăng ký!" });
        }

        const alreadySubscribed = product.restockSubscribers.some(
            (sub) => String(sub) === String(userId)
        );

        if (alreadySubscribed) {
            // Toggle: hủy đăng ký
            await Product.findByIdAndUpdate(productId, { $pull: { restockSubscribers: userId } });
            return res.status(200).json({ status: "OK", message: "Đã hủy đăng ký thông báo hàng về.", subscribed: false });
        } else {
            // Đăng ký mới
            await Product.findByIdAndUpdate(productId, { $addToSet: { restockSubscribers: userId } });
            return res.status(200).json({ status: "OK", message: "Đã đăng ký nhận thông báo khi sản phẩm có hàng!", subscribed: true });
        }
    } catch (e) {
        return res.status(500).json({ status: "ERR", message: e.message });
    }
};

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getDetailsProduct,
    getAllProducts,
    searchProducts,
    addComment,
    updateComment,
    addRating,
    getReviews,
    addReplyToReview,
    updateReplyOfReview,
    deleteReplyOfReview,
    deleteReview,
    checkRatingPermission,
    getAllTypeProducts,
    getRecommendationsByProduct,
    getRecommendationsByCart,
    getRecommendationsByHistory,
    getRecommendationsByGuest,
    rebuildProductEmbeddings,
    subscribeRestock,
}