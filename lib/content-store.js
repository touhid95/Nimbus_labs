'use strict';

/**
 * Content store: the single source of truth for everything the CMS edits.
 *
 * Responsibilities:
 *  - read data/site-content.json and migrate it to the current schema
 *  - sanitize authored HTML before it is ever persisted
 *  - write atomically (temp file + rename) so a crash cannot truncate it
 *  - keep a rolling snapshot in data/backups for rollback
 *  - regenerate the static assets/explore/explore-data.js contract
 */

const fs = require('fs');
const path = require('path');

const { migrate, RICH_TEXT_PATHS, SCHEMA_VERSION } = require('./schema');
const { sanitizeHtml } = require('./sanitize');

const MAX_BACKUPS = 40;

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

/**
 * Apply a transform to every string reached through a dotted path.
 */
function applyToPath(root, dottedPath, transform) {
  const parts = dottedPath.split('.');
  let current = root;

  for (let i = 0; i < parts.length - 1; i++) {
    if (!current || typeof current !== 'object') return;
    current = current[parts[i]];
  }

  if (!current || typeof current !== 'object') return;

  const last = parts[parts.length - 1];
  const target = current[last];

  if (Array.isArray(target)) {
    current[last] = target.map(function (item) {
      if (typeof item === 'string') return transform(item);
      if (item && typeof item === 'object') {
        const copy = {};
        Object.keys(item).forEach(function (key) {
          copy[key] = typeof item[key] === 'string' ? transform(item[key]) : item[key];
        });
        return copy;
      }
      return item;
    });
    return;
  }

  if (typeof target === 'string') {
    current[last] = transform(target);
  }
}

