'use strict';

const { renderFile } = require('./lib/render');
const { migrate, defaultContent } = require('./lib/schema');

const c = renderFile('login.html', migrate(defaultContent()));
const m1 = /login-kicker">(.+?)</.exec(c);
const m2 = /login-title" id="login-title">(.+?)</.exec(c);
const m3 = /class="reveal-btn" id="reveal-btn" type="button" aria-label="([^"]+)">([^<]+)</.exec(c);
const m4 = /id="submit-btn" type="submit">([^<]+)</.exec(c);

console.log(m1 ? m1[1] : 'no');
console.log(m2 ? m2[1] : 'no');
console.log(m3 ? m3[1] + ' | ' + m3[2] : 'no');
console.log(m4 ? m4[1] : 'no');
