const Router = require('koa-router');

// 引入所有路由模块
const User = require('./modules/user');
const Article = require('./modules/article');

const router = new Router({
  prefix: '/api'
});

// 注册路由''
router.use(User.routes(), User.allowedMethods());
router.use(Article.routes(), Article.allowedMethods());

module.exports = router;
