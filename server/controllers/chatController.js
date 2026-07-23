const Conversation = require('../models/Conversation');
const ChatMessage = require('../models/ChatMessage');
const Property = require('../models/Property');

// ─── GET or CREATE /api/chat/conversation ─────────────────────
// Body: { propertyId, sellerId }
exports.getOrCreateConversation = async (req, res) => {
  try {
    const { propertyId, sellerId } = req.body;
    if (!propertyId || !sellerId)
      return res.status(400).json({ message: 'propertyId and sellerId are required.' });

    const buyerId = req.user._id;

    // Prevent seller from chatting with themselves
    if (buyerId.toString() === sellerId.toString())
      return res.status(400).json({ message: 'You cannot chat with yourself.' });

    let conversation = await Conversation.findOne({
      property: propertyId,
      buyer: buyerId,
      seller: sellerId,
    })
      .populate('buyer', 'name email profilePicture')
      .populate('seller', 'name email profilePicture')
      .populate('property', 'title images location')
      .populate('lastMessage');

    if (!conversation) {
      conversation = await Conversation.create({
        property: propertyId,
        buyer: buyerId,
        seller: sellerId,
      });
      conversation = await Conversation.findById(conversation._id)
        .populate('buyer', 'name email profilePicture')
        .populate('seller', 'name email profilePicture')
        .populate('property', 'title images location');
    }

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/chat/conversations ─────────────────────────────
exports.getConversations = async (req, res) => {
  try {
    const userId = req.user._id;

    const conversations = await Conversation.find({
      $or: [{ buyer: userId }, { seller: userId }],
    })
      .populate('buyer', 'name email profilePicture')
      .populate('seller', 'name email profilePicture')
      .populate('property', 'title images location')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/chat/:conversationId/messages ───────────────────
exports.getMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // Verify user is a participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const isBuyer = conversation.buyer.toString() === userId.toString();
    const isSeller = conversation.seller.toString() === userId.toString();
    if (!isBuyer && !isSeller)
      return res.status(403).json({ message: 'Access denied.' });

    const messages = await ChatMessage.find({ conversation: conversationId })
      .populate('sender', 'name profilePicture')
      .sort({ createdAt: 1 });

    // Mark messages as read for the current user (messages they received)
    await ChatMessage.updateMany(
      { conversation: conversationId, sender: { $ne: userId }, isRead: false },
      { isRead: true }
    );

    // Reset unread count for this user
    if (isBuyer) conversation.buyerUnread = 0;
    if (isSeller) conversation.sellerUnread = 0;
    await conversation.save();

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/chat/:conversationId/messages ──────────────────
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const { content } = req.body;
    const userId = req.user._id;

    if (!content || !content.trim())
      return res.status(400).json({ message: 'Message content is required.' });

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) return res.status(404).json({ message: 'Conversation not found.' });

    const isBuyer = conversation.buyer.toString() === userId.toString();
    const isSeller = conversation.seller.toString() === userId.toString();
    if (!isBuyer && !isSeller)
      return res.status(403).json({ message: 'Access denied.' });

    const chatMessage = await ChatMessage.create({
      conversation: conversationId,
      sender: userId,
      content: content.trim(),
    });

    const populated = await ChatMessage.findById(chatMessage._id)
      .populate('sender', 'name profilePicture');

    // Update conversation
    conversation.lastMessage = chatMessage._id;
    if (isBuyer) conversation.sellerUnread += 1;
    if (isSeller) conversation.buyerUnread += 1;
    await conversation.save();

    // Emit via Socket.io
    if (req.io) {
      req.io.to(`conversation_${conversationId}`).emit('new_message', populated);
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/chat/unread-count ───────────────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;

    const buyerConvs = await Conversation.find({ buyer: userId });
    const sellerConvs = await Conversation.find({ seller: userId });

    const totalUnread =
      buyerConvs.reduce((sum, c) => sum + c.buyerUnread, 0) +
      sellerConvs.reduce((sum, c) => sum + c.sellerUnread, 0);

    res.json({ unreadCount: totalUnread });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
