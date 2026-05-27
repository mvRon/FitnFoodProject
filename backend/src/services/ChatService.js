
const { 
    GoogleGenerativeAI, 
    HarmCategory, 
    HarmBlockThreshold 
} = require("@google/generative-ai");
const mongoose = require("mongoose");
const Conversation = require("../models/ConversationModel");
const Message = require("../models/MessageModel");
const Product = require("../models/ProductModel");
const Category = require("../models/CategoryModel");
const Order = require("../models/OrderModel");
const { embedText, normalizeText } = require("./EmbeddingService");

const VECTOR_INDEX = process.env.MONGO_VECTOR_INDEX || "product_embedding_index";
const EMBEDDING_DIM = Number(process.env.AI_EMBEDDING_DIM || 384);
const CHAT_VECTOR_LIMIT = Number(process.env.CHAT_VECTOR_LIMIT || 6);
const CHAT_HISTORY_LIMIT = Number(process.env.CHAT_HISTORY_LIMIT || 5);
const AI_CONTEXT_LIMIT = Number(process.env.AI_CONTEXT_LIMIT || 20);
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
    const singleImage = images.length > 0 ? [images[0]] : [];
    return {
        _id: product?._id,
        name: product?.name,
        price: product?.price,
        images: singleImage,
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
            categoryName ? `- Danh mục: ${categoryName}` : "",
            price ? `- Giá: ${price}` : "",
            discount ? `- Giảm giá: ${discount}` : "",
            description ? `- Mô tả: ${description}` : "",
        ]
            .filter(Boolean)
            .join("\n");
    });

    const productContext = lines.length ? lines.join("\n\n") : "(Không có sản phẩm phù hợp trong kho hàng)";

    return [
        "Danh sách sản phẩm từ kho hàng FITNFOOD:",
        productContext,
        "",
        `Câu hỏi của khách hàng: ${question}`,
        "",
        "Dựa vào thông tin trên, hãy đề xuất và giải thích ngắn gọn lý do chọn sản phẩm cho khách. Nếu không có sản phẩm phù hợp, hãy nói rõ và xin thêm thông tin."
    ].join("\n");
};

const getGeminiModel = () => {
    if (!GEMINI_API_KEY) return null;
    if (!geminiClient) {
        geminiClient = new GoogleGenerativeAI(GEMINI_API_KEY);
    }
    return geminiClient.getGenerativeModel({ 
        model: GEMINI_MODEL,
        systemInstruction: `Bạn là chuyên gia tư vấn dinh dưỡng của FITNFOOD. Nhiệm vụ:
1. Tư vấn thân thiện, ngắn gọn và dễ hiểu bằng tiếng Việt.
2. Chỉ sử dụng thông tin sản phẩm được cung cấp, không tự bịa sản phẩm.
3. Nếu không có sản phẩm phù hợp, hãy xin lỗi và hỏi thêm thông tin từ khách.
4. Khi khách hỏi về đơn hàng hoặc tồn kho, hãy sử dụng các function tool được cung cấp. Khi phản hồi về thông tin đơn hàng từ tool lookup_user_orders, chỉ cung cấp chi tiết đơn hàng thu được, KHÔNG cần nhận xét/báo cáo về việc các sản phẩm trong đơn hàng đó có thuộc danh mục của FITNFOOD hay gợi ý kiểm tra tồn kho của chúng trừ khi khách hỏi riêng biệt.
5. Luôn duy trì ngữ cảnh hội thoại, nhớ những gì khách đã nói và những quyết định bạn đã đưa ra trước đó trong cuộc hội thoại.
6. Khi cần thêm thông tin sức khỏe (cân nặng, chiều cao, mục tiêu...), hãy hỏi ngắn gọn và chỉ hỏi 1 câu tại 1 thời điểm.
7. Nếu bạn chưa có đủ thông tin hoặc ngữ cảnh để tư vấn sản phẩm cụ thể và cần hỏi thêm thông tin từ khách (như chiều cao, cân nặng, mục tiêu...), hoặc khi bạn đang trong quá trình hỏi thăm để lấy thêm thông tin mà chưa đề xuất sản phẩm cụ thể, hãy thêm từ khóa "[NEEDS_INFO]" vào cuối câu trả lời.
8. QUAN TRỌNG: Đọc kỹ lịch sử hội thoại trước khi hỏi thêm. Nếu khách đã trả lời câu hỏi của bạn hoặc bạn đã đề xuất sản phẩm cho yêu cầu đó rồi, KHÔNG hỏi lại câu hỏi đó nữa. Thay vào đó, hãy tiếp tục hội thoại tự nhiên dựa trên thông tin đã có và chỉ đặt câu hỏi mới nếu thực sự cần thêm thông tin khác.
9. QUAN TRỌNG: Khi gợi ý sản phẩm, bạn phải in đậm (**) tên sản phẩm và dùng ĐÚNG tên gốc của sản phẩm như trong danh sách được cung cấp ở đầu prompt. Không viết tắt hoặc thay đổi tên. Ví dụ: nếu tên trong danh sách là "Viên uống bổ sung vitamin C, tăng cường sức đề kháng C 500mg Nature's Bounty " thì phải in đậm đúng tên đó, không viết tắt thành "C 500mg Nature's Bounty" hay "Nature's Bounty".`
    });
};

// =============================================
// Gemini Function Calling — Tool Declarations
// =============================================

const functionDeclarations = [
    {
        name: "lookup_user_orders",
        description: "Tra cứu đơn hàng gần nhất của khách hàng đang chat. Dùng khi khách hỏi về đơn hàng, trạng thái giao hàng, lịch sử mua hàng.",
        parameters: {
            type: "object",
            properties: {
                limit: {
                    type: "number",
                    description: "Số đơn hàng cần lấy (mặc định 3)",
                },
            },
        },
    },
    {
        name: "check_product_stock",
        description: "Kiểm tra tồn kho của một sản phẩm cụ thể. Dùng khi khách hỏi sản phẩm còn hàng không, có sẵn không.",
        parameters: {
            type: "object",
            properties: {
                productName: {
                    type: "string",
                    description: "Tên sản phẩm cần kiểm tra tồn kho",
                },
            },
            required: ["productName"],
        },
    },
];

// =============================================
// Function Call Executor
// =============================================

const executeFunctionCall = async (functionCall, userId) => {
    const { name, args } = functionCall;

    if (name === "lookup_user_orders") {
        if (!userId) return { error: "Bạn cần đăng nhập để xem đơn hàng." };
        const limit = args?.limit || 3;
        const orders = await Order.find({ user: userId })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select("orderItems totalPrice isPaid isDelivered createdAt shippingAddress")
            .lean();

        if (!orders.length) return { message: "Không tìm thấy đơn hàng nào." };

        return orders.map((order) => ({
            orderId: order._id,
            totalPrice: order.totalPrice,
            isPaid: order.isPaid,
            deliveryStatus: order.isDelivered,
            createdAt: order.createdAt,
            items: (order.orderItems || []).map((item) => ({
                name: item.name,
                amount: item.amount,
                price: item.price,
            })),
        }));
    }

    if (name === "check_product_stock") {
        const productName = args?.productName || "";
        const product = await Product.findOne({
            name: { $regex: productName, $options: "i" },
        })
            .select("name countInStock price discount")
            .lean();

        if (!product) return { message: `Không tìm thấy sản phẩm "${productName}".` };

        const stockStatus =
            product.countInStock <= 0
                ? "Hết hàng"
                : product.countInStock <= 5
                    ? `Còn ít (${product.countInStock} sản phẩm)`
                    : `Còn hàng (${product.countInStock} sản phẩm)`;

        return {
            name: product.name,
            stockStatus,
            price: product.price,
            discount: product.discount,
        };
    }

    return { error: "Chức năng không hỗ trợ." };
};

// =============================================
// Multi-turn Conversation History
// =============================================

