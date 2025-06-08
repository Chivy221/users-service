const crypto = require('crypto');
const secret = process.env.SECRET_KEY || 'default-secret';

function encrypt(text) {
  const cipher = crypto.createCipher('aes-256-ctr', secret);
  return cipher.update(text, 'utf8', 'hex') + cipher.final('hex');
}

function decrypt(hash) {
  const decipher = crypto.createDecipher('aes-256-ctr', secret);
  return decipher.update(hash, 'hex', 'utf8') + decipher.final('utf8');
}

module.exports = { encrypt, decrypt };
