const mongoose = require("mongoose");
const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const Order = require("../models/OrderModel");
const { embedText } = require("./EmbeddingService");

const VECTOR_INDEX = process.env.MONGO_VECTOR_INDEX || "product_embedding_index";
const EMBEDDING_DIM = Number(process.env.AI_EMBEDDING_DIM || 384);
const DEFAULT_LIMIT = Number(process.env.RECOMMENDATION_LIMIT || 5);
const RECENT_ORDER_LIMIT = Number(process.env.RECOMMENDATION_ORDER_LIMIT || 5);

const resolveCategoryId = (typeField) => {
    if (!typeField) return null;
    if (typeof typeField === "string") return typeField;
    if (typeField._id) return String(typeField._id);
    return String(typeField);
};

const normalizeObjectIds = (ids) => {
    return (ids || [])
        .map((id) => {
            if (id instanceof mongoose.Types.ObjectId) return id;
            if (!mongoose.Types.ObjectId.isValid(id)) return null;
            return new mongoose.Types.ObjectId(id);
        })
        .filter(Boolean);
};

const buildProductText = (product, categoryName) => {
    return [product?.name, categoryName, product?.description]
        .filter(Boolean)
        .join(". ");
};

const getCategoryMap = async (categoryIds) => {
    if (!categoryIds.length) return {};
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    return categories.reduce((acc, item) => {
        acc[String(item._id)] = item.name;
        return acc;
    }, {});
};

const mapRecommendation = (product, reason, score) => {
    const images = Array.isArray(product?.images) ? product.images : [];
    return {
        _id: product?._id,
        name: product?.name,
        images,
        image: images[0] || product?.image || "",
        price: product?.price,
        discount: product?.discount,
        countInStock: product?.countInStock,
        sold: product?.sold,
        rating: Number.isFinite(product?.averageRating)
            ? product.averageRating
            : product?.rating,
        type: product?.type,
        reason,
        score,
    };
};

