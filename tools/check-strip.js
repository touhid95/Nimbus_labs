'use strict';

/**
 * Compares the rendered AI ecosystem marquee before and after tokenising it.
 */

const fs = require('fs');
const { execFileSync } = require('child_process');
const { renderTemplate } = require('./lib/render');
const { migrate, defaultContent } = require('./lib/schema');

const content = migrate(defaultContent());
const before = execFileSync('git', ['show', 'HEAD:explore.html'], { encoding: 'utf8' });
const after = fs.readFileSync('explore.html', 'utf8');

function items(html) {
  const out = [];
  const chunks = html.split('<div class="ai-strip-item"');
  for (let i = 1; i < chunks.length; i++) {
    const body = chunks[i];
    const name = /ai-strip-name">([^<]*)</.exec(body);
    const badge = /ai-strip-badge">([^<]*)</.exec(body);
    const cat = /ai-strip-cat">([^<]*)</.exec(body);
    if (!name || !badge || !cat) continue;
    out.push(name[1] + ' | ' + badge[1] + ' | ' + cat[1]);
  }
  return out;
}

const a = items(renderTemplate(before, content));
const b = items(renderTemplate(after, content));

console.log('before items: ' + a.length + '  after items: ' + b.length);
console.log('identical text: ' + (JSON.stringify(a) === JSON.stringify(b)));
if (JSON.stringify(a) !== JSON.stringify(b)) {
  for (let i = 0; i < Math.max(a.length, b.length); i++) {
    if (a[i] !== b[i]) console.log(i + ': ' + a[i] + '  ->  ' + b[i]);
  }
}
