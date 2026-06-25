const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const Order = require("../models/OrderModel");
const InventoryService = require("./InventoryService");
const RecommendationService = require("./RecommendationService");
const { embedText, normalizeText } = require("./EmbeddingService");
const NotificationService = require('./NotificationService');
const EmailService = require('./EmailService');
const { emitToUser } = require('../socket/notificationSocket');
const User = require('../models/UserModel');

const VECTOR_INDEX = process.env.MONGO_VECTOR_INDEX || "product_embedding_index";
const EMBEDDING_DIM = Number(process.env.AI_EMBEDDING_DIM || 384);
const SEARCH_DEFAULT_LIMIT = Number(process.env.SEARCH_LIMIT || 24);

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const vectorSearchProductHits = async ({ queryVector, limit }) => {
    if (!Array.isArray(queryVector) || queryVector.length !== EMBEDDING_DIM) {
        return [];
    }

    const numCandidates = Math.max(limit * 20, 100);

    try {
        const results = await Product.aggregate([
            {
                $vectorSearch: {
                    index: VECTOR_INDEX,
                    path: "embedding",
                    queryVector,
                    numCandidates,
                    limit,
                },
            },
            {
                $project: {
                    _id: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ]);

        return results || [];
    } catch (error) {
        console.warn("Product search vector query failed:", error?.message || error);
        return [];
    }
};

const hydrateSearchResults = async (hits, includeImages) => {
    const ids = (hits || []).map((item) => item?._id).filter(Boolean);
    if (!ids.length) return [];

    let query = Product.find({ _id: { $in: ids } }).populate("type").lean();
    query = query.select("-embedding");
    if (!includeImages) {
        query = query.select("-images");
    } else {
        query = query.slice("images", 1);
    }

    const docs = await query;
    const docMap = new Map(docs.map((item) => [String(item._id), item]));
    return hits
        .map((hit) => {
            const doc = docMap.get(String(hit._id));
            if (!doc) return null;
            return { ...doc, score: hit.score };
        })
        .filter(Boolean);
};

const resolveSearchCategoryFilter = async (typeId) => {
    if (!typeId || !Category) return null;
    const parentCategory = await Category.findById(typeId);
    if (!parentCategory) return null;
    const childCategories = await Category.find({ parent: parentCategory._id });
    const categoryIds = [parentCategory._id, ...childCategories.map((cat) => cat._id)];
    return { type: { $in: categoryIds } };
};

const buildKeywordScore = (query, product) => {
    const content = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
    const tokens = String(query)
        .toLowerCase()
        .split(/\s+/)
        .filter((token) => token.length > 1);

    if (!tokens.length) return 0;

    let score = 0;
    tokens.forEach((token) => {
        if (product?.name?.toLowerCase().includes(token)) {
            score += 1;
        } else if (content.includes(token)) {
            score += 0.5;
        }
    });

    const normalized = score / tokens.length;
    if (product?.name?.toLowerCase().startsWith(tokens[0])) {
        return Math.min(1, normalized + 0.1);
    }
    return Math.min(1, normalized);
};

const buildHybridScore = (vectorScore, keywordScore, isNameMatch) => {
    const vectorWeight = 0.75;
    const keywordWeight = 0.25;
    let baseScore = (Number(vectorScore) || 0) * vectorWeight + (Number(keywordScore) || 0) * keywordWeight;
    if (isNameMatch) {
        baseScore += 10;
    }
    return baseScore;
};


const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, images, type, price, unitPrice, countInStock, rating, description, sold, discount } = newProduct;

        try {
            const checkProduct = await Product.findOne({
                name: name
            })
            if (checkProduct != null) {
                resolve({
                    status: "ERR",
                    message: "Product name already exists!"
                })
            }
            const createdProduct = await Product.create({
                name, images, type, price, unitPrice, countInStock, rating, description, sold, discount
            })
            if (createdProduct) {
                await RecommendationService.ensureProductEmbedding(createdProduct, { force: true });
                resolve({
                    status: "OK",
                    message: "Product added successfully!",
                    data: createdProduct
                })
            }
        } catch (e) {
            reject(e);
        }
    })
}

