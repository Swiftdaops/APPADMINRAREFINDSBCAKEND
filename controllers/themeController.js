const ThemeSetting = require('../models/ThemeSetting');
const axios = require('axios');

// GET /api/appadmin/settings/theme
// Public: admin UI will still be protected at route level
exports.getTheme = async (req, res, next) => {
  try {
    let doc = await ThemeSetting.findOne({ key: 'global-theme' }).lean();
    if (!doc) {
      doc = await ThemeSetting.create({ key: 'global-theme', themeMode: 'dark' });
    }
    res.json({ themeMode: doc.themeMode });
  } catch (err) {
    // dev-friendly logging to help diagnose 500s seen by the frontend
    // eslint-disable-next-line no-console
    console.error('[themeController:getTheme] error:', err && err.stack ? err.stack : err, 'origin=', req && req.headers && req.headers.origin);
    next(err);
  }
};

// POST /api/appadmin/settings/theme
// Body: { themeMode: 'light' | 'dark' }
exports.updateTheme = async (req, res, next) => {
  try {
    // Normalize incoming value and log for easier debugging
    // Accept capitalized or string values like 'Light' -> 'light'
    let { themeMode } = req.body || {};
    // eslint-disable-next-line no-console
    console.info('[themeController:updateTheme] incoming themeMode:', themeMode);
    if (typeof themeMode === 'string') themeMode = themeMode.trim().toLowerCase();
    if (!['light', 'dark'].includes(themeMode)) {
      return res.status(400).json({ message: 'Invalid theme mode' });
    }

    const doc = await ThemeSetting.findOneAndUpdate(
      { key: 'global-theme' },
      { themeMode },
      { new: true, upsert: true }
    ).lean();

    // Emit Socket.io event so all connected clients can update in real time
    const io = req.app.get('io');
    if (io) {
      io.emit('theme:update', { themeMode: doc.themeMode });
    }

    // Notify owner-backend (server-to-server) if configured. This is best-effort
    // and will not affect the main response if the notification fails.
    const ownerBase = process.env.OWNER_BACKEND_URL;
    if (ownerBase) {
      try {
        const headers = {};
        if (process.env.OWNER_SHARED_SECRET) {
          headers['x-internal-secret'] = process.env.OWNER_SHARED_SECRET;
        }
        // send a short timeout so a slow owner backend doesn't block the response
        await axios.post(`${ownerBase.replace(/\/$/, '')}/api/internal/theme-sync`, { themeMode: doc.themeMode }, { headers, timeout: 2000 });
      } catch (notifyErr) {
        // eslint-disable-next-line no-console
        console.warn('[themeController] failed to notify owner-backend', notifyErr && notifyErr.message);
      }
    }

    res.json({ themeMode: doc.themeMode });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[themeController:updateTheme] error:', err && err.stack ? err.stack : err, 'origin=', req && req.headers && req.headers.origin);
    next(err);
  }
};

// DEV-only: update theme without auth and emit (only when NODE_ENV === 'development')
exports.testUpdateTheme = async (req, res, next) => {
  try {
    if (process.env.NODE_ENV !== 'development') {
      return res.status(403).json({ message: 'Not allowed' });
    }
    const { themeMode } = req.body;
    if (!['light', 'dark'].includes(themeMode)) {
      return res.status(400).json({ message: 'Invalid theme mode' });
    }

    const doc = await ThemeSetting.findOneAndUpdate(
      { key: 'global-theme' },
      { themeMode },
      { new: true, upsert: true }
    ).lean();

    const io = req.app.get('io');
    if (io) io.emit('theme:update', { themeMode: doc.themeMode });

    res.json({ themeMode: doc.themeMode, dev: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('[themeController:testUpdateTheme] error:', err && err.stack ? err.stack : err, 'origin=', req && req.headers && req.headers.origin);
    next(err);
  }
};
