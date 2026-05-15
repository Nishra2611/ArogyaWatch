const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user dynamically
router.post('/register', authController.register);

// @route   POST /api/auth/login
// @desc    Login existing user
router.post('/login', authController.login);

// @route   POST /api/auth/google
// @desc    Google OAuth login or registration
router.post('/google', authController.googleLogin);

module.exports = router;
