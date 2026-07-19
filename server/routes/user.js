const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getProfile, updateProfile, toggleSave, getSaved } = require('../controllers/userController');

router.get('/profile', auth, getProfile);
router.put('/profile', auth, updateProfile);
router.post('/save/:propertyId', auth, toggleSave);
router.get('/saved', auth, getSaved);

module.exports = router;
