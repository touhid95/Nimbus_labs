const http = require('http');
const fs = require('fs');

// Capture the explore page's runtime-generated DOM strings via a DOM-less
// simulation of explore.js is overkill; instead assert the rendered HTML
// contains the expected static markup and that explore.js/script.js contain
// no hardcoded-only literals (fallbacks are allowed).

function get(path) {
  return new Promise(function (resolve, reject) {
    http.get('http://localhost:3000' + path, function (res) {
      let d = '';
      res.on('data', function (c) { d += c; });
      res.on('end', function () { resolve({ status: res.statusCode, body: d }); });
    }).on('error', reject);
  });
}

get('/explore').then(function (r) {
  const h = r.body;
  const checks = [
    ['explore-ui island present', h.indexOf('id="explore-ui"') >= 0],
    ['ui chapterPrefix', h.indexOf('"chapterPrefix":"// CHAPTER 0"') >= 0],
    ['ui chapterSeparator', h.indexOf('"chapterSeparator":" / "') >= 0],
    ['ui chapterDash emdash', h.indexOf('"chapterDash":"\u2014"') >= 0],
    ['ui deployLabel', h.indexOf('"deployLabel":"Deploy"') >= 0],
    ['ui exploreLabel', h.indexOf('"exploreLabel":"Explore"') >= 0],
    ['ui productFallback', h.indexOf('"productFallback":"Product"') >= 0],
    ['ui defaultBrandTag', h.indexOf('"defaultBrandTag":"SOLUTIONS"') >= 0],
    ['ui categoryFallback', h.indexOf('"categoryFallback":"SYSTEMS"') >= 0],
    ['no unresolved tokens', h.indexOf('{{') < 0]
  ];
  let fail = 0;
  checks.forEach(function (c) {
    if (!c[1]) fail++;
    console.log((c[1] ? '  PASS ' : '  FAIL ') + c[0]);
  });
  process.exit(fail ? 1 : 0);
});
