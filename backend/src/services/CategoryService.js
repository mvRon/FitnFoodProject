const Category = require("../models/CategoryModel");

const createCategory = async ({ name, parent }) => {
    return new Promise(async (resolve, reject) => {
        try {
            // Kiểm tra nếu đã có category với cùng tên và parent
            const existingCategory = await Category.findOne({ name, parent: parent || null });
            if (existingCategory) {
                return resolve({
                    status: 'ERR',
                    message: 'Category with the same name already exists under the specified parent!',
                    data: null
                });
            }
            const newCategory = new Category({ name, parent: parent || null });
            const savedCategory = await newCategory.save();
            resolve({
                status: 'OK',
                message: 'Category created successfully!',
                data: savedCategory
            });
        } catch (error) {
            reject(error);
        }
    });
};

const getAllCategories = async () => {
    return new Promise(async (resolve, reject) => {
        try {
            const categories = await Category.find();
            resolve({
                status: 'OK',
                message: 'Categories retrieved successfully!',
                data: categories
            });
        } catch (error) {
            reject(error);
        }
    });
}

const getCategoryById = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const category = await Category.findById(id);
            if (!category) {
                return resolve({
                    status: 'ERR',
                    message: 'Category not found!',
                    data: null
                });
            }
            resolve({
                status: 'OK',
                message: 'Category retrieved successfully!',
                data: category
            });
        }
        catch (error) {
            reject(error);
        }
    });
}

const updateCategory = async (id, { name, parent }) => {
    return new Promise(async (resolve, reject) => {
        try {

            // Kiểm tra nếu đã có category với cùng tên và parent (ngoại trừ chính nó)
            const existingCategory = await Category.findOne({
                name,
                parent: parent || null,
                _id: { $ne: id }
            });
            if (existingCategory) {
                return resolve({
                    status: 'ERR',
                    message: 'Category with the same name already exists under the specified parent!',
                    data: null
                });
            }
            const updatedCategory = await Category.findByIdAndUpdate(
                id,
                { name, parent: parent || null },
                { new: true }
            );
            if (!updatedCategory) {
                return resolve({
                    status: 'ERR',
                    message: 'Category not found!',
                    data: null
                });
            }
            resolve({
                status: 'OK',
                message: 'Category updated successfully!',
                data: updatedCategory
            });

        } catch (error) {
            reject(error);
        }
    });
}

const deleteCategory = async (id) => {
    return new Promise(async (resolve, reject) => {
        try {
            const deletedCategory = await Category.findByIdAndDelete(id);
            if (!deletedCategory) {
                return resolve({
                    status: 'ERR',
                    message: 'Category not found!',
                    data: null
                });
            }
            resolve({
                status: 'OK',
                message: 'Category deleted successfully!',
                data: deletedCategory
            });
        } catch (error) {
            reject(error);
        }
    });
}

module.exports = {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory
};