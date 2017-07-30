const expect = require('expect.js');
const sinon = require('sinon');
const request = require('supertest');
const path = require('path');

const {createApp} = require('../app');

describe('App', () => {
  let app, test;

  describe('using disk config', () => {
    const config = {
      store: {
        adapter: 'disk',
        disk: {
          dir: '/tmp',
        },
      },
    };

    beforeEach(() => {
      app = createApp(config);
    });

    describe('POST file', () => {
      beforeEach(done => {
        test = request(app)
          .post('/v1/file/upload')
          .attach('foobar', path.join(__dirname, 'fixtures', 'photo.jpg'))
          .end(done);
      });

      it('status is 200', () => {
        expect(test.response.status).to.be(200);
      });

      describe('body', () => {
        let body;

        beforeEach(() => {
          body = JSON.parse(test.response.text);
        });

        it('contains id', () => {
          expect(body.id).to.be.a('string');
          expect(body.id.length).to.be(8);
        });

        it('contains secret', () => {
          expect(body.secret).to.be.a('string');
          expect(body.secret.length).to.be(64);
        });

        describe('when retreiving file using id', () => {
          beforeEach(done => {
            test = request(app)
              .get(`/v1/file/download/${body.id}`)
              .end(done);
          });

          it('status is 200', () => {
            expect(test.response.status).to.be(200);
          });
        });
      });
    });
  });
});
