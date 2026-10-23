'use strict';

/**
 * Zero-dependency server-side template renderer.
 *
 * Templates are plain HTML files with mustache-style tokens:
 *
 *   {{pages.home.hero.title}}          escaped text (HTML entities applied)
 *   {{pages.home.hero.title|raw}}      verbatim, for pre-sanitized rich text
 *   {{pages.home.hero.title|safe}}     sanitized through lib/sanitize.js
 *   {{#products}} ... {{/products}}    repeat block over an array
 *   {{^pages.home.hero.title}} ... {{/pages.home.hero.title}}
 *                                     inverted block, rendered when empty
 *
 * Inside a repeat block `{{this.field}}` reads the current item, `{{@index}}`,
 * `{{@number}}`, `{{@first}}` and `{{@last}}` expose the loop state. A bare
 * `{{field}}` resolves against the current item first and the root content
 * second.
 */

const { sanitizeHtml, escapeText } = require('./sanitize');

const TOKEN_RE = /\{\{([^{}]*)\}\}/g;

/**
 * Parse a template into a node tree.
 * @param {string} template
 * @returns {Array} nodes
 */
function parseTemplate(template) {
  const root = [];
  const stack = [{ body: root }];
  let lastIndex = 0;
  let match;

  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(template)) !== null) {
    if (match.index > lastIndex) {
      stack[stack.length - 1].body.push({ type: 'text', value: template.slice(lastIndex, match.index) });
    }
    lastIndex = TOKEN_RE.lastIndex;

    const raw = match[1].trim();
    if (!raw) continue;

    if (raw.charAt(0) === '#') {
      const path = raw.slice(1).trim();
      if (!path) continue;
      const node = { type: 'block', path: path, inverted: false, body: [] };
      stack[stack.length - 1].body.push(node);
      stack.push(node);
      continue;
    }

    if (raw.charAt(0) === '^') {
      const path = raw.slice(1).trim();
      if (!path) continue;
      const node = { type: 'block', path: path, inverted: true, body: [] };
      stack[stack.length - 1].body.push(node);
      stack.push(node);
      continue;
    }

    if (raw.charAt(0) === '/') {
      if (stack.length > 1) stack.pop();
      continue;
    }

    const pipe = raw.indexOf('|');
    const path = (pipe === -1 ? raw : raw.slice(0, pipe)).trim();
    const filter = pipe === -1 ? '' : raw.slice(pipe + 1).trim().toLowerCase();
    if (!path) continue;

    stack[stack.length - 1].body.push({ type: 'var', path: path, filter: filter });
  }

  if (lastIndex < template.length) {
    stack[stack.length - 1].body.push({ type: 'text', value: template.slice(lastIndex) });
  }

  return root;
}

function lookup(source, path) {
  if (!source || !path) return undefined;
  const parts = path.split('.').filter(Boolean);
  let current = source;

  for (let i = 0; i < parts.length; i++) {
    if (current === null || current === undefined) return undefined;
    if (typeof current !== 'object') return undefined;
    current = current[parts[i]];
  }

  return current;
}

function isEmpty(value) {
  if (value === null || value === undefined || value === false || value === '') return true;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  if (typeof value === 'number') return value === 0;
  return false;
}

function stringify(value) {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  return '';
}

/**
 * Resolve a token path against the current scope.
 * @param {string} path
 * @param {Object} scope
 * @returns {*} resolved value
 */
function resolvePath(path, scope) {
  if (path === 'this') return scope.item;
  if (path.indexOf('this.') === 0) return lookup(scope.item, path.slice(5));
  if (path.indexOf('@') === 0) {
    const key = path.slice(1);
    if (key === 'index') return scope.index;
    if (key === 'number') return scope.index + 1;
    if (key === 'first') return scope.index === 0;
    if (key === 'last') return scope.last;
    return undefined;
  }

  if (scope.item && typeof scope.item === 'object' && !Array.isArray(scope.item)) {
    const local = lookup(scope.item, path);
    if (local !== undefined) return local;
  }

  return lookup(scope.root, path);
}

function renderVar(node, scope) {
  const value = resolvePath(node.path, scope);

  if (node.filter === 'raw') {
    if (value === null || value === undefined) return '';
    if (typeof value === 'object') return JSON.stringify(value);
    return String(value);
  }

  if (node.filter === 'json') {
    // Safe to embed inside a <script> block: the characters that could
    // close the tag or start an entity are escaped.
    if (value === null || value === undefined) return 'null';
    return JSON.stringify(value)
      .replace(/</g, '\\u003c')
      .replace(/>/g, '\\u003e')
      .replace(/&/g, '\\u0026')
      .replace(/\u2028/g, '\\u2028')
      .replace(/\u2029/g, '\\u2029');
  }

  if (node.filter === 'safe') {
    return sanitizeHtml(stringify(value));
  }

  return escapeText(stringify(value));
}

function renderNodes(nodes, scope) {
  let out = '';

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === 'text') {
      out += node.value;
      continue;
    }

    if (node.type === 'var') {
      out += renderVar(node, scope);
      continue;
    }

    const value = resolvePath(node.path, scope);
    const childScope = {
      root: scope.root,
      item: scope.item,
      index: scope.index,
      last: scope.last
    };

    if (node.inverted) {
      if (isEmpty(value)) {
        out += renderNodes(node.body, childScope);
      }
      continue;
    }

    if (Array.isArray(value)) {
      for (let j = 0; j < value.length; j++) {
        const loopScope = {
          root: scope.root,
          item: value[j],
          index: j,
          last: j === value.length - 1
        };
        out += renderNodes(node.body, loopScope);
      }
      continue;
    }

    if (value && typeof value === 'object') {
      out += renderNodes(node.body, {
        root: scope.root,
        item: value,
        index: scope.index,
        last: scope.last
      });
      continue;
    }

    if (!isEmpty(value)) {
      out += renderNodes(node.body, childScope);
    }
  }

  return out;
}

/**
 * Render a template string against the site content.
 * @param {string} template
 * @param {Object} content
 * @returns {string} rendered HTML
 */
function renderTemplate(template, content) {
  if (typeof template !== 'string') return '';
  const nodes = parseTemplate(template);
  return renderNodes(nodes, { root: content || {}, item: null, index: 0, last: false });
}

/**
 * Render an HTML file from disk against the site content.
 * @param {string} filePath absolute path to the template
 * @param {Object} content
 * @returns {string} rendered HTML
 */
function renderFile(filePath, content) {
  const fs = require('fs');
  return renderTemplate(fs.readFileSync(filePath, 'utf8'), content);
}

/**
 * Report which tokens a template expects, so missing content is visible
 * before the page goes live.
 * @param {string} template
 * @returns {Array} unique token paths
 */
function listTokens(template) {
  const paths = [];
  const re = /\{\{([^{}]*)\}\}/g;
  let match;

  while ((match = re.exec(template)) !== null) {
    const raw = match[1].trim();
    if (!raw) continue;
    const body = raw.charAt(0) === '#' || raw.charAt(0) === '^' ? raw.slice(1) : raw;
    const path = body.split('|')[0].trim();
    if (path && paths.indexOf(path) === -1) paths.push(path);
  }

  return paths;
}

module.exports = {
  renderTemplate: renderTemplate,
  renderFile: renderFile,
  listTokens: listTokens
};