const updateProduct = (productId, data, userId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const productData = await Product.findById(productId);

            if (!productData) {
                return resolve({
                    status: "ERR",
                    message: "Product not found!"
                });
            }

            const updateData = { ...(data || {}) };
            const shouldUpdateEmbedding = ["name", "description", "type"].some(
                (field) => Object.prototype.hasOwnProperty.call(updateData, field)
            );
            const hasCountInStockUpdate = Object.prototype.hasOwnProperty.call(updateData, "countInStock");

            let stockDelta = 0;
            if (hasCountInStockUpdate) {
                if (!userId) {
                    return resolve({
                        status: "ERR",
                        message: "User context is required for stock adjustment"
                    });
                }

                const nextStock = Number(updateData.countInStock);
                if (!Number.isFinite(nextStock) || nextStock < 0) {
                    return resolve({
                        status: "ERR",
                        message: "countInStock must be a non-negative number"
                    });
                }

                const currentStock = Number(productData.countInStock || 0);
                stockDelta = nextStock - currentStock;

                if (stockDelta !== 0) {
                    const quantity = Math.abs(stockDelta);
                    const note = `Stock adjusted from update-product API for product ${productId}`;

                    const adjustmentResponse = stockDelta > 0
                        ? await InventoryService.createImportVoucher(
                            {
                                sourceType: "ADJUSTMENT",
                                status: "confirmed",
                                note,
                                items: [{
                                    product: productId,
                                    quantity,
                                    unitPrice: productData.unitPrice || 0,
                                }],
                            },
                            userId
                        )
                        : await InventoryService.createExportVoucher(
                            {
                                exportReason: "ADJUSTMENT",
                                insufficientAction: "error",
                                note,
                                items: [{
                                    product: productId,
                                    quantity,
                                    unitPrice: productData.unitPrice || 0,
                                }],
                            },
                            userId
                        );

                    if (adjustmentResponse.status !== "OK") {
                        return resolve(adjustmentResponse);
                    }
                }

                delete updateData.countInStock;
            }

            delete updateData.lastStockMovementAt;

            let updatedProduct = null;
            if (Object.keys(updateData).length > 0) {
                updatedProduct = await Product.findByIdAndUpdate(
                    productId,
                    updateData,
                    { new: true }
                );
            } else {
                updatedProduct = await Product.findById(productId);
            }

            if (updatedProduct) {
                if (shouldUpdateEmbedding) {
                    await RecommendationService.ensureProductEmbedding(updatedProduct, { force: true });
                }

                // Trigger RESTOCK notification: nếu tăng stock và có subscriber
                if (stockDelta > 0) {
                    setImmediate(() => {
                        _triggerRestockNotifications(updatedProduct, productData.countInStock).catch((err) => {
                            console.error("[Notification] RESTOCK trigger failed:", err);
                        });
                    });
                }

                resolve({
                    status: "OK",
                    message: "Product updated successfully!",
                    data: updatedProduct
                });
            } else {
                resolve({
                    status: "ERR",
                    message: "Product not found!"
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

const deleteProduct = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deletedProduct = await Product.findByIdAndDelete(productId);
            if (deletedProduct) {
                resolve({
                    status: "OK",
                    message: "Product deleted successfully!",
                    data: deletedProduct
                });
            } else {
                resolve({
                    status: "ERR",
                    message: "Product not found!"
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

const getDetailsProduct = (productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            const productDetails = await Product.findById(productId)
                .select("-embedding -reviews -restockSubscribers")
                .populate('type')
                .lean();
            if (productDetails) {
                resolve({
                    status: "OK",
                    message: "Product details retrieved successfully!",
                    data: productDetails
                });
            } else {
                resolve({
                    status: "ERR",
                    message: "Product not found!"
                });
            }
        } catch (e) {
            reject(e);
        }
    });
}

// const getAllProducts = () => {
//     return new Promise(async (resolve, reject) => {
//         try {
//             const allProducts = await Product.find().populate('type');
//             resolve({
//                 status: "OK",
//                 message: "All products retrieved successfully!",
//                 data: allProducts
//             });
//         } catch (e) {
//             reject(e);
//         }
//     });
// }


const getAllProducts = (limit, page, sort, filter, includeImages = false) => {
    return new Promise(async (resolve, reject) => {
        try {
            const parsedLimit = Number(limit) > 0 ? Number(limit) : 5;
            const parsedPage = Number(page) > 0 ? Number(page) : 1;
            const skip = (parsedPage - 1) * parsedLimit;

            const query = {};
            const populateType = true;

            if (Array.isArray(filter) && filter.length >= 2) {
                if (filter[0] === "type") {
                    const parentCategory = await Category.findOne({ name: filter[1] });
                    if (!parentCategory) {
                        return resolve({
                            status: "OK",
                            message: "Product type not found!",
                            total: 0,
                            data: [],
                            currentPage: parsedPage,
                            totalPage: 0
                        });
                    }
                    const childCategories = await Category.find({ parent: parentCategory._id });
                    const categoryIds = [parentCategory._id, ...childCategories.map(cat => cat._id)];
                    query.type = { $in: categoryIds };
                }

                if (filter[0] === "typeId") {
                    const parentCategory = await Category.findById(filter[1]);
                    if (!parentCategory) {
                        return resolve({
                            status: "OK",
                            message: "Product type not found!",
                            total: 0,
                            data: [],
                            currentPage: parsedPage,
                            totalPage: 0
                        });
                    }
                    const childCategories = await Category.find({ parent: parentCategory._id });
                    const categoryIds = [parentCategory._id, ...childCategories.map(cat => cat._id)];
                    query.type = { $in: categoryIds };
                }

                if (filter[0] === "name") {
                    query.name = { $regex: filter[1], $options: 'i' };
                }
            }

            let sortObject = { name: 1 };
            if (Array.isArray(sort) && sort.length >= 2) {
                sortObject = { [sort[1]]: sort[0] };
            }

            const totalProduct = await Product.countDocuments(query);
            let productQuery = Product.find(query)
                .limit(parsedLimit)
                .skip(skip)
                .sort(sortObject);

            productQuery = productQuery.select("-embedding -reviews -restockSubscribers -description");

            if (populateType) {
                productQuery = productQuery.populate("type");
            }

            const allProduct = await productQuery.lean();

            // Lọc bớt hình ảnh ở cấp độ JavaScript vì MongoDB không cho phép kết hợp select exclusion và slice
            if (allProduct && Array.isArray(allProduct)) {
                allProduct.forEach(product => {
                    if (!includeImages) {
                        delete product.images;
                    } else if (product.images && product.images.length > 0) {
                        product.images = [product.images[0]];
                    }
                });
            }

            resolve({
                status: "OK",
                message: "Get all products successfully!",
                total: totalProduct,
                data: allProduct,
                currentPage: parsedPage,
                totalPage: Math.ceil(totalProduct / parsedLimit)
            })
        } catch (e) {
            reject(e);
        }
    })
}

const searchProducts = (query, options = {}) => {
    return new Promise(async (resolve, reject) => {
        try {
            const normalized = normalizeText(query);
            const includeImages = options.includeImages === true;
            const limit = Number(options.limit) > 0 ? Number(options.limit) : SEARCH_DEFAULT_LIMIT;
            const page = Number(options.page) > 0 ? Number(options.page) : 1;
            const skip = (page - 1) * limit;
            const typeId = options.typeId || null;
            const categoryFilter = await resolveSearchCategoryFilter(typeId);

            if (!normalized) {
                return resolve({
                    status: "OK",
                    message: "No search query provided",
                    total: 0,
                    data: [],
                });
            }

            // 1. Vector Search Hits
            const queryVector = await embedText(normalized);
            const vectorLimit = Math.max(limit + skip, limit);
            let vectorHits = await vectorSearchProductHits({ queryVector, limit: vectorLimit });

            // 2. Regex Exact Match Hits
            const escaped = escapeRegex(normalized);
            const regex = new RegExp(escaped, "i");
            const fallbackFilter = { name: regex };
            if (categoryFilter) {
                Object.assign(fallbackFilter, categoryFilter);
            }
            let regexHits = await Product.find(fallbackFilter).limit(limit * 2).select("_id").lean();

            // 3. Combine unique IDs
            const combinedHitsMap = new Map();
            vectorHits.forEach(hit => combinedHitsMap.set(String(hit._id), hit.score));
            regexHits.forEach(hit => {
                if (!combinedHitsMap.has(String(hit._id))) {
                    combinedHitsMap.set(String(hit._id), 0);
                }
            });

            const combinedHitsArray = Array.from(combinedHitsMap.entries()).map(([id, score]) => ({ _id: id, score }));

            // 4. Hydrate & Filter
            let hydrated = await hydrateSearchResults(combinedHitsArray, includeImages);

            if (categoryFilter && hydrated.length) {
                hydrated = hydrated.filter((item) => {
                    const typeIdValue = item?.type?._id ? String(item.type._id) : String(item.type || "");
                    return categoryFilter.type.$in.map(String).includes(typeIdValue);
                });
            }

            // 5. Score & Sort
            const enriched = hydrated
                .map((item) => {
                    const keywordScore = buildKeywordScore(normalized, item);
                    const isNameMatch = item.name && String(item.name).toLowerCase().includes(String(normalized).toLowerCase());
                    const hybridScore = buildHybridScore(item.score, keywordScore, isNameMatch);
                    return { ...item, keywordScore, hybridScore, isSemanticOnly: !isNameMatch };
                })
                .sort((a, b) => b.hybridScore - a.hybridScore);

            const pageResults = enriched.slice(skip, skip + limit);
            const total = enriched.length;

            return resolve({
                status: "OK",
                message: "Search products successfully!",
                total,
                data: pageResults,
                currentPage: page,
                totalPage: Math.ceil(total / limit) || 1,
            });
        } catch (e) {
            reject(e);
        }
    });
};

const getAllTypeProducts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const AllType = await Product.distinct('type')
            resolve({
                status: "OK",
                message: "All types retrieved successfully!",
                data: AllType,
            })
        } catch (e) {
            reject(e);
        }
    })
}




