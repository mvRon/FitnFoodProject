const SystemSettingModel = require('../models/SystemSettingModel');

/**
 * GET /api/system-setting
 * Lấy cài đặt hệ thống hiện tại.
 * Nếu chưa có document nào, trả về giá trị default từ schema.
 */
const getSetting = async (req, res) => {
    try {
        let setting = await SystemSettingModel.findOne();

        // Lần đầu chạy: chưa có document → tạo mới với default values
        if (!setting) {
            setting = await SystemSettingModel.create({});
        }

        return res.status(200).json({
            status: 'OK',
            message: 'Lấy cài đặt hệ thống thành công',
            data: setting,
        });
    } catch (error) {
        console.error('❌ getSetting error:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server khi lấy cài đặt hệ thống',
            error: error.message,
        });
    }
};

/**
 * PUT /api/system-setting
 * Cập nhật cài đặt hệ thống (upsert – tạo nếu chưa có).
 * Chỉ admin mới có quyền gọi (bảo vệ bằng authMiddleWare).
 */
const updateSetting = async (req, res) => {
    try {
        const updateData = req.body;

        // Không cho phép update _id hay timestamps thủ công
        delete updateData._id;
        delete updateData.createdAt;
        delete updateData.updatedAt;
        delete updateData.__v;

        const updated = await SystemSettingModel.findOneAndUpdate(
            {}, // điều kiện tìm (singleton nên không cần filter cụ thể)
            { $set: updateData },
            { new: true, upsert: true, runValidators: true }
        );

        return res.status(200).json({
            status: 'OK',
            message: 'Cập nhật cài đặt hệ thống thành công',
            data: updated,
        });
    } catch (error) {
        console.error('❌ updateSetting error:', error);
        return res.status(500).json({
            status: 'ERROR',
            message: 'Lỗi server khi cập nhật cài đặt hệ thống',
            error: error.message,
        });
    }
};

module.exports = {
    getSetting,
    updateSetting,
};
