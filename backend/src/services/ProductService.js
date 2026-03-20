const Product = require("../models/ProductModel");
const InventoryService = require("./InventoryService");


const createProduct = (newProduct) => {
    return new Promise(async (resolve, reject) => {
        const { name, images, type, price, countInStock, rating, description, sold, discount } = newProduct;

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
                name, images, type, price, countInStock, rating, description, sold, discount
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
                                    unitPrice: 0,
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
                                    unitPrice: 0,
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

const getAllProducts = () => {
    return new Promise(async (resolve, reject) => {
        try {
            const allProducts = await Product.find().populate('type');
            resolve({
                status: "OK",
                message: "All products retrieved successfully!",
                data: allProducts
            });
        } catch (e) {
            reject(e);
        }
    });
}


module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getDetailsProduct,
    getAllProducts
}