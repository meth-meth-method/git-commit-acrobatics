const crypto = require('crypto');

function consume(stream, enc = 'utf8') {
  return new Promise(resolve => {
    let data = '';
    stream.on('data', buffer => {
      data += buffer.toString(enc);
    });
    stream.on('end', () => {
      resolve(data);
    });
  });
}

function hash(stream, algo = 'sha1') {
  return new Promise(resolve => {
    const shasum = crypto.createHash(algo);
    let hash = '';
    stream.pipe(shasum)
    .on('data', digest => {
      hash += digest.toString('hex');
    })
    .on('end', () => {
      resolve(hash);
    });
  });
}

module.exports = {
  consume,
  hash,
};
