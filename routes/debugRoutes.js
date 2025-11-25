const express = require('express');
const router = express.Router();
const { headers } = require('../controllers/debugController');

// Dev-only: GET /api/debug/headers -> returns request headers (no cookie)
router.get('/headers', headers);

module.exports = router;
