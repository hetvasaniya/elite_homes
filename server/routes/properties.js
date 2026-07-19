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
} = require('../controllers/propertyController');

router.get('/', getProperties);
router.get('/my', auth, getMyProperties);
router.get('/:id', getPropertyById);
router.post('/', auth, (req, res, next) => {
  uploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, createProperty);
router.put('/:id', auth, updateProperty);
router.delete('/:id', auth, deleteProperty);

module.exports = router;
