const http = require('http');
const fs = require('fs');
const path = require('path');

const { loadEnv } = require('./lib/env');
const { createAuth } = require('./lib/auth');
const { createCors, sendJson: sendJsonRaw, sendText, redirect } = require('./lib/http');
const { createRateLimiter, clientIp } = require('./lib/rate-limit');
const { createContentStore } = require('./lib/content-store');
const { renderFile } = require('./lib/render');
const cloudinary = require('./lib/cloudinary');

// Load .env BEFORE reading any process.env value. Real env vars always win.
loadEnv();

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PRODUCTION = NODE_ENV === 'production';
const SITE_ORIGIN = process.env.SITE_ORIGIN || 'http://localhost:' + PORT;

const DATA_FILE = path.join(__dirname, 'data', 'site-content.json');
const EXPLORE_DATA_FILE = path.join(__dirname, 'assets', 'explore', 'explore-data.js');
const BACKUPS_DIR = path.join(__dirname, 'data', 'backups');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');

const auth = createAuth({
  adminPassword: process.env.ADMIN_PASSWORD || '',
  secret: process.env.SESSION_SECRET || '',
  secure: IS_PRODUCTION
});

if (!process.env.ADMIN_PASSWORD || !String(process.env.ADMIN_PASSWORD).trim()) {
  console.error('FATAL: ADMIN_PASSWORD is not configured. Set ADMIN_PASSWORD in .env and restart the server.');
  process.exit(1);
}
if (!process.env.SESSION_SECRET || !String(process.env.SESSION_SECRET).trim()) {
  console.error('FATAL: SESSION_SECRET is not configured. Set SESSION_SECRET in .env and restart the server.');
  process.exit(1);
}

const cors = createCors({
  allowedOrigins: [SITE_ORIGIN],
  dev: !IS_PRODUCTION
});

const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 5,
  keyPrefix: 'login',
  message: 'Too many login attempts. Try again in a few minutes.'
});

const inquiryLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  keyPrefix: 'inquiry',
  message: 'Too many requests submitted. Please try again later.'
});

// Endpoints the public site is allowed to reach without a session.
const PUBLIC_API = new Set([
  'GET /api/v1/content',
  'GET /api/v1/products',
  'GET /api/v1/media',
  'POST /api/v1/audit/inquire',
  'GET /api/v1/auth/session'
]);

// Pages that require an authenticated admin session.
const PROTECTED_PAGES = new Set(['/cms.html', '/admin.html']);

// Cloudinary media config. The API secret never leaves the server.
const cloudinaryConfig = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
  apiKey: process.env.CLOUDINARY_API_KEY || '',
  apiSecret: process.env.CLOUDINARY_API_SECRET || '',
  folder: process.env.CLOUDINARY_FOLDER || 'nimbus'
};
const cloudinaryPreset = process.env.CLOUDINARY_UPLOAD_PRESET || 'Nimbus_Cms';

// Ensure necessary directories exist
[path.join(__dirname, 'data'), BACKUPS_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const contentStore = createContentStore({
  dataFile: DATA_FILE,
  exploreDataFile: EXPLORE_DATA_FILE,
  backupsDir: BACKUPS_DIR
});

// Pages rendered on the server with the CMS content before they are sent.
const PAGE_TEMPLATES = new Set(['index.html', 'explore.html', 'audit.html', 'login.html']);

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mov': 'video/quicktime',
  '.m4v': 'video/x-m4v',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.pdf': 'application/pdf'
};

// Helper to read content JSON
function readSiteContent() {
  return contentStore.read();
}

