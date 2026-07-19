const User = require('../models/User');
const Property = require('../models/Property');

// GET /api/user/profile
exports.getProfile = async (req, res) => {
  try {
    res.json(req.user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/user/profile
exports.updateProfile = async (req, res) => {
  try {
    const { name, profilePicture } = req.body;
    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, profilePicture },
      { new: true, select: '-password' }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/user/save/:propertyId
exports.toggleSave = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const propId = req.params.propertyId;

    const idx = user.savedProperties.findIndex((id) => id.toString() === propId);
    let saved;
    if (idx > -1) {
      user.savedProperties.splice(idx, 1);
      saved = false;
    } else {
      user.savedProperties.push(propId);
      saved = true;
    }

    await user.save();
    res.json({ saved, savedProperties: user.savedProperties });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/user/saved
exports.getSaved = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'savedProperties',
      populate: { path: 'owner', select: 'name email' },
    });
    res.json(user.savedProperties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
