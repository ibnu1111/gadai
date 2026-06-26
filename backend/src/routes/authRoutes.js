const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth');
const authController = require('../controllers/authController');

// Login
router.post('/login', authController.login);

// Register (only when no admin exists)
router.post('/register', authController.register);

// Get current admin profile (requires auth)
router.get('/profile', authMiddleware, authController.getProfile);

module.exports = router;
