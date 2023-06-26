const express = require('express');
const { UserLogin, UserSignup } = require('../controllers/userController');
const router = express.Router();

// Login
router.post('/login', UserLogin);

// Signup
router.post('/signup', UserSignup);

module.exports = router;
