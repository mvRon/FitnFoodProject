const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');
const { authMiddleWare, authUserMiddleWare } = require('../middleware/authMiddleware');

router.post('/register', UserController.registerAccount);
router.post('/login', UserController.loginAccount);
router.post('/verify', UserController.verifyAccount)
router.post('/logout', UserController.logoutAccount);
router.post('/refresh-token', UserController.refreshToken);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/reset-password', UserController.resetPassword);
router.put('/:id', authUserMiddleWare, UserController.updateUser);
router.delete('/:id', authMiddleWare, UserController.deleteUser);


module.exports = router;