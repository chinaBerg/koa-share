const Router = require('koa-router');
const mongoose = require('mongoose');
const { createToken } = require('../../utils/account');

const router = new Router();

/**
 * 用户注册
 * @param { String } userName 用户名
 * @param { String } password 密码
 */
router.post('/register', async (ctx) => {
  let data = ctx.request.body;
  // 验证参数合法性
  if (!data.userName || !data.password || data.password.length < 6) {
    return ctx.body = {
      code: 403,
      message: '参数错误'
    };
  }

  // 先检查用户是否存在
  const User = mongoose.model('User');
  const checkByUserName = { userName: data.userName };
  await User.findOne(checkByUserName)
    .then(async (doc) => {
      // 用户不存在的时候创建新用户，存入数据库
      if (!doc) {
        await User(data).save()
          .then(() => {
            return ctx.body = {
              code: 200,
              message: 'ok'
            };
          })
          .catch(error => {
            return ctx.body = {
              code: 500,
              message: error || '用户创建失败'
            };
          })
      // 用户已存在提示‘已存在’
      } else {
        return ctx.body = {
          code: 400,
          message: '用户已存在'
        };
      }
    })
    .catch((error) => {
      ctx.body = {
        code: 500,
        message: error || '创建失败'
      };
    })
});

/**
 * 用户登录
 * @param { String } userName 用户名
 * @param { String } password 密码
 */
router.post('/login', async ctx => {
  const data = ctx.request.body;
  if (!data.userName || !data.password) {
    return ctx.body = {
      code: 403,
      data: null,
      message: '参数错误'
    };
  }
  const userModal = mongoose.model('User');
  const userInstance = new userModal();
  const query = { userName: data.userName };
  // 先查找用户是否存在
  await userModal.findOne(query).exec()
    .then(async res => {
      await userInstance.comparePassword(data.password, res.password).then((isMatch) => {
        if (isMatch) {
          // 给前端生成token
          const token = createToken(res)
          return ctx.body = {
            code: 200,
            data: token,
            message: 'ok'
          };
        }
        return ctx.body = {
          code: 400,
          message: '账号密码错误'
        };
      }).catch((err) => {
        ctx.body = {
          code: 500,
          message: err.message
        };
      })
    }).catch(() => {
      return ctx.body = {
        code: 400,
        data: null,
        message: '当前用户不存在'
      };
    });
});

// 查找用户信息
router.get('/user/:userId', async ctx => {
  const id = ctx.params.userId
  if (!id) {
    return ctx.body = {
      code: 403,
      message: '请输入客户id'
    };
  }
  const User = mongoose.model('User');
  await User.findById(id, (err, doc) => {
    if (err) {
      return ctx.body = {
        code: 500,
        message: error || '查询失败'
      };
    } else {
      return ctx.body = {
        code: 200,
        data: doc,
        message: 'ok'
      }
    }
  });
});

module.exports = router;
