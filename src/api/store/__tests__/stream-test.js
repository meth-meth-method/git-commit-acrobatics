const expect = require('expect.js');

const fs = require('fs');
const path = require('path');
const {Readable} = require('stream');
const {consume, hash} = require('../stream');

describe('Stream util', () => {
	describe('#consume', () => {
	  let promise;

	  beforeEach(() => {
	    const stream = new Readable();
	    stream.push('a little message');
	    promise = consume(stream);
	    stream.push(' that is put together');
	    stream.push(' in parts');
	    stream.push(null);
	  });

	  it('returns a Promise', () => {
	    expect(promise).to.be.a(Promise);
	  });

	  it('resolves with all contents from stream', () => {
	    return promise.then(content => {
	      expect(content).to.be('a little message that is put together in parts');
	    });
	  });
	});

	describe('#hash', () => {
	  let readstream;

	  beforeEach(() => {
	    readstream = fs.createReadStream(path.join(__dirname, 'fixtures', 'photo.jpg'));
	  });

	  [
	    ['sha1', 'e0ca7fef3e168d51dc34403dd34b7613c3cc80c2'],
	    ['md5', '3c199665351f4697ca1e5a48d2bbce29'],
	  ].forEach(([algo, expected]) => {
	    describe(`calculating ${algo}`, () => {
	      let promise;

	      beforeEach(() => {
	        promise = hash(readstream, algo);
	      });

	      it('returns a promise', () => {
	        expect(promise).to.be.a(Promise);
	      });

	      it(`resolves to hash ${expected}`, () => {
	        return promise.then(digest => {
	          expect(digest).to.be(expected);
	        });
	      });
	    });
	  });
	});
});
