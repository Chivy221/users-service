const crypto = require('crypto');
const key = process.env.ENCRYPTION_KEY; // 32 символа
const iv = Buffer.alloc(16, 0); // инициализационный вектор (безопасен для этого кейса)

function encrypt(text) {
const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(key), iv);
let encrypted = cipher.update(text, 'utf8', 'hex');
encrypted += cipher.final('hex');
return encrypted;
}

function decrypt(encrypted) {
const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(key), iv);
let decrypted = decipher.update(encrypted, 'hex', 'utf8');
decrypted += decipher.final('utf8');
return decrypted;
}

module.exports = { encrypt, decrypt };
