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
    sameSite: 'strict',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  });
};

// @desc    Auth admin & get token
// @route   POST /api/admin/login
const loginAdmin = async (req, res) => {
  const { username, password } = req.body;

  const admin = await Admin.findOne({ username });

  if (admin && (await admin.matchPassword(password))) {
    generateToken(res, admin._id);
    res.status(200).json({
      _id: admin._id,
      username: admin.username,
      role: admin.role,
      message: 'Login successful'
    });
  } else {
    res.status(401);
    throw new Error('Invalid username or password');
  }
};

// @desc    Logout admin
// @route   POST /api/admin/logout
const logoutAdmin = (req, res) => {
  res.cookie('admin_jwt', '', {
    httpOnly: true,
    expires: new Date(0),
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
