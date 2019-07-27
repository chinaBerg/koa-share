require('should');
const app = require('../app');
const request = require('supertest');

/**
 * 单元测试
 */
// describe('GET /', () => {
//   it('should return status with 200', (done) => {
//     request(app)
//       .get('/')
//       .expect(200)
//       .end((err, res) => {
//         if (err) return done(err);
//         done();
//       });
//   })
// })
describe('GET /artiles/:id', () => {
  it('should an article info', (done) => {
    request(app)
      .get('/api/articles/5d2edc370fddf68b438b6b53')
      .set()
      .expect(200, done);
  });
});
