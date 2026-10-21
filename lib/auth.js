const crypto = require('crypto');

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000; // 8 hours
const COOKIE_NAME = 'nimbus_session';

function base64url(buffer) {
  return Buffer.from(buffer).toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function signPayload(payload, secret) {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

function safeEqual(a, b) {
  const aHash = crypto.createHash('sha256').update(String(a)).digest();
  const bHash = crypto.createHash('sha256').update(String(b)).digest();
  return crypto.timingSafeEqual(aHash, bHash);
}

function parseCookies(header) {
  const out = {};
  if (!header) return out;
  header.split(';').forEach((part) => {
    const idx = part.indexOf('=');
    if (idx === -1) return;
    const key = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (key) out[key] = decodeURIComponent(value);
  });
  return out;
}

/** True when the request arrived over TLS (directly or via a proxy). */
function isSecureRequest(req) {
  if (!req) return false;

  const forwarded = req.headers && req.headers['x-forwarded-proto'];
  if (typeof forwarded === 'string' && forwarded.length) {
    if (forwarded.split(',')[0].trim().toLowerCase() === 'https') return true;
  }

  if (req.socket && req.socket.encrypted) return true;
  return false;
}

function createAuth(options) {
  const adminPassword = options.adminPassword || '';
  const secret = options.secret || 'nimbus-insecure-default-secret';
  const secure = Boolean(options.secure);

  function isConfigured() {
    return adminPassword.length > 0;
  }

  function verifyPassword(candidate) {
    if (!isConfigured()) return false;
    return safeEqual(candidate || '', adminPassword);
  }

  function issueToken() {
    const now = Date.now();
    const payload = base64url(JSON.stringify({ v: 1, iat: now, exp: now + TOKEN_TTL_MS }));
    return payload + '.' + signPayload(payload, secret);
  }

  function verifyToken(token) {
    if (!token || typeof token !== 'string') return false;
    const idx = token.indexOf('.');
    if (idx === -1) return false;

    const payload = token.slice(0, idx);
    const signature = token.slice(idx + 1);
    if (!safeEqual(signature, signPayload(payload, secret))) return false;

    try {
      const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
      return typeof data.exp === 'number' && Date.now() < data.exp;
    } catch (err) {
      return false;
    }
  }

  // Secure is sent when the server runs in production OR the request is https.
  function effectiveSecure(req) {
    return Boolean(secure) || isSecureRequest(req);
  }

  function cookieHeader(token, req) {
    const parts = [
      COOKIE_NAME + '=' + encodeURIComponent(token),
      'Path=/',
      'HttpOnly',
      'SameSite=Lax',
      'Max-Age=' + Math.floor(TOKEN_TTL_MS / 1000)
    ];
    if (effectiveSecure(req)) parts.push('Secure');
    return parts.join('; ');
  }

  function clearCookieHeader(req) {
    const parts = [COOKIE_NAME + '=', 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
    if (effectiveSecure(req)) parts.push('Secure');
    return parts.join('; ');
  }

  function isAuthenticated(req) {
    const cookies = parseCookies(req.headers.cookie);
    return verifyToken(cookies[COOKIE_NAME]);
  }

  return {
    isConfigured,
    verifyPassword,
    issueToken,
    verifyToken,
    cookieHeader,
    clearCookieHeader,
    isAuthenticated,
    cookieName: COOKIE_NAME
  };
}

module.exports = { createAuth, parseCookies, isSecureRequest, COOKIE_NAME, TOKEN_TTL_MS };
