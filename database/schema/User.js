const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { Schema } = mongoose;

let ObjectId = Schema.Types.ObjectId;
const SALT_ROUNDS = 10;

// 创建用户的schema
const userSchema = new Schema({
  UserId: ObjectId,
  userName: {
    unique: true,
    type: String
  },
  password: String,
  createAt: {
    default: Date.now(),
    type: Date
  },
  lastLoginAt: {
    type: Date,
    default: Date.now()
  },
  likes: {
    type: Array,
    default: []
  },
  collect: {
    type: Array,
    default: []
  }
});

// 每次保存时进行密码加密
// 注意此处pre的第二个参数，不能是箭头函数，不然拿不到this
userSchema.pre('save', function(next) {
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      this.password = hash;
      next();
    });
  });
});

// 定义userSchema的实例方法
// 解密user password
userSchema.methods = {
  comparePassword (userPassword, passwordHash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(userPassword, passwordHash, (err, res) => {
        if (!err) return resolve(res);
        return reject(err);
      });
    });
  }
}

mongoose.model('User', userSchema);