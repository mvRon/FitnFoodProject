const express = require('express');
const router = express.Router();
const UserController = require('../controllers/UserController');

router.post('/register', UserController.registerAccount);
router.post('/login', UserController.loginAccount);
router.post('/verify', UserController.verifyAccount)


module.exports = router;