const mongoose = require('mongoose');
const { decodeToken, parseAuth } = require('./account');

// 从authorization解析出用户_id和userName
const getUserInfo = ctx => {
  return new Promise(async (resolve, reject) => {
    const authorization = parseAuth(ctx);
    const tokenDecoded = decodeToken(authorization);
    const { _id } = tokenDecoded;
    const userModal = mongoose.model('User');
    await userModal.findById(_id).exec()
      .then(res => {
        return resolve(res)
      })
      .catch(err => {
        reject(err);
      })
  })
};

exports.getUserInfo = getUserInfo;
