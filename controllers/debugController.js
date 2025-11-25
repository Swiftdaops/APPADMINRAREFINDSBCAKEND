// Dev-only debug controller: returns request headers and CORS-related info
exports.headers = (req, res) => {
  // Return a minimal, safe view of headers so the browser can confirm what
  // was sent to the server (useful for debugging CORS/origin issues).
  const safeHeaders = {};
  Object.keys(req.headers || {}).forEach((k) => {
    // avoid echoing any potentially large cookies in the debug view
    if (k === 'cookie') return;
    safeHeaders[k] = req.headers[k];
  });

  res.json({
    origin: req.headers.origin || null,
    method: req.method,
    path: req.originalUrl,
    headers: safeHeaders,
  });
};
