const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data', 'site-content.json');
const EXPLORE_DATA_FILE = path.join(__dirname, 'assets', 'explore', 'explore-data.js');
const BACKUPS_DIR = path.join(__dirname, 'data', 'backups');
const UPLOADS_DIR = path.join(__dirname, 'assets', 'uploads');

// Ensure necessary directories exist
[path.join(__dirname, 'data'), BACKUPS_DIR, UPLOADS_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.webm': 'video/webm',
  '.mp4': 'video/mp4'
};

// Helper to generate assets/explore/explore-data.js
function generateExploreDataJs(content) {
  const exportData = {
    meta: content.meta || {},
    products: content.products || [],
    services: content.services || []
  };
  return `/**
 * NIMBUS LABS — EXPLORE PAGE CONTENT CONFIGURATION
 * Generated automatically by Nimbus CMS Matrix
 * Timestamp: ${new Date().toISOString()}
 */
(function (global) {
  'use strict';

  global.NIMBUS_EXPLORE_DATA = ${JSON.stringify(exportData, null, 2)};
})(typeof window !== 'undefined' ? window : this);
`;
}

// Helper to read content JSON
function readSiteContent() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    }
  } catch (err) {
    console.error('Error reading site-content.json:', err);
  }
  return null;
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

// Helper to send JSON responses
function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
  });
  res.end(JSON.stringify(payload));
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
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS'
    });
    return res.end();
  }

  // Legacy video upload hook
  if (req.method === 'POST' && req.url === '/save-video') {
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const buffer = Buffer.concat(chunks);
      fs.writeFileSync(path.join(__dirname, 'assets', 'research-cognition.webm'), buffer);
      sendJson(res, 200, { success: true, bytes: buffer.length });
    });
    return;
  }

  let reqPath = decodeURI(req.url.split('?')[0]);

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
    '/admin/': '/cms.html'
  };

  if (Object.prototype.hasOwnProperty.call(ROUTES, reqPath)) {
    reqPath = ROUTES[reqPath];
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

      // Update meta counts automatically
      if (!payload.meta) payload.meta = {};
      payload.meta.productsCount = payload.products.length;
      if (Array.isArray(payload.services)) {
        payload.meta.servicesCount = payload.services.length;
      }

      // 1. Save main content JSON
      fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf8');

      // 2. Generate and export assets/explore/explore-data.js for static site contract
      const jsExport = generateExploreDataJs(payload);
      fs.writeFileSync(EXPLORE_DATA_FILE, jsExport, 'utf8');

      // 3. Create timestamped snapshot in data/backups
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(BACKUPS_DIR, `backup-${timestamp}.json`);
      fs.writeFileSync(backupPath, JSON.stringify(payload, null, 2), 'utf8');

      return sendJson(res, 200, {
        status: 'success',
        message: 'Content updated and exported to static catalogue successfully',
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Error saving content:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'Server error saving content' });
    }
  }

  // 3. GET /api/v1/products — CMS Specification Section 4 Mode B contract
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
      if (!payload || !payload.filename || !payload.base64Data) {
        return sendJson(res, 400, { status: 'error', message: 'Missing filename or base64Data' });
      }

      // Sanitize filename
      const cleanName = payload.filename.replace(/[^a-zA-Z0-9._-]/g, '_').toLowerCase();
      const targetPath = path.join(UPLOADS_DIR, cleanName);

      // Extract base64 buffer (stripping data:image/...;base64, header if present)
      const dataStr = payload.base64Data.replace(/^data:[^;]+;base64,/, '');
      const buffer = Buffer.from(dataStr, 'base64');

      fs.writeFileSync(targetPath, buffer);

      return sendJson(res, 200, {
        status: 'success',
        message: 'File uploaded successfully',
        data: {
          name: cleanName,
          path: './assets/uploads/' + cleanName,
          sizeBytes: buffer.length
        }
      });
    } catch (err) {
      console.error('Upload error:', err);
      return sendJson(res, 500, { status: 'error', message: err.message || 'File upload failed' });
    }
  }

  // 6. GET /api/v1/backups — List backups
  if (req.method === 'GET' && reqPath === '/api/v1/backups') {
    try {
      const files = fs.readdirSync(BACKUPS_DIR)
        .filter(f => f.endsWith('.json'))
        .map(f => {
          const stats = fs.statSync(path.join(BACKUPS_DIR, f));
          return {
            filename: f,
            sizeBytes: stats.size,
            created: stats.birthtime.toISOString()
          };
        })
        .sort((a, b) => new Date(b.created) - new Date(a.created));

      return sendJson(res, 200, { status: 'success', data: files });
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
      const safeFilename = path.basename(payload.filename);
      const snapshotPath = path.join(BACKUPS_DIR, safeFilename);

      if (!fs.existsSync(snapshotPath)) {
        return sendJson(res, 404, { status: 'error', message: 'Backup file not found' });
      }

      const backupContent = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));

      // Save to main data file
      fs.writeFileSync(DATA_FILE, JSON.stringify(backupContent, null, 2), 'utf8');

      // Sync explore-data.js
      const jsExport = generateExploreDataJs(backupContent);
      fs.writeFileSync(EXPLORE_DATA_FILE, jsExport, 'utf8');

      return sendJson(res, 200, {
        status: 'success',
        message: `Restored snapshot ${safeFilename} successfully`,
        data: backupContent
      });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  // 8. POST /api/v1/audit/inquire — Receive and store business audit intake
  if (req.method === 'POST' && reqPath === '/api/v1/audit/inquire') {
    try {
      const payload = await parseJsonBody(req);
      const auditLogPath = path.join(__dirname, 'data', 'audit-inquiries.json');
      let inquiries = [];
      if (fs.existsSync(auditLogPath)) {
        try { inquiries = JSON.parse(fs.readFileSync(auditLogPath, 'utf8')); } catch (e) {}
      }
      const record = {
        id: 'audit-' + Date.now(),
        receivedAt: new Date().toISOString(),
        ...payload
      };
      inquiries.unshift(record);
      fs.writeFileSync(auditLogPath, JSON.stringify(inquiries, null, 2), 'utf8');

      return sendJson(res, 200, {
        status: 'success',
        message: 'Business audit diagnostic request registered. A principal research fellow will review your telemetry.',
        inquiryId: record.id
      });
    } catch (err) {
      return sendJson(res, 500, { status: 'error', message: err.message });
    }
  }

  /* ------------------------------------------------------------------
     STATIC FILE SERVING
     ------------------------------------------------------------------ */

  const fullPath = path.join(__dirname, reqPath);

  fs.stat(fullPath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found: ' + reqPath);
      return;
    }

    const ext = path.extname(fullPath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*'
    });

    const stream = fs.createReadStream(fullPath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log(`Nimbus Labs server running at http://localhost:${PORT}/`);
  console.log(`CMS Matrix control panel at http://localhost:${PORT}/cms`);
});
