const Message = require('../models/Message');
const Property = require('../models/Property');

// POST /api/messages
exports.sendMessage = async (req, res) => {
  try {
    const { propertyId, content } = req.body;
    if (!propertyId || !content)
      return res.status(400).json({ message: 'Property ID and content are required.' });

    const property = await Property.findById(propertyId);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    if (property.owner.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot send an inquiry to your own property.' });

    const message = await Message.create({
      property: propertyId,
      sender: req.user._id,
      receiver: property.owner,
      content,
    });

    const populated = await message.populate([
      { path: 'sender', select: 'name email profilePicture' },
      { path: 'property', select: 'title location' },
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/owner
exports.getOwnerMessages = async (req, res) => {
  try {
    const messages = await Message.find({ receiver: req.user._id })
      .populate('sender', 'name email profilePicture')
      .populate('property', 'title location images')
      .sort({ createdAt: -1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/messages/:id/read
exports.markRead = async (req, res) => {
  try {
    await Message.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
