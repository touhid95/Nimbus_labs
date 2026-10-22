// Verifies the CMS panel loads and the content API exposes the new groups.
// The admin password is read from .env via lib/env.js and never printed.
const http = require('http');
const { loadEnv } = require('./lib/env');

const env = loadEnv();
const password = env.ADMIN_PASSWORD;
if (!password) {
  console.log('SKIP: ADMIN_PASSWORD not configured');
  process.exit(0);
}

let cookie = '';

function request(path, method, body) {
  return new Promise(function (resolve, reject) {
    const data = body ? JSON.stringify(body) : null;
    const headers = { 'Content-Type': 'application/json' };
    if (cookie) headers.Cookie = cookie;
    if (data) headers['Content-Length'] = Buffer.byteLength(data);
    const req = http.request({
      hostname: 'localhost', port: 3000, path: path, method: method || 'GET', headers: headers
    }, function (res) {
      let d = '';
      res.on('data', function (c) { d += c; });
      res.on('end', function () { resolve({ status: res.statusCode, body: d, headers: res.headers }); });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

(async function () {
  const login = await request('/api/v1/auth/login', 'POST', { password: password });
  if (login.status !== 200) {
    console.log('LOGIN FAILED: ' + login.status);
    process.exit(1);
  }
  const setCookie = login.headers['set-cookie'] || [];
  cookie = setCookie.map(function (c) { return c.split(';')[0]; }).join('; ');

  const cms = await request('/cms.html');
  const content = await request('/api/v1/content');
  const parsed = JSON.parse(content.body);
  const c = parsed.data || parsed;

  const checks = [
    ['cms.html 200', cms.status === 200],
    ['content api 200', content.status === 200],
    ['site.header present', !!(c.site && c.site.header)],
    ['site.header.nav items', !!(c.site && c.site.header && c.site.header.nav && c.site.header.nav.length)],
    ['site.assets present', !!(c.site && c.site.assets)],
    ['site.footer.navAriaLabel', !!(c.site && c.site.footer && c.site.footer.navAriaLabel)],
    ['pages.login present', !!(c.pages && c.pages.login)],
    ['pages.login.revealAriaLabel', !!(c.pages && c.pages.login && c.pages.login.revealAriaLabel)],
    ['pages.home.meta.ogTitle', !!(c.pages && c.pages.home && c.pages.home.meta && c.pages.home.meta.ogTitle)],
    ['pages.home.hero.layers 18', !!(c.pages && c.pages.home && c.pages.home.hero && c.pages.home.hero.layers && c.pages.home.hero.layers.length === 18)],
    ['pages.home.dapper.controls', !!(c.pages && c.pages.home && c.pages.home.dapper && c.pages.home.dapper.controls)],
    ['pages.explore.aiStrip 12', !!(c.pages && c.pages.explore && c.pages.explore.aiStrip && c.pages.explore.aiStrip.length === 12)],
    ['pages.explore.ui', !!(c.pages && c.pages.explore && c.pages.explore.ui)],
    ['pages.explore.noscript', !!(c.pages && c.pages.explore && c.pages.explore.noscript)],
    ['pages.audit.servicesHeading', !!(c.pages && c.pages.audit && c.pages.audit.servicesHeading)],
    ['pages.audit.industries.ariaLabel', !!(c.pages && c.pages.audit && c.pages.audit.industries && c.pages.audit.industries.ariaLabel)],
    ['no legacy site.nav', !(c.site && c.site.nav)]
  ];

  let fail = 0;
  checks.forEach(function (t) {
    if (!t[1]) fail++;
    console.log((t[1] ? '  PASS ' : '  FAIL ') + t[0]);
  });
  console.log(fail === 0 ? 'ALL CMS CHECKS PASSED' : fail + ' CHECK(S) FAILED');
  process.exit(fail ? 1 : 0);
})().catch(function (e) { console.log('ERROR ' + e.message); process.exit(1); });
