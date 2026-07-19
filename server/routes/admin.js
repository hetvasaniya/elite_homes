const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  getContactMessages,
  markContactRead,
  createAdmin,
  uploadDocument,
  getDocuments,
  deleteDocument,
  docUploadMiddleware,
} = require('../controllers/adminController');

const guard = [auth, adminOnly];

router.get('/stats', guard, getStats);
router.get('/users', guard, getAllUsers);
router.put('/users/:id/status', guard, toggleUserStatus);
router.get('/messages', guard, getContactMessages);
router.put('/messages/:id/read', guard, markContactRead);
router.post('/create-admin', guard, createAdmin);
router.post('/upload-document', guard, (req, res, next) => {
  docUploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadDocument);
router.get('/documents', guard, getDocuments);
router.delete('/documents/:id', guard, deleteDocument);

module.exports = router;
