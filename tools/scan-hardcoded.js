// Scans page templates for hardcoded user-facing text / assets.
// Usage: node scan-hardcoded.js index.html explore.html audit.html login.html
const fs = require('fs');

const files = process.argv.slice(2);
files.forEach(function (file) {
  const src = fs.readFileSync(file, 'utf8');
  const lines = src.split(/\r?\n/);
  console.log('\n===== ' + file + ' =====');
  lines.forEach(function (line, i) {
    const n = i + 1;
    const trimmed = line.trim();
    if (!trimmed) return;
    // skip lines that are pure markup with no text
    const textOnly = trimmed
      .replace(/<!--[\s\S]*?-->/g, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\{\{[^}]*\}\}/g, ' ')
      .trim();
    const hasText = textOnly.length > 0 && /[a-zA-Z]{2,}/.test(textOnly);
    const hasAsset = /<img|<video|<source|<iframe/i.test(trimmed);
    const hasLink = /<a\s/i.test(trimmed);
    const hasBtn = /<button/i.test(trimmed);
    if (hasText || hasAsset || hasLink || hasBtn) {
      const flags = [hasText ? 'TEXT' : '', hasAsset ? 'ASSET' : '', hasLink ? 'LINK' : '', hasBtn ? 'BTN' : '']
        .filter(Boolean).join(',');
      console.log(n + ' [' + flags + '] ' + trimmed.slice(0, 190));
    }
  });
});
