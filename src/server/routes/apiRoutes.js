const express = require('express');
const authController = require('../controllers/authController');
const roomController = require('../controllers/roomController');
const rateLimit = require('express-rate-limit');

const apiLimiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again after 15 minutes'
});

const router = express.Router();

router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/check-session', authController.checkSession);

// Define your room-related routes here
router.post('/api/rooms', apiLimiter, roomController.createRoom);
router.get('/api/rooms/:roomID/users', roomController.getRoomUsers);

module.exports = router;
