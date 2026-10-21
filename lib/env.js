const fs = require('fs');
const path = require('path');

/**
 * Minimal zero-dependency .env reader.
 * Real environment variables always win over file values.
 */
function parseEnvFile(filePath) {
  const parsed = {};
  if (!fs.existsSync(filePath)) return parsed;

  const raw = fs.readFileSync(filePath, 'utf8');
  raw.split(/\r?\n/).forEach((line) => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;

    const separator = trimmed.indexOf('=');
    if (separator === -1) return;

    const key = trimmed.slice(0, separator).trim();
    let value = trimmed.slice(separator + 1).trim();

    if (value.length >= 2) {
      const first = value[0];
      const last = value[value.length - 1];
      if ((first === '"' && last === '"') || (first === "'" && last === "'")) {
        value = value.slice(1, -1);
      }
    }

    if (key) parsed[key] = value;
  });

  return parsed;
}

function loadEnv(filePath) {
  const target = filePath || path.join(__dirname, '..', '.env');
  const parsed = parseEnvFile(target);

  Object.keys(parsed).forEach((key) => {
    if (process.env[key] === undefined) process.env[key] = parsed[key];
  });

  return parsed;
}

module.exports = { loadEnv, parseEnvFile };