const fetchConversationHistory = async (conversationId, limit = AI_CONTEXT_LIMIT) => {
    const messages = await Message.find({ conversation: conversationId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    // Đảo ngược để đúng thứ tự thời gian
    const ordered = messages.reverse();

    // Map sang format Gemini multi-turn: user → "user", bot → "model"
    const mapped = ordered
        .filter((msg) => msg.sender === "user" || msg.sender === "bot")
        .map((msg) => ({
            role: msg.sender === "user" ? "user" : "model",
            parts: [{ text: msg.content || "" }],
        }));

    // Tối ưu hóa lịch sử cuộc trò chuyện cho Gemini:
    // 1. Phải luân phiên các vai trò (role). Gộp các tin nhắn liên tiếp cùng vai trò.
    const optimized = [];
    for (const msg of mapped) {
        if (optimized.length === 0) {
            optimized.push(msg);
        } else {
            const last = optimized[optimized.length - 1];
            if (last.role === msg.role) {
                last.parts[0].text = last.parts[0].text + "\n" + msg.parts[0].text;
            } else {
                optimized.push(msg);
            }
        }
    }

    // 2. Tin nhắn đầu tiên phải có vai trò "user".
    while (optimized.length > 0 && optimized[0].role !== "user") {
        optimized.shift();
    }

    return optimized;
};

// =============================================
// Context-Aware RAG Query Builder
// =============================================

const buildContextQuery = (currentQuestion, history) => {
    // Lấy 2-3 tin nhắn user gần nhất từ history để tổng hợp ngữ cảnh
    const recentUserMessages = history
        .filter((msg) => msg.role === "user")
        .slice(-3)
        .map((msg) => msg.parts[0]?.text || "")
        .filter(Boolean);

    // Nối với câu hỏi hiện tại để tạo query tổng hợp
    return [...recentUserMessages, currentQuestion]
        .filter(Boolean)
        .join(" | ");
};

// =============================================
// Gemini Multi-turn Reply + Function Calling
// =============================================

const generateGeminiReply = async (prompt, conversationHistory, userId, statusCallback) => {
    const model = getGeminiModel();
    if (!model) {
        return {
            text: "Hiện tại hệ thống chưa được cấu hình AI. Bạn có thể mô tả rõ hơn nhu cầu để mình tư vấn tốt hơn không?",
            wasFunctionCalled: false
        };
    }

    try {
        // Khởi tạo multi-turn chat với conversation history + function calling tools
        const chat = model.startChat({
            history: conversationHistory,
            tools: [{ functionDeclarations }],
            generationConfig: {
                temperature: 0.4,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 2048,
            },
            safetySettings: [
                {
                    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                    threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
            ],
        });

        // Gửi message hiện tại
        let result = await chat.sendMessage(prompt);
        let response = result.response;

        // Function Calling loop — xử lý khi Gemini yêu cầu gọi function
        const MAX_FUNCTION_CALLS = 3;
        let functionCallCount = 0;
        let wasFunctionCalled = false;

        while (functionCallCount < MAX_FUNCTION_CALLS) {
            const functionCalls = response.functionCalls?.() || [];
            if (functionCalls.length === 0) break;

            functionCallCount++;
            wasFunctionCalled = true;
            const functionResponses = [];

            for (const fc of functionCalls) {
                // Gửi status update cho frontend
                if (statusCallback) {
                    statusCallback(
                        fc.name === "lookup_user_orders"
                            ? "Đang tra cứu đơn hàng của bạn..."
                            : "Đang kiểm tra tồn kho sản phẩm..."
                    );
                }

                const fcResult = await executeFunctionCall(fc, userId);
                functionResponses.push({
                    functionResponse: {
                        name: fc.name,
                        response: { result: fcResult },
                    },
                });
            }

            // Gửi kết quả function call lại cho Gemini để tạo câu trả lời
            result = await chat.sendMessage(functionResponses);
            response = result.response;
        }

        const text = response?.text ? response.text().trim() : "";
        return {
            text: text || "Mình chưa thể trả lời câu hỏi của bạn. Bạn có thể mô tả rõ hơn nhu cầu để mình tư vấn tốt hơn không?",
            wasFunctionCalled
        };
    } catch (error) {
        console.warn("Gemini generation failed:", error?.message || error);
        throw error; // Ném lỗi ra để hàm generateBotMessage bắt và xử lý Human Handoff
    }
};

// =============================================
// Product Search (RAG)
// =============================================

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

const escapeRegExp = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Extract các chuỗi in đậm (**...**) từ Markdown response của bot
const extractBoldTexts = (text) => {
    const boldPattern = /\*\*([^*]+)\*\*/g;
    const results = [];
    let match;
    while ((match = boldPattern.exec(text)) !== null) {
        const boldText = match[1].trim();
        if (boldText.length >= 3) {
            results.push(boldText);
        }
    }
    return results;
};

// So khớp một chuỗi bold với tên sản phẩm trong DB
// Hỗ trợ: khớp chính xác, bold là sub-string của tên DB, hoặc tên DB là sub-string của bold
const boldMatchesProduct = (boldText, productName) => {
    if (!boldText || !productName) return false;

    const normalB = boldText.trim().toLowerCase();
    const normalP = productName.trim().toLowerCase();

    // 1. Khớp chính xác (sau khi normalize, bỏ khoảng trắng thừa)
    if (normalP === normalB) return true;

    // 2. Tên DB chứa toàn bộ nội dung bold — bold là sub-chuỗi đặc trưng của tên DB
    //    Yêu cầu bold phải đủ dài (>= 6 ký tự) để tránh khớp sai với từ ngắn chung chung
    if (normalP.includes(normalB) && normalB.length >= 6) return true;

    // 3. Bold chứa toàn bộ tên DB — bot đã thêm thông tin vào sau tên
    if (normalB.includes(normalP) && normalP.length >= 6) return true;

    return false;
};

const extractProductsFromText = async (text) => {
    if (!text) return [];
    try {
        // Bước 1: Lấy các chuỗi in đậm từ response của bot
        const boldTexts = extractBoldTexts(text);
        if (boldTexts.length === 0) return [];

        // Bước 2: Load tất cả sản phẩm từ DB
        const allProducts = await Product.find({})
            .select("name price discount images")
            .lean();

        const matchedProducts = [];
        const seenIds = new Set();

        // Bước 3: Với mỗi chuỗi bold, tìm sản phẩm khớp trong DB
        for (const boldText of boldTexts) {
            for (const product of allProducts) {
                if (!product.name || seenIds.has(String(product._id))) continue;

                if (boldMatchesProduct(boldText, product.name)) {
                    matchedProducts.push(product);
                    seenIds.add(String(product._id));
                    break; // Mỗi bold text chỉ khớp tối đa 1 sản phẩm
                }
            }
        }

        return matchedProducts;
    } catch (error) {
        console.warn("Error extracting products from text:", error?.message || error);
        return [];
    }
};



// =============================================
// Main Bot Message Generator (Context-Aware RAG + Multi-turn + Function Calling)
// =============================================

const generateBotMessage = async (question, conversationId, userId, statusCallback) => {
    // 1. Lấy conversation history từ DB cho multi-turn context
    const conversationHistory = conversationId
        ? await fetchConversationHistory(conversationId)
        : [];

    // 2. Context-aware RAG: tổng hợp ngữ cảnh từ history để vector search chính xác hơn
    if (statusCallback) statusCallback("Đang tìm sản phẩm phù hợp...");

    const contextQuery = buildContextQuery(question, conversationHistory);
    const { products, categoryMap } = await searchProductsByQuestion(
        contextQuery,
        CHAT_VECTOR_LIMIT
    );

    // 3. Build prompt với sản phẩm từ RAG
    const prompt = buildPrompt(question, products, categoryMap);

    // 4. Gọi Gemini với multi-turn history + function calling
    if (statusCallback) statusCallback("Đang tạo câu trả lời...");

    let text = "";
    let wasFunctionCalled = false;
    try {
        const replyResult = await generateGeminiReply(prompt, conversationHistory, userId, statusCallback);
        text = replyResult.text;
        wasFunctionCalled = replyResult.wasFunctionCalled;
    } catch (error) {
        console.warn("Gemini call failed or overloaded:", error?.message || error);
        // Fallback khi AI lỗi 503 hoặc các lỗi khác
        text = "Hiện tại chuyên viên AI của FITNFOOD đang hỗ trợ nhiều khách hàng cùng lúc nên phản hồi hơi chậm. Bạn vui lòng đợi một chút hoặc nhấn nút 'Gặp Nhân Viên' để kết nối trực tiếp với chuyên gia dinh dưỡng nhé!";
    }

    // 5. Kiểm tra nếu cần ẩn danh sách sản phẩm gợi ý (khi thực hiện function call hoặc chưa đủ ngữ cảnh)
    let hideProducts = wasFunctionCalled;
    if (text.includes("[NEEDS_INFO]")) {
        hideProducts = true;
        // Xóa cờ [NEEDS_INFO] khỏi câu trả lời của bot trước khi gửi đi
        text = text.replace(/\[NEEDS_INFO\]/gi, "").trim();
    }

    // Gợi ý chính xác các sản phẩm được đề cập trong text (nếu không bị ẩn)
    const matchedProducts = hideProducts ? [] : await extractProductsFromText(text);
    const productSnapshots = matchedProducts.map(buildProductSnapshot).filter((item) => item?._id);
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

const populateMessagesProducts = async (messages) => {
    if (!Array.isArray(messages) || messages.length === 0) return [];

    const productIdsSet = new Set();
    messages.forEach((msg) => {
        if (msg?.metadata) {
            if (Array.isArray(msg.metadata.productIds)) {
                msg.metadata.productIds.forEach((id) => {
                    if (id) productIdsSet.add(String(id));
                });
            }
            if (Array.isArray(msg.metadata.products)) {
                msg.metadata.products.forEach((p) => {
                    if (p && p._id) productIdsSet.add(String(p._id));
                });
            }
        }
    });

    const productIds = Array.from(productIdsSet);
    if (productIds.length === 0) return messages;

    const products = await Product.find({ _id: { $in: productIds } })
        .select("name price discount images")
        .lean();

    const productMap = products.reduce((acc, prod) => {
        const images = Array.isArray(prod?.images) ? prod.images : [];
        const singleImage = images.length > 0 ? [images[0]] : [];
        acc[String(prod._id)] = {
            _id: prod._id,
            name: prod.name,
            price: prod.price,
            discount: prod.discount,
            images: singleImage,
        };
        return acc;
    }, {});

    return messages.map((msg) => {
        if (msg?.metadata) {
            let pIds = msg.metadata.productIds || [];
            if (pIds.length === 0 && Array.isArray(msg.metadata.products)) {
                pIds = msg.metadata.products.map((p) => p._id).filter(Boolean);
            }

            const populated = pIds
                .map((id) => productMap[String(id)])
                .filter(Boolean);

            return {
                ...msg,
                metadata: {
                    ...msg.metadata,
                    productIds: pIds,
                    products: populated,
                },
            };
        }
        return msg;
    });
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

    const rawMessages = await Message.find({ conversation: conversation._id })
        .sort({ createdAt: -1 })
        .limit(CHAT_HISTORY_LIMIT)
        .lean();

    const messages = await populateMessagesProducts(rawMessages.reverse());

    return { conversation, messages };
};

const getMessages = async (conversationId, before = null, limit = CHAT_HISTORY_LIMIT) => {
    const query = { conversation: conversationId };
    if (before) {
        query.createdAt = { $lt: new Date(before) };
    }
    const rawMessages = await Message.find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

    return populateMessagesProducts(rawMessages.reverse());
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

const deleteGuestConversations = async (guestId) => {
    if (!guestId) return { deletedConversations: 0, deletedMessages: 0 };

    const conversations = await Conversation.find({ guestId }).select("_id").lean();
    const ids = conversations.map((item) => item._id);

    if (!ids.length) {
        return { deletedConversations: 0, deletedMessages: 0 };
    }

    const messageResult = await Message.deleteMany({ conversation: { $in: ids } });
    const conversationResult = await Conversation.deleteMany({ _id: { $in: ids } });

    return {
        deletedConversations: conversationResult?.deletedCount || 0,
        deletedMessages: messageResult?.deletedCount || 0,
    };
};

module.exports = {
    createConversation,
    getOrCreateConversation,
    getMessages,
    createMessage,
    getConversationForUser,
    updateConversationStatus,
    getAdminConversations,
    deleteGuestConversations,
    generateBotMessage,
};