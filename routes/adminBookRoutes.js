const express = require('express');
const router = express.Router();
const { deleteByTitles } = require('../controllers/adminBookController');
const { protect } = require('../middleware/authMiddleware');

// Protected admin route to delete books by title (dev tool)
router.post('/delete-by-title', protect, deleteByTitles);

module.exports = router;
