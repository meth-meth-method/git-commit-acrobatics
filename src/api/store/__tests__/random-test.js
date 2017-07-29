const expect = require('expect.js');
const sinon = require('sinon');

const crypto = require('crypto');

const random = require('../random');

describe('Random', () => {
  const FAKE_BYTES = '109hf1-920jf1';

  beforeEach(() => {
    sinon.stub(crypto, 'randomBytes').callsFake(() => Buffer.from(FAKE_BYTES));
  });

  afterEach(() => {
    crypto.randomBytes.restore();
  });

  describe('when called', () => {
    let result;

    beforeEach(() => {
      result = random(FAKE_BYTES.length);
    });

    it('gets random bytes from crypto', () => {
      expect(crypto.randomBytes.callCount).to.be(1);
    });

    it('honors length', () => {
      expect(crypto.randomBytes.getCall(0).args[0]).to.be(13);
    });

    it('returns generated string', () => {
      expect(result).to.be('xjeKylUPDzhL8');
    });
  });
});