// Helper to parse JSON body from request
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      try {
        const bodyStr = Buffer.concat(chunks).toString('utf8');
        if (!bodyStr) return resolve({});
        const data = JSON.parse(bodyStr);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

// Helper to send JSON responses (CORS restricted to the site origin)
function sendJson(res, statusCode, payload, extraHeaders) {
  const headers = Object.assign(cors.headers(res.req || {}), extraHeaders || {});
  sendJsonRaw(res, statusCode, payload, headers);
}

// Public static allowlist. Only these root files and the assets/ tree are
// reachable over HTTP. Everything else in the project (server.js, lib/, data/,
// .ai/, .git/, *.md, *.py, package.json, .env*) is not served.
const PUBLIC_ROOT_FILES = new Set([
  'index.html', 'explore.html', 'audit.html', 'cms.html', 'login.html',
  'style.css', 'dapper.css', 'explore.css', 'audit.css', 'cms.css',
  'script.js', 'explore.js', 'audit.js', 'cms.js', 'login.js',
  'sw.js', 'manifest.webmanifest'
]);
const PUBLIC_DIRS = ['assets'];

/**
 * Resolve a request path to a readable file inside the project root.
 * Returns null when the path escapes the root, is not on the public
 * allowlist, or has an extension the server does not serve.
 */
function resolveStaticPath(reqPath) {
  if (!reqPath || reqPath.indexOf('\u0000') !== -1) return null;

  const root = path.resolve(__dirname);
  const relative = reqPath.replace(/^[/\\]+/, '');
  const target = path.resolve(root, relative);

  // Containment check: blocks "../" traversal and encoded separators such as
  // %2e%2e (dots) and %5c (backslash) that decodeURI turns into real path
  // characters on Windows.
  if (target !== root && target.indexOf(root + path.sep) !== 0) return null;

  const normalized = target.slice(root.length).replace(/\\/g, '/');
  const segments = normalized.split('/').filter(Boolean);
  if (!segments.length) return null;

  const inPublicDir = PUBLIC_DIRS.indexOf(segments[0]) !== -1;
  const isPublicRootFile = segments.length === 1 && PUBLIC_ROOT_FILES.has(segments[0]);
  if (!inPublicDir && !isPublicRootFile) return null;

  if (!MIME_TYPES[path.extname(target).toLowerCase()]) return null;

  return target;
}

// Helper to collect media files
function getMediaFiles() {
  const mediaList = [];
  const searchDirs = [
    { dir: path.join(__dirname, 'assets'), prefix: './assets/' },
    { dir: path.join(__dirname, 'assets', 'explore'), prefix: './assets/explore/' },
    { dir: path.join(__dirname, 'assets', 'uploads'), prefix: './assets/uploads/' }
  ];

  const allowedExts = new Set(['.jpg', '.jpeg', '.png', '.webp', '.svg', '.webm', '.mp4']);

  searchDirs.forEach(({ dir, prefix }) => {
    if (fs.existsSync(dir)) {
      try {
        const entries = fs.readdirSync(dir, { withFileTypes: true });
        entries.forEach(entry => {
          if (entry.isFile()) {
            const ext = path.extname(entry.name).toLowerCase();
            if (allowedExts.has(ext)) {
              const fullPath = path.join(dir, entry.name);
              const stats = fs.statSync(fullPath);
              mediaList.push({
                name: entry.name,
                path: prefix + entry.name,
                ext: ext.replace('.', ''),
                sizeBytes: stats.size,
                sizeFormatted: (stats.size / 1024).toFixed(1) + ' KB',
                modified: stats.mtime.toISOString(),
                category: prefix.includes('explore') ? 'explore' : (prefix.includes('uploads') ? 'upload' : 'core')
              });
            }
          }
        });
      } catch (e) {
        console.error('Error scanning dir:', dir, e);
      }
    }
  });

  // Sort newest first
  return mediaList.sort((a, b) => new Date(b.modified) - new Date(a.modified));
}

const server = http.createServer(async (req, res) => {
  res.req = req;

  // Handle CORS preflight (restricted to the configured site origin)
  if (req.method === 'OPTIONS') {
    res.writeHead(204, cors.headers(req));
    return res.end();
  }

  // Legacy video upload hook (admin only — it writes straight into assets/)
  if (req.method === 'POST' && req.url === '/save-video') {
    if (!auth.isAuthenticated(req)) {
      return sendJson(res, 401, { status: 'error', message: 'Authentication required' });
    }
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(path.join(__dirname, 'assets', 'research-cognition.webm'), buffer);
      sendJson(res, 200, { success: true, bytes: buffer.length });
    });
    return;
  }

  const rawPath = req.url.split('?')[0];

  // decodeURI throws on malformed sequences such as "/%zz" — answer 400
  // instead of letting the request hang.
  let reqPath;
  try {
    reqPath = decodeURI(rawPath);
  } catch (err) {
    return sendText(res, 400, '400 Bad Request: malformed URL');
  }

  const queryIndex = req.url.indexOf('?');
  const queryParams = new URLSearchParams(queryIndex === -1 ? '' : req.url.slice(queryIndex + 1));

  // Clean-URL routes (static site, no framework router)
  const ROUTES = {
    '/': '/index.html',
    '/explore': '/explore.html',
    '/explore/': '/explore.html',
    '/audit': '/audit.html',
    '/audit/': '/audit.html',
    '/services': '/audit.html',
    '/services/': '/audit.html',
    '/business-audit': '/audit.html',
    '/business-audit/': '/audit.html',
    '/cms': '/cms.html',
    '/cms/': '/cms.html',
    '/admin': '/cms.html',
    '/admin/': '/cms.html',
    '/login': '/login.html',
    '/login/': '/login.html'
  };

  if (Object.prototype.hasOwnProperty.call(ROUTES, reqPath)) {
    reqPath = ROUTES[reqPath];
  }

  /* ------------------------------------------------------------------
     AUTH ENDPOINTS
     ------------------------------------------------------------------ */

  // GET /api/v1/auth/session — is the current visitor an admin?
  if (req.method === 'GET' && reqPath === '/api/v1/auth/session') {
    return sendJson(res, 200, {
      status: 'success',
      data: {
        authenticated: auth.isAuthenticated(req),
        authConfigured: auth.isConfigured()
      }
    });
  }

  // POST /api/v1/auth/login — exchange password for a signed session cookie
  if (req.method === 'POST' && reqPath === '/api/v1/auth/login') {
    if (!auth.isConfigured()) {
      return sendJson(res, 503, {
        status: 'error',
        message: 'Admin access is not configured. Set ADMIN_PASSWORD in .env and restart the server.'
      });
    }

    const ip = clientIp(req);
    const limit = loginLimiter.check(ip);
    if (!limit.allowed) {
      return sendJson(res, 429, { status: 'error', message: limit.message }, { 'Retry-After': String(limit.retryAfter) });
    }

    let payload = {};
    try {
      payload = await parseJsonBody(req);
    } catch (err) {
      return sendJson(res, 400, { status: 'error', message: 'Invalid request body' });
    }

    if (!auth.verifyPassword(payload.password)) {
      return sendJson(res, 401, { status: 'error', message: 'Incorrect password' });
    }

    loginLimiter.reset(ip);
    const token = auth.issueToken();
    return sendJson(res, 200, { status: 'success', message: 'Authenticated' }, {
      'Set-Cookie': auth.cookieHeader(token, req)
    });
  }

  // POST /api/v1/auth/logout — clear the session cookie
  if (req.method === 'POST' && reqPath === '/api/v1/auth/logout') {
    return sendJson(res, 200, { status: 'success', message: 'Signed out' }, {
      'Set-Cookie': auth.clearCookieHeader(req)
    });
  }

  /* ------------------------------------------------------------------
     API AUTH GUARD
     ------------------------------------------------------------------ */

  const apiMatch = reqPath.match(/^\/api\/v1\//);
  if (apiMatch) {
    const signature = req.method + ' ' + reqPath;
    const isPublic = PUBLIC_API.has(signature);
    if (!isPublic && !auth.isAuthenticated(req)) {
      return sendJson(res, 401, { status: 'error', message: 'Authentication required' });
    }
  }

  // Protected admin pages bounce to the login screen.
  if (PROTECTED_PAGES.has(reqPath) && !auth.isAuthenticated(req)) {
    const next = encodeURIComponent(reqPath);
    return redirect(res, '/login?next=' + next);
  }

  /* ------------------------------------------------------------------
     CMS REST API ENDPOINTS
     ------------------------------------------------------------------ */

  // 1. GET /api/v1/content — Full site content
  if (req.method === 'GET' && reqPath === '/api/v1/content') {
    const content = readSiteContent();
    if (!content) {
      return sendJson(res, 500, { status: 'error', message: 'Unable to load site content' });
    }
    return sendJson(res, 200, { status: 'success', data: content });
  }

  // 2. POST /api/v1/content — Save updated site content
  if (req.method === 'POST' && reqPath === '/api/v1/content') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload || !payload.products) {
        return sendJson(res, 400, { status: 'error', message: 'Invalid payload structure: products required' });
      }

      // Migrate to the current schema, sanitize authored HTML, write the
      // content file atomically, snapshot it and regenerate the static
      // explore-data.js contract.
      const stored = contentStore.write(payload);

      return sendJson(res, 200, {
        status: 'success',
        message: 'Content updated and exported to static catalogue successfully',
        timestamp: new Date().toISOString(),
        schemaVersion: stored.schemaVersion
      });
    } catch (err) {
      console.error('Error saving content:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'Server error saving content' });
    }
  }

  // 3. GET /api/v1/content/draft — the editor's working copy (may be null)
  if (req.method === 'GET' && reqPath === '/api/v1/content/draft') {
    const draft = contentStore.readDraft();
    return sendJson(res, 200, {
      status: 'success',
      data: { draft: draft, hasDraft: !!draft }
    });
  }

  // 4. POST /api/v1/content/draft — autosave the working copy
  if (req.method === 'POST' && reqPath === '/api/v1/content/draft') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload || !payload.products) {
        return sendJson(res, 400, { status: 'error', message: 'Invalid payload structure: products required' });
      }
      const draft = contentStore.writeDraft(payload);
      return sendJson(res, 200, {
        status: 'success',
        message: 'Draft saved',
        timestamp: new Date().toISOString(),
        schemaVersion: draft.schemaVersion
      });
    } catch (err) {
      console.error('Error saving draft:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'Server error saving draft' });
    }
  }

  // 5. DELETE /api/v1/content/draft — throw the working copy away
  if (req.method === 'DELETE' && reqPath === '/api/v1/content/draft') {
    contentStore.discardDraft();
    return sendJson(res, 200, { status: 'success', message: 'Draft discarded' });
  }

  // 6. POST /api/v1/content/publish — promote the draft to the live site
  if (req.method === 'POST' && reqPath === '/api/v1/content/publish') {
    try {
      const result = contentStore.publish();
      const snapshot = result.snapshot
        ? { filename: result.snapshot.name, sizeBytes: result.snapshot.size, created: new Date(result.snapshot.created).toISOString() }
        : null;
      return sendJson(res, 200, {
        status: 'success',
        message: 'Content published. A snapshot was saved for rollback.',
        timestamp: new Date().toISOString(),
        snapshot: snapshot,
        schemaVersion: result.content.schemaVersion
      });
    } catch (err) {
      console.error('Error publishing content:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'Server error publishing content' });
    }
  }

  // 7. POST /api/v1/preview — render a page with the unsaved draft
  if (req.method === 'POST' && reqPath === '/api/v1/preview') {
    try {
      const payload = await parseJsonBody(req);
      const page = String((payload && payload.page) || 'index.html');
      if (!PAGE_TEMPLATES.has(page)) {
        return sendJson(res, 400, { status: 'error', message: 'Unknown preview page: ' + page });
      }
      const draft = payload.content || contentStore.readDraft();
      if (!draft) {
        return sendJson(res, 400, { status: 'error', message: 'Nothing to preview' });
      }
      const templatePath = path.join(__dirname, page);
      const html = renderFile(templatePath, contentStore.migrate(draft));
      return sendJson(res, 200, { status: 'success', data: { html: html, page: page } });
    } catch (err) {
      console.error('Error rendering preview:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'Server error rendering preview' });
    }
  }

  // 8. GET /api/v1/products — CMS Specification Section 4 Mode B contract
  if (req.method === 'GET' && reqPath === '/api/v1/products') {
    const content = readSiteContent();
    const products = (content && content.products) ? content.products : [];
    return sendJson(res, 200, {
      status: 'success',
      data: {
        count: products.length,
        products: products
      }
    });
  }

  // 4. GET /api/v1/media — Browse media library
  if (req.method === 'GET' && reqPath === '/api/v1/media') {
    const media = getMediaFiles();
    return sendJson(res, 200, { status: 'success', data: media });
  }

  // 5. POST /api/v1/media/upload — Base64 file upload
  if (req.method === 'POST' && reqPath === '/api/v1/media/upload') {
    try {
      const payload = await parseJsonBody(req);
      const filename = payload && (payload.filename || payload.name);
      const base64Data = payload && (payload.base64Data || payload.data);
      if (!filename || !base64Data) {
        return sendJson(res, 400, { status: 'error', message: 'Missing filename or base64Data' });
      }

      const ext = path.extname(String(filename)).toLowerCase();
      const allowed = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.mp4', '.webm', '.mov', '.m4v'];
      if (allowed.indexOf(ext) === -1) {
        return sendJson(res, 400, { status: 'error', message: 'Unsupported file type' });
      }

      // Sanitize filename
      const cleanName = String(filename).replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
      const targetPath = path.join(UPLOADS_DIR, cleanName);

      // Extract base64 buffer (stripping data:[mime];base64, header if present)
      const dataStr = String(base64Data).replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(dataStr, 'base64');
      const maxBytes = 200 * 1024 * 1024;
      if (buffer.length > maxBytes) {
        return sendJson(res, 413, { status: 'error', message: 'File too large' });
      }

      fs.writeFileSync(targetPath, buffer);

      return sendJson(res, 200, {
        status: 'success',
        message: 'File uploaded successfully',
        data: {
          name: cleanName,
          path: './assets/uploads/' + cleanName,
          sizeBytes: buffer.length,
          type: payload.type || ''
        }
      });
    } catch (err) {
      console.error('Upload error:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'File upload failed' });
    }
  }

  /* ------------------------------------------------------------------
     CLOUDINARY MEDIA (admin only — the API secret never leaves the server)
     ------------------------------------------------------------------ */

  if (!cloudinary.isCloudinaryConfigured(cloudinaryConfig)) {
    const cloudinaryOffline = (res) => sendJson(res, 503, {
      status: 'error',
      message: 'Cloudinary is not configured. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET in .env, then restart the server.'
    });

    if (reqPath.indexOf('/api/v1/media/cloudinary') === 0) {
      if (req.method === 'GET' && reqPath === '/api/v1/media/cloudinary/config') {
        return sendJson(res, 200, { status: 'success', data: { configured: false, preset: cloudinaryPreset } });
      }
      return cloudinaryOffline(res);
    }
  }

  // GET /api/v1/media/cloudinary/config — public-safe browser config
  if (req.method === 'GET' && reqPath === '/api/v1/media/cloudinary/config') {
    return sendJson(res, 200, {
      status: 'success',
      data: {
        configured: true,
        cloudName: cloudinaryConfig.cloudName,
        apiKey: cloudinaryConfig.apiKey,
        folder: cloudinaryConfig.folder,
        preset: cloudinaryPreset
      }
    });
  }

  // POST /api/v1/media/cloudinary/sign — signed upload parameters
  if (req.method === 'POST' && reqPath === '/api/v1/media/cloudinary/sign') {
    let payload = {};
    try {
      payload = await parseJsonBody(req);
    } catch (err) {
      return sendJson(res, 400, { status: 'error', message: 'Invalid request body' });
    }

    const resourceType = cloudinary.normalizeResourceType(payload.resourceType);
    const timestamp = Math.floor(Date.now() / 1000);

    const signed = { timestamp: timestamp, folder: cloudinaryConfig.folder };
    if (payload.publicId) signed.public_id = payload.publicId;
    if (payload.tags) signed.tags = payload.tags;

    return sendJson(res, 200, {
      status: 'success',
      data: {
        signature: cloudinary.buildSignature(signed, cloudinaryConfig.apiSecret),
        timestamp: timestamp,
        apiKey: cloudinaryConfig.apiKey,
        cloudName: cloudinaryConfig.cloudName,
        folder: cloudinaryConfig.folder,
        resourceType: resourceType,
        uploadUrl: cloudinary.uploadUrl(cloudinaryConfig.cloudName, resourceType)
      }
    });
  }

  // GET /api/v1/media/cloudinary/list — browse the Cloudinary library
  if (req.method === 'GET' && reqPath === '/api/v1/media/cloudinary/list') {
    try {
      const result = await cloudinary.searchResources(cloudinaryConfig, {
        maxResults: Number(queryParams.get('maxResults')) || 40,
        term: queryParams.get('q') || undefined,
        resourceType: queryParams.get('type') || 'all',
        folder: queryParams.get('folder') || undefined,
        cursor: queryParams.get('cursor') || undefined
      });

      const resources = ((result.data && result.data.resources) || []).map((item) => ({
        publicId: item.public_id,
        resourceType: item.resource_type,
        format: item.format,
        width: item.width || null,
        height: item.height || null,
        bytes: item.bytes || 0,
        url: cloudinary.deliveryUrl(cloudinaryConfig.cloudName, item.public_id, item.resource_type),
        secureUrl: item.secure_url || null,
        createdAt: item.created_at || null
      }));

      return sendJson(res, 200, {
        status: 'success',
        data: {
          resources: resources,
          totalCount: (result.data && result.data.total_count) || resources.length,
          nextCursor: (result.data && result.data.next_cursor) || null
        }
      });
    } catch (err) {
      console.error('Cloudinary list error:', err.message);
      return sendJson(res, err.status || 502, { status: 'error', message: err.message });
    }
  }

  // DELETE /api/v1/media/cloudinary[/<public_id>] — remove a Cloudinary asset
  if (req.method === 'DELETE' && (reqPath === '/api/v1/media/cloudinary' || reqPath.indexOf('/api/v1/media/cloudinary/') === 0)) {
    let publicId = queryParams.get('publicId') || '';
    let resourceType = queryParams.get('resourceType') || '';

    // The public id may also be the path suffix, folder prefix included:
    // /api/v1/media/cloudinary/nimbus/abc123  or  .../nimbus%2Fabc123
    if (!publicId && reqPath.indexOf('/api/v1/media/cloudinary/') === 0) {
      const rawId = reqPath.slice('/api/v1/media/cloudinary/'.length).split('?')[0];
      try {
        publicId = decodeURIComponent(rawId);
      } catch (err) {
        publicId = rawId;
      }
    }

    // Some clients drop the body on DELETE, so treat it as a fallback only.
    if (!publicId) {
      let payload = {};
      try {
        payload = await parseJsonBody(req);
      } catch (err) {
        payload = {};
      }
      publicId = payload.publicId || '';
      resourceType = resourceType || payload.resourceType || '';
    }

    if (!publicId) {
      return sendJson(res, 400, { status: 'error', message: 'publicId is required' });
    }

    try {
      const result = await cloudinary.deleteResource(cloudinaryConfig, publicId, resourceType);
      const outcome = result.data && result.data.result;
      if (outcome === 'not found') {
        return sendJson(res, 404, { status: 'error', message: 'Asset not found', data: { publicId: publicId } });
      }
      return sendJson(res, 200, { status: 'success', message: 'Asset deleted', data: { publicId: publicId } });
    } catch (err) {
      console.error('Cloudinary delete error:', err.message);
      return sendJson(res, err.status || 502, { status: 'error', message: err.message });
    }
  }

  // POST /api/v1/media/cloudinary/preset — create (or refresh) the upload preset
  if (req.method === 'POST' && reqPath === '/api/v1/media/cloudinary/preset') {
    let payload = {};
    try {
      payload = await parseJsonBody(req);
    } catch (err) {
      return sendJson(res, 400, { status: 'error', message: 'Invalid request body' });
    }

    const presetName = payload.name || cloudinaryPreset;

    try {
      const result = await cloudinary.createUploadPreset(cloudinaryConfig, presetName, {
        folder: cloudinaryConfig.folder
      });
      return sendJson(res, 200, { status: 'success', message: 'Upload preset ready', data: result.data });
    } catch (err) {
      // A preset that already exists is not a failure for the caller.
      const message = err.message || '';
      const alreadyExists = (err.status === 400 || err.status === 409) && /already exists|already been taken/i.test(message);
      if (alreadyExists) {
        return sendJson(res, 200, {
          status: 'success',
          message: 'Upload preset already exists',
          data: { name: presetName, existing: true }
        });
      }
      console.error('Cloudinary preset error:', message);
      return sendJson(res, err.status || 502, { status: 'error', message: message });
    }
  }

  // 6. GET /api/v1/backups — List backups
  if (req.method === 'GET' && reqPath === '/api/v1/backups') {
    try {
      const files = contentStore.listBackups().map((entry) => ({
        filename: entry.name,
        sizeBytes: entry.size,
        created: new Date(entry.created).toISOString()
      }));

      return sendJson(res, 200, { status: 'success', data: files });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // 6b. GET /api/v1/backups/diff?filename=... — what changed since a snapshot
  if (req.method === 'GET' && reqPath === '/api/v1/backups/diff') {
    try {
      const filename = queryParams.get('filename');
      if (!filename) {
        return sendJson(res, 400, { status: 'error', message: 'filename query parameter required' });
      }
      let snapshot;
      try {
        snapshot = contentStore.readSnapshot(filename);
      } catch (snapshotErr) {
        const code = snapshotErr.message === 'Backup file not found' ? 404 : 400;
        return sendJson(res, code, { status: 'error', message: snapshotErr.message });
      }
      const changes = contentStore.diff(snapshot, contentStore.read());
      return sendJson(res, 200, {
        status: 'success',
        data: { filename: path.basename(String(filename)), changes: changes, count: changes.length }
      });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // 7. POST /api/v1/backups/restore — Restore a past snapshot
  if (req.method === 'POST' && reqPath === '/api/v1/backups/restore') {
    try {
      const payload = await parseJsonBody(req);
      if (!payload.filename) {
        return sendJson(res, 400, { status: 'error', message: 'Backup filename required' });
      }

      let restored;
      try {
        restored = contentStore.restore(payload.filename);
      } catch (restoreErr) {
        const code = restoreErr.message === 'Backup file not found' ? 404 : 400;
        return sendJson(res, code, { status: 'error', message: restoreErr.message });
      }

      return sendJson(res, 200, {
        status: 'success',
        message: `Restored snapshot ${path.basename(String(payload.filename))} successfully`,
        data: restored
      });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // 8. POST /api/v1/audit/inquire — Public intake form (rate limited + honeypot)
  if (req.method === 'POST' && reqPath === '/api/v1/audit/inquire') {
    const ip = clientIp(req);
    const limit = inquiryLimiter.check(ip);
    if (!limit.allowed) {
      return sendJson(res, 429, { status: 'error', message: limit.message }, { 'Retry-After': String(limit.retryAfter) });
    }

    try {
      const payload = await parseJsonBody(req);
      const clean = Object.assign({}, payload);
      delete clean.honeypot;

      // Honeypot: bots fill the hidden field. Answer as if it worked, store nothing.
      if (typeof payload.honeypot === 'string' && payload.honeypot.trim() !== '') {
        return sendJson(res, 200, {
          status: 'success',
          message: 'Business audit diagnostic request registered. A principal research fellow will review your telemetry.',
          inquiryId: 'audit-' + Date.now()
        });
      }

      const auditLogPath = path.join(__dirname, 'data', 'audit-inquiries.json');
      let inquiries = [];
      if (fs.existsSync(auditLogPath)) {
        try { inquiries = JSON.parse(fs.readFileSync(auditLogPath, 'utf8')); } catch (e) {}
      }
      if (!Array.isArray(inquiries)) inquiries = [];

      const record = Object.assign({}, clean, {
        id: 'audit-' + Date.now(),
        receivedAt: new Date().toISOString()
      });
      inquiries.unshift(record);

      // Retention cap: keep the newest 500 inquiries only.
      if (inquiries.length > 500) inquiries = inquiries.slice(0, 500);

      fs.writeFileSync(auditLogPath, JSON.stringify(inquiries, null, 2), 'utf8');

      return sendJson(res, 200, {
        status: 'success',
        message: 'Business audit diagnostic request registered. A principal research fellow will review your telemetry.',
        inquiryId: record.id
      });
    } catch (err) {
      console.error('Error saving inquiry:', err);
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  /* ------------------------------------------------------------------
     STATIC FILE SERVING
     ------------------------------------------------------------------ */

  const fullPath = resolveStaticPath(reqPath);
  if (!fullPath) {
    return sendText(res, 404, '404 Not Found: ' + reqPath);
  }

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      return sendText(res, 404, '404 Not Found: ' + reqPath);
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext];
    if (!contentType) {
      return sendText(res, 404, '404 Not Found: ' + reqPath);
    }

    const headers = cors.headers(req);
    headers['Content-Type'] = contentType;
    headers['Cache-Control'] = 'no-cache';

    // Page templates are rendered server-side with the CMS content before
    // they are sent, so every visitor sees the current catalogue.
    if (PAGE_TEMPLATES.has(path.basename(fullPath))) {
      try {
        const html = renderFile(fullPath, contentStore.read());
        res.writeHead(200, headers);
        return res.end(html);
      } catch (renderErr) {
        console.error('Error rendering ' + path.basename(fullPath) + ':', renderErr.message);
        return sendText(res, 500, '500 Internal Server Error');
      }
    }

    res.writeHead(200, headers);

    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  // Keep the static explore-data.js contract in sync with the CMS content.
  contentStore.sync();
  console.log(`Nimbus Labs server running at http://localhost:${PORT}/`);
  console.log(`CMS Matrix control panel at http://localhost:${PORT}/cms`);
});
