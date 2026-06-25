const express = require('express');
const router = express.Router();
const SystemSettingController = require('../controllers/SystemSettingController');
const { authMiddleWare } = require('../middleware/authMiddleware');

// GET  /api/system-setting        – public (admin UI cũng cần đọc khi load trang)
router.get('/', SystemSettingController.getSetting);

// PUT  /api/system-setting        – chỉ admin
router.put('/', authMiddleWare, SystemSettingController.updateSetting);

module.exports = router;
