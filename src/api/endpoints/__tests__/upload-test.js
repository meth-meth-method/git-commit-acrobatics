const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest');
const express = require('express');

const path = require('path');

const upload = require('../upload');

function MockStorage() {
	this.store = sinon.spy(() => Promise.resolve({
	  id: 'mock-id',
	  secret: 'mock-secret',
	}));
}

describe('Upload endpoint', () => {
	let mockStorage, app, test;

	beforeEach(() => {
	  mockStorage = new MockStorage();
	  app = express();
	  app.use(upload(mockStorage));
	});

	describe('when no file in payload', () => {
	  beforeEach(done => {
	    test = request(app)
	      .post('/')
	      .end(done);
	  });

	  it('status is 400', () => {
	    expect(test.response.status).to.be(400);
	  });

	  it('body is descriptive', () => {
	    expect(test.response.text).to.be('No file.');
	  });

	  it('storage has not been touched', () => {
	    expect(mockStorage.store.callCount).to.be(0);
	  });
	});

	describe('when file in payload', () => {
	  beforeEach(done => {
	    test = request(app)
	      .post('/')
	      .attach('foobar', path.join(__dirname, '/fixtures/photo.jpg'))
	      .end(done);
	  });

	  it('status is 200', () => {
	    expect(test.response.status).to.be(200);
	  });

	  it('response contains id and secret', () => {
	    expect(test.response.text).to.be('{"id":"mock-id","secret":"mock-secret"}');
	  });

	  it('calls store method on storage', () => {
	    expect(mockStorage.store.callCount).to.be(1);
	  });

	  describe('.store call', () => {
	    it('supplied file stream', () => {
	      expect(mockStorage.store.getCall(0).args[0].read)
	      .to.be.a(Function);
	    });

	    it('supplied meta', () => {
	      expect(mockStorage.store.getCall(0).args[1])
	      .to.eql({
	        name: 'photo.jpg',
	        mime: 'image/jpeg',
	      });
	    });
	  });
	});
});
