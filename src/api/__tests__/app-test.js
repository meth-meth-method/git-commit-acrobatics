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

        describe('when retreiving file using id and secret', () => {
          beforeEach(done => {
            test = request(app)
              .get(`/v1/file/download/${body.id}/${body.secret}`)
              .end(done);
          });

          it('status is 200', () => {
            expect(test.response.status).to.be(200);
          });

          describe('Headers', () => {
            it('Content-Length set', () => {
              expect(test.response.header['content-length']).to.be('32489');
            });

            it('Content-Type set', () => {
              expect(test.response.header['content-type']).to.be('image/jpeg');
            });

            it('Content-Disposition set', () => {
              expect(test.response.header['content-disposition'])
              .to.be('attachment; filename="photo.jpg"');
            });
          });

          it('body contains expected data', () => {
            const body = test.response.body;
            expect(body).to.be.a(Buffer);
            expect(body.length).to.be(32489);
            expect(body.slice(0, 20).toString('hex')).to.be('ffd8ffe000104a46494600010200000100010000');
            expect(body.slice(32469, 32489).toString('hex')).to.be('0ded5a9fb8ad350cc3bc7f519ec8380fd54fffd9');
          });
        });
      });
    });
  });
});