function createContentStore(options) {
  const dataFile = options.dataFile;
  const exploreDataFile = options.exploreDataFile;
  const backupsDir = options.backupsDir;

  let cache = null;
  let cacheStamp = -1;

  function stamp() {
    try {
      return fs.statSync(dataFile).mtimeMs;
    } catch (err) {
      return 0;
    }
  }

  function ensureDirs() {
    [path.dirname(dataFile), backupsDir, path.dirname(exploreDataFile)].forEach(function (dir) {
      if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    });
  }

  function readRaw() {
    try {
      if (!fs.existsSync(dataFile)) return null;
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (err) {
      console.error('Error reading site-content.json:', err.message);
      return null;
    }
  }

  /**
   * Read the current content, migrated to the active schema.
   * The result is cached until the file changes on disk.
   */
  function read() {
    const current = stamp();
    if (cache && cacheStamp === current) return cache;

    const raw = readRaw();
    const content = migrate(raw);

    cache = content;
    cacheStamp = current;

    // Persist the migration so the file on disk always matches the schema.
    if (raw && raw.schemaVersion !== SCHEMA_VERSION) {
      write(content);
    }

    return content;
  }

  function sanitizeContent(content) {
    RICH_TEXT_PATHS.forEach(function (dottedPath) {
      applyToPath(content, dottedPath, function (value) {
        return sanitizeHtml(value);
      });
    });
    return content;
  }

  function syncCounts(content) {
    if (!content.meta || typeof content.meta !== 'object') content.meta = {};
    if (Array.isArray(content.products)) content.meta.productsCount = content.products.length;
    if (Array.isArray(content.services)) content.meta.servicesCount = content.services.length;
    return content;
  }

  function atomicWrite(file, contents) {
    const temp = file + '.tmp';
    fs.writeFileSync(temp, contents, 'utf8');
    fs.renameSync(temp, file);
  }

  function generateExploreDataJs(content) {
    const exportData = {
      meta: content.meta || {},
      products: content.products || [],
      services: content.services || []
    };

    return [
      '/**',
      ' * NIMBUS LABS — EXPLORE PAGE CONTENT CONFIGURATION',
      ' *',
      ' * GENERATED — DO NOT EDIT.',
      ' * This file is written by lib/content-store.js on boot and on every save.',
      ' * Edit the content in the CMS Matrix (/cms) instead.',
      ' *',
      ' * Generated at: ' + new Date().toISOString(),
      ' */',
      '(function (global) {',
      "  'use strict';",
      '',
      '  global.NIMBUS_EXPLORE_DATA = ' + JSON.stringify(exportData, null, 2) + ';',
      "})(typeof window !== 'undefined' ? window : this);",
      ''
    ].join('\n');
  }

  function writeExploreData(content) {
    try {
      atomicWrite(exploreDataFile, generateExploreDataJs(content));
    } catch (err) {
      console.error('Error writing explore-data.js:', err.message);
    }
  }

  function pruneBackups() {
    try {
      const files = fs.readdirSync(backupsDir)
        .filter(function (name) { return /^backup-.*\.json$/.test(name); })
        .sort()
        .reverse();

      files.slice(MAX_BACKUPS).forEach(function (name) {
        try {
          fs.unlinkSync(path.join(backupsDir, name));
        } catch (err) {
          console.error('Error pruning backup:', err.message);
        }
      });
    } catch (err) {
      console.error('Error pruning backups:', err.message);
    }
  }

  function createBackup(content) {
    try {
      const stampName = new Date().toISOString().replace(/[:.]/g, '-');
      const backupPath = path.join(backupsDir, 'backup-' + stampName + '.json');
      fs.writeFileSync(backupPath, JSON.stringify(content, null, 2), 'utf8');
      pruneBackups();
      return backupPath;
    } catch (err) {
      console.error('Error writing backup:', err.message);
      return null;
    }
  }

  /**
   * Validate, sanitize and persist a content document.
   * @param {Object} content
   * @returns {Object} the stored content
   */
  function write(content) {
    if (!content || typeof content !== 'object' || !Array.isArray(content.products)) {
      throw new Error('Invalid payload structure: products required');
    }

    ensureDirs();

    const migrated = migrate(content);
    sanitizeContent(migrated);
    syncCounts(migrated);

    atomicWrite(dataFile, JSON.stringify(migrated, null, 2) + '\n');
    writeExploreData(migrated);
    createBackup(migrated);

    cache = migrated;
    cacheStamp = stamp();

    return migrated;
  }

  /**
   * List the stored snapshots, newest first.
   * @returns {Array} snapshot descriptors
   */
  function listBackups() {
    try {
      if (!fs.existsSync(backupsDir)) return [];
      return fs.readdirSync(backupsDir)
        .filter(function (name) { return /^backup-.*\.json$/.test(name); })
        .map(function (name) {
          const stats = fs.statSync(path.join(backupsDir, name));
          return { name: name, created: stats.birthtimeMs || stats.mtimeMs, size: stats.size };
        })
        .sort(function (a, b) { return b.created - a.created; });
    } catch (err) {
      console.error('Error listing backups:', err.message);
      return [];
    }
  }

  /**
   * Restore a snapshot as the live content.
   * @param {string} filename
   * @returns {Object} the restored content
   */
  function restore(filename) {
    const safe = path.basename(String(filename || ''));
    if (!/^backup-.*\.json$/.test(safe)) {
      throw new Error('Invalid backup filename');
    }

    const snapshotPath = path.join(backupsDir, safe);
    if (!fs.existsSync(snapshotPath)) {
      throw new Error('Backup file not found');
    }

    const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8'));
    return write(snapshot);
  }

  /**
   * Regenerate the static explore-data.js contract from the stored content
   * without touching the content file or creating a snapshot.
   * @returns {Object} the content that was exported
   */
  function sync() {
    const content = read();
    writeExploreData(content);
    return content;
  }

  return {
    read: read,
    write: write,
    sync: sync,
    restore: restore,
    listBackups: listBackups,
    generateExploreDataJs: generateExploreDataJs,
    migrate: migrate,
    clone: clone
  };
}

module.exports = {
  createContentStore: createContentStore
};
