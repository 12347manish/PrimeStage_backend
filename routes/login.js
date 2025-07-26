// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/UserController');

router.post('/user', authController.login);

module.exports = router;