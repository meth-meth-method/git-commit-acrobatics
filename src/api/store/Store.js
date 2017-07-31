const crypto = require('crypto');
const {Readable} = require('stream');
const random = require('./random');
const {consume} = require('./stream');

class Store
{
  constructor(adapter) {
    this.algo = 'aes-256-ctr';
    this.adapter = adapter;
  }

  createId() {
    return random(8);
  }

  createSecret() {
    return random(64);
  }

  cipher(secret) {
    return crypto.createCipher(this.algo, secret);
  }

  decipher(secret) {
    return crypto.createDecipher(this.algo, secret);
  }

  getMeta(id, secret) {
    return consume(this.readStream(id + '.meta', secret))
    .then(json => JSON.parse(json));
  }

  putMeta(meta, id, secret) {
    const readable = new Readable();
    readable.push(JSON.stringify(meta));
    readable.push(null);
    return this.storeStream(readable, id + '.meta', secret);
  }

  retrieve(id, secret) {
    return this.getMeta(id, secret)
    .then(meta => {
      return {
        meta,
        stream: this.readStream(id, secret),
      }
    });
  }

  readStream(id, secret) {
    const decipher = this.decipher(secret);
    return this.adapter.getStream(id).pipe(decipher);
  }

  storeStream(stream, id, secret) {
    const cipher = this.cipher(secret);
    return this.adapter.putStream(id, stream.pipe(cipher));
  }

  store(file, meta) {
    const id = this.createId();
    const secret = this.createSecret();

    const metaStream = new Promise(resolve => {
      let size = 0;

      file.on('data', buff => {
        size += buff.length;
      });

      file.on('end', () => {
        meta.size = size;
        const stream = this.putMeta(meta, id, secret);
        stream.on('finish', resolve);
      });
    });

    const blobStream = new Promise(resolve => {
      this.storeStream(file, id, secret).on('finish', resolve);
    });

    return Promise.all([metaStream, blobStream])
    .then(() => {
      return {
        id,
        secret,
      };
    });
  }

  verify(id, secret) {
    return this.getMeta(id, secret)
    .then(() => true)
    .catch(err => {
      console.error('Verify for claim %s failed', id, err);
      return false;
    });
  }
}

module.exports = Store;
