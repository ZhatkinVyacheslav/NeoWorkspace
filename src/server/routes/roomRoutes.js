const express = require('express');
const roomController = require('../controllers/roomController');
const router = express.Router();

// Define your room-related routes here
router.post('/', roomController.createRoom);
router.get('/:roomID/users', roomController.getRoomUsers);
router.get('/:roomID', roomController.getRoom);
router.delete('/:roomID', roomController.deleteRoom);

module.exports = router;
