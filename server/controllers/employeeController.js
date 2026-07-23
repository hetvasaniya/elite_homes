const Property = require('../models/Property');
const PropertyDocument = require('../models/PropertyDocument');
const User = require('../models/User');

// Helper: push notification to property owner
const notifyOwner = async (ownerId, { title, message, type, propertyId }) => {
  try {
    await User.findByIdAndUpdate(ownerId, {
      $push: {
        notifications: {
          $each: [{ title, message, type, propertyId, isRead: false, createdAt: new Date() }],
          $position: 0, // newest first
          $slice: 50,   // keep max 50 notifications
        },
      },
    });
  } catch (err) {
    console.error('Failed to push notification:', err.message);
  }
};

// ─── GET /api/employee/pending ─────────────────────────────────
exports.getPendingProperties = async (req, res) => {
  try {
    const properties = await Property.find({ status: 'pending' })
      .populate('owner', 'name email profilePicture')
      .populate('documents')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/employee/properties (all — for stats) ───────────
exports.getAllPropertiesForEmployee = async (req, res) => {
  try {
    const [pending, approved, rejected] = await Promise.all([
      Property.countDocuments({ status: 'pending' }),
      Property.countDocuments({ status: 'approved' }),
      Property.countDocuments({ status: 'rejected' }),
    ]);
    res.json({ pending, approved, rejected, total: pending + approved + rejected });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/employee/properties/:id ─────────────────────────
exports.getPropertyForReview = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .populate('documents')
      .populate('reviewedBy', 'name email');

    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/employee/properties/:id/approve ─────────────────
exports.approveProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    if (property.status === 'approved') {
      return res.status(400).json({ message: 'Property is already approved.' });
    }

    property.status = 'approved';
    property.reviewedBy = req.user._id;
    property.approvedAt = new Date();
    property.rejectionRemark = '';
    await property.save();

    // Notify owner
    await notifyOwner(property.owner, {
      title: '🎉 Property Approved!',
      message: `Your property "${property.title}" has been approved and is now live on EliteEstate.`,
      type: 'approved',
      propertyId: property._id,
    });

    // Emit socket event if io is available
    if (req.io) {
      req.io.to(`user_${property.owner}`).emit('notification', {
        title: '🎉 Property Approved!',
        message: `Your property "${property.title}" has been approved.`,
        type: 'approved',
      });
    }

    res.json({ message: 'Property approved successfully.', property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/employee/properties/:id/reject ──────────────────
exports.rejectProperty = async (req, res) => {
  try {
    const { remark } = req.body;
    if (!remark || !remark.trim()) {
      return res.status(400).json({ message: 'Rejection remark is required.' });
    }

    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    property.status = 'rejected';
    property.reviewedBy = req.user._id;
    property.rejectionRemark = remark.trim();
    property.approvedAt = null;
    await property.save();

    // Notify owner
    await notifyOwner(property.owner, {
      title: '❌ Property Rejected',
      message: `Your property "${property.title}" was rejected. Reason: ${remark.trim()}`,
      type: 'rejected',
      propertyId: property._id,
    });

    // Emit socket event if io is available
    if (req.io) {
      req.io.to(`user_${property.owner}`).emit('notification', {
        title: '❌ Property Rejected',
        message: `Your property "${property.title}" was rejected. Reason: ${remark.trim()}`,
        type: 'rejected',
      });
    }

    res.json({ message: 'Property rejected successfully.', property });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
