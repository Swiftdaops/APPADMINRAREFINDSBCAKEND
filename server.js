const express = require('express');
const http = require('http');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const connectDB = require('./config/db');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const adminRoutes = require('./routes/adminRoutes');
const ownerAdminRoutes = require('./routes/ownerAdminRoutes');
const themeRoutes = require('./routes/themeRoutes');
const ebookRoutes = require('./routes/ebookRoutes');
const ownerAuthRoutes = require('./routes/ownerAuthRoutes');
const adminBookRoutes = require('./routes/adminBookRoutes');
const { listEbooks } = require('./controllers/ebookController');
const debugRoutes = require('./routes/debugRoutes');

dotenv.config();

connectDB();

const app = express();
const server = http.createServer(app);

// Attach Socket.io to the HTTP server and expose on app
const { Server } = require('socket.io');

// Accept multiple frontend origins (comma-separated) or default to Vite port 5173
// Include the production admin frontend on Netlify as a safe default fallback
const rawFrontend = process.env.FRONTEND_ORIGIN || 'https://rarefindsintl.netlify.app';
const allowedOrigins = rawFrontend.split(',').map((s) => s.trim()).filter(Boolean);

// Helper: allow explicit configured origins OR any localhost origin (any port)
function isAllowedOrigin(origin) {
  // allow non-browser requests (no origin)
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  try {
    const u = new URL(origin);
    const host = u.hostname.toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
  } catch (e) {
    // if parsing fails, fall back to strict match
  }
  return false;
}

// In development reflect the requesting origin to simplify local CORS debugging.
const devCors = process.env.NODE_ENV === 'development';
const socketCorsOptions = devCors
  ? { origin: true, credentials: true }
  : {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error('CORS not allowed'));
      },
      credentials: true,
    };

const io = new Server(server, { cors: socketCorsOptions });

app.set('io', io);

// Basic connection logging for Socket.io
io.on('connection', (socket) => {
  console.log('Socket.io client connected:', socket.id);
  socket.on('disconnect', (reason) => {
    console.log('Socket.io client disconnected:', socket.id, reason);
  });
});
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Unconditional request logging to help diagnose routing/CORS in production
app.use((req, res, next) => {
  // eslint-disable-next-line no-console
  console.log('[ROUTE DEBUG]', new Date().toISOString(), 'method=', req.method, 'path=', req.path, 'origin=', req.headers.origin);
  next();
});

// CORS configuration for REST endpoints — allow frontend(s) defined in FRONTEND_ORIGIN
// Use the same dev-friendly behavior for REST endpoints when in development.
const restCorsOptions = devCors
  ? { origin: true, credentials: true }
  : {
      origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) return callback(null, true);
        return callback(new Error('CORS not allowed'));
      },
      credentials: true,
    };

// Dev-only: log incoming origin and request method to help diagnose CORS failures
if (devCors) {
  app.use((req, res, next) => {
    // eslint-disable-next-line no-console
    console.log('[CORS DEBUG] origin=%s method=%s path=%s', req.headers.origin, req.method, req.path);
    next();
  });
}

app.use(cors(restCorsOptions));

// Ensure preflight OPTIONS requests are handled with the same CORS options
app.options('*', cors(restCorsOptions));

// API routes
app.use('/api/admin', adminRoutes);
app.use('/api/admin/owners', ownerAdminRoutes);
app.use('/api/appadmin/settings', themeRoutes);
app.use('/api/appadmin/ebooks', ebookRoutes);
// Owner auth (dev-friendly) mounted under /api/owner/auth
app.use('/api/owner/auth', ownerAuthRoutes);
// Dev-only debug routes
app.use('/api/debug', debugRoutes);
// Admin-only book management routes (protected) — e.g. delete-by-title for dev cleanup
app.use('/api/admin/books', adminBookRoutes);

// Public aliases: expose the same ebook listing under several common paths
// so external frontends can call /api/books, /api/ebooks or /api/public/books
// without changing their code.
app.get('/api/public/books', listEbooks);
app.get('/api/books', listEbooks);
app.get('/api/ebooks', listEbooks);

// Also mount the admin routes under /api/appadmin to remain compatible
// with the frontend which calls /api/appadmin/*
app.use('/api/appadmin', adminRoutes);
app.use('/api/appadmin/owners', ownerAdminRoutes);

app.get('/', (req, res) => {
  res.send('API is running...');
});

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => console.log(`Server started on port ${PORT}`));
