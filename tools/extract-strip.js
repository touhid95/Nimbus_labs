// Extracts the 12 unique ai-strip SVG icons so they can become a <symbol> sprite.
const fs = require('fs');
const src = fs.readFileSync('explore.html', 'utf8');
const start = src.indexOf('<div class="ai-strip-track">');
const end = src.indexOf('</section>', start);
const section = src.slice(start, end);
const items = section.split('<div class="ai-strip-item">').slice(1);
const seen = new Map();
items.forEach(function (block) {
  const name = (block.match(/ai-strip-name">([^<]*)</) || [])[1];
  const badge = (block.match(/ai-strip-badge">([^<]*)</) || [])[1];
  const cat = (block.match(/ai-strip-cat">([^<]*)</) || [])[1];
  const svg = (block.match(/<svg[\s\S]*?<\/svg>/) || ['NONE'])[0];
  if (seen.has(name)) return;
  const inner = svg.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '').trim();
  const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  seen.set(name, { id: id, name: name, badge: badge, cat: cat, inner: inner });
});
console.log('unique icons: ' + seen.size);
const out = [];
seen.forEach(function (v) {
  out.push({ id: v.id, name: v.name, badge: v.badge, cat: v.cat, inner: v.inner });
});
fs.writeFileSync('strip-icons.json', JSON.stringify(out, null, 2));
out.forEach(function (v) {
  console.log(v.id + ' | ' + v.name + ' | ' + v.badge + ' | ' + v.cat + ' | len=' + v.inner.length);
});
