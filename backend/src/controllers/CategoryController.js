const CategoryService = require("../services/CategoryService");


const createCategory = async (req, res) => {
    try {
        const { name, parent } = req.body;
        if (!name) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Category name is required!',
                data: null
            });
        }
        const result = await CategoryService.createCategory({ name, parent });
        res.status(result.status === 'OK' ? 201 : 400).json(result);
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
            data: null
        });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const result = await CategoryService.getAllCategories();
        res.status(result.status === 'OK' ? 200 : 500).json(result);
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
            data: null
        });
    }
};

const getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.getCategoryById(id);
        res.status(result.status === 'OK' ? 200 : 404).json(result);
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
            data: null
        });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, parent } = req.body;
        if (!name) {
            return res.status(400).json({
                status: 'ERR',
                message: 'Category name is required!',
                data: null
            });
        }
        const result = await CategoryService.updateCategory(id, { name, parent });
        res.status(result.status === 'OK' ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
            data: null
        });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await CategoryService.deleteCategory(id);
        res.status(result.status === 'OK' ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({
            status: 'ERR',
            message: error.message,
            data: null
        });
    }
};


module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};