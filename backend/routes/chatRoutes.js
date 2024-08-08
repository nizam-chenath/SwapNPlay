const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const protect = require('../middleware/authMiddleware');

// Initiate chat when a buy request is made
router.post('/initiate-chat', protect, chatController.initiateChat);

// Endpoint to send a message (optional, if you want to add it now)
router.post('/message/:chatId', protect, chatController.sendMessage);

module.exports = router;