const vectorSearchProducts = async ({ queryVector, limit, excludeIds }) => {
    if (!Array.isArray(queryVector) || queryVector.length !== EMBEDDING_DIM) {
        return [];
    }

    const numCandidates = Math.max(limit * 20, 100);
    const vectorSearchStage = {
        index: VECTOR_INDEX,
        path: "embedding",
        queryVector,
        numCandidates,
        limit,
    };

    if (excludeIds && excludeIds.length) {
        vectorSearchStage.filter = { _id: { $nin: excludeIds } };
    }

    try {
        const results = await Product.aggregate([
            { $vectorSearch: vectorSearchStage },
            {
                $project: {
                    name: 1,
                    images: 1,
                    price: 1,
                    discount: 1,
                    countInStock: 1,
                    sold: 1,
                    rating: 1,
                    averageRating: 1,
                    type: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ]);
        return results || [];
    } catch (error) {
        console.warn("Vector search failed:", error?.message || error);
        return [];
    }
};

const fetchFallbackProducts = async ({ limit, excludeIds }) => {
    const query = excludeIds?.length ? { _id: { $nin: excludeIds } } : {};
    const products = await Product.find(query)
        .sort({ sold: -1, averageRating: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    return products || [];
};

const ensureProductEmbedding = async (productDoc, options = {}) => {
    if (!productDoc) return [];
    const force = options.force === true;
    const hasEmbedding = Array.isArray(productDoc.embedding) && productDoc.embedding.length === EMBEDDING_DIM;

    if (!force && hasEmbedding) {
        return productDoc.embedding;
    }

    const categoryId = resolveCategoryId(productDoc.type);
    const category = categoryId ? await Category.findById(categoryId).lean() : null;
    const text = buildProductText(productDoc, category?.name);
    const vector = await embedText(text);

    if (vector.length === EMBEDDING_DIM) {
        productDoc.embedding = vector;
        productDoc.embeddingUpdatedAt = new Date();
        await productDoc.save();
    }

    return vector;
};

const getRecommendationsByProduct = async (productId, options = {}) => {
    const limit = Number(options.limit) || DEFAULT_LIMIT;
    const productDoc = await Product.findById(productId);

    if (!productDoc) {
        return {
            status: "ERR",
            message: "Product not found!",
            data: [],
        };
    }

    const embedding = await ensureProductEmbedding(productDoc);
    const excludeIds = normalizeObjectIds([productId]);

    let results = await vectorSearchProducts({ queryVector: embedding, limit, excludeIds });
    if (!results.length) {
        results = await fetchFallbackProducts({ limit, excludeIds });
    }

    const reason = "Tương tự sản phẩm bạn đang xem";
    return {
        status: "OK",
        message: "Recommendations generated successfully!",
        data: results.map((item) => mapRecommendation(item, reason, item?.score)),
    };
};

const getRecommendationsByCart = async (productIds, options = {}) => {
    const limit = Number(options.limit) || DEFAULT_LIMIT;
    const excludeIds = normalizeObjectIds(productIds);

    if (!excludeIds.length) {
        const fallback = await fetchFallbackProducts({ limit, excludeIds: [] });
        return {
            status: "OK",
            message: "Recommendations generated successfully!",
            data: fallback.map((item) => mapRecommendation(item, "Phù hợp với giỏ hàng của bạn")),
        };
    }

    const products = await Product.find({ _id: { $in: excludeIds } }).lean();
    const categoryIds = Array.from(
        new Set(products.map((item) => resolveCategoryId(item.type)).filter(Boolean))
    );
    const categoryMap = await getCategoryMap(categoryIds);
    const cartText = products
        .map((item) => buildProductText(item, categoryMap[resolveCategoryId(item.type)]))
        .filter(Boolean)
        .join(" | ");

    const embedding = await embedText(cartText);
    let results = await vectorSearchProducts({ queryVector: embedding, limit, excludeIds });

    if (!results.length) {
        results = await fetchFallbackProducts({ limit, excludeIds });
    }

    const reason = "Phù hợp với giỏ hàng của bạn";
    return {
        status: "OK",
        message: "Recommendations generated successfully!",
        data: results.map((item) => mapRecommendation(item, reason, item?.score)),
    };
};

const getRecommendationsByHistory = async (userId, options = {}) => {
    const limit = Number(options.limit) || DEFAULT_LIMIT;

    const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(RECENT_ORDER_LIMIT)
        .lean();

    const orderItems = orders.flatMap((order) => order?.orderItems || []);
    const purchasedIds = normalizeObjectIds(
        orderItems.map((item) => item?.product).filter(Boolean)
    );

    if (!orderItems.length) {
        const fallback = await fetchFallbackProducts({ limit, excludeIds: [] });
        return {
            status: "OK",
            message: "Recommendations generated successfully!",
            data: fallback.map((item) => mapRecommendation(item, "Dựa trên sản phẩm nổi bật")),
        };
    }

    const products = purchasedIds.length
        ? await Product.find({ _id: { $in: purchasedIds } }).lean()
        : [];

    const categoryIds = Array.from(
        new Set(products.map((item) => resolveCategoryId(item.type)).filter(Boolean))
    );
    const categoryMap = await getCategoryMap(categoryIds);

    const historyText = products.length
        ? products
            .map((item) => buildProductText(item, categoryMap[resolveCategoryId(item.type)]))
            .filter(Boolean)
            .join(" | ")
        : orderItems.map((item) => item?.name).filter(Boolean).join(" | ");

    const embedding = await embedText(historyText);
    let results = await vectorSearchProducts({ queryVector: embedding, limit, excludeIds: purchasedIds });

    if (!results.length) {
        results = await fetchFallbackProducts({ limit, excludeIds: purchasedIds });
    }

    const reason = "Dựa trên lịch sử mua hàng của bạn";
    return {
        status: "OK",
        message: "Recommendations generated successfully!",
        data: results.map((item) => mapRecommendation(item, reason, item?.score)),
    };
};

const rebuildProductEmbeddings = async (options = {}) => {
    const limit = Number(options.limit) || 0;
    const query = {};

    const cursor = Product.find(query).cursor();
    const updated = [];
    let processed = 0;

    for await (const productDoc of cursor) {
        if (limit > 0 && processed >= limit) {
            break;
        }
        processed += 1;
        const embedding = await ensureProductEmbedding(productDoc, { force: true });
        if (embedding.length === EMBEDDING_DIM) {
            updated.push(String(productDoc._id));
        }
    }

    return {
        processed,
        updated,
    };
};

module.exports = {
    ensureProductEmbedding,
    getRecommendationsByProduct,
    getRecommendationsByCart,
    getRecommendationsByHistory,
    rebuildProductEmbeddings,
};
