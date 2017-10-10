const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const {Readable} = require('stream');

const download = require('../download');

function MockStorage() {
	this.retrieve = sinon.spy(() => {
	  const stream = new Readable();
	  stream.push('fake body data');
	  stream.push(null);

	  return Promise.resolve({
	    stream,
	    meta: {
	      name: 'foobar.jpg',
	      mime: 'image/jpeg',
	      size: 123412,
	    },
	  });
	});
}

describe('Download endpoint', () => {
	let mockStorage, app, test;

	beforeEach(() => {
	  mockStorage = new MockStorage();
	  app = express();
	  app.use(download(mockStorage));
	});

	describe('when id missing', () => {
	  beforeEach(done => {
	    test = request(app)
	      .get('/')
	      .end(done);
	  });

	  it('status is 404', () => {
	    expect(test.response.status).to.be(404);
	  });

	  it('storage has not been touched', () => {
	    expect(mockStorage.retrieve.callCount).to.be(0);
	  });
	});

	describe('when id specified', () => {
	  beforeEach(done => {
	    test = request(app)
	      .get('/mock-file-id/mock-secret')
	      .end(done);
	  });

	  it('status is 200', () => {
	    expect(test.response.status).to.be(200);
	  });

	  it('response contains body of stream', () => {
	    expect(test.response.body.toString()).to.be('fake body data');
	  });

	  describe('Headers', () => {
	    it('Content-Length set', () => {
	      expect(test.response.header['content-length']).to.be('123412');
	    });

	    it('Content-Type set', () => {
	      expect(test.response.header['content-type']).to.be('image/jpeg');
	    });

	    it('Content-Disposition set', () => {
	      expect(test.response.header['content-disposition']).to.be('attachment; filename="foobar.jpg"');
	    });
	  });

	  it('calls store method on storage', () => {
	    expect(mockStorage.retrieve.callCount).to.be(1);
	  });

	  describe('retrieve call', () => {
	    it('contained id', () => {
	      expect(mockStorage.retrieve.getCall(0).args[0])
	        .to.be('mock-file-id');
	    });

	    it('contained secret', () => {
	      expect(mockStorage.retrieve.getCall(0).args[1])
	        .to.be('mock-secret');
	    });
	  });
	});
});
