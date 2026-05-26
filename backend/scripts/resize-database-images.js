const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const sharp = require('sharp');
const Product = require('../src/models/ProductModel');
const User = require('../src/models/UserModel');
const Order = require('../src/models/OrderModel');

const MONGO_DB = process.env.MONGO_DB;
const MAX_DIMENSION = 800;
const QUALITY = 80;

if (!MONGO_DB) {
    console.error("Error: MONGO_DB is not defined in .env");
    process.exit(1);
}

// Function to compress base64 image using sharp
async function compressBase64Image(base64Str) {
    if (!base64Str || typeof base64Str !== 'string') return null;

    // Check if it's a valid data URL base64 image
    const match = base64Str.match(/^data:image\/([^;]+);base64,(.*)$/);
    if (!match) {
        // Not a data URL, return null (might be a standard url or empty)
        return null;
    }

    const mime = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    try {
        const image = sharp(buffer);
        const metadata = await image.metadata();

        // Check if resize is needed
        let width = metadata.width;
        let height = metadata.height;
        let resizeOptions = null;

        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
            resizeOptions = {
                width: MAX_DIMENSION,
                height: MAX_DIMENSION,
                fit: 'inside',
                withoutEnlargement: true
            };
        }

        let pipeline = image;
        if (resizeOptions) {
            pipeline = pipeline.resize(resizeOptions);
        }

        // Output to JPEG with specified quality
        const outputBuffer = await pipeline
            .jpeg({ quality: QUALITY })
            .toBuffer();

        const newBase64 = `data:image/jpeg;base64,${outputBuffer.toString('base64')}`;
        return {
            originalSize: base64Str.length,
            compressedSize: newBase64.length,
            data: newBase64
        };
    } catch (error) {
        console.error("Failed to compress image:", error.message);
        return null;
    }
}

async function run() {
    try {
        console.log("Connecting to database...");
        await mongoose.connect(MONGO_DB);
        console.log("Connected successfully!");

        let totalOriginalBytes = 0;
        let totalCompressedBytes = 0;
        let productsProcessed = 0;
        let usersProcessed = 0;
        let ordersProcessed = 0;

        // 1. Process Products
        console.log("\n--- Processing Products ---");
        const products = await Product.find({});
        for (const product of products) {
            let updated = false;

            // Compress main image field if exists
            if (product.image && product.image.startsWith('data:image')) {
                const result = await compressBase64Image(product.image);
                if (result && result.compressedSize < result.originalSize) {
                    totalOriginalBytes += result.originalSize;
                    totalCompressedBytes += result.compressedSize;
                    product.image = result.data;
                    updated = true;
                }
            }

            // Compress images array
            if (Array.isArray(product.images) && product.images.length > 0) {
                const newImages = [];
                for (let i = 0; i < product.images.length; i++) {
                    const img = product.images[i];
                    if (img && img.startsWith('data:image')) {
                        const result = await compressBase64Image(img);
                        if (result && result.compressedSize < result.originalSize) {
                            totalOriginalBytes += result.originalSize;
                            totalCompressedBytes += result.compressedSize;
                            newImages.push(result.data);
                            updated = true;
                        } else {
                            newImages.push(img);
                        }
                    } else {
                        newImages.push(img);
                    }
                }
                if (updated) {
                    product.images = newImages;
                }
            }

            if (updated) {
                // Use Direct update to skip pre-save hooks
                await Product.updateOne({ _id: product._id }, { 
                    image: product.image,
                    images: product.images
                });
                productsProcessed++;
                console.log(`Compressed images for product: ${product.name}`);
            }
        }

        // 2. Process Users
        console.log("\n--- Processing User Avatars ---");
        const users = await User.find({});
        for (const user of users) {
            if (user.avatar && user.avatar.startsWith('data:image')) {
                const result = await compressBase64Image(user.avatar);
                if (result && result.compressedSize < result.originalSize) {
                    totalOriginalBytes += result.originalSize;
                    totalCompressedBytes += result.compressedSize;
                    await User.updateOne({ _id: user._id }, { avatar: result.data });
                    usersProcessed++;
                    console.log(`Compressed avatar for user: ${user.email}`);
                }
            }
        }

        // 3. Process Orders
        console.log("\n--- Processing Order Items ---");
        const orders = await Order.find({});
        for (const order of orders) {
            let updated = false;
            if (Array.isArray(order.orderItems) && order.orderItems.length > 0) {
                for (let i = 0; i < order.orderItems.length; i++) {
                    const item = order.orderItems[i];
                    if (item.image && item.image.startsWith('data:image')) {
                        const result = await compressBase64Image(item.image);
                        if (result && result.compressedSize < result.originalSize) {
                            totalOriginalBytes += result.originalSize;
                            totalCompressedBytes += result.compressedSize;
                            item.image = result.data;
                            updated = true;
                        }
                    }
                }
            }
            if (updated) {
                await Order.updateOne({ _id: order._id }, { orderItems: order.orderItems });
                ordersProcessed++;
                console.log(`Compressed order items for order ID: ${order._id}`);
            }
        }

        console.log("\n--- Migration Complete ---");
        console.log(`Products updated: ${productsProcessed}`);
        console.log(`Users updated: ${usersProcessed}`);
        console.log(`Orders updated: ${ordersProcessed}`);
        
        const originalMB = (totalOriginalBytes / (1024 * 1024)).toFixed(2);
        const compressedMB = (totalCompressedBytes / (1024 * 1024)).toFixed(2);
        const savedMB = ((totalOriginalBytes - totalCompressedBytes) / (1024 * 1024)).toFixed(2);
        
        console.log(`Original Base64 Payload Size: ${originalMB} MB`);
        console.log(`Compressed Base64 Payload Size: ${compressedMB} MB`);
        console.log(`Saved Database Space: ${savedMB} MB`);

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("Disconnected from database.");
    }
}

run();
