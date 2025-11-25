const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const generateToken = (res, userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Set HTTP-Only Cookie
  res.cookie('admin_jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development', // Use secure in production
    sameSite: 'none', // allow cross-site cookie for admin frontend
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
  try {
    const { username, password } = req.body;

    const admin = await Admin.findOne({ username });

    if (admin && (await admin.matchPassword(password))) {
      generateToken(res, admin._id);
      return res.status(200).json({
        _id: admin._id,
        username: admin.username,
        role: admin.role,
        message: 'Login successful'
      });
    }

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
  res.cookie('admin_jwt', '', {
    httpOnly: true,
    expires: new Date(0),
    sameSite: 'none',
    secure: process.env.NODE_ENV !== 'development',
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
