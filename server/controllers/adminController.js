const User = require('../models/User');
const Property = require('../models/Property');
const ContactForm = require('../models/ContactForm');
const Document = require('../models/Document');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Multer for Admin Docs ────────────────────────────────────
const docStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/documents');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const docUpload = multer({
  storage: docStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed.'));
  },
}).single('document');

exports.docUploadMiddleware = docUpload;

// GET /api/admin/stats
exports.getStats = async (req, res) => {
  try {
    const [users, admins, properties, messages, contactMessages] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: 'admin' }),
      Property.countDocuments(),
      ContactForm.countDocuments(),
      ContactForm.countDocuments({ isRead: false }),
    ]);
    res.json({ users, admins, properties, messages, unreadMessages: contactMessages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/users/:id/status
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found.' });
    if (user._id.toString() === req.user._id.toString())
      return res.status(400).json({ message: 'You cannot deactivate your own account.' });

    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully.`, isActive: user.isActive });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/messages
exports.getContactMessages = async (req, res) => {
  try {
    const messages = await ContactForm.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/admin/messages/:id/read
exports.markContactRead = async (req, res) => {
  try {
    await ContactForm.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/create-admin
exports.createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: 'All fields are required.' });

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: 'Email already registered.' });

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const admin = await User.create({ name, email, password: hashedPassword, role: 'admin' });
    res.status(201).json({ message: 'Admin created successfully.', admin: { _id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/admin/upload-document
exports.uploadDocument = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded.' });

    const doc = await Document.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/documents/${req.file.filename}`,
      uploadedBy: req.user._id,
      fileSize: req.file.size,
    });

    res.status(201).json(doc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/documents
exports.getDocuments = async (req, res) => {
  try {
    const docs = await Document.find().populate('uploadedBy', 'name email').sort({ createdAt: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/admin/documents/:id
exports.deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Document not found.' });

    const fullPath = path.join(__dirname, '..', doc.filePath);
    if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);

    await doc.deleteOne();
    res.json({ message: 'Document deleted.' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
