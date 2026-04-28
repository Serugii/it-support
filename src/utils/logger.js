const fs = require('fs');
const config = require('../config/config.json');

function log(message) {
  const time = new Date().toISOString();
  fs.appendFileSync(config.logPath, `[${time}] ${message}\n`);
}

module.exports = { log };