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

/** Best-effort client IP from a Node http request. */
function clientIp(req) {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length) {
    return forwarded.split(',')[0].trim();
  }
  return req.socket ? req.socket.remoteAddress : 'unknown';
}

module.exports = { createRateLimiter, clientIp };
