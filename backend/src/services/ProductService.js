const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const Order = require("../models/OrderModel");
const InventoryService = require("./InventoryService");


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
            const hasCountInStockUpdate = Object.prototype.hasOwnProperty.call(updateData, "countInStock");

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
                const stockDelta = nextStock - currentStock;

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
            const productDetails = await Product.findById(productId).populate('type').populate('reviews.user').populate('reviews.replies.user');
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

            if (!includeImages) {
                productQuery = productQuery.select("-images");
            }

            if (populateType) {
                productQuery = productQuery.populate("type");
            }

            const allProduct = await productQuery;
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
        const product = await Product.findById(productId);
        if (!product) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        }

        // Thêm comment mới, chỉ lưu comment
        const review = {
            user,
            comment,
            createdAt: new Date()
        };
        product.reviews.push(review);
        product.numReviews = product.reviews.length;
        await product.save();
        return { status: 'OK', message: 'Bình luận thành công!', data: product };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};


const updateComment = async (productId, commentId, { user, comment }) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        const review = product.reviews.id(commentId);
        if (!review) return { status: 'ERROR', message: 'Không tìm thấy bình luận!', data: null };
        if (String(review.user) !== String(user)) return { status: 'ERROR', message: 'Không có quyền sửa bình luận này!', data: null };
        review.comment = comment;
        review.createdAt = new Date();
        await product.save();
        return { status: 'OK', message: 'Cập nhật bình luận thành công!', data: review };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};




const addRating = async (productId, { user, rating, comment }) => {
    try {
        const product = await Product.findById(productId);
        if (!product) {
            return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        }

        // Kiểm tra quyền đánh giá trước khi cho phép
        const permissionCheck = await checkRatingPermission(user, productId);
        if (permissionCheck.status === 'ERROR') {
            return permissionCheck;
        }

        // Kiểm tra xem user đã đánh giá sản phẩm này chưa
        // const existingReview = product.reviews.find(review => String(review.user) === String(user));
        // if (existingReview) {
        //     return { status: 'ERROR', message: 'Bạn đã đánh giá sản phẩm này rồi!', data: null };
        // }

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
        return { status: 'OK', message: 'Đánh giá thành công!', data: product };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

const getReviews = async (productId) => {
    try {
        // Populates name, avatar, and isAdmin from User for reviews and replies
        const product = await Product.findById(productId)
            .populate('reviews.user', 'name avatar isAdmin')
            .populate('reviews.replies.user', 'name avatar isAdmin');
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
        const product = await Product.findById(productId);

        if (!product) return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        const review = product.reviews.id(reviewId);
        if (!review) return { status: 'ERROR', message: 'Không tìm thấy bình luận!', data: null };
        review.replies.push({ user, comment });
        await product.save();

        // Populate user info for the newly added reply
        const updatedProduct = await Product.findById(productId)
            .populate('reviews.user', 'name avatar isAdmin')
            .populate('reviews.replies.user', 'name avatar isAdmin');
        const updatedReview = updatedProduct.reviews.id(reviewId);
        return { status: 'OK', message: 'Thêm phản hồi thành công!', data: updatedReview.replies };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Sửa phản hồi cho review
const updateReplyOfReview = async (productId, reviewId, replyId, { user, comment }) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        const review = product.reviews.id(reviewId);
        if (!review) return { status: 'ERROR', message: 'Không tìm thấy bình luận!', data: null };
        const reply = review.replies.id(replyId);
        if (!reply) return { status: 'ERROR', message: 'Không tìm thấy phản hồi!', data: null };
        if (String(reply.user) !== String(user)) return { status: 'ERROR', message: 'Không có quyền sửa phản hồi này!', data: null };
        reply.comment = comment;
        reply.createdAt = new Date();
        await product.save();

        // Populate user info for the updated reply
        const updatedProduct = await Product.findById(productId)
            .populate('reviews.user', 'name avatar isAdmin')
            .populate('reviews.replies.user', 'name avatar isAdmin');
        const updatedReview = updatedProduct.reviews.id(reviewId);
        const updatedReply = updatedReview.replies.id(replyId);
        return { status: 'OK', message: 'Cập nhật phản hồi thành công!', data: updatedReply };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Xóa phản hồi cho review
const deleteReplyOfReview = async (productId, reviewId, replyId, user) => {
    try {
        const product = await Product.findById(productId);
        if (!product) return { status: 'ERROR', message: 'Không tìm thấy sản phẩm!', data: null };
        const review = product.reviews.id(reviewId);
        if (!review) return { status: 'ERROR', message: 'Không tìm thấy bình luận!', data: null };
        const reply = review.replies.id(replyId);
        if (!reply) return { status: 'ERROR', message: 'Không tìm thấy phản hồi!', data: null };
        if (String(reply.user) !== String(user)) return { status: 'ERROR', message: 'Không có quyền xóa phản hồi này!', data: null };
        // Xóa reply bằng filter
        review.replies = review.replies.filter(r => String(r._id) !== String(replyId));
        await product.save();
        return { status: 'OK', message: 'Xóa phản hồi thành công!', data: null };
    } catch (error) {
        return { status: 'ERROR', message: error.message, data: null };
    }
};

// Thêm thêm vào xóa cmt của bản thân
const deleteReview = async (productId, reviewId, user) => {
    try {
        const product = await Product.findById(productId);
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
        // Tìm tất cả đơn hàng của user có trạng thái isDelivered = true
        const deliveredOrders = await Order.find({
            user: userId,
            isDelivered: true
        });

        // Kiểm tra xem có đơn hàng nào chứa sản phẩm cần đánh giá không
        for (const order of deliveredOrders) {
            const hasProduct = order.orderItems.some(item =>
                String(item.product) === String(productId)
            );
            if (hasProduct) {
                return { status: 'OK', message: 'Có quyền đánh giá!', data: true };
            }
        }

        return { status: 'ERROR', message: 'Bạn chưa mua sản phẩm này hoặc đơn hàng chưa được giao!', data: false };
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