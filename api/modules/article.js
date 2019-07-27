const Router = require('koa-router');
const mongoose = require('mongoose');
const { getUserInfo } = require('../../utils/user');

const router = new Router();

// 创建文章
router.post('/articles', async ctx => {
  let data = ctx.request.body;
  // 文章标题和作者必传
  if (!data || !data.title || !data.content) {
    return ctx.body = {
      code: 403,
      message: '参数错误'
    };
  }
  try {
    const { userName } = getUserInfo(ctx);
    try {
      data.author = userName
      const articleModal = mongoose.model('Article');
      const newArticle = articleModal(data);
      // 存储数据
      await newArticle.save()
      return ctx.body = {
        code: 200,
        message: '保存成功'
      };
    } catch (error) {
      return ctx.body = {
        code: 500,
        message: error.message
      };
    }
  } catch (error) {
    return ctx.body = {
      code: 500,
      message: error.message || '获取出错'
    }
  }
});

// 查询文章详情
router.get('/articles/:id', async (ctx) => {
  const id = ctx.params.id;
  if (!id) {
    ctx.body = {
      code: 403,
      message: '参数错误'
    }
    return;
  }
  const articleModal = mongoose.model('Article');
  await articleModal.findById(id).exec()
    .then(doc => {
      return ctx.body = {
        code: 200,
        data: doc,
        message: 'ok'
      };
    })
    .catch(() => {
      return ctx.body = {
        code: 500,
        message: '文章不存在'
      }
    })
});

router.post('/like/:id', async ctx => {
  const { id } = ctx.params
  if (!id) {
    return ctx.body = {
      code: 403,
      message: '参数错误'
    };
  }
  try {
    const { _id } = await getUserInfo(ctx)
    const likeModel = mongoose.model('UserArticleLike');
    const query = { cId: _id, articleId: id };
    const doc = await likeModel.findOne(query)
    console.log('doc', doc)
    if (!doc) {
      await likeModel(query).save();
      return ctx.body = {
        code: 200,
        message: '点赞成功'
      };
    }
    if (doc.type === 1) {
      console.log(123321)
      doc.type = 0
      doc.save();
      return ctx.body = {
        code: 200,
        message: '取消成功'
      };
    }
    if (doc.type === 0) {
      doc.type = 1
      doc.save();
      return ctx.body = {
        code: 200,
        message: '点赞成功'
      };
    }
  } catch (error) {
    return ctx.body = {
      code: 500,
      message: error.message
    }
  }
})

module.exports = router;
