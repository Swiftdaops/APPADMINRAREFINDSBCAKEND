const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Decide secure flag: in production we must send secure cookies when using SameSite=None.
  // Also allow an explicit override via FORCE_SECURE_COOKIES=true (useful if your platform
  // sets NODE_ENV differently or you need to force secure cookies).
  const isProduction = process.env.NODE_ENV === 'production';
  const forceSecure = process.env.FORCE_SECURE_COOKIES === 'true';
  const secureFlag = isProduction || forceSecure;

  const cookieOptions = {
    httpOnly: true,
    secure: secureFlag,
    sameSite: 'true', // allow cross-site cookie for admin frontend
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  // Helpful debug log when troubleshooting cookie/CORS behavior in production
  if (process.env.DEBUG_COOKIE === 'true') {
    // eslint-disable-next-line no-console
    console.log('[auth] set admin_jwt cookie options:', cookieOptions);
  }

  // Set HTTP-Only Cookie
  res.cookie('admin_jwt', token, cookieOptions);
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;
    console.log('[loginAdmin] Attempting login for username:', username);

    const admin = await Admin.findOne({ username });
    console.log('[loginAdmin] Admin found:', !!admin);

    if (admin && (await admin.matchPassword(password))) {
      console.log('[loginAdmin] Password match, generating token');
      generateToken(res, admin._id);
      return res.status(200).json({
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        message: 'Login successful'
      });
    }

    console.log('[loginAdmin] Invalid credentials');
    res.status(401).json({ message: 'Invalid username or password' });
  } catch (err) {
    // Log the full error server-side to help diagnose 502s/500s
    // eslint-disable-next-line no-console
    console.error('[loginAdmin] error:', err && err.stack ? err.stack : err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
const logoutAdmin = (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  const secureFlag = isProduction || process.env.FORCE_SECURE_COOKIES === 'true';

  res.cookie('admin_jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'None', // CORRECTED for consistency
    secure: secureFlag,
  });
  res.status(200).json({ message: 'Logged out successfully' });
};

// @desc    Get Admin Profile
// @route   GET /api/admin/profile
const getAdminProfile = (req, res) => {
  const admin = {
    _id: req.admin._id,
    username: req.admin.username,
    role: req.admin.role,
  };
  res.status(200).json(admin);
};

module.exports = {
  loginAdmin,
  logoutAdmin,
  getAdminProfile
};
