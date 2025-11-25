const express = require('express');
const router = express.Router();
const { loginOwner, logoutOwner, getOwnerMe } = require('../controllers/ownerAuthController');
const { ownerProtect } = require('../middleware/ownerAuthMiddleware');

router.post('/login', loginOwner);
router.post('/logout', logoutOwner);
router.get('/me', ownerProtect, getOwnerMe);

module.exports = router;
