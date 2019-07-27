const mongoose = require('mongoose');
const xss = require('xss');
const { Schema } = mongoose;

let ObjectId = Schema.Types.ObjectId;

// 创建用户的schema
const articleSchema = new Schema({
  UserId: ObjectId,
  title: {
    unique: false,
    type: String
  },
  content: {
    unique: false,
    type: String
  },
  author: {
    type: String
  }
}, {
  timestamps: {
    createdAt: 'createdAt',
    updatedAt: 'updatedAt'
  }
});

// 每次保存时进行密码加密
// 注意此处pre的第二个参数，不能是箭头函数，不然拿不到this
articleSchema.pre('save', function(next) {
  this.title = xss(this.title);
  this.content = xss(this.content);
  next();
});

mongoose.model('Article', articleSchema);