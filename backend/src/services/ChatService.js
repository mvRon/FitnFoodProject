const { GoogleGenerativeAI } = require("@google/generative-ai");
const mongoose = require("mongoose");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");
const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const { embedText, normalizeText } = require("./EmbeddingService");

const VECTOR_INDEX = process.env.MONGO_VECTOR_INDEX || "product_embedding_index";
const EMBEDDING_DIM = Number(process.env.AI_EMBEDDING_DIM || 384);
const CHAT_VECTOR_LIMIT = Number(process.env.CHAT_VECTOR_LIMIT || 3);
const CHAT_HISTORY_LIMIT = Number(process.env.CHAT_HISTORY_LIMIT || 50);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || "";
const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
let geminiClient = null;

const resolveCategoryId = (typeField) => {
    if (!typeField) return null;
    if (typeof typeField === "string") return typeField;
    if (typeField._id) return String(typeField._id);
    return String(typeField);
};

const getCategoryMap = async (categoryIds) => {
    if (!categoryIds.length) return {};
    const categories = await Category.find({ _id: { $in: categoryIds } }).lean();
    return categories.reduce((acc, item) => {
        acc[String(item._id)] = item.name;
        return acc;
    }, {});
};

const buildProductSnapshot = (product) => {
    const images = Array.isArray(product?.images) ? product.images : [];
    return {
        _id: product?._id,
        name: product?.name,
        price: product?.price,
        images,
        discount: product?.discount,
    };
};

const vectorSearchProducts = async ({ queryVector, limit }) => {
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
                    name: 1,
                    images: 1,
                    price: 1,
                    discount: 1,
                    description: 1,
                    type: 1,
                    averageRating: 1,
                    rating: 1,
                    score: { $meta: "vectorSearchScore" },
                },
            },
        ]);
        return results || [];
    } catch (error) {
        console.warn("Chat vector search failed:", error?.message || error);
        return [];
    }
};

const fetchFallbackProducts = async (limit) => {
    const products = await Product.find({})
        .sort({ sold: -1, averageRating: -1, createdAt: -1 })
        .limit(limit)
        .lean();
    return products || [];
};

const buildPrompt = (question, products, categoryMap) => {
    const lines = products.map((product, index) => {
        const categoryName = categoryMap[resolveCategoryId(product.type)] || "";
        const price = Number.isFinite(product?.price) ? `${product.price} VND` : "";
        const discount = Number.isFinite(product?.discount) ? `${product.discount}%` : "";
        const description = product?.description ? product.description : "";
        return [
            `${index + 1}. ${product?.name || ""}`,
            categoryName ? `- Danh muc: ${categoryName}` : "",
            price ? `- Gia: ${price}` : "",
            discount ? `- Giam gia: ${discount}` : "",
            description ? `- Mo ta: ${description}` : "",
        ]
            .filter(Boolean)
            .join("\n");
    });

    const productContext = lines.length ? lines.join("\n\n") : "(Không có sản phẩm phù hợp trong kho hàng)";

    return [
        "Bạn là chuyên gia dinh dưỡng của FITNFOOD.",
        "Nhiệm vụ: Tư vấn sản phẩm dinh dưỡng phù hợp dựa trên câu hỏi của khách hàng.",
        "Nếu cần thiết, bạn có thể hỏi thêm thông tin về nhu cầu hoặc sở thích của khách hàng để đưa ra gợi ý chính xác hơn.",
        "Chỉ đề xuất sản phẩm nếu bạn thấy phù hợp, nếu không hãy giải thích rõ lý do và hỏi thêm thông tin.",
        "",
        "Danh sách sản phẩm gợi ý (nếu có):",
        productContext,
        "",
        `Câu hỏi của khách hàng: ${question}`,
        "",
        "êu cầu trả lời:",
        "- Viết bằng tiếng Việt.",
        "- Nếu sản phẩm phù hợp, nên đề xuất tối đa 3 sản phẩm trở lên.",
        "- Nếu không phù hợp, nói rõ lý do và hỏi thêm thông tin.",
    ].join("\n");
};

const getGeminiModel = () => {
    if (!GEMINI_API_KEY) return null;
    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return geminiClient.getGenerativeModel({ model: GEMINI_MODEL });
};

const generateGeminiReply = async (prompt) => {
    const model = getGeminiModel();
    if (!model) {
        return "Hiện tại hệ thống chưa được cấu hình AI. Bạn có thể mô tả rõ hơn nhu cầu để mình tư vấn tốt hơn không?";
    }

    const result = await model.generateContent({
        contents: [
            {
                role: "user",
                parts: [{ text: prompt }],
            },
        ],
        generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
        },
    });

    const text = result?.response?.text ? result.response.text().trim() : "";
    return text || "Mình chưa thể trả lời câu hỏi của bạn. Bạn có thể mô tả rõ hơn nhu cầu để mình tư vấn tốt hơn không?";
};

const searchProductsByQuestion = async (question, limit) => {
    const normalized = normalizeText(question);
    const queryVector = await embedText(normalized);
    const vectorLimit = Number(limit) || CHAT_VECTOR_LIMIT;

    let results = await vectorSearchProducts({ queryVector, limit: vectorLimit });
    if (!results.length) {
        results = await fetchFallbackProducts(vectorLimit);
    }

    const categoryIds = Array.from(
        new Set(results.map((item) => resolveCategoryId(item.type)).filter(Boolean))
    );
    const categoryMap = await getCategoryMap(categoryIds);

    return {
        products: results,
        categoryMap,
    };
};

const generateBotMessage = async (question) => {
    const { products, categoryMap } = await searchProductsByQuestion(question, CHAT_VECTOR_LIMIT);
    const prompt = buildPrompt(question, products, categoryMap);

    let text = "";
    try {
        text = await generateGeminiReply(prompt);
    } catch (error) {
        console.warn("Gemini call failed:", error?.message || error);
        text = "Mình chưa thể trả lời câu hỏi của bạn. Bạn có thể mô tả rõ hơn nhu cầu để mình tư vấn tốt hơn không?";
    }

    const productSnapshots = products.map(buildProductSnapshot).filter((item) => item?._id);
    const productIds = productSnapshots.map((item) => item._id).filter(Boolean);

    return {
        text,
        productIds,
        products: productSnapshots,
    };
};

const resolveConversationInput = (input) => {
    if (!input) return { customerId: null, guestId: null };
    if (typeof input === "string") {
        return { customerId: input, guestId: null };
    }
    return {
        customerId: input.customerId || null,
        guestId: input.guestId || null,
    };
};

const createConversation = async (input) => {
    const { customerId, guestId } = resolveConversationInput(input);
    if (!customerId && !guestId) {
        throw new Error("Customer or guest id is required");
    }

    const conversation = await Conversation.create({
        customer: customerId || null,
        guestId: guestId || null,
        status: "bot_active",
    });

    return conversation;
};

const getOrCreateConversation = async (input) => {
    const { customerId, guestId } = resolveConversationInput(input);
    if (!customerId && !guestId) {
        throw new Error("Customer or guest id is required");
    }

    const query = customerId ? { customer: customerId } : { guestId };
    let conversation = await Conversation.findOne(query)
        .sort({ updatedAt: -1 })
        .lean();

    if (!conversation) {
        const created = await createConversation({ customerId, guestId });
        conversation = created.toObject();
    }

    const messages = await Message.find({ conversation: conversation._id })
        .sort({ createdAt: 1 })
        .limit(CHAT_HISTORY_LIMIT)
        .lean();

    return { conversation, messages };
};

const getMessages = async (conversationId, limit = CHAT_HISTORY_LIMIT) => {
    return Message.find({ conversation: conversationId })
        .sort({ createdAt: 1 })
        .limit(limit)
        .lean();
};

const createMessage = async ({ conversationId, sender, content, metadata }) => {
    const message = await Message.create({
        conversation: conversationId,
        sender,
        content,
        metadata: metadata || {},
    });

    await Conversation.findByIdAndUpdate(conversationId, { lastMessageAt: new Date() });
    return message.toObject();
};

const getConversationForUser = async (conversationId, user, guestId) => {
    if (!mongoose.Types.ObjectId.isValid(conversationId)) return null;
    const conversation = await Conversation.findById(conversationId).lean();
    if (!conversation) return null;

    if (user?.isAdmin) return conversation;

    const userId = user?.id || user?._id;
    const resolvedGuestId = guestId || user?.guestId || null;

    if (userId && conversation.customer && String(conversation.customer) === String(userId)) {
        return conversation;
    }

    if (resolvedGuestId && conversation.guestId && String(conversation.guestId) === String(resolvedGuestId)) {
        return conversation;
    }

    return null;
};

const updateConversationStatus = async (conversationId, status, adminId = null) => {
    const update = { status };
    if (status === "waiting_for_admin" || status === "bot_active") {
        update.admin = null;
    } else if (adminId) {
        update.admin = adminId;
    }
    const conversation = await Conversation.findByIdAndUpdate(conversationId, update, { new: true }).lean();
    return conversation;
};

const getAdminConversations = async () => {
    return Conversation.find({ status: { $in: ["waiting_for_admin", "admin_active"] } })
        .populate("customer", "name email avatar")
        .populate("admin", "name email avatar")
        .sort({ lastMessageAt: -1 })
        .lean();
};

module.exports = {
    createConversation,
    getOrCreateConversation,
    getMessages,
    createMessage,
    getConversationForUser,
    updateConversationStatus,
    getAdminConversations,
    generateBotMessage,
};
