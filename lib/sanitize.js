'use strict';

/**
 * Zero-dependency, allowlist-based HTML sanitizer.
 *
 * This is the server-side security boundary for every rich-text field: the
 * CMS editor produces HTML, and nothing reaches the browser without passing
 * through sanitizeHtml() first. Everything that is not explicitly allowed is
 * removed: unknown tags, event handlers, script/style/iframe blocks and
 * dangerous URL schemes.
 */

const VOID_TAGS = new Set(['br', 'hr', 'img']);

const ALLOWED_TAGS = new Set([
  'p', 'br', 'hr', 'strong', 'b', 'em', 'i', 'u', 's', 'mark', 'small',
  'sub', 'sup', 'h2', 'h3', 'h4', 'h5', 'h6', 'ul', 'ol', 'li', 'blockquote',
  'pre', 'code', 'a', 'img', 'span', 'div', 'table', 'thead', 'tbody', 'tr',
  'th', 'td'
]);

// Allowed attributes per tag. "*" applies to every allowed tag.
const ALLOWED_ATTRS = {
  '*': ['title'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
  span: ['class'],
  div: ['class'],
  code: ['class'],
  pre: ['class'],
  td: ['colspan', 'rowspan'],
  th: ['colspan', 'rowspan', 'scope']
};

// Tags whose entire content is dropped, not just the tag itself.
const DANGEROUS_BLOCKS = [
  'script', 'style', 'iframe', 'object', 'embed', 'noscript', 'template',
  'svg', 'math', 'form', 'base', 'link', 'meta', 'frame', 'frameset'
];

const ENTITIES = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'",
  '&#x27;': "'", '&apos;': "'"
};

function decodeEntities(value) {
  return String(value)
    .replace(/&(?:amp|lt|gt|quot|apos|#39|#x27);/gi, function (match) {
      const key = match.toLowerCase();
      return Object.prototype.hasOwnProperty.call(ENTITIES, key) ? ENTITIES[key] : match;
    })
    .replace(/&#(\d+);/g, function (match, code) {
      const num = parseInt(code, 10);
      return num > 0 && num < 0x110000 ? String.fromCharCode(num) : match;
    })
    .replace(/&#x([0-9a-f]+);/gi, function (match, code) {
      const num = parseInt(code, 16);
      return num > 0 && num < 0x110000 ? String.fromCharCode(num) : match;
    });
}

function escapeAttribute(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeText(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Only http(s), mailto, tel, relative and anchor URLs are allowed.
 * data: is limited to inline images.
 */
function safeUrl(value, isImageSource) {
  const cleaned = decodeEntities(String(value))
    .replace(/[\u0000-\u001F\u007F]/g, '')
    .trim();

  if (!cleaned) return null;
  if (/^(https?:|mailto:|tel:)/i.test(cleaned)) return cleaned;
  if (cleaned.charAt(0) === '#' || cleaned.charAt(0) === '/' || cleaned.charAt(0) === '.') {
    return cleaned;
  }
  if (isImageSource && /^data:image\/(png|jpe?g|gif|webp);base64,[a-z0-9+/=\s]+$/i.test(cleaned)) {
    return cleaned;
  }
  return null;
}

function sanitizeAttributes(tag, attrText) {
  const allowed = (ALLOWED_ATTRS[tag] || []).concat(ALLOWED_ATTRS['*'] || []);
  const collected = {};
  const order = [];
  const re = /([a-zA-Z_:][-a-zA-Z0-9_:.]*)\s*(?:=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'>]+)))?/g;
  let match;

  while ((match = re.exec(attrText)) !== null) {
    const name = match[1].toLowerCase();
    if (name.indexOf('on') === 0) continue;
    if (allowed.indexOf(name) === -1) continue;
    if (Object.prototype.hasOwnProperty.call(collected, name)) continue;

    let value = '';
    if (match[2] !== undefined) value = match[2];
    else if (match[3] !== undefined) value = match[3];
    else if (match[4] !== undefined) value = match[4];

    if (name === 'href' || name === 'src') {
      const url = safeUrl(value, name === 'src');
      if (url === null) continue;
      value = url;
    } else if (name === 'class') {
      const classes = value.split(/\s+/).filter(function (cls) {
        return /^[a-zA-Z0-9_-]{1,32}$/.test(cls);
      });
      if (!classes.length) continue;
      value = classes.join(' ');
    } else if (name === 'target') {
      if (value !== '_blank' && value !== '_self') continue;
    } else if (name === 'width' || name === 'height' || name === 'colspan' || name === 'rowspan') {
      if (!/^\d{1,4}$/.test(value)) continue;
    }

    collected[name] = value;
    order.push(name);
  }

  if (tag === 'a' && collected.target === '_blank') {
    collected.rel = 'noopener noreferrer';
    if (order.indexOf('rel') === -1) order.push('rel');
  }

  return order.map(function (name) {
    return ' ' + name + '="' + escapeAttribute(collected[name]) + '"';
  }).join('');
}

/**
 * Sanitize an HTML fragment against the allowlist.
 * @param {string} input raw HTML
 * @returns {string} safe HTML
 */
function sanitizeHtml(input) {
  if (typeof input !== 'string' || !input) return '';

  let html = input;

  // Comments, CDATA sections and processing instructions.
  html = html.replace(/<!--[\s\S]*?-->/g, '');
  html = html.replace(/<!\[CDATA\[[\s\S]*?\]\]>/g, '');
  html = html.replace(/<\?[\s\S]*?\?>/g, '');

  // Dangerous elements: drop the whole block first so its text content
  // cannot leak into the output.
  DANGEROUS_BLOCKS.forEach(function (tag) {
    const blockRe = new RegExp('<\\s*' + tag + '\\b[\\s\\S]*?<\\s*\\/\\s*' + tag + '\\s*>', 'gi');
    html = html.replace(blockRe, '');
    const openRe = new RegExp('<\\s*' + tag + '\\b[^>]*>', 'gi');
    html = html.replace(openRe, '');
  });

  const out = [];
  const openTags = [];
  const tagRe = /<\s*(\/)?\s*([a-zA-Z][a-zA-Z0-9:-]*)((?:"[^"]*"|'[^']*'|[^>])*)>/g;
  let lastIndex = 0;
  let match;

  while ((match = tagRe.exec(html)) !== null) {
    out.push(html.slice(lastIndex, match.index));
    lastIndex = tagRe.lastIndex;

    const isClosing = match[1] === '/';
    const tag = match[2].toLowerCase();
    const attrText = match[3] || '';

    if (!ALLOWED_TAGS.has(tag)) continue;

    if (isClosing) {
      const idx = openTags.lastIndexOf(tag);
      if (idx === -1) continue;
      for (let i = openTags.length - 1; i >= idx; i--) {
        out.push('</' + openTags[i] + '>');
      }
      openTags.length = idx;
      continue;
    }

    const attrs = sanitizeAttributes(tag, attrText);
    out.push('<' + tag + attrs + '>');
    if (!VOID_TAGS.has(tag)) openTags.push(tag);
  }

  out.push(html.slice(lastIndex));

  // Close anything the input left open.
  for (let i = openTags.length - 1; i >= 0; i--) {
    out.push('</' + openTags[i] + '>');
  }

  return out.join('');
}

/**
 * Reduce a rich-text value to plain text (used for meta descriptions and
 * other single-line fields).
 */
function stripTags(input) {
  if (typeof input !== 'string') return '';
  return decodeEntities(
    input
      .replace(/<script\b[\s\S]*?<\/script>/gi, '')
      .replace(/<style\b[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]*>/g, ' ')
  ).replace(/\s+/g, ' ').trim();
}

module.exports = {
  sanitizeHtml: sanitizeHtml,
  stripTags: stripTags,
  escapeText: escapeText,
  escapeAttribute: escapeAttribute,
  safeUrl: safeUrl
};
