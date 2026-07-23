const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const adminOnly = require('../middleware/adminOnly');
const {
  getStats,
  getAllUsers,
  toggleUserStatus,
  deleteUser,
  getContactMessages,
  markContactRead,
  createAdmin,
  createEmployee,
  getAllEmployees,
  getAllProperties,
  deleteProperty,
  uploadDocument,
  getDocuments,
  deleteDocument,
  docUploadMiddleware,
} = require('../controllers/adminController');

const guard = [auth, adminOnly];

// Stats
router.get('/stats', guard, getStats);

// Users
router.get('/users', guard, getAllUsers);
router.put('/users/:id/status', guard, toggleUserStatus);
router.delete('/users/:id', guard, deleteUser);

// Employees
router.get('/employees', guard, getAllEmployees);
router.post('/create-employee', guard, createEmployee);

// Properties
router.get('/properties', guard, getAllProperties);
router.delete('/properties/:id', guard, deleteProperty);

// Contact Messages
router.get('/messages', guard, getContactMessages);
router.put('/messages/:id/read', guard, markContactRead);

// Admin management
router.post('/create-admin', guard, createAdmin);

// Documents
router.post('/upload-document', guard, (req, res, next) => {
  docUploadMiddleware(req, res, (err) => {
    if (err) return res.status(400).json({ message: err.message });
    next();
  });
}, uploadDocument);
router.get('/documents', guard, getDocuments);
router.delete('/documents/:id', guard, deleteDocument);

module.exports = router;
