// Lists the content tokens used by each template and flags unused schema fields.
const fs = require('fs');
const { listTokens } = require('./lib/render');
const sc = require('./lib/schema');

const templates = ['index.html', 'explore.html', 'audit.html', 'login.html', 'cms.html'];
const used = new Set();
templates.forEach(function (t) {
  const tokens = listTokens(fs.readFileSync(t, 'utf8'));
  console.log('\n== ' + t + ' (' + tokens.length + ' tokens)');
  tokens.forEach(function (tok) {
    console.log('   ' + tok);
    if (tok.indexOf('this') !== 0 && tok.indexOf('@') !== 0) used.add(tok);
  });
});

function flatten(obj, prefix, out) {
  Object.keys(obj || {}).forEach(function (key) {
    const path = prefix ? prefix + '.' + key : key;
    const value = obj[key];
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      flatten(value, path, out);
    } else {
      out.push(path);
    }
  });
  return out;
}

const flat = flatten(sc.defaultContent(), '', []);
console.log('\n\n== SCHEMA FIELDS NOT REFERENCED IN ANY TEMPLATE');
flat.forEach(function (path) {
  if (used.has(path)) return;
  // parent paths are considered used if a child is used
  var covered = false;
  used.forEach(function (u) { if (u.indexOf(path + '.') === 0) covered = true; });
  if (!covered) console.log('   ' + path);
});
