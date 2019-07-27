require('should');
const lib = require('./index');
const asyncTest = require('./async');

/**
 * 单元测试
*/
describe('Math', () => {
  describe('#iterate', () => {
    it('should return 10', () => {
      lib.iterate(5, 5).should.be.equal(10);
    });
    it('should return 0', () => {
      lib.iterate().should.be.equal(0);
    });
    it('should return 10', () => {
      lib.iterate(1, 1).should.be.equal(10);
    });
  });

  describe('#createObj', () => {
    it('should return an object', () => {
      should(lib.createObj('xiaomi')).be.a.Object();
    });
  });
});

describe('Async', () => {
  // describe('#getInfo', () => {
  //   it('should return success', done => {
  //     (async function () {
  //       try {
  //         await asyncTest.getInfo(false);
  //         done();
  //       } catch (error) {
  //         done(error)
  //       }
  //     })();
  //   });
  // });
  // describe('#getInfo', () => {
  //   it('should return success', async () => {
  //     await asyncTest.getInfo(false);
  //   });
  // });
})
// describe('#asyncFunc', () => {
  //   it('should an async function', (done) => {
  //     asyncTest.asyncFunc(done)
  //   })
  // })