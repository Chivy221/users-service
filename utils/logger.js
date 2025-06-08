const fs = require('fs');
const path = require('path');
const logPath = path.join(__dirname, '../logs.log');

function log(message) {
const entry = [${new Date().toISOString()}] ${message}\n;
fs.appendFile(logPath, entry, err => {
if (err) console.error('Log write failed:', err);
});
}

module.exports = { log };
