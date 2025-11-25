const jwt = require('jsonwebtoken');

// Generate owner token and set cookie
const generateOwnerToken = (res, payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' });
  res.cookie('owner_jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    sameSite: 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });
};

// POST /api/owner/auth/login
// Dev-friendly login: accepts email/password and issues an owner_jwt cookie
const loginOwner = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ message: 'Email required' });
    return;
  }

  // In a production app validate credentials; here we issue a dev token
  const payload = { id: 'dev-owner', email };
  generateOwnerToken(res, payload);
  res.status(200).json({ id: payload.id, email });
};

// POST /api/owner/auth/logout
const logoutOwner = (req, res) => {
  res.cookie('owner_jwt', '', { httpOnly: true, expires: new Date(0) });
  res.status(200).json({ message: 'Owner logged out' });
};

// GET /api/owner/auth/me
const getOwnerMe = (req, res) => {
  // owner info is attached by middleware when token valid
  if (!req.owner) {
    // Defensive logging to help debug 401s
    try {
      // eslint-disable-next-line no-console
      console.warn('[getOwnerMe] request missing owner on req; headers=', {
        origin: req.headers.origin,
        cookie: req.headers.cookie,
        referer: req.headers.referer,
      });
    } catch (e) {
      // ignore
    }
    res.status(401).json({ message: 'Not authenticated' });
    return;
  }

  // eslint-disable-next-line no-console
  console.info('[getOwnerMe] returning owner:', { id: req.owner.id, email: req.owner.email });
  res.status(200).json({ id: req.owner.id, email: req.owner.email });
};

module.exports = { loginOwner, logoutOwner, getOwnerMe };
