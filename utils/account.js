const JWT = require('jsonwebtoken');

const JWT_SECRET = 'system-user-token';

// 生成JWT Token
exports.createToken = (config = {}, expiresIn = '7 days') => {
  const { userName, _id } = config;
  const options = { userName, _id };
  const custom = { expiresIn };
  return JWT.sign(options, JWT_SECRET, custom);
};

// 解析JWT Token
exports.decodeToken = (token) => {
  return JWT.decode(token);
};

// 从ctx中解析authorization
exports.parseAuth = ctx => {
  if (!ctx || !ctx.header.authorization) return null;
  console.log(ctx.header.authorization)
  const parts = ctx.header.authorization.split(' ');
  if (parts.length < 2) return null;
  return parts[1];
}

exports.JWT_SECRET = JWT_SECRET;
