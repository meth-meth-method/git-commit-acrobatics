const expect = require('expect.js');

const fs = require('fs');
const {Readable} = require('stream');

const {consume} = require('../../stream');
const DiskStorageAdapter = require('../DiskStorage');

describe('Disk Storage Adapter', () => {
  const FAKE_ID = 'tango-transfer-fake-file';
  let storage;

  beforeEach(() => {
    storage = new DiskStorageAdapter('/tmp');
  });

  describe('#putStream', () => {
    let stream;

    beforeEach(done => {
      const input = new Readable();
      stream = storage.putStream(FAKE_ID, input);
      input.push('File contents\n');
      input.push('This file has text in it');
      input.push(null);
      stream.on('finish', done);
    });

    afterEach(done => {
      fs.unlink('/tmp/tango-transfer-fake-file', done);
    });

    it('writes stream to disk', done => {
      fs.stat('/tmp/tango-transfer-fake-file', (err, res) => {
        expect(res.size).to.be(38);
        done(err);
      });
    });

    describe('#getStream', () => {
      let input;

      beforeEach(() => {
        input = storage.getStream(FAKE_ID);
      });

      it('returns readable stream for file on disk', () => {
        return consume(input).then(contents => {
          expect(contents).to.be('File contents\nThis file has text in it');
        });
      });
    });
  });
});
