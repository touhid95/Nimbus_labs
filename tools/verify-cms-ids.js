const fs = require('fs');

const html = fs.readFileSync('cms.html', 'utf8');
const js = fs.readFileSync('cms.js', 'utf8');

const htmlIds = new Set();
const re = /\bid="([^"]+)"/g;
let m;
while ((m = re.exec(html)) !== null) htmlIds.add(m[1]);

const jsIds = new Set();
const re2 = /(?:bind|setVal|getElementById|document\.getElementById)\(\s*'([^']+)'/g;
while ((m = re2.exec(js)) !== null) jsIds.add(m[1]);

// Also catch ids built via string concat for editors
const dynamic = ['header-nav-editor', 'home-chapters-editor', 'home-layers-editor', 'explore-ai-strip-editor', 'explore-legal-editor', 'audit-proof-editor', 'audit-stages-editor', 'explore-rail', 'explore-metalabels', 'home-footernav', 'explore-footernav', 'audit-footernav', 'footer-groups-editor'];

let fail = 0;
const missing = [];
jsIds.forEach(function (id) {
  if (!htmlIds.has(id)) { missing.push(id); fail++; }
});
console.log('JS ids referenced: ' + jsIds.size);
console.log('HTML ids present : ' + htmlIds.size);
if (missing.length) {
  console.log('MISSING IN HTML:');
  missing.forEach(function (id) { console.log('  - ' + id); });
} else {
  console.log('OK: every JS-referenced id exists in cms.html');
}

// Dynamic editor containers
const dynMissing = dynamic.filter(function (id) { return !htmlIds.has(id); });
if (dynMissing.length) {
  console.log('MISSING EDITOR CONTAINERS: ' + dynMissing.join(', '));
  fail++;
} else {
  console.log('OK: all editor containers present');
}

// Buttons referenced by getElementById(...).onclick
const btnIds = [];
const re3 = /getElementById\('(btn-[^']+)'\)/g;
while ((m = re3.exec(js)) !== null) btnIds.push(m[1]);
const btnMissing = btnIds.filter(function (id) { return !htmlIds.has(id); });
if (btnMissing.length) {
  console.log('MISSING BUTTONS: ' + btnMissing.join(', '));
  fail++;
} else {
  console.log('OK: all ' + btnIds.length + ' buttons present');
}

// Duplicate HTML ids
const counts = {};
const re4 = /\bid="([^"]+)"/g;
while ((m = re4.exec(html)) !== null) { counts[m[1]] = (counts[m[1]] || 0) + 1; }
const dupes = Object.keys(counts).filter(function (k) { return counts[k] > 1; });
if (dupes.length) {
  console.log('DUPLICATE HTML IDS: ' + dupes.join(', '));
  fail++;
} else {
  console.log('OK: no duplicate HTML ids');
}

process.exit(fail ? 1 : 0);
