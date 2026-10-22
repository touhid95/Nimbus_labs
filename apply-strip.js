'use strict';

/**
 * One-off helper that swaps the hardcoded AI ecosystem marquee in
 * explore.html for the CMS-driven version plus a template-owned SVG sprite.
 */

const fs = require('fs');

const file = 'explore.html';
let html = fs.readFileSync(file, 'utf8');

const sprite = fs.readFileSync('strip-sprite.html', 'utf8').trimEnd();

const startMarker = '      <div class="ai-strip-wrapper" aria-label="Supported AI Ecosystem">';
const endMarker = '      <!-- Clean Editorial Typographic OEM Block -->';

const start = html.indexOf(startMarker);
const end = html.indexOf(endMarker);
if (start === -1 || end === -1 || end < start) {
  throw new Error('marquee markers not found');
}

const item = function (hidden) {
  return [
    '          {{#pages.explore.aiStrip}}',
    '          <div class="ai-strip-item"' + (hidden ? ' aria-hidden="true"' : '') + '>',
    '            <div class="ai-strip-icon-box">',
    '              <svg class="ai-strip-icon" viewBox="0 0 24 24" aria-hidden="true"><use href="#ai-icon-{{this.icon}}"></use></svg>',
    '            </div>',
    '            <div class="ai-strip-meta">',
    '              <div class="ai-strip-brand-row">',
    '                <span class="ai-strip-name">{{this.name}}</span>',
    '                <span class="ai-strip-badge">{{this.badge}}</span>',
    '              </div>',
    '              <span class="ai-strip-cat">{{this.category}}</span>',
    '            </div>',
    '          </div>',
    '          {{/pages.explore.aiStrip}}'
  ].join('\n');
};

const block = [
  '      <div class="ai-strip-wrapper" aria-label="{{pages.explore.aiStripAriaLabel}}">',
  '        <div class="ai-strip-track">',
  item(false),
  item(true),
  '        </div>',
  '      </div>',
  ''
].join('\n');

html = html.slice(0, start) + block + html.slice(end);

// The sprite lives with the template: content only ever names a symbol id.
const spriteBlock = [
  '  <svg aria-hidden="true" focusable="false" style="position:absolute;width:0;height:0;overflow:hidden">',
  sprite,
  '  </svg>',
  ''
].join('\n');

const bodyOpen = html.indexOf('<body class="xp-page">');
if (bodyOpen === -1) throw new Error('body not found');
html = html.slice(0, bodyOpen + '<body class="xp-page">'.length) + '\n\n' + spriteBlock + html.slice(bodyOpen + '<body class="xp-page">'.length);

fs.writeFileSync(file, html, 'utf8');
console.log('explore.html marquee replaced');
