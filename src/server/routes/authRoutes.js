const express = require('express');
const authController = require('../controllers/authController');
const router = express.Router();

// Define your authentication-related routes here
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/check-session', authController.checkSession);

module.exports = router;
