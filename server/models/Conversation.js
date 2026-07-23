const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema(
  {
    property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
    buyer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage', default: null },
    // unread counts per participant
    buyerUnread: { type: Number, default: 0 },
    sellerUnread: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Unique constraint: one conversation per buyer-seller-property combination
conversationSchema.index({ property: 1, buyer: 1, seller: 1 }, { unique: true });

module.exports = mongoose.model('Conversation', conversationSchema);
