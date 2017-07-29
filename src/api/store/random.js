const crypto = require('crypto');

const URL_SAFE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateRandomString(len = 6, chars = URL_SAFE) {
  let cursor = 0;
  return crypto.randomBytes(len).reduce((string, byte) => {
    cursor += byte;
    return string + chars[cursor % chars.length];
  }, '');
}

module.exports = generateRandomString;
