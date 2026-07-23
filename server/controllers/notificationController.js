const User = require('../models/User');

// ─── GET /api/notifications ───────────────────────────────────
exports.getNotifications = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    if (!user) return res.status(404).json({ message: 'User not found.' });

    res.json(user.notifications || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/notifications/unread-count ─────────────────────
exports.getUnreadCount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('notifications');
    if (!user) return res.json({ count: 0 });

    const count = (user.notifications || []).filter((n) => !n.isRead).length;
    res.json({ count });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/notifications/:notifId/read ────────────────────
exports.markRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id, 'notifications._id': req.params.notifId },
      { $set: { 'notifications.$.isRead': true } }
    );
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/notifications/mark-all-read ────────────────────
exports.markAllRead = async (req, res) => {
  try {
    await User.updateOne(
      { _id: req.user._id },
      { $set: { 'notifications.$[].isRead': true } }
    );
    res.json({ message: 'All notifications marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
