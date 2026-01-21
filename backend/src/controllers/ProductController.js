const ProducService = require('../services/ProductService');

const createProduct = async (req, res) => {
    try {
        const { name, images, type, price, countInStock, rating, description, sold, discount } = req.body;

        if (
            !name ||
            !images ||
            !type ||
            price == null ||
            countInStock == null ||
            rating == null ||
            sold == null ||
            discount == null
        ) {
            return res.status(200).json({
                status: "ERR",
                message: "All fields required!"
            });
        }
        const response = await ProducService.createProduct(req.body)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const data = req.body;
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            })
        }
        const response = await ProducService.updateProduct(productId, data)
        return res.status(200).json(response)
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const deleteProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            })
        }
        const deletedProduct = await ProducService.deleteProduct(productId);
        return res.status(200).json(deletedProduct);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }   
}


const getDetailsProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        if (!productId) {
            return res.status(200).json({
                status: "ERR",
                message: "Product ID is required!"
            })
        }
        const productDetails = await ProducService.getDetailsProduct(productId);
        return res.status(200).json(productDetails);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

const getAllProducts = async (req, res) => {
    try {
        const products = await ProducService.getAllProducts();
        return res.status(200).json(products);
    } catch (e) {
        return res.status(404).json({
            message: e
        })
    }
}

module.exports = {
    createProduct,
    updateProduct,
    deleteProduct,
    getDetailsProduct,
    getAllProducts
}