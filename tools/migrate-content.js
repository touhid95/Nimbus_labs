const fs = require('fs');
const { migrate } = require('./lib/schema');

const content = JSON.parse(fs.readFileSync('./data/site-content.json', 'utf8'));
const migrated = migrate(content);
fs.writeFileSync('./data/site-content.json', JSON.stringify(migrated, null, 2) + '\n', 'utf8');

console.log('done');
console.log('header.nav', JSON.stringify(migrated.site.header.nav));
console.log('home dapper tagTop', migrated.pages.home.dapper.tagTop);
console.log('explore strip', migrated.pages.explore.aiStrip ? migrated.pages.explore.aiStrip.length : 'none');
console.log('login present', !!migrated.pages.login);
