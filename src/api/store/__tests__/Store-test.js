const expect = require('expect.js');
const sinon = require('sinon');

const fs = require('fs');
const path = require('path');
const {Readable, Writable} = require('stream');

const {hash} = require('../stream');
const Store = require('../Store');

function FakeAdapter() {
  this.files = new Map();

  this.getStream = sinon.spy(name => {
    const stream = new Readable();
    this.files.get(name).forEach(chunk => {
      stream.push(chunk);
    });
    stream.push(null);
    return stream;
  });

  this.putStream = sinon.spy((name, stream) => {
    const output = new Writable();
    const chunks = [];
    this.files.set(name, chunks);
    sinon.stub(output, '_write').callsFake((chunk, encoding, next) => {
      chunks.push(chunk);
      next();
    });
    return stream.pipe(output);
  });
}

describe('Store', () => {
  const MOCK_ID = 'Aa12xea2';
  let store, adapter;

  beforeEach(() => {
    adapter = new FakeAdapter();
    store = new Store(adapter);
    sinon.stub(store, 'createId').returns('Aa12xea2');
    sinon.stub(store, 'createSecret').returns('8q3mu093ny9q0qm8nyntm0r9u0cqynq09mu9q0wuq9-91h-10jf-01901rh1hr1d');
  });

  describe('when storing stream', () => {
    let storePromise;

    beforeEach(() => {
      const file = fs.createReadStream(path.join(__dirname, 'fixtures', 'photo.jpg'));
      storePromise = store.store(file, {
        mime: 'image/jpg',
        filename: 'other_filename.png',
      });

      return storePromise;
    });

    it('returns a Promise', () => {
      expect(storePromise).to.be.a(Promise);
    });

    it('stores meta data encrypted', () => {
      expect(adapter.files.get('Aa12xea2.meta').toString('hex'))
      .to.be('1953b238db9498f23cd5484e584a90316e3f4f534897b0d28ba8188c12c4b579a8d1a70eda1f00186809e0ff7bbe030d81876ca2795d7015b9eb928da30df77c80');
    });

    describe('when resolved', () => {
      let receipt;

      beforeEach(() => {
        return storePromise.then(response => {
          receipt = response;
        });
      });

      it('contains a receipt', () => {
        expect(receipt).to.be.an(Object);
      });

      describe('Receipt', () => {
        it('contains file id', () => {
          expect(receipt.id).to.equal(MOCK_ID);
        });

        it('contains secret', () => {
          expect(receipt.secret.length).to.be(64);
        });

        describe('when used to retreive file', () => {
          let retreivePromise;

          beforeEach(() => {
            retreivePromise = store.retrieve(receipt.id, receipt.secret);
          });

          it('returns a Promise', () => {
            expect(retreivePromise).to.be.a(Promise);
          });

          describe('when resolved', () => {
            let result;

            beforeEach(() => {
              return retreivePromise.then(_r => {
                result = _r;
              });
            });

            it('contains meta', () => {
              expect(result.meta).to.be.an(Object);
            });

            describe('Meta', () => {
              let meta;

              beforeEach(() => {
                meta = result.meta;
              });

              it('has mime type', () => {
                expect(meta.mime).to.equal('image/jpg');
              });

              it('contains filename', () => {
                expect(meta.filename).to.equal('other_filename.png');
              });

              it('contains filesize', () => {
                expect(meta.size).to.equal(32489);
              });
            });

            it('contains stream with expected data', () => {
              return hash(result.stream, 'sha1').then(digest => {
                expect(digest).to.be('da39a3ee5e6b4b0d3255bfef95601890afd80709');
              });
            });
          });
        });
      });
    });
  });
});
