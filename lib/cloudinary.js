const crypto = require('crypto');
const https = require('https');
const fs = require('fs');

const API_BASE = 'https://api.cloudinary.com';
const DELIVERY_BASE = 'https://res.cloudinary.com';

const RESOURCE_TYPES = ['image', 'video', 'raw', 'auto'];

/* ------------------------------------------------------------------
   SIGNING
   ------------------------------------------------------------------ */

/**
 * Cloudinary's signature scheme: sha1 over the alphabetically sorted
 * `key=value&...` string of signed params, with api_secret appended.
 * `file`, `cloud_name`, `api_key` and `resource_type` are never signed.
 */
function buildSignature(params, apiSecret) {
  const excluded = ['file', 'cloud_name', 'api_key', 'resource_type'];

  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== null && params[key] !== '')
    .filter((key) => excluded.indexOf(key) === -1)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&');

  return crypto.createHash('sha1').update(query + apiSecret).digest('hex');
}

/* ------------------------------------------------------------------
   URL BUILDERS
   ------------------------------------------------------------------ */

function normalizeResourceType(resourceType) {
  const value = String(resourceType || 'image').toLowerCase();
  return RESOURCE_TYPES.indexOf(value) === -1 ? 'image' : value;
}

function uploadUrl(cloudName, resourceType) {
  const type = normalizeResourceType(resourceType);
  return `${API_BASE}/v1_1/${cloudName}/${type === 'auto' ? 'auto' : type}/upload`;
}

function deliveryUrl(cloudName, publicId, resourceType, options) {
  const opts = options || {};
  const type = normalizeResourceType(resourceType);
  const clean = String(publicId || '').replace(/^\/+/, '');

  if (type === 'image') {
    const transforms = opts.transforms || 'f_auto,q_auto';
    return `${DELIVERY_BASE}/${cloudName}/image/upload/${transforms}/${clean}`;
  }
  if (type === 'video') {
    const transforms = opts.transforms || 'q_auto';
    return `${DELIVERY_BASE}/${cloudName}/video/upload/${transforms}/${clean}`;
  }
  return `${DELIVERY_BASE}/${cloudName}/raw/upload/${clean}`;
}

/* ------------------------------------------------------------------
   ADMIN API
   ------------------------------------------------------------------ */

function adminRequest(options) {
  return new Promise((resolve, reject) => {
    const url = new URL(options.path, API_BASE);

    let payload = null;
    const headers = { Accept: 'application/json' };

    if (options.form) {
      const form = new URLSearchParams();
      Object.keys(options.form).forEach((key) => {
        if (options.form[key] !== undefined && options.form[key] !== null) {
          form.append(key, options.form[key]);
        }
      });
      payload = Buffer.from(form.toString());
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    } else if (options.body) {
      payload = Buffer.from(JSON.stringify(options.body));
      headers['Content-Type'] = 'application/json';
    }

    const requestOptions = {
      method: options.method,
      hostname: url.hostname,
      path: url.pathname + url.search,
      auth: `${options.apiKey}:${options.apiSecret}`,
      headers: headers
    };

    if (payload) requestOptions.headers['Content-Length'] = payload.length;

    const req = https.request(requestOptions, (res) => {
      let raw = '';
      res.on('data', (chunk) => { raw += chunk; });
      res.on('end', () => {
        let parsed = null;
        try { parsed = raw ? JSON.parse(raw) : null; } catch (err) { parsed = { raw }; }

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ ok: true, status: res.statusCode, data: parsed });
        } else {
          const message = (parsed && parsed.error && parsed.error.message) || `Cloudinary returned ${res.statusCode}`;
          const error = new Error(message);
          error.status = res.statusCode;
          error.body = parsed;
          reject(error);
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

function listResources(config, query) {
  const params = new URLSearchParams();
  params.set('type', 'upload');
  params.set('max_results', String((query && query.maxResults) || 40));
  if (query && query.cursor) params.set('next_cursor', query.cursor);
  if (query && query.prefix) params.set('prefix', query.prefix);
  if (query && query.resourceType && query.resourceType !== 'all') {
    params.set('resource_type', query.resourceType);
  }

  const path = `/v1_1/${config.cloudName}/resources?${params.toString()}`;
  return adminRequest({
    method: 'GET',
    path,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
  });
}

/**
 * Destroy an asset.
 * The DELETE /:resource_type/upload/:public_id route does not accept a
 * folder prefix, so the documented POST /:resource_type/destroy form is used
 * instead. `invalidate=true` purges the CDN copy.
 */
function deleteResource(config, publicId, resourceType) {
  const type = normalizeResourceType(resourceType);
  const clean = String(publicId || '').replace(/^\/+/, '');

  return adminRequest({
    method: 'POST',
    path: `/v1_1/${config.cloudName}/${type}/destroy`,
    form: { public_id: clean, invalidate: 'true', resource_type: type },
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
  });
}

/**
 * Search API — unlike GET /resources, this reliably returns assets that live
 * inside a folder (e.g. "nimbus/..."). Used as the primary listing source.
 */
function searchResources(config, query) {
  const q = query || {};
  const clauses = [];

  const folder = q.folder || config.folder;
  if (folder) clauses.push(`folder:${folder}`);

  if (q.resourceType && q.resourceType !== 'all') {
    clauses.push(`resource_type:${normalizeResourceType(q.resourceType)}`);
  }

  if (q.term) {
    const safe = String(q.term).replace(/[^a-zA-Z0-9_-]/g, '');
    if (safe) clauses.push(`(public_id:*${safe}* OR asset_folder:*${safe}*)`);
  }

  const expression = clauses.length ? clauses.join(' AND ') : 'resource_type:image OR resource_type:video';

  const body = {
    expression: expression,
    max_results: Math.min(Number(q.maxResults) || 40, 100),
    sort_by: [{ created_at: 'desc' }]
  };
  if (q.cursor) body.next_cursor = q.cursor;

  return adminRequest({
    method: 'POST',
    path: `/v1_1/${config.cloudName}/resources/search`,
    body,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
  });
}

function createUploadPreset(config, presetName, settings) {
  const body = {
    name: presetName,
    unsigned: false,
    settings: Object.assign({
      folder: config.folder,
      max_file_size: 26214400,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif', 'svg', 'mp4', 'webm', 'mov', 'm4v'],
      disallow_public_id: true,
      use_filename: false
    }, settings || {})
  };

  return adminRequest({
    method: 'POST',
    path: `/v1_1/${config.cloudName}/upload_presets`,
    body,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
  });
}

function listUploadPresets(config) {
  return adminRequest({
    method: 'GET',
    path: `/v1_1/${config.cloudName}/upload_presets?max_results=100`,
    apiKey: config.apiKey,
    apiSecret: config.apiSecret
  });
}

/* ------------------------------------------------------------------
   LOCAL FALLBACK
   ------------------------------------------------------------------ */

function isCloudinaryConfigured(config) {
  return Boolean(
    config &&
    config.cloudName &&
    config.apiKey &&
    config.apiSecret
  );
}

module.exports = {
  API_BASE,
  DELIVERY_BASE,
  RESOURCE_TYPES,
  buildSignature,
  uploadUrl,
  deliveryUrl,
  adminRequest,
  listResources,
  searchResources,
  deleteResource,
  createUploadPreset,
  listUploadPresets,
  isCloudinaryConfigured,
  normalizeResourceType
};
