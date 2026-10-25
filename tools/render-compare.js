'use strict';

/**
 * Renders the current template and the template stored in git HEAD against
 * the same content, then reports the differences. Used to prove that
 * tokenising a page did not change what the browser receives.
 */

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { renderTemplate } = require('./lib/render');
const { migrate, defaultContent } = require('./lib/schema');

const files = process.argv.slice(2);
if (!files.length) {
  console.error('usage: node render-compare.js <file.html> [...]');
  process.exit(1);
}

const content = migrate(defaultContent());

function gitShow(file) {
  try {
    return execFileSync('git', ['show', 'HEAD:' + file], { encoding: 'utf8', cwd: __dirname });
  } catch (err) {
    return null;
  }
}

function normalise(html) {
  return html
    .replace(/\r\n/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .split('\n')
    .map(function (line) { return line.trim(); })
    .filter(function (line) { return line.length; })
    .join('\n');
}

files.forEach(function (file) {
  const before = gitShow(file);
  if (before === null) {
    console.log(file + ': not in HEAD (new file) - skipped');
    return;
  }

  const after = fs.readFileSync(path.join(__dirname, file), 'utf8');
  const beforeOut = normalise(renderTemplate(before, content));
  const afterOut = normalise(renderTemplate(after, content));

  if (beforeOut === afterOut) {
    console.log(file + ': IDENTICAL output');
    return;
  }

  const a = beforeOut.split('\n');
  const b = afterOut.split('\n');
  console.log(file + ': ' + a.length + ' -> ' + b.length + ' lines');

  // Multiset difference: report lines that only exist on one side.
  function count(lines) {
    const map = new Map();
    lines.forEach(function (l) { map.set(l, (map.get(l) || 0) + 1); });
    return map;
  }
  const ca = count(a);
  const cb = count(b);
  const onlyBefore = [];
  const onlyAfter = [];
  ca.forEach(function (n, line) {
    const m = cb.get(line) || 0;
    if (n > m) onlyBefore.push(line);
  });
  cb.forEach(function (n, line) {
    const m = ca.get(line) || 0;
    if (n > m) onlyAfter.push(line);
  });

  console.log('  only in HEAD (' + onlyBefore.length + '):');
  onlyBefore.forEach(function (l) { console.log('    - ' + l); });
  console.log('  only in working copy (' + onlyAfter.length + '):');
  onlyAfter.forEach(function (l) { console.log('    + ' + l); });
});
