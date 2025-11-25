const express = require('express');
const router = express.Router();
const { approveOwnerByEmail, deleteOwnerByEmail } = require('../controllers/ownerAdminController');
const { protect } = require('../middleware/authMiddleware');

// Approve owner (admin must be authenticated via cookie)
router.post('/approve', protect, approveOwnerByEmail);

// Delete owner
router.delete('/:email', protect, deleteOwnerByEmail);

// List owners (with optional ?status=)
const { listOwners } = require('../controllers/ownerAdminController');
router.get('/', protect, listOwners);

module.exports = router;
