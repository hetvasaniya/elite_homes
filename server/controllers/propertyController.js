const Property = require('../models/Property');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer Config ────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/properties');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
}).array('images', 6);

exports.uploadMiddleware = upload;

// GET /api/properties
exports.getProperties = async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice, status } = req.query;
    const filter = {};

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type && ['Sell', 'Rent'].includes(type)) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    filter.status = status || 'Active';

    const properties = await Property.find(filter)
      .populate('owner', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/properties/my
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/properties/:id
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id).populate('owner', 'name email profilePicture');
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/properties
exports.createProperty = async (req, res) => {
  try {
    const { title, location, type, description, price, bedrooms, bathrooms, area } = req.body;
    if (!title || !location || !type || !price)
      return res.status(400).json({ message: 'Title, location, type, and price are required.' });

    const images = req.files ? req.files.map((f) => `/uploads/properties/${f.filename}`) : [];

    const property = await Property.create({
      title,
      location,
      type,
      description,
      price: Number(price),
      bedrooms: Number(bedrooms) || 0,
      bathrooms: Number(bathrooms) || 0,
      area: Number(area) || 0,
      images,
      owner: req.user._id,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/properties/:id
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to edit this property.' });

    const updated = await Property.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/properties/:id
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to delete this property.' });

    await property.deleteOne();
    res.json({ message: 'Property deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
