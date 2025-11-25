const express = require('express');
const router = express.Router();
const { getTheme, updateTheme, testUpdateTheme } = require('../controllers/themeController');
const { protect } = require('../middleware/authMiddleware');

// Get current global theme
router.get('/debug', (req, res) => res.json({ ok: true, now: Date.now() }));
router.get('/theme', getTheme);

// Update global theme (restricted to authenticated admin)
router.post('/theme', protect, updateTheme);

// DEV-only helper: update theme without auth (only in development mode)
router.post('/theme/test-update', testUpdateTheme);

module.exports = router;
