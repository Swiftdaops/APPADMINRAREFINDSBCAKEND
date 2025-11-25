const jwt = require('jsonwebtoken');

const ownerProtect = (req, res, next) => {
  // Defensive logging to help debug 401s
  // Log origin, cookies and authorization headers when present
  try {
    // eslint-disable-next-line no-console
    console.info('[ownerProtect] origin=', req.headers.origin, 'cookies=', req.headers.cookie);
  } catch (e) {
    // ignore logging errors
  }

  const token = req.cookies && req.cookies.owner_jwt;
  if (!token) {
    // eslint-disable-next-line no-console
    console.warn('[ownerProtect] no owner_jwt cookie present');
    res.status(401).json({ message: 'Not authorized, no owner token' });
    return;
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Attach minimal owner info to request
    req.owner = { id: decoded.id || decoded.sub || 'dev-owner', email: decoded.email };
    // eslint-disable-next-line no-console
    console.info('[ownerProtect] owner authenticated:', req.owner.email || req.owner.id);
    next();
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[ownerProtect] token verification failed:', err && err.message);
    res.status(401).json({ message: 'Not authorized, token failed' });
  }
};

module.exports = { ownerProtect };
