const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { sendMessage, getOwnerMessages, markRead } = require('../controllers/messageController');

router.post('/', auth, sendMessage);
router.get('/owner', auth, getOwnerMessages);
router.put('/:id/read', auth, markRead);

module.exports = router;
