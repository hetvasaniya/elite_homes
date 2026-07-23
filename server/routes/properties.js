const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const {
  getProperties,
  getMyProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  uploadMiddleware,
  uploadDocsMiddleware,
  uploadPropertyDocuments,
} = require('../controllers/propertyController');

// Public
router.get('/', getProperties);
router.get('/my', auth, getMyProperties);
router.get('/:id', getPropertyById);

// Create property with image upload
router.post('/', auth, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, createProperty);

// Upload ownership documents to an existing property
router.post('/:id/documents', auth, (req, res, next) => {
  uploadDocsMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadPropertyDocuments);

// Update / Delete
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

module.exports = router;
