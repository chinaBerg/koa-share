const mongoose = require('mongoose');
const glob = require('glob');
const path = require('path');

const DB_ADDRESS = 'mongodb://localhost/koa-test';
let connectConfig = { useNewUrlParser: true };

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

const log = console.log.bind(console);

const connect = () => {
  let connectTimes = 0;
  const MAX_CONNECT_TIMES = 3;

  // 断线重连
  const reconnectDB = (resolve, reject) => {
    if (connectTimes < MAX_CONNECT_TIMES) {
      connectTimes++;
      mongoose.connect(DB_ADDRESS, connectConfig);
    } else {
      log('[mongodb] database connect fail!');
      reject();
    }
  }

  // 连接数据库
  mongoose.connect(DB_ADDRESS, connectConfig);

  return new Promise((resolve, reject) => {
    // 监听数据库断开
    mongoose.connection.on('disconnected', () => {
      reconnectDB(reject);
    });

    mongoose.connection.on('error', err => {
      log(err);
      reconnectDB(reject);
    });

    mongoose.connection.on('open', () => {
      // log('[mongodb server] database connect success!');
      resolve();
    });
  });
};

exports.connect = connect;

exports.initSchemas = () => {
  glob.sync(path.resolve(__dirname, './schema/', '**/*.js')).forEach(require);
}