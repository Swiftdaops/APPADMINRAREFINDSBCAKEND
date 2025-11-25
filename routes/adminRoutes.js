const express = require('express');
const router = express.Router();
const {
  loginAdmin,
  logoutAdmin,
  getAdminProfile,
} = require('../controllers/adminAuthController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/logout', logoutAdmin);
router.get('/profile', protect, getAdminProfile);
// Alias for legacy frontend route `/me`
router.get('/me', protect, getAdminProfile);

module.exports = router;
