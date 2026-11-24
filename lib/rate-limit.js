/**
 * In-memory fixed-window rate limiter. Zero dependencies, per-process.
 * Used for the admin login endpoint and the public audit inquiry endpoint.
 */
function createRateLimiter({ windowMs, max, message, keyPrefix }) {
  const hits = new Map();
  const prefix = keyPrefix || 'default';

  const sweep = setInterval(() => {
    const now = Date.now();
    hits.forEach((entry, key) => {
      if (now > entry.resetAt) hits.delete(key);
    });
  }, windowMs);

  if (typeof sweep.unref === 'function') sweep.unref();

  function check(key) {
    const now = Date.now();
    const id = prefix + ':' + key;
    const entry = hits.get(id);

    if (!entry || now > entry.resetAt) {
      hits.set(id, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: max - 1, retryAfter: 0, message };
    }

    entry.count += 1;

    if (entry.count > max) {
      return {
        allowed: false,
        remaining: 0,
        retryAfter: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
        message
      };
    }

    return { allowed: true, remaining: max - entry.count, retryAfter: 0, message };
  }

  function reset(key) {
    hits.delete(prefix + ':' + key);
  }

  return { check, reset };
}

/**
 * Client IP for rate limiting.
 *
 * X-Forwarded-For is written by the client unless a trusted reverse proxy
 * overwrites it, so trusting it by default let anyone dodge the login lockout
 * by sending a new fake address with every guess. It is only honoured when
 * TRUST_PROXY=1 is set (deploy behind nginx/Cloudflare/etc.); then the
 * right-most entry, the one the proxy itself appended, is used.
 */
function clientIp(req) {
  const trustProxy = /^(1|true|yes)$/i.test(String(process.env.TRUST_PROXY || ''));
  if (trustProxy) {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string' && forwarded.length) {
      const hops = forwarded.split(',').map((part) => part.trim()).filter(Boolean);
      if (hops.length) return hops[hops.length - 1];
    }
  }
  return req.socket ? req.socket.remoteAddress : 'unknown';
}

module.exports = { createRateLimiter, clientIp };
