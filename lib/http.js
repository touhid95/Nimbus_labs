const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=()'
};

function normalizeOrigin(origin) {
  if (!origin) return '';
  return String(origin).trim().replace(/\/+$/, '').toLowerCase();
}

function createCors({ allowedOrigins, dev }) {
  const allowed = new Set((allowedOrigins || []).map(normalizeOrigin).filter(Boolean));

  if (dev) {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
    allowed.add('http://localhost:5173');
    allowed.add('http://127.0.0.1:5173');
  }

  function allowedOriginFor(req) {
    const origin = req.headers.origin;
    if (!origin) return null;              // same-origin / non-browser request
    if (allowed.has(normalizeOrigin(origin))) return origin;
    return null;
  }

  function headers(req) {
    const base = Object.assign({}, SECURITY_HEADERS, {
      'Vary': 'Origin',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });

    const origin = allowedOriginFor(req);
    if (origin) {
      base['Access-Control-Allow-Origin'] = origin;
      base['Access-Control-Allow-Credentials'] = 'true';
      base['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      base['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    }

    return base;
  }

  return { headers, allowedOriginFor };
}

function sendJson(res, statusCode, payload, extraHeaders) {
  const headers = Object.assign({}, SECURITY_HEADERS, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  }, extraHeaders || {});

  res.writeHead(statusCode, headers);
  res.end(JSON.stringify(payload));
}

function sendText(res, statusCode, text, extraHeaders) {
  const headers = Object.assign({}, SECURITY_HEADERS, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache'
  }, extraHeaders || {});

  res.writeHead(statusCode, headers);
  res.end(text);
}

function redirect(res, location) {
  res.writeHead(302, Object.assign({}, SECURITY_HEADERS, { Location: location }));
  res.end();
}

module.exports = { createCors, sendJson, sendText, redirect, SECURITY_HEADERS };