const addComment = async (productId, { user, comment }) => {
    try {
        const review = {
            user,
            comment,
            createdAt: new Date()
        };
        const product = await Product.findByIdAndUpdate(
            productId,
            { 
                $push: { reviews: review },
                $inc: { numReviews: 1 } 
            },
            { new: true, select: '_id' }
        );

        if (!product) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        }

        return { status: 'OK', message: 'Bình luận thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};


const updateComment = async (productId, commentId, { user, comment }) => {
    try {
        const result = await Product.updateOne(
            { _id: productId, "reviews._id": commentId, "reviews.user": user },
            { 
                $set: { 
                    "reviews.$.comment": comment,
                    "reviews.$.createdAt": new Date()
                } 
            }
        );
        
        if (result.matchedCount === 0) {
            return { status: 'ERROR', message: 'Không tìm thấy bình luận hoặc không có quyền sửa!', data: null };
        }
        
        return { status: 'OK', message: 'Cập nhật bình luận thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};




const addRating = async (productId, { user, rating, comment }) => {
    try {
        const product = await Product.findById(productId).select('-embedding');
        if (!product) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        }

        // Kiểm tra quyền đánh giá trước khi cho phép
        const permissionCheck = await checkRatingPermission(user, productId);
        if (permissionCheck.status === 'ERROR') {
            return permissionCheck;
        }

        const existingRating = product.reviews.find(
            review => String(review.user) === String(user) && typeof review.rating === 'number' && !isNaN(review.rating)
        );
        if (existingRating) {
            return { status: 'ERROR', message: 'Bạn đã đánh giá sản phẩm này rồi!', data: null };
        }

        // Thêm rating mới, chỉ lưu rating
        const review = {
            user,
            rating: Number(rating),
            comment: comment,
            createdAt: new Date()
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        // Tính averageRating chỉ dựa trên các review có rating hợp lệ
        const ratingReviews = product.reviews.filter(r => typeof r.rating === 'number' && !isNaN(r.rating));
        if (ratingReviews.length > 0) {
            product.averageRating = ratingReviews.reduce((acc, item) => acc + item.rating, 0) / ratingReviews.length;
        } else {
            product.averageRating = 0;
        }
        await product.save();
        return { status: 'OK', message: 'Đánh giá thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

const getReviews = async (productId) => {
    try {
        // Populates name, avatar, and isAdmin from User for reviews and replies
        const product = await Product.findById(productId)
            .select('reviews')
            .populate('reviews.user', 'name avatar isAdmin')
            .populate('reviews.replies.user', 'name avatar isAdmin')
            .lean();
        if (!product) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        }
        return { status: 'OK', message: 'Lấy đánh giá thành công!', data: product.reviews };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Thêm phản hồi cho review
const addReplyToReview = async (productId, reviewId, { user, comment }) => {
    try {
        const reply = { user, comment, createdAt: new Date() };
        const result = await Product.updateOne(
            { _id: productId, "reviews._id": reviewId },
            { $push: { "reviews.$.replies": reply } }
        );

        if (result.matchedCount === 0) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm hoặc bình luận!', data: null };
        }

        return { status: 'OK', message: 'Thêm phản hồi thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Sửa phản hồi cho review
const updateReplyOfReview = async (productId, reviewId, replyId, { user, comment }) => {
    try {
        const result = await Product.updateOne(
            { _id: productId },
            {
                $set: {
                    "reviews.$[review].replies.$[reply].comment": comment,
                    "reviews.$[review].replies.$[reply].createdAt": new Date()
                }
            },
            {
                arrayFilters: [
                    { "review._id": reviewId },
                    { "reply._id": replyId, "reply.user": user }
                ]
            }
        );
        
        if (result.matchedCount === 0) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        }
        if (result.modifiedCount === 0) {
            return { status: 'ERROR', message: 'Không tìm thấy phản hồi hoặc không có quyền sửa!', data: null };
        }

        return { status: 'OK', message: 'Cập nhật phản hồi thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Xóa phản hồi cho review
const deleteReplyOfReview = async (productId, reviewId, replyId, user) => {
    try {
        const result = await Product.updateOne(
            { _id: productId, "reviews._id": reviewId },
            { $pull: { "reviews.$.replies": { _id: replyId, user: user } } }
        );
        
        if (result.matchedCount === 0) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm hoặc bình luận!', data: null };
        }
        if (result.modifiedCount === 0) {
            return { status: 'ERROR', message: 'Không tìm thấy phản hồi hoặc không có quyền xóa!', data: null };
        }

        return { status: 'OK', message: 'Xóa phản hồi thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Thêm thêm vào xóa cmt của bản thân
const deleteReview = async (productId, reviewId, user) => {
    try {
        const product = await Product.findById(productId).select('-embedding');
        if (!product) return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        const review = product.reviews.id(reviewId);
        if (!review) return { status: 'ERROR', message: 'Không tìm thấy bình luận!', data: null };
        if (String(review.user) !== String(user)) return { status: 'ERROR', message: 'Không có quyền xóa bình luận này!', data: null };
        // Xóa review bằng filter
        product.reviews = product.reviews.filter(r => String(r._id) !== String(reviewId));
        product.numReviews = product.reviews.length;
        // Cập nhật averageRating 
        const ratingReviews = product.reviews.filter(r => typeof r.rating === 'number' && !isNaN(r.rating));
        if (ratingReviews.length > 0) {
            product.averageRating = ratingReviews.reduce((acc, item) => acc + item.rating, 0) / ratingReviews.length;
        } else {
            product.averageRating = 0;
        }
        await product.save();
        return { status: 'OK', message: 'Xóa bình luận thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Kiểm tra quyền đánh giá sản phẩm
const checkRatingPermission = async (userId, productId) => {
    try {
        // Kiểm tra xem có đơn hàng nào đã giao, đã thanh toán và chứa sản phẩm cần đánh giá không
        const orderExists = await Order.exists({
            user: userId,
            isPaid: true,
            $or: [
                { isDelivered: true },
                { isDelivered: 'delivered' }
            ],
            'orderItems.product': productId
        });

        if (orderExists) {
            return { status: 'OK', message: 'Có quyền đánh giá!', data: true };
        }

        return { status: 'ERROR', message: 'Bạn cần có đơn hàng đã giao và đã thanh toán cho sản phẩm này để đánh giá!', data: false };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: false };
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
    triggerRestockNotifications: _triggerRestockNotifications
}

/**
 * Gửi thông báo RESTOCK cho tất cả user đã đăng ký theo dõi sản phẩm hết hàng.
 * Chỉ trigger khi sản phẩm trước đó countInStock === 0 và nay đã có hàng trở lại.
 * @param {Object} updatedProduct - document sản phẩm sau khi cập nhật
 * @param {number} oldStock - số lượng tồn kho trước khi cập nhật
 */
async function _triggerRestockNotifications(updatedProduct, oldStock) {
    try {
        // Chỉ trigger khi trước đó hết hàng và nay đã có hàng
        if (oldStock > 0 || updatedProduct.countInStock <= 0) return;

        const subscribers = updatedProduct.restockSubscribers || [];
        if (subscribers.length === 0) return;

        // Fetch user emails
        const users = await User.find({ _id: { $in: subscribers } }, 'email name').lean();
        const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
        const productUrl = `${FRONTEND_URL}/product-details/${updatedProduct._id}`;

        for (const userId of subscribers) {
            const notification = await NotificationService.createNotification({
                recipient: String(userId),
                recipientType: 'user',
                type: 'RESTOCK',
                title: 'Sản phẩm đã có hàng trở lại!',
                message: `"${updatedProduct.name}" đã có hàng. Đặt ngay trước khi hết!`,
                metadata: {
                    productId: String(updatedProduct._id),
                    productName: updatedProduct.name,
                    newStock: updatedProduct.countInStock,
                },
            });
            emitToUser(String(userId), notification);

            // Gửi email
            const user = users.find(u => String(u._id) === String(userId));
            if (user && user.email) {
                EmailService.sendRestockEmail({
                    email: user.email,
                    productName: updatedProduct.name,
                    productUrl: productUrl
                }).catch(err => console.error("Lỗi gửi restock email độc lập:", err));
            }
        }

        // Xóa danh sách đăng ký sau khi đã thông báo
        await Product.findByIdAndUpdate(updatedProduct._id, { $set: { restockSubscribers: [] } });

        console.log(`[Notification] RESTOCK: Notified ${subscribers.length} subscribers for "${updatedProduct.name}"`);
    } catch (err) {
        console.error('[Notification] _triggerRestockNotifications error:', err);
    }
}