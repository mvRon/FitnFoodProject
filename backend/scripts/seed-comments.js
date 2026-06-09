const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { fakerVI: faker } = require('@faker-js/faker'); 

dotenv.config();

const Product = require('../src/models/ProductModel');
const User = require('../src/models/UserModel');

const TOTAL_COMMENTS = 700;
const MAX_RATINGS = Math.floor(TOTAL_COMMENTS * 0.2); // max 20% = 140 ratings

async function seedComments() {
    try {
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Connected to MongoDB!");

        const users = await User.find({}).select('_id');
        const products = await Product.find({}).select('_id');

        if (users.length === 0 || products.length === 0) {
            console.error("Missing users or products in database.");
            process.exit(1);
        }

        console.log(`Found ${users.length} users and ${products.length} products.`);

        const userIds = users.map(u => u._id);
        const productIds = products.map(p => p._id);

        let ratingCount = 0;
        let reviewsToInsert = [];

        // Track users who already rated each product to prevent duplicate ratings by same user
        const productRatedUsers = new Map();
        for (const pid of productIds) {
            productRatedUsers.set(pid.toString(), new Set());
        }

        // 1. Đảm bảo mỗi sản phẩm nhận được ít nhất 1 đánh giá sao (nếu có thể)
        for (const pid of productIds) {
            if (ratingCount >= MAX_RATINGS) break;

            const randomUser = faker.helpers.arrayElement(userIds);
            productRatedUsers.get(pid.toString()).add(randomUser.toString());

            reviewsToInsert.push({
                productId: pid,
                review: {
                    user: randomUser,
                    rating: faker.number.int({ min: 1, max: 5 }),
                    comment: faker.lorem.paragraph(),
                    createdAt: faker.date.recent({ days: 60 })
                }
            });
            ratingCount++;
        }

        // 2. Tiếp tục nhồi thêm các đánh giá sao vào ngẫu nhiên các sản phẩm cho đến khi đạt MAX_RATINGS
        while (ratingCount < MAX_RATINGS) {
            const randomProduct = faker.helpers.arrayElement(productIds);
            const randomUser = faker.helpers.arrayElement(userIds);

            const ratedSet = productRatedUsers.get(randomProduct.toString());
            // Tránh việc 1 user đánh giá nhiều lần trên cùng 1 sản phẩm
            if (!ratedSet.has(randomUser.toString())) {
                ratedSet.add(randomUser.toString());
                reviewsToInsert.push({
                    productId: randomProduct,
                    review: {
                        user: randomUser,
                        rating: faker.number.int({ min: 1, max: 5 }),
                        comment: faker.lorem.paragraph(),
                        createdAt: faker.date.recent({ days: 60 })
                    }
                });
                ratingCount++;
            }
        }

        // 3. Số lượng còn lại sẽ là bình luận thông thường (không có sao)
        const commentsNeeded = TOTAL_COMMENTS - reviewsToInsert.length;
        for (let i = 0; i < commentsNeeded; i++) {
            const randomProduct = faker.helpers.arrayElement(productIds);
            const randomUser = faker.helpers.arrayElement(userIds);

            reviewsToInsert.push({
                productId: randomProduct,
                review: {
                    user: randomUser,
                    // Không có thuộc tính rating
                    comment: faker.lorem.paragraph(),
                    createdAt: faker.date.recent({ days: 60 })
                }
            });
        }

        // Xáo trộn mảng để thứ tự chèn ngẫu nhiên hơn
        reviewsToInsert = faker.helpers.shuffle(reviewsToInsert);

        console.log(`Bắt đầu phân bổ ${reviewsToInsert.length} bình luận/đánh giá vào cơ sở dữ liệu...`);

        // Nhóm các bình luận theo từng sản phẩm để gom chung lệnh cập nhật
        const updatesByProduct = {};
        for (const item of reviewsToInsert) {
            const pid = item.productId.toString();
            if (!updatesByProduct[pid]) {
                updatesByProduct[pid] = [];
            }
            updatesByProduct[pid].push(item.review);
        }

        let updatedProductsCount = 0;

        for (const [pid, newReviews] of Object.entries(updatesByProduct)) {
            // Lấy thông tin hiện tại để tính lại averageRating và numReviews một cách chính xác
            const product = await Product.findById(pid).select('reviews numReviews averageRating');
            if (!product) continue;

            for (const r of newReviews) {
                product.reviews.push(r);
            }
            
            product.numReviews = product.reviews.length;

            const ratingReviews = product.reviews.filter(r => typeof r.rating === 'number' && !isNaN(r.rating));
            if (ratingReviews.length > 0) {
                product.averageRating = ratingReviews.reduce((acc, item) => acc + item.rating, 0) / ratingReviews.length;
            } else {
                product.averageRating = 0;
            }

            // Sử dụng updateOne thay vì save() để tránh kích hoạt các middleware không cần thiết (như tạo embedding AI làm chậm tiến trình)
            await Product.updateOne(
                { _id: pid },
                { 
                    $push: { reviews: { $each: newReviews } },
                    $set: { 
                        numReviews: product.numReviews,
                        averageRating: product.averageRating 
                    }
                }
            );

            updatedProductsCount++;
            process.stdout.write(`\rĐã cập nhật ${updatedProductsCount}/${Object.keys(updatesByProduct).length} sản phẩm...`);
        }

        console.log("\nQuá trình tạo bình luận đã hoàn tất thành công!");
        process.exit(0);

    } catch (error) {
        console.error("\nLỗi trong quá trình chạy script:", error);
        process.exit(1);
    }
}

seedComments();
