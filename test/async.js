const getInfo = async (bool) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (bool) return resolve('success');
      return reject('fail');
    }, 1000);
  });
};

const asyncFunc = (cb) => {
  setTimeout(() => {
    console.log('async init after 1000')
    cb()
  }, 1000)
}

module.exports = {
  getInfo,
  asyncFunc
}
