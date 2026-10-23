const fs = require('fs');
const path = './data/site-content.json';

const content = JSON.parse(fs.readFileSync(path, 'utf8'));
if (content.site && content.site.nav) {
  delete content.site.nav;
  fs.writeFileSync(path, JSON.stringify(content, null, 2) + '\n', 'utf8');
  console.log('removed legacy site.nav');
} else {
  console.log('no legacy site.nav found');
}
