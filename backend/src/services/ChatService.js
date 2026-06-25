
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
const { Cart } = require("../models/CartModel");
const User = require("../models/UserModel");
const Discount = require("../models/DiscountModel");
const OrderService = require("./OrderService");
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
2. Bạn có thể tư vấn hoặc thêm vào giỏ hàng bất kỳ sản phẩm nào có trong danh sách được cung cấp HOẶC đã từng được bạn đề cập trong lịch sử trò chuyện. Không tự bịa ra sản phẩm hoàn toàn mới. BẠN CÓ QUYỀN thực hiện các thao tác (như thêm giỏ hàng) đối với các sản phẩm trong lịch sử chat dù chúng không xuất hiện trong danh sách cung cấp ở lượt chat hiện tại.
3. Nếu không có sản phẩm phù hợp, hãy xin lỗi và hỏi thêm thông tin từ khách.
4. Khi khách hỏi về đơn hàng hoặc tồn kho, hãy sử dụng các function tool được cung cấp. Khi phản hồi về thông tin đơn hàng từ tool lookup_user_orders, chỉ cung cấp chi tiết đơn hàng thu được, KHÔNG cần nhận xét/báo cáo về việc các sản phẩm trong đơn hàng đó có thuộc danh mục của FITNFOOD hay gợi ý kiểm tra tồn kho của chúng trừ khi khách hỏi riêng biệt.
5. Luôn duy trì ngữ cảnh hội thoại, nhớ những gì khách đã nói và những quyết định bạn đã đưa ra trước đó trong cuộc hội thoại.
6. Khi cần thêm thông tin sức khỏe (cân nặng, chiều cao, mục tiêu...), hãy hỏi ngắn gọn và chỉ hỏi 1 câu tại 1 thời điểm.
7. Nếu bạn chưa có đủ thông tin hoặc ngữ cảnh để tư vấn sản phẩm cụ thể và cần hỏi thêm thông tin từ khách (như chiều cao, cân nặng, mục tiêu...), hoặc khi bạn đang trong quá trình hỏi thăm để lấy thêm thông tin mà chưa đề xuất sản phẩm cụ thể, hãy thêm từ khóa "[NEEDS_INFO]" vào cuối câu trả lời.
8. QUAN TRỌNG: Đọc kỹ lịch sử hội thoại trước khi hỏi thêm. Nếu khách đã trả lời câu hỏi của bạn hoặc bạn đã đề xuất sản phẩm cho yêu cầu đó rồi, KHÔNG hỏi lại câu hỏi đó nữa. Thay vào đó, hãy tiếp tục hội thoại tự nhiên dựa trên thông tin đã có và chỉ đặt câu hỏi mới nếu thực sự cần thêm thông tin khác.
9. QUAN TRỌNG: Khi gợi ý sản phẩm, bạn phải in đậm (**) tên sản phẩm và dùng ĐÚNG tên gốc của sản phẩm như trong danh sách được cung cấp ở đầu prompt. Không viết tắt hoặc thay đổi tên. TUYỆT ĐỐI KHÔNG in đậm (**) bất kỳ từ khóa, tiêu đề (như Lý do đề xuất), thành phần, hay nội dung nào khác ngoài tên sản phẩm.

--- LUỒNG MUA HÀNG QUA CHAT ---
10. KHI KHÁCH MUỐN MUA / THÊM GIỎ HÀNG: Khi khách nói muốn mua, đặt hàng, thêm giỏ hàng, lấy sản phẩm nào đó → gọi function add_to_cart. 
    QUAN TRỌNG: Khi gọi tool add_to_cart, bạn PHẢI truyền TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC CỦA SẢN PHẨM vào tham số productName. TUYỆT ĐỐI KHÔNG truyền "sản phẩm 1", "số 2", "vitamin C" hoặc các từ khóa chung chung. Nếu khách nói "mua sản phẩm 1", bạn phải tự đối chiếu lịch sử chat để lấy tên đầy đủ của sản phẩm số 1 truyền vào tool.
11. SAU KHI THÊM GIỎ HÀNG THÀNH CÔNG: Luôn gợi ý sản phẩm bổ sung liên quan (upsell/cross-sell). Ví dụ: nếu khách mua Whey Protein → gợi ý bình lắc, creatine, hoặc BCAA. Nếu khách mua vitamin → gợi ý thêm sản phẩm bổ sung khác.
12. KHI KHÁCH MUỐN THANH TOÁN / CHECKOUT: Khi khách nói muốn thanh toán, đặt hàng luôn, checkout → thực hiện theo thứ tự: (a) Gọi view_cart để xem giỏ hàng hiện tại, (b) Liệt kê ngắn gọn các sản phẩm trong giỏ và tổng tiền, (c) Gọi get_user_address để lấy địa chỉ mặc định, (d) Gọi find_applicable_vouchers để quét voucher phù hợp, (e) Trình bày thông tin tổng hợp cho khách và hỏi khách muốn thanh toán theo phương thức nào: COD (thanh toán khi nhận hàng) hoặc QR PayOS (chuyển khoản qua app ngân hàng). QUAN TRỌNG: Thêm tag "[CHECKOUT_CONFIRM]" vào cuối response khi đang chờ khách xác nhận đặt hàng.
13. KHI KHÁCH XÁC NHẬN ĐẶT HÀNG COD: Khi khách chọn COD hoặc nói "thanh toán khi nhận hàng" → PHẢI gọi view_cart trước để lấy trạng thái giỏ hàng mới nhất (giỏ hàng có thể đã thay đổi từ lần xem trước), rồi mới gọi create_cod_order. Dù trước đó đã gọi view_cart, LUÔN phải gọi lại một lần nữa ngay trước create_cod_order. Sau khi tạo thành công, thông báo mã đơn hàng.
14. KHI KHÁCH CHỌN PAYOS QR: Khi khách chọn QR, PayOS, chuyển khoản, quét mã QR → PHẢI gọi view_cart trước để lấy trạng thái giỏ hàng mới nhất (giỏ hàng có thể đã thay đổi kể từ lần xem trước đó trong hội thoại — ví dụ khách vào trang giỏ hàng tự xóa bớt sản phẩm), rồi mới gọi create_payos_order. TUYỆT ĐỐI KHÔNG bỏ qua bước gọi view_cart ngay trước create_payos_order dù có lịch sử giỏ hàng trong hội thoại. Hệ thống sẽ tự động gửi link thanh toán cho khách trong chat. Khách click link và quét QR bằng app ngân hàng.
15. KHI KHÁCH MUỐN XEM GIỎ HÀNG: Gọi function view_cart.
16. KHI KHÁCH MUỐN XÓA SẢN PHẨM KHỎI GIỎ: Gọi function remove_from_cart.`
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
                    description: "TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC của sản phẩm cần kiểm tra tồn kho. TUYỆT ĐỐI KHÔNG dùng 'sản phẩm 1', 'số 2' hay viết tắt.",
                },
            },
            required: ["productName"],
        },
    },
    {
        name: "add_to_cart",
        description: "Thêm sản phẩm vào giỏ hàng của khách. Dùng khi khách muốn mua, đặt hàng, thêm giỏ hàng, hoặc lấy sản phẩm nào đó.",
        parameters: {
            type: "object",
            properties: {
                productName: {
                    type: "string",
                    description: "TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC của sản phẩm cần thêm vào giỏ. TUYỆT ĐỐI KHÔNG dùng 'sản phẩm 1', 'số 2' hay viết tắt.",
                },
                quantity: {
                    type: "number",
                    description: "Số lượng cần thêm (mặc định 1)",
                },
            },
            required: ["productName"],
        },
    },
    {
        name: "view_cart",
        description: "Xem giỏ hàng hiện tại của khách. Dùng khi khách hỏi giỏ hàng có gì, muốn xem giỏ, hoặc trước khi thanh toán.",
        parameters: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "remove_from_cart",
        description: "Xóa sản phẩm khỏi giỏ hàng. Dùng khi khách muốn bỏ, xóa, không lấy sản phẩm nào đó khỏi giỏ.",
        parameters: {
            type: "object",
            properties: {
                productName: {
                    type: "string",
                    description: "TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC của sản phẩm cần xóa. TUYỆT ĐỐI KHÔNG dùng 'sản phẩm 1', 'số 2' hay viết tắt.",
                },
            },
            required: ["productName"],
        },
    },
    {
        name: "get_user_address",
        description: "Lấy địa chỉ giao hàng mặc định của khách. Dùng khi cần xác nhận địa chỉ trước khi tạo đơn hàng.",
        parameters: {
            type: "object",
            properties: {},
        },
    },
    {
        name: "find_applicable_vouchers",
        description: "Tìm mã giảm giá (voucher) phù hợp cho đơn hàng. Dùng khi đang checkout để gợi ý voucher cho khách.",
        parameters: {
            type: "object",
            properties: {
                orderValue: {
                    type: "number",
                    description: "Tổng giá trị đơn hàng (VND) để lọc voucher phù hợp",
                },
            },
            required: ["orderValue"],
        },
    },
    {
        name: "create_cod_order",
        description: "Tạo đơn hàng COD (thanh toán khi nhận hàng) từ giỏ hàng hiện tại. Chỉ gọi khi khách đã xác nhận muốn đặt hàng COD.",
        parameters: {
            type: "object",
            properties: {
                voucherCode: {
                    type: "string",
                    description: "Mã voucher giảm giá nếu có (tùy chọn)",
                },
                paymentMethod: {
                    type: "string",
                    description: "Phương thức thanh toán: cod hoặc bank_transfer",
                    enum: ["cod", "bank_transfer"],
                },
            },
        },
    },
    {
        name: "create_payos_order",
        description: "Tạo đơn hàng PayOS (thanh toán QR code) từ giỏ hàng hiện tại. Chỉ gọi khi khách đã xác nhận muốn thanh toán bằng QR / chuyển khoản. Hệ thống sẽ gửi link thanh toán cho khách.",
        parameters: {
            type: "object",
            properties: {
                voucherCode: {
                    type: "string",
                    description: "Mã voucher giảm giá nếu có (tùy chọn)",
                },
            },
        },
    },
];

// =============================================
// Function Call Executor
// =============================================

const executeFunctionCall = async (functionCall, userId, context = {}) => {
    const { name, args } = functionCall;
    const { sideEffects } = context;

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
        
        if (productName.length < 5 || /^(sản phẩm|số|sp|mục|item)\s*\d*$/i.test(productName.trim())) {
            return { message: `Lỗi hệ thống: Tham số productName "${productName}" quá chung chung. AI vui lòng kiểm tra lịch sử chat và truyền TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC của sản phẩm.` };
        }

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

    // =============================================
    // Bước 3: Cart Management Functions
    // =============================================

    if (name === "add_to_cart") {
        if (!userId) return { error: "Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng." };
        const productName = args?.productName || "";
        const quantity = Math.max(Number(args?.quantity) || 1, 1);

        if (productName.length < 5 || /^(sản phẩm|số|sp|mục|item)\s*\d*$/i.test(productName.trim())) {
            return { message: `Lỗi hệ thống: Tham số productName "${productName}" không hợp lệ. AI vui lòng đối chiếu lịch sử để lấy TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC của sản phẩm rồi gọi lại tool.` };
        }

        // Tìm sản phẩm bằng regex match (hỗ trợ cả variant/hương vị trong tên)
        const product = await Product.findOne({
            name: { $regex: productName, $options: "i" },
        })
            .select("name price discount countInStock images")
            .lean();

        if (!product) return { message: `Không tìm thấy sản phẩm "${productName}". Bạn có thể mô tả rõ hơn không?` };

        if (product.countInStock <= 0) {
            return { message: `Sản phẩm "${product.name}" hiện đã hết hàng.` };
        }
        if (quantity > product.countInStock) {
            return { message: `Sản phẩm "${product.name}" chỉ còn ${product.countInStock} sản phẩm trong kho.` };
        }

        // Lấy hoặc tạo giỏ hàng
        let cart = await Cart.findOne({ userId });
        if (!cart) {
            cart = await Cart.create({ userId, items: [] });
        }

        // Kiểm tra sản phẩm đã có trong giỏ chưa
        const existingItem = cart.items.find(item => String(item.product) === String(product._id));
        if (existingItem) {
            const newAmount = existingItem.amount + quantity;
            if (newAmount > product.countInStock) {
                return { message: `Không thể thêm. Giỏ đã có ${existingItem.amount} sản phẩm, kho chỉ còn ${product.countInStock}.` };
            }
            existingItem.amount = newAmount;
        } else {
            const primaryImage = Array.isArray(product.images) && product.images.length > 0 ? product.images[0] : "";
            cart.items.push({
                product: product._id,
                name: product.name,
                amount: quantity,
                image: primaryImage,
                price: product.price,
                discount: product.discount || 0,
                countInStock: product.countInStock,
            });
        }

        await cart.save();

        // Đánh dấu side effect để socket layer emit cart update
        if (sideEffects) {
            sideEffects.cartUpdated = true;
            sideEffects.cartItems = cart.items;
        }

        return {
            message: `Đã thêm ${quantity} x "${product.name}" vào giỏ hàng.`,
            addedProduct: product.name,
            quantity,
            cartTotalItems: cart.items.reduce((sum, item) => sum + item.amount, 0),
        };
    }

    if (name === "view_cart") {
        if (!userId) return { error: "Bạn cần đăng nhập để xem giỏ hàng." };

        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items || cart.items.length === 0) {
            return { message: "Giỏ hàng của bạn đang trống." };
        }

        const items = cart.items.map(item => ({
            name: item.name,
            quantity: item.amount,
            price: item.price,
            discount: item.discount || 0,
            subtotal: item.amount * item.price,
        }));

        const totalPrice = items.reduce((sum, item) => sum + item.subtotal, 0);
        const totalDiscount = items.reduce((sum, item) => sum + (item.discount * item.price * item.quantity / 100), 0);

        return {
            items,
            totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
            totalPrice,
            totalDiscount,
            finalPrice: totalPrice - totalDiscount,
        };
    }

    if (name === "remove_from_cart") {
        if (!userId) return { error: "Bạn cần đăng nhập để thao tác giỏ hàng." };
        const productName = args?.productName || "";

        if (productName.length < 5 || /^(sản phẩm|số|sp|mục|item)\s*\d*$/i.test(productName.trim())) {
            return { message: `Lỗi hệ thống: Tham số productName "${productName}" không hợp lệ. AI vui lòng truyền TÊN ĐẦY ĐỦ VÀ CHÍNH XÁC của sản phẩm cần xóa.` };
        }

        const cart = await Cart.findOne({ userId });
        if (!cart || !cart.items || cart.items.length === 0) {
            return { message: "Giỏ hàng đang trống, không có gì để xóa." };
        }

        const itemIndex = cart.items.findIndex(item =>
            item.name && item.name.toLowerCase().includes(productName.toLowerCase())
        );

        if (itemIndex === -1) {
            return { message: `Không tìm thấy sản phẩm "${productName}" trong giỏ hàng.` };
        }

        const removedItem = cart.items[itemIndex];
        cart.items.splice(itemIndex, 1);
        await cart.save();

        if (sideEffects) {
            sideEffects.cartUpdated = true;
            sideEffects.cartItems = cart.items;
        }

        return {
            message: `Đã xóa "${removedItem.name}" khỏi giỏ hàng.`,
            removedProduct: removedItem.name,
            cartTotalItems: cart.items.reduce((sum, item) => sum + item.amount, 0),
        };
    }

    // =============================================
    // Bước 4: Checkout Functions
    // =============================================

    if (name === "get_user_address") {
        if (!userId) return { error: "Bạn cần đăng nhập để lấy thông tin giao hàng." };

        const user = await User.findById(userId)
            .select("name phone address city email")
            .lean();

        if (!user) return { error: "Không tìm thấy thông tin người dùng." };

        const hasFullAddress = user.name && user.phone && user.address && user.city;
        return {
            fullName: user.name || "",
            phone: user.phone || "",
            address: user.address || "",
            city: user.city || "",
            email: user.email || "",
            isComplete: !!hasFullAddress,
        };
    }

    if (name === "find_applicable_vouchers") {
        if (!userId) return { error: "Bạn cần đăng nhập để xem mã giảm giá." };
        const orderValue = Number(args?.orderValue) || 0;

        const now = new Date();
        const vouchers = await Discount.find({
            isActive: true,
            startDate: { $lte: now },
            endDate: { $gte: now },
            usesLeft: { $gt: 0 },
            minValue: { $lte: orderValue },
            usersUsed: { $ne: userId },
        })
            .select("name code type value minValue")
            .limit(5)
            .lean();

        if (!vouchers.length) {
            return { message: "Hiện tại không có mã giảm giá phù hợp cho đơn hàng này." };
        }

        return {
            vouchers: vouchers.map(v => ({
                name: v.name,
                code: v.code,
                type: v.type,
                value: v.value,
                minValue: v.minValue,
                description: v.type === "percent"
                    ? `Giảm ${v.value}% (đơn tối thiểu ${v.minValue.toLocaleString("vi-VN")} VND)`
                    : `Giảm ${v.value.toLocaleString("vi-VN")} VND (đơn tối thiểu ${v.minValue.toLocaleString("vi-VN")} VND)`,
            })),
        };
    }

    if (name === "create_cod_order") {
        if (!userId) return { error: "Bạn cần đăng nhập để đặt hàng." };

        // Kiểm tra phương thức thanh toán
        const paymentMethod = args?.paymentMethod || "cod";
        if (paymentMethod === "bank_transfer") {
            return { message: "Tính năng thanh toán chuyển khoản đang được phát triển. Hiện tại bạn có thể thanh toán khi nhận hàng (COD). Xin lỗi vì sự bất tiện!" };
        }

        // Lấy giỏ hàng
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items || cart.items.length === 0) {
            return { error: "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng." };
        }

        // Lấy thông tin user
        const user = await User.findById(userId).select("name phone address city email").lean();
        if (!user) return { error: "Không tìm thấy thông tin người dùng." };
        if (!user.name || !user.phone || !user.address || !user.city) {
            return { error: "Thông tin giao hàng chưa đầy đủ. Vui lòng cập nhật tên, số điện thoại, địa chỉ và tỉnh/thành phố." };
        }

        // Tính tổng tiền
        const itemsPrice = cart.items.reduce((sum, item) => sum + (item.price * item.amount), 0);
        const itemDiscount = cart.items.reduce((sum, item) => sum + ((item.discount || 0) * item.price * item.amount / 100), 0);

        // Tính phí ship (logic tương tự PaymentPage)
        let shippingPrice = 0;
        if (itemsPrice < 200000 && cart.items.length > 0) {
            shippingPrice = 20000;
        } else if (itemsPrice >= 200000 && itemsPrice < 500000) {
            shippingPrice = 10000;
        }

        // Xử lý voucher nếu có
        let voucherDiscount = 0;
        const voucherCode = args?.voucherCode || "";
        if (voucherCode) {
            const discount = await Discount.findOne({
                code: voucherCode.toUpperCase().trim(),
                isActive: true,
                usesLeft: { $gt: 0 },
                minValue: { $lte: itemsPrice },
                usersUsed: { $ne: userId }
            });
            if (discount) {
                if (discount.type === "percent") {
                    voucherDiscount = (itemsPrice * discount.value) / 100;
                } else {
                    voucherDiscount = discount.value;
                }
            }
        }

        const totalBeforeVoucher = itemsPrice - itemDiscount + shippingPrice;
        const totalPrice = Math.max(totalBeforeVoucher - voucherDiscount, 0);

        // Chuẩn bị orderItems — gán nguồn gốc chatbot cho từng item
        const orderItems = cart.items.map(item => ({
            name: item.name,
            amount: item.amount,
            image: item.image || "",
            price: item.price,
            discount: item.discount || 0,
            product: item.product,
            countInStock: item.countInStock,
            orderSource: "chatbot",
        }));

        // Tạo đơn hàng qua OrderService (tái sử dụng logic transaction, trừ kho, phiếu xuất)
        try {
            const orderResult = await OrderService.createOrder({
                orderItems,
                paymentMethod: "cash",
                itemsPrice,
                shippingPrice,
                totalPrice,
                fullName: user.name,
                address: user.address,
                city: user.city,
                phone: user.phone,
                user: userId,
                email: user.email,
            });

            if (orderResult.status === "ERR") {
                return { error: orderResult.message || "Không thể tạo đơn hàng." };
            }

            // Áp dụng voucher nếu có (sau khi tạo đơn thành công)
            if (voucherCode) {
                try {
                    const DiscountService = require("./DiscountService");
                    await DiscountService.useDiscount({
                        code: voucherCode,
                        orderValue: itemsPrice,
                        userId,
                    });
                } catch (discountError) {
                    console.warn("Voucher apply failed (order already created):", discountError?.message);
                }
            }

            // Xóa giỏ hàng sau khi đặt hàng thành công
            await Cart.findOneAndDelete({ userId });

            // Đánh dấu side effects
            if (sideEffects) {
                sideEffects.cartUpdated = true;
                sideEffects.cartItems = [];
                sideEffects.orderCreated = true;
                sideEffects.orderId = orderResult.data?._id;
                sideEffects.orderTotalPrice = totalPrice;
            }

            return {
                message: "Đặt hàng thành công!",
                orderId: orderResult.data?._id,
                totalPrice,
                shippingAddress: `${user.address}, ${user.city}`,
                phone: user.phone,
                paymentMethod: "Thanh toán khi nhận hàng (COD)",
                itemCount: cart.items.length,
            };
        } catch (orderError) {
            console.error("Create COD order failed:", orderError?.message || orderError);
            return { error: "Có lỗi xảy ra khi tạo đơn hàng. Vui lòng thử lại." };
        }
    }

    // =============================================
    // PayOS: Tạo đơn hàng PayOS từ chatbot
    // =============================================
    if (name === "create_payos_order") {
        if (!userId) return { error: "Bạn cần đăng nhập để đặt hàng." };

        // Lấy giỏ hàng
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items || cart.items.length === 0) {
            return { error: "Giỏ hàng đang trống. Vui lòng thêm sản phẩm trước khi đặt hàng." };
        }

        // Lấy thông tin user
        const user = await User.findById(userId).select("name phone address city email").lean();
        if (!user) return { error: "Không tìm thấy thông tin người dùng." };
        if (!user.name || !user.phone || !user.address || !user.city) {
            return { error: "Thông tin giao hàng chưa đầy đủ. Vui lòng cập nhật tên, số điện thoại, địa chỉ và tỉnh/thành phố." };
        }

        // Tính tổng tiền
        const itemsPrice = cart.items.reduce((sum, item) => sum + (item.price * item.amount), 0);
        const itemDiscount = cart.items.reduce((sum, item) => sum + ((item.discount || 0) * item.price * item.amount / 100), 0);

        let shippingPrice = 0;
        if (itemsPrice < 200000 && cart.items.length > 0) shippingPrice = 20000;
        else if (itemsPrice >= 200000 && itemsPrice < 500000) shippingPrice = 10000;

        // Xử lý voucher nếu có
        let voucherDiscount = 0;
        const voucherCode = args?.voucherCode || "";
        if (voucherCode) {
            const discount = await Discount.findOne({
                code: voucherCode.toUpperCase().trim(),
                isActive: true,
                usesLeft: { $gt: 0 },
                minValue: { $lte: itemsPrice },
                usersUsed: { $ne: userId }
            });
            if (discount) {
                if (discount.type === "percent") {
                    voucherDiscount = (itemsPrice * discount.value) / 100;
                } else {
                    voucherDiscount = discount.value;
                }
            }
        }

        const totalBeforeVoucher = itemsPrice - itemDiscount + shippingPrice;
        const totalPrice = Math.max(totalBeforeVoucher - voucherDiscount, 0);

        // Chuẩn bị orderItems — gán nguồn gốc chatbot cho từng item
        const orderItems = cart.items.map(item => ({
            name: item.name,
            amount: item.amount,
            image: item.image || "",
            price: item.price,
            discount: item.discount || 0,
            product: item.product,
            countInStock: item.countInStock,
            orderSource: "chatbot",
        }));

        try {
            const PayOSService = require("./PayOSService");

            // Tạo đơn hàng pending
            const orderResult = await OrderService.createPendingOrder({
                orderItems,
                paymentMethod: "payos",
                itemsPrice,
                shippingPrice,
                totalPrice,
                fullName: user.name,
                address: user.address,
                city: user.city,
                phone: user.phone,
                user: userId,
                email: user.email,
            });

            if (orderResult.status === "ERR") {
                return { error: orderResult.message || "Không thể tạo đơn hàng." };
            }

            const order = orderResult.data;

            // Áp dụng voucher nếu có (sau khi tạo đơn thành công)
            if (voucherCode) {
                try {
                    const DiscountService = require("./DiscountService");
                    await DiscountService.useDiscount({
                        code: voucherCode,
                        orderValue: itemsPrice,
                        userId,
                    });
                } catch (discountError) {
                    console.warn("Voucher apply failed (order already created):", discountError?.message);
                }
            }

            const payosOrderCode = PayOSService.generateOrderCode(order._id);
            const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";

            // Tạo PayOS payment link
            const paymentLinkData = await PayOSService.createPaymentLink({
                orderCode: payosOrderCode,
                amount: Math.round(totalPrice),
                description: `FitnFood #${String(order._id).slice(-6).toUpperCase()}`,
                items: orderItems.map(item => ({
                    name: String(item.name || "").slice(0, 50),
                    quantity: Number(item.amount || 1),
                    price: Math.round(Number(item.price || 0)),
                })),
                returnUrl: `${frontendUrl}/orderSuccess`,
                cancelUrl: `${frontendUrl}/payment`,
                buyerName: user.name,
                buyerPhone: user.phone,
            });

            // Cập nhật payosOrderCode vào đơn hàng
            const Order = require("../models/OrderModel");
            await Order.findByIdAndUpdate(order._id, {
                payosOrderCode,
                paymentLinkId: paymentLinkData.paymentLinkId,
            });

            // Xóa giỏ hàng
            await Cart.findOneAndDelete({ userId });

            // Đánh dấu side effects để chatSocket emit chat:payos_link
            if (sideEffects) {
                sideEffects.cartUpdated = true;
                sideEffects.cartItems = [];
                sideEffects.payosLink = paymentLinkData.checkoutUrl;
                sideEffects.orderId = order._id;
                sideEffects.orderTotalPrice = totalPrice;
            }

            return {
                message: "Đã tạo link thanh toán PayOS thành công! Link thanh toán đã được gửi vào chat. Vui lòng mở link và quét mã QR bằng app ngân hàng để hoàn tất thanh toán.",
                orderId: order._id,
                totalPrice,
                paymentMethod: "PayOS QR Code",
                note: "Link thanh toán sẽ hết hạn sau 15 phút.",
            };
        } catch (payosError) {
            console.error("Create PayOS order failed:", payosError?.message || payosError);
            return { error: "Có lỗi xảy ra khi tạo thanh toán PayOS. Vui lòng thử lại hoặc chọn COD." };
        }
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
            wasFunctionCalled: false,
            sideEffects: {},
        };
    }

    // Context để thu thập side effects từ function calls
    const sideEffects = {};

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
        const MAX_FUNCTION_CALLS = 6;
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
                    const statusMessages = {
                        lookup_user_orders: "Đang tra cứu đơn hàng của bạn...",
                        check_product_stock: "Đang kiểm tra tồn kho sản phẩm...",
                        add_to_cart: "Đang thêm sản phẩm vào giỏ hàng...",
                        view_cart: "Đang kiểm tra giỏ hàng...",
                        remove_from_cart: "Đang cập nhật giỏ hàng...",
                        get_user_address: "Đang lấy thông tin giao hàng...",
                        find_applicable_vouchers: "Đang tìm mã giảm giá phù hợp...",
                        create_cod_order: "Đang tạo đơn hàng...",
                    };
                    statusCallback(statusMessages[fc.name] || "Đang xử lý...");
                }

                const fcResult = await executeFunctionCall(fc, userId, { sideEffects });
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
            wasFunctionCalled,
            sideEffects,
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

    // 2. Bold chứa toàn bộ tên DB — bot đã thêm thông tin vào sau tên
    if (normalB.includes(normalP) && normalP.length >= 6) return true;
    
    // 3. Tên DB chứa toàn bộ nội dung bold — GIẢM THIỂU RỦI RO bằng cách yêu cầu bold phải đủ dài (>= 15 ký tự)
    // Tránh trường hợp boldText là "Vitamin C" khớp với "Viên uống bổ sung Vitamin C"
    if (normalP.includes(normalB) && normalB.length >= 15) return true;

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
    let sideEffects = {};
    try {
        const replyResult = await generateGeminiReply(prompt, conversationHistory, userId, statusCallback);
        text = replyResult.text;
        wasFunctionCalled = replyResult.wasFunctionCalled;
        sideEffects = replyResult.sideEffects || {};
    } catch (error) {
        console.warn("Gemini call failed or overloaded:", error?.message || error);
        // Fallback khi AI lỗi 503 hoặc các lỗi khác
        text = "Hiện tại chuyên viên AI của FITNFOOD đang hỗ trợ nhiều khách hàng cùng lúc nên phản hồi hơi chậm. Bạn vui lòng đợi một chút hoặc nhấn nút 'Gặp Nhân Viên' để kết nối trực tiếp với chuyên gia dinh dưỡng nhé!";
    }

    // 5. Kiểm tra nếu cần ẩn danh sách sản phẩm gợi ý (khi thực hiện checkout hoặc chưa đủ ngữ cảnh)
    let hideProducts = text.includes("[CHECKOUT_CONFIRM]");
    if (text.includes("[NEEDS_INFO]")) {
        hideProducts = true;
        // Xóa cờ [NEEDS_INFO] khỏi câu trả lời của bot trước khi gửi đi
        text = text.replace(/\[NEEDS_INFO\]/gi, "").trim();
    }

    // 6. Xử lý [CHECKOUT_CONFIRM] — tạo action buttons cho checkout
    let actions = [];
    if (text.includes("[CHECKOUT_CONFIRM]")) {
        text = text.replace(/\[CHECKOUT_CONFIRM\]/gi, "").trim();
        actions = [
            { type: "confirm_order", label: "Xác nhận đặt hàng", payload: {} },
            { type: "change_address", label: "Đổi địa chỉ giao hàng", payload: {} },
        ];
    }

    // 7. Tạo cartUpdate metadata nếu giỏ hàng thay đổi
    let cartUpdate = null;
    if (sideEffects.cartUpdated) {
        const cartItems = sideEffects.cartItems || [];
        cartUpdate = {
            items: cartItems,
            totalItems: cartItems.reduce((sum, item) => sum + (item.amount || 0), 0),
        };
    }

    // 8. Tạo orderCreated metadata nếu đơn hàng được tạo
    let orderCreated = null;
    if (sideEffects.orderCreated) {
        orderCreated = {
            orderId: sideEffects.orderId,
            totalPrice: sideEffects.orderTotalPrice,
        };
    }

    // Gợi ý chính xác các sản phẩm được đề cập trong text (nếu không bị ẩn)
    const matchedProducts = hideProducts ? [] : await extractProductsFromText(text);
    const productSnapshots = matchedProducts.map(buildProductSnapshot).filter((item) => item?._id);
    const productIds = productSnapshots.map((item) => item._id).filter(Boolean);

    return {
        text,
        productIds,
        products: productSnapshots,
        actions,
        cartUpdate,
        orderCreated,
        sideEffects,
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