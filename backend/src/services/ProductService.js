const Product = require("../models/ProductModel");


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

const updateProduct = (productId, data) => {
    return new Promise(async (resolve, reject) => {
        try {
            const updatedProduct = await Product.findByIdAndUpdate(
                productId,
                data,
                { new: true }
            );
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