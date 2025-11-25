const express = require('express');
const router = express.Router();
const { listEbooks } = require('../controllers/ebookController');

// Public for admins; mounted under /api/appadmin/ebooks
router.get('/', listEbooks);

module.exports = router;
