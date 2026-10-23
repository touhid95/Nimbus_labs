const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const root = __dirname;
const libDir = path.join(root, 'lib');
const files = [];

fs.readdirSync(libDir).filter(function (f) { return f.endsWith('.js'); }).sort().forEach(function (f) {
  files.push(path.join(libDir, f));
});
files.push(path.join(root, 'server.js'));

let failed = 0;
files.forEach(function (f) {
  try {
    execSync('node --check "' + f + '"', { stdio: 'pipe' });
    console.log('OK ' + path.relative(root, f));
  } catch (e) {
    failed++;
    console.log('ERR ' + path.relative(root, f));
    if (e.stderr) console.log('  ' + e.stderr.toString().trim());
  }
});

// also require modules to check runtime deps
try {
  require('./lib/auth');
  require('./lib/cloudinary');
  require('./lib/content-store');
  require('./lib/env');
  require('./lib/http');
  require('./lib/rate-limit');
  require('./lib/render');
  require('./lib/sanitize');
  require('./lib/schema');
  console.log('OK require:all-lib');
} catch (e) {
  failed++;
  console.log('ERR require:all-lib');
  console.log('  ' + e.message);
}

process.exit(failed > 0 ? 1 : 0);
