const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const employeeOrAdmin = require('../middleware/employeeOrAdmin');
const {
  getPendingProperties,
  getAllPropertiesForEmployee,
  getPropertyForReview,
  approveProperty,
  rejectProperty,
} = require('../controllers/employeeController');

const guard = [auth, employeeOrAdmin];

router.get('/pending', guard, getPendingProperties);
router.get('/stats', guard, getAllPropertiesForEmployee);
router.get('/properties/:id', guard, getPropertyForReview);
router.put('/properties/:id/approve', guard, approveProperty);
router.put('/properties/:id/reject', guard, rejectProperty);

module.exports = router;
