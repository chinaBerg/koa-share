const Koa = require('koa');
const bodyParser = require('koa-bodyparser');
const { connect, initSchemas } = require('./database/index');
const jwt = require('koa-jwt');
const { JWT_SECRET } = require('./utils/account');
const router = require('./api');

const app = new Koa();

// 使用数据库
;(async () => {
  await connect();
  initSchemas();
})();

// jwt验证错误的处理
// 放在jwt中间件挂载之前
app.use(function(ctx, next){
  return next().catch((err) => {
    if (401 == err.status) {
      ctx.status = 401;
      ctx.body = {
        code: 401,
        message: '暂无权限'
      };
    } else {
      throw err;
    }
  });
});

// 挂载jwt中间件
// jwt封装了koa-less方法，只有koa-less参数不匹配的情况下，才执行前面的中间件
// 更多koa-less的参数使用方式，参数文档https://github.com/Foxandxss/koa-unless
app.use(
  jwt({ secret: JWT_SECRET }).unless({
    path: [
      '/',
      '/api',
      '/api/login',
      '/api/register'
    ]
  })
);

// 挂在路由前先挂载 koa-bodyparser
app.use(bodyParser());

// 挂载路由
app.use(router.routes());
app.use(router.allowedMethods());

// 启动服务
const appService = app.listen(3000, () => {
  console.log('[node]server is starting at localhost:3000')
});

// 导出服务，供单测使用
module.exports = appService;
