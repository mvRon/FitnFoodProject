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
router.put('/update-user/:id', authUserMiddleWare, UserController.updateUser);
router.delete('/delete-user/:id', authMiddleWare, UserController.deleteUser);
router.get('/get-all-users', authMiddleWare, UserController.getAllUsers);
router.get('/get-user-details', authUserMiddleWare, UserController.getUserDetails);


module.exports = router;