const mongoose = require('mongoose');
const { Schema } = mongoose;
let ObjectId = Schema.Types.ObjectId;

const UserArticleLike = new Schema({
  ObjectId,
  cId: {
    type: String
  },
  articleId: {
    type: String
  },
  type: {
    type: Number,
    default: 1
  }
});

mongoose.model('UserArticleLike', UserArticleLike);
