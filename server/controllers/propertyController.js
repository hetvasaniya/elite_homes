const Property = require('../models/Property');
const PropertyDocument = require('../models/PropertyDocument');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer: Property Images ──────────────────────────────────
const imgStorage = multer.diskStorage({
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

const uploadImages = multer({
  storage: imgStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Only image files are allowed.'));
  },
}).array('images', 6);

// ─── Multer: Ownership Documents ──────────────────────────────
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/property-docs');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const uploadDocs = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = /pdf|jpeg|jpg|png/;
    const extAllowed = allowed.test(path.extname(file.originalname).toLowerCase());
    const mimeAllowed = /application\/pdf|image\/(jpeg|jpg|png)/.test(file.mimetype);
    if (extAllowed && mimeAllowed) cb(null, true);
    else cb(new Error('Only PDF, JPG, and PNG files are allowed for documents.'));
  },
}).array('documents', 5);

// ─── Combined upload middleware (images + docs in one request) ─
exports.uploadMiddleware = (req, res, next) => {
  uploadImages(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    // Images are now in req.files. Store them, then process docs separately.
    next();
  });
};

exports.uploadDocsMiddleware = (req, res, next) => {
  uploadDocs(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
};

// ─── GET /api/properties (PUBLIC — approved only) ─────────────
exports.getProperties = async (req, res) => {
  try {
    const { location, type, minPrice, maxPrice } = req.query;
    const filter = { status: 'approved' }; // Public sees only approved

    if (location) filter.location = { $regex: location, $options: 'i' };
    if (type && ['Sell', 'Rent'].includes(type)) filter.type = type;
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }

    const properties = await Property.find(filter)
      .populate('owner', 'name email profilePicture')
      .sort({ createdAt: -1 });

    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/properties/my (OWNER — all statuses) ────────────
exports.getMyProperties = async (req, res) => {
  try {
    const properties = await Property.find({ owner: req.user._id })
      .populate('documents')
      .sort({ createdAt: -1 });
    res.json(properties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── GET /api/properties/:id ──────────────────────────────────
exports.getPropertyById = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('owner', 'name email profilePicture')
      .populate('documents');
    if (!property) return res.status(404).json({ message: 'Property not found.' });
    res.json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/properties (CREATE — status: pending) ──────────
exports.createProperty = async (req, res) => {
  try {
    const { title, location, type, description, price, bedrooms, bathrooms, area, latitude, longitude } = req.body;
    if (!title || !location || !type || !price)
      return res.status(400).json({ message: 'Title, location, type, and price are required.' });

    // req.files from images upload middleware
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
      status: 'pending', // Always starts as pending
      latitude: latitude ? Number(latitude) : null,
      longitude: longitude ? Number(longitude) : null,
    });

    res.status(201).json(property);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── POST /api/properties/:id/documents (UPLOAD DOCS) ─────────
exports.uploadPropertyDocuments = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    // Only owner can upload docs
    if (property.owner.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No documents uploaded.' });
    }

    const documentTypes = req.body.documentTypes
      ? JSON.parse(req.body.documentTypes)
      : [];

    const savedDocs = await Promise.all(
      req.files.map((file, i) =>
        PropertyDocument.create({
          property: property._id,
          uploadedBy: req.user._id,
          documentType: documentTypes[i] || 'other',
          fileUrl: `/uploads/property-docs/${file.filename}`,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
        })
      )
    );

    // Link docs to property
    property.documents.push(...savedDocs.map((d) => d._id));
    // Reset to pending if resubmitting after rejection
    if (property.status === 'rejected') {
      property.status = 'pending';
      property.rejectionRemark = '';
      property.reviewedBy = null;
      property.approvedAt = null;
    }
    await property.save();

    res.status(201).json({ message: 'Documents uploaded successfully.', documents: savedDocs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── PUT /api/properties/:id ──────────────────────────────────
exports.updateProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to edit this property.' });

    // If owner edits a rejected property, reset to pending for re-review
    const updateData = { ...req.body };
    if (isOwner && property.status === 'rejected') {
      updateData.status = 'pending';
      updateData.rejectionRemark = '';
      updateData.reviewedBy = null;
      updateData.approvedAt = null;
    }

    // Prevent owners from manually setting status to approved
    if (isOwner && updateData.status === 'approved') {
      delete updateData.status;
    }

    const updated = await Property.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── DELETE /api/properties/:id ───────────────────────────────
exports.deleteProperty = async (req, res) => {
  try {
    const property = await Property.findById(req.params.id);
    if (!property) return res.status(404).json({ message: 'Property not found.' });

    const isOwner = property.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to delete this property.' });

    // Clean up associated documents
    await PropertyDocument.deleteMany({ property: property._id });

    await property.deleteOne();
    res.json({ message: 'Property deleted successfully.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
