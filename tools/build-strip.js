'use strict';

const fs = require('fs');
const items = require('./strip-icons.json');

// Presentation attributes copied from the original <svg> wrappers in
// explore.html so every glyph keeps its exact rendering.
const presentation = {
  'chatgpt': 'fill="currentColor"',
  'claude': 'fill="currentColor"',
  'gemini': 'fill="currentColor"',
  'perplexity': 'fill="currentColor"',
  'grok': 'fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"',
  'cursor': 'fill="currentColor"',
  'copilot': 'fill="currentColor"',
  'devin-ai': 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"',
  'midjourney': 'fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"',
  'adobe-firefly': 'fill="currentColor"',
  'grammarly': 'fill="currentColor"',
  'notebooklm': 'fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"'
};

const sprite = items.map(function (item) {
  return '    <symbol id="ai-icon-' + item.id + '" viewBox="0 0 24 24" ' + presentation[item.id] + '>' + item.inner + '</symbol>';
}).join('\n');

fs.writeFileSync('strip-sprite.html', sprite + '\n', 'utf8');
console.log('wrote strip-sprite.html (' + items.length + ' symbols)');
