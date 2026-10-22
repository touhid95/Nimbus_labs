const http = require('http');

const checks = [
  { url: '/', expect: [
    { label: 'dapper-ui island', test: (h) => h.indexOf('id="dapper-ui"') >= 0 },
    { label: 'hero layer-01', test: (h) => h.indexOf('id="layer-01"') >= 0 },
    { label: 'hero layer-cloud8', test: (h) => h.indexOf('id="layer-cloud8"') >= 0 },
    { label: 'hero layer-10', test: (h) => h.indexOf('id="layer-10"') >= 0 },
    { label: '18 hero layers', test: (h) => (h.match(/id="layer-(?:0[1-9]|10|cloud[1-8])"/g) || []).length === 18 },
    { label: 'nav no active on home', test: (h) => h.indexOf('aria-current="page"') < 0 },
    { label: 'video src', test: (h) => /<source src="[^"]+\.(mp4|webm)"/.test(h) },
    { label: 'no unresolved token', test: (h) => h.indexOf('{{') < 0 }
  ]},
  { url: '/explore', expect: [
    { label: 'explore-ui island', test: (h) => h.indexOf('id="explore-ui"') >= 0 },
    { label: 'ai sprite symbols', test: (h) => (h.match(/<symbol id="ai-icon-/g) || []).length === 12 },
    { label: 'use refs', test: (h) => (h.match(/<use href="#ai-icon-/g) || []).length === 24 },
    { label: 'marquee items', test: (h) => (h.match(/class="ai-strip-item"/g) || []).length === 24 },
    { label: 'noscript title', test: (h) => h.indexOf('JavaScript is required') >= 0 },
    { label: 'no unresolved token', test: (h) => h.indexOf('{{') < 0 }
  ]},
  { url: '/audit', expect: [
    { label: 'audit nav active', test: (h) => h.indexOf('aria-current="page"') >= 0 },
    { label: 'services heading', test: (h) => h.indexOf('Services and Audit Spectrum') >= 0 },
    { label: 'industries aria', test: (h) => h.indexOf('Mission-Critical Sectors') >= 0 },
    { label: 'no unresolved token', test: (h) => h.indexOf('{{') < 0 }
  ]},
  { url: '/login', expect: [
    { label: 'login-i18n island', test: (h) => h.indexOf('id="login-i18n"') >= 0 },
    { label: 'reveal label', test: (h) => h.indexOf('Show passphrase') >= 0 },
    { label: 'no unresolved token', test: (h) => h.indexOf('{{') < 0 }
  ]}
];

function get(path) {
  return new Promise(function (resolve, reject) {
    http.get('http://localhost:3000' + path, function (res) {
      let d = '';
      res.on('data', function (c) { d += c; });
      res.on('end', function () { resolve({ status: res.statusCode, body: d }); });
    }).on('error', reject);
  });
}

let fail = 0;
checks.forEach(function (c) {
  get(c.url).then(function (r) {
    const out = [];
    out.push(c.url + ' -> ' + r.status);
    c.expect.forEach(function (e) {
      const ok = e.test(r.body);
      if (!ok) fail++;
      out.push((ok ? '  PASS ' : '  FAIL ') + e.label);
    });
    console.log(out.join('\n'));
  }).catch(function (err) {
    fail++;
    console.log(c.url + ' -> ERROR ' + err.message);
  });
});

setTimeout(function () {
  console.log(fail === 0 ? 'ALL CHECKS PASSED' : fail + ' CHECK(S) FAILED');
  process.exit(fail === 0 ? 0 : 1);
}, 2500);
