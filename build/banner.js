const pkg = require('../package.json');
const app = require('../dist/manifest.json');
const util = require('./util.js');

const banner = `${app.name} - v${app.version}
@desc ${app.description}
@author ${pkg.author}
@date ${`${util.getDate()} ${util.getTime()}`}`;

module.exports = banner;