const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getOrCreateConversation,
  getConversations,
  getMessages,
  sendMessage,
  getUnreadCount,
} = require('../controllers/chatController');

router.post('/conversation', auth, getOrCreateConversation);
router.get('/conversations', auth, getConversations);
router.get('/unread-count', auth, getUnreadCount);
router.get('/:conversationId/messages', auth, getMessages);
router.post('/:conversationId/messages', auth, sendMessage);

module.exports = router;
