# koa-share
koa2与mongoDb的知识分享

### Installation

```
npm install
```
### Usage

```
node app.js
```

注意：还需要安装mongoDb数据库，文章中有讲解。

### Course


随着Node.js的横空处世，本来目的是解决部分后端的问题，谁知道却无意间给前端开发带来了一场颠覆性的革命，从此前端拉开了现代化开发的序幕。如今，作为前端开发，无论是想进阶或是拓宽个人知识边界，node.js早已是前端必须掌握的了。拿下node.js，你还在犹豫什么？

Koa.js是基于node.js的一个开发框架，小巧灵活，对于一些中小型项目开发还是比较友好的。Koa上手简单，因此成为了不少小伙伴上手node开发的选择之一。本文主要从以下几个方面讲解koa后端开发最核心的部分内容，让人人都是全栈小能手：

- 安装Koa2与启动一个hello world服务
- Koa的接口开发
- 什么是REST API？
- 在Koa开发REST风格的API
- 使用PostMan测试我们的接口
- Koa中安装
- MongoDb可视化工具的使用
- mongoose操作MongoDb数据库
- 对前端提交的密码进行加密与解密
- Koa中使用JWT做登录鉴权
- 过滤用户提交的数据，防止XSS攻击
- 使用mocha进行同步、异步和接口的单元测试
- 单元测试覆盖率

### 安装Koa2与启动一个hello world服务

开发node后端需要安装node.js环境和npm包管理工具，这块就不多说了，相信现在的前端小伙伴基本都会的。首先创建一个文件文件夹作为我们的项目目录：

```javascript
// 终端。创建koa-test并进入该目录
mkdir koa-test
cd koa-test
```
 
紧接着，像我们平时做前端项目一样安装koa库：

```javascript
// 终端：安装koa2
cnpm i koa -S
```

根目录下创建app.js作为我们程序的入口，就像我们vue项目中的main.js:

```javascript
// 引入Koa库并初始化
const Koa = require('koa');
const app = new Koa();

// 启动服务
// 监听3000端口，就像vue中默认的是监听8080一样
// 当然了你也可以监听其他端口
const appService = app.listen(3000, () => {
  console.log('[Koa]Server is starting at localhost:3000');
});

// 导出服务(是为了供单测使用)
// 即使这里不导出也正常可以跑项目，后面会讲解这里为什么需要导出
module.exports = appService;
```

最后在终端启动我们的程序服务：

```javascript
// node是node.js的命令
node app.js
```

如下图，在浏览器输入localhost:3000，就可以看我们开启的服务了：

![node server start success](https://user-gold-cdn.xitu.io/2019/7/27/16c33ea2d7f35916?w=842&h=176&f=png&s=26626)

### koa路由（接口编写）

关于接口，相信大家都不陌生。作为前端开发，每天都会和后台人员提供的接口打交道。下面，我们看如何在Koa开发的服务中，开发供前端使用的接口吧！

- 开发接口，其实就是在Koa中写路由，需要用到`koa-router`这个库，就好比前端vue开发中的vue-router也是前端的路由一样：

```javascript
// 安装路由库
// -S是--save的简写，表示在生成环境中使用
// -D是--save-dev的简写，表示在开发环境中使用
cnpm i koa-router -S

// 对于前端的参数，我们是需要获取使用的
// get提交的参数我们可以轻松获得，
// 但是post的数据，我们需要解析才能使用
// 因此需要安装koa-bodyparser库来处理post的数据
// 终端执行：
cnpm i koa-bodyparser -S
```

- 挂载koa-bodyparser和api路由
 
出于标准，我们需要将api相关的内容独立出来。就像我们vue项目开发中的src下也会分components、pages、api、assets等。这里我们在根目录下创建api文件夹，用来存放我们的路由文件，如图：

![api](https://user-gold-cdn.xitu.io/2019/7/27/16c33f3035bce51e?w=512&h=250&f=png&s=21966)

koa-test/api/index.js是我们api模块的出口，modules文件用来存放所有的API模块，例如这里有user相关接口都在user.js中等。具体的内容会放在后面细说。

下面我们看如何在app.js中挂载路由和其他中间件：

```javascript
// koa-test/app.js

// 引入koa-bodyparser用于解析post数据
const bodyParser = require('koa-bodyparser');

// 引入根目录下的api路由
// 即把koa-test/api/index.js暴露出来的路由引入进来
const router = require('./api')

// app.js中挂载koa-bodyparser
// 注意：在路由挂载前先挂载 koa-bodyparser
app.use(bodyParser());

// 挂载路由
// 服务启动后可以在浏览器输入localhost:3000看到提示
app.use(async ctx => ctx.body = '服务启动成功');
app.use(router.routes());
app.use(router.allowedMethods());

// 省略上面的其他代码
```

- 编写api的index.js

```javascript
// 引入koa-router
const Router = require('koa-router');

// 引入modules文件夹下的路由模块
const articleRouter = require('./modules/articles');

// 实例化Router中间件
const router = new Router();

// 注册路由
// 注意该路由模块文件在注册时增加了'/articles前缀
// 即该模块下所有的接口地址都会以/articles作为前缀
router.use('/articles', articleRouter.routes(), articleRouter.allowedMethods())

// 将注册后的路由导出
// 供app.js中的koa挂载
module.exports = router;
```

- 编写具体的路由文件，eg：`articles.js`文件：

```javascript
// 还是需要先导入koa-router
const Router = require('koa-router');
// 实例化router
const router = new Router();

// 注册get方法
// 可以通过ctx.query获取parse后的参数
// 或者通过ctx.queryString获取序列化后的参数
router.get('/list', (ctx, next) => {
  ctx.body = {
        code: 200,
        data: [
            {
                id: 1,
                name: '小明',
                sex: 0,
                age: 22
            }
        ],
        message: 'ok'
    };
});

// 注册post方法
// app.js中挂载koa-bodyparse中间件后，
// 可以通过ctx.request.body获取post参数
// eg：这里的data就是前端post时提交的数据
router.post('/update', (ctx, next) => {
    let data = ctx.request.body
    ctx.body = {
        code: 200,
        data,
        message: 'ok'
    };
});

// 将该模块的路由（api接口）暴露出去
// 供api/index.js路由注册
module.exports = router;
```

这里的`ctx.body`，就是返回给前端的json数据。

基本的路由编写就到这了，当然了，实际业务开发中还会涉及到put、delete类型等等的接口。基本写法都大同小异，这里附上[koa-router的官网文档地址](https://www.npmjs.com/package/koa-router)，查看更多的路由编写细节把。

### 什么是REST API？

引用网上的定义就是：

> REST 指的是一组架构约束条件和原则。
> 满足这些约束条件和原则的应用程序或设计就是 RESTful

下面看如何定义rest风格的api接口：

```javascript
// 获取操作使用get：
// 例如：获取全部文章
get /api/articles
// 带搜索条件带获取文章（例如页数、每页条数、文章类型等等）
get /api/articles?page=1=pageSize=50&type=1
// 获取id为12345带单条文章
get /api/articles/12345

// 资源分类，
// eg：获取id为12345的文章的评论
get /api/articles/12345/comments
// 获取id为12345的文章的带搜索条件的评论
get /api/articles/12345/comments?page=1&pageSize=50

// 提交数据使用post类型：
// 创建文章
post /api/articles

// 更新数据使用put类型：
// 例如：更新id为12345的文章内容
put /api/articles/12345

// 删除id为12345的文章
delete /api/articles/12345
```
REST风格的API编写可以参考阮一峰大大的这篇 [编写REST API](https://www.liaoxuefeng.com/wiki/1022910821149312/1105003357927328) 文章

### 在Koa开发REST风格的API

在Koa中开发REST风格的API也很简单，koa-router为我们的ctx对象提供了params对象，可以获取REST风格的API中的参数。很像vue-router中的动态路由有木有？

```javascript
router.get('/user/:userId', async ctx => {
    // 获取动态路由的参数
    // 通过koa-router提供的ctx.params对象获取
    const id = ctx.params.userId
    // 省略其他代码
}
```

### 使用PostMan测试我们的接口

我们在开发接口过程中，肯定需要测试我们写的接口正不正确，有木有按照预期返回结果。那么怎么访问我们的接口查看是否正确呢？最简单的肯定有那么一款工具完，我们直接在上面操作就好了，呢～～如下，可以安装postman使用：

![postman](https://user-gold-cdn.xitu.io/2019/7/27/16c340cd8c12b209?w=1958&h=938&f=png&s=1311845)

这样的话，我们可以创建接口来访问我们写的接口服务，还可以携带各种参数，调试起来还是非常方便的，这个就不多说了，网上搜postman下载就可以了，免费开源的。

### Koa中安装、操作MongoDb数据库

OK，上面说完了编写接口，对应的肯定需要我们操作数据库，然后给前端返回数据，例如基本的增删改查呀。下面先看基本mongodb数据的安装吧，这里以Mac OS为列：

这里介绍的是在终端用curl的方式安装的（显示骚骚的～～），其实直接到官网下载mongo的安装包也是一样的：

- （很骚气滴）安装mongoDb

```
# 进入 /usr/local
cd /usr/local

# 下载
sudo curl -O https://fastdl.mongodb.org/osx/mongodb-osx-ssl-x86_64-4.0.9.tgz

# 解压
sudo tar -zxvf mongodb-osx-ssl-x86_64-4.0.9.tgz

# 重命名为 mongodb 目录
sudo mv mongodb-osx-x86_64-4.0.9/ mongodb

// 添加环境变量
export PATH=/usr/local/mongodb/bin:$PATH

// 新建一个数据库存储目录
sudo mkdir -p /data/db

// 启动mongod
sudo mongod
```

mongodb的安装过程很简单，就不赘述了，更多的安装方法可以参考
[mongoDb 安装参考地址](https://www.runoob.com/mongodb/mongodb-osx-install.html)

### MongoDb可视化工具的使用

mongodb的可视化工具，我这里推荐的是Studio 3T，可以很方便的连接数据库，查看数据库的内容，或者操作数据库等。

![](https://user-gold-cdn.xitu.io/2019/7/27/16c3410deff28a7d?w=1958&h=1336&f=png&s=1285696)

最后这里附上[Robo3的下载安装地址](https://robomongo.org/download)，安装很简单，就像装个qq一样，不赘述了。

### mongoose操作MongoDb数据库

在node中，我们基本上是使用mongoose连接、操作数据库。首先，我们需要安装mongoose：

```javascript
// 安装mongoose
cnpm i mongoose -S
```

而后，在文件根目录下新建databse文件夹，用来专门放置连接和操作数据相关的文件：

![](https://user-gold-cdn.xitu.io/2019/7/27/16c3414fa5cc6f16?w=540&h=736&f=png&s=68253)

database/index.js中，我们用来写连接数据库的方法，最后将其导出供app.js中连接使用：

```javascript
// 引入mongoose库
const mongoose = require('mongoose');

// 定义数据库地址的常量
// 更标准的可以新建一个数据配置文件，
// 用来专门存放数据相关的配置，比如账号密码等等
const DB_ADDRESS = 'mongodb://localhost/koa-test';

mongoose.Promise = global.Promise;
mongoose.set('useCreateIndex', true);

// 简单封装log
const log = console.log.bind(console);

// 定义连接函数
const connect = () => {
  // 重连次数
  let connectTimes = 0;
  // 设置最大重连次数
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
    // 监听数据库断开，重新连接
    mongoose.connection.on('disconnected', () => {
      reconnectDB(reject);
    });
    // 监听数据库连接出错，重新连接
    mongoose.connection.on('error', err => {
      log(err);
      reconnectDB(reject);
    });
    // 监听连接成功
    mongoose.connection.on('open', () => {
      log('[mongodb server] database connect success!');
      resolve();
    });
  });
};

// 暴露出去
exports.connect = connect;

// 还需要引入schema，在下面演示
// ……
```

这里主要的作用就是：
    
    （1）通过mongoose.connect()方法连接数据库；  
    
    （2）监听disconnected和error事件，进行数据库重连，并且最多重连三次；
    
    （3）返回promise来告知连接成功与否


- 引入所有的schema

通过之前的文件夹截图可以看出，我们创建了schema文件夹，是用来存放所有数据库建模相关的内容，其实就是通过schema来对数据库进行操作的。下面看下如何导入我们所有的schema下的文件的（虽然一个个引入也是可以的，但是我们是有追求的程序猿～～）：

在databse/index.js：
```javascript
// 引入glob
const glob = require('glob');

// 引入弄的的path方法
// 可以读取、解析、拼接路径等等
const path = require('path');

// 暴露一个initSchemas方法
// 用于导入database/schema文件夹下所有schema
exports.initSchemas = () => {
    // 通过glob读取schema文件夹下内容
    glob.sync(path.resolve(__dirname, './schema/', '**/*.js')).forEach(require);
}
```
不清楚glob用法的，这里附上[glob文档地址](https://www.npmjs.com/package/glob)；

更多mongoose的内容可以查看[mongoose中文文档地址](http://www.mongoosejs.net/docs/index.html)；

- 简单说下path模块常用的方法：

path是node提供的一个模块，主要用来处理和路径相关的内容：

```javascript
// path使用前，还是需要先导入
const path = require('path');

// join方法可以将所有参数连接起来，返回一个路径
path.join() 
// eg：
path.join('a', 'b', 'c', 'd'); // a/b/c/d
path.join(__dirname, '/a', '//b', '///c', 'd'); // /Users/yoreirei/Documents/demo/node-demo/a/b/c/d
path.join(__dirname, 'a', 'b', '../c', 'd'); // /Users/yoreirei/Documents/demo/node-demo/a/c/d
path.join(__dirname, 'a', './b', './c', './d'); // /Users/yoreirei/Documents/demo/node-demo/a/b/c/d

// parse方法将路径解析为一个路径对象
path.parse()
// eg：
path.parse(path1) // { root: '', dir: 'a/b/c', base: 'd', ext: '', name: 'd' }
path.parse(path2) // { root: '/', dir: '/Users/yoreirei/Documents/demo/node-demo/a/b/c', base: 'd', ext: '', name: 'd' }

// format方法将路径对象转换成路径地址
path.format(parse1) // a/b/c/d
```

注意：`__dirname`获取的是当前文件模块所在的绝对路径。这个前端小伙伴在vue-cli的entry应该看到过，很熟悉吧。

拓展来一下，OK，我们继续schema建模。

- Schema建模，通过schema操作数据库

// database/schema/User.js
```javascript
// 引入mongoose
const mongoose = require('mongoose');
// 获取mongoose.Schema方法用于建模
const { Schema } = mongoose;

// 生成id
let ObjectId = Schema.Types.ObjectId;

// 创建用户的schema
// 例如创建一个包含用户名、密码、创建时间、
// 最后登录时间、点赞内容、收藏内容的schema
const userSchema = new Schema({
  UserId: ObjectId,
  // 我们可以定义每个字段的类型，例如String、Number、Array等等
  // 可以定义该字段的值是否唯一，如果设置了唯一，
  // 那么后续插入相同的值时就会报错
  userName: {
    unique: true,
    type: String
  },
  password: String,
  likes: {
    type: Array,
    default: []
  },
  collect: {
    type: Array,
    default: []
  }
}, {
    // 加入该配置项，会自动生成创建时间
    // 在文档更新时，也会自动更新时间
    timestamps: {
        createdAt: 'createdAt',
        updatedAt: 'updatedAt'
    }
});

// 最后，使用mongoose发布模型
mongoose.model('User', userSchema);
```

使用schema建模就是这么简单，小伙伴可以自己扩展创建其他schema。这个操作其实就类似于其他数据中的建表。

### 对前端提交的密码进行加密与解密

基本上我们的服务中都会涉及到用户的注册和登录等等。而对于用户注册的密码，我们是不会明文保存的，这样是不安全的。一般的做法都是对明文密码进行加密后存储，而用户登录时再对用户的密码加密后后和数据库中加密过的密码进行比对，看是否正确。而前端常见的也可以在用户提交时进行md5等方式的加密提交。

关于加密，我们可以使用bcript对密码的加密与解密。

![密码](https://user-gold-cdn.xitu.io/2019/7/28/16c342db61a834d6?w=591&h=296&f=jpeg&s=26886)

- 加密

我们需要对用户注册时的密码进行加密，使其不可逆。首先，我们需要安装bcript库：

```javascript
// 安装bcript
cnpm i bcript -S
```

database/schema/User.js
```javascript
// 引入bcript
const bcrypt = require('bcrypt');

// 定义bcrip加密时的配置常量
const SALT_ROUNDS = 10;

// 每次保存时进行密码加密
// 注意此处pre的第二个参数，不能是箭头函数，不然拿不到this
userSchema.pre('save', function(next) {
  bcrypt.genSalt(SALT_ROUNDS, (err, salt) => {
    if (err) return next(err);
    bcrypt.hash(this.password, salt, (err, hash) => {
      if (err) return next(err);
      // 将用户提交的密码替换成加密后的hash
      this.password = hash;
      next();
    });
  });
});
```

注意：我们这里的加密做法时，在用户建模的时候，监听save事件，即用户每次存储数据的时候，都会执行我们定义的回调，而我们就在回调的函数中进行加密的操作。

- 解密

验证用户登录的密码时，我们需要拿到用户的密码然后通过bcript验证是否和加密后的数据一样。

database/schema/User.js：

```javascript
// 定义userSchema的实例方法
// 解密user password
// 注意mehtod要加s
userSchema.methods = {
    // 定义一个对比密码是否正确的方法
    // userPassword用户提交的密码
    // passwordHash数据库查出来的加过密的密码
    comparePassword (userPassword, passwordHash) {
        return new Promise((resolve, reject) => {
            bcrypt.compare(userPassword, passwordHash, (err, res) => {
                // 验证完成
                // res值为false|true，表示密码不同/相同
                if (!err) return resolve(res);
                // 验证出错
                return reject(err);
            });
        });
    }
}
```

注意：我们这里的做法是给schema增加一个实例方法，那么我们（例如编写登录接口，那么用户的密码后）通过调用schema的实例去比对密码是否正确。

- 简单演示一下login接口（去掉了参数验证和JWT）

```javascript
/**
 * 用户登录
 * @param { String } userName 用户名
 * @param { String } password 密码
 */
router.post('/login', async ctx => {
  // 前提引入mongoose
  // 获取User集合（类似于其他数据的表）
  const userModal = mongoose.model('User');
  // 集合的实例
  const userInstance = new userModal();
  // 定义查询参数
  const query = { userName: data.userName };
  // 先查找用户是否存在
  await userModal.findOne(query).exec()
    .then(async res => {
      // 用户存在，拿到用户数据
      // 调用集合的实例方法，比对密码是否正确
      // then回调表示验证操作完成
      // 通过返回的参数isMatch（true/false）表示验证是否正确
      await userInstance.comparePassword(data.password, res.password).then((isMatch) => {
        // 验证密码是否正确
        if (isMatch) {
            // 此处省略token生成，会在后面讲解
            // *****
            return ctx.body = {
                code: 200,
                message: 'ok'
            };
        }
        return ctx.body = {
          code: 400,
          message: '账号密码错误'
        };
      }).catch(() => {
        return ctx.body = {
          code: 500,
          message: error.message
        };
      })
    // 用户不存在，直接提示
    }).catch(() => {
      return ctx.body = {
        code: 400,
        data: null,
        message: '当前用户不存在'
      };
    });
});
```

关于bcript的内容可以参考 [bcript的npm文档地址](https://www.npmjs.com/package/bcrypt)

其实关于登录这一块，我们是需要做登录鉴权的，比如是否过期等等，再复杂一些还会有redis持久化等等。这里省略了JWT登录鉴权，下面会介绍。

### Koa中使用JWT做登录鉴权

jwt是常用的用户登录鉴权方式：

（1）前端通过登录接口拿到token，存到本地，前端在后续的增删改查的时候会在请求头携带token。

（2）后端会根据请求时携带的authorization（即用户token），判断用户是否登录过期（统一拦截），登录过期则返回401，或者判断当前用户是否有权限进行此操作。

在koa2中使用jwt，要提到两个中间件：

（1）[jsonwebtoken 生成和解析token](https://www.npmjs.com/package/jsonwebtoken)

（2）[koa-jwt 拦截（全部/部分）用户请求并验证token](https://www.npmjs.com/package/koa-jwt)

- 生成token

首先安装jsonwebtoken:

```javascript
// 安装jsonwebtoken
cnpm i jsonwebtoken -S
```

api/modules/user.js中

```javascript
const { createToken } = require('../../utils/account');
// 根据上面的登录接口，在用户账号密码查询正确后
// 生成token返回给前端，createToken方法往后看
const token = createToken(res)
return ctx.body = {
    code: 200,
    data: token,
    message: 'ok'
};
```

根目录下新建utils文件夹,

utils/account.js
```javascript
// 引入jsonwebtoken
const JWT = require('jsonwebtoken');

// 自定义生成token的密钥(随意定义的字符串)
// 就其安全性而言，不能暴露给前端，不然就可以随意拿到token
const JWT_SECRET = 'system-user-token';

// 生成JWT Token
// 同时可以设置过期时间
exports.createToken = (config = {}, expiresIn = '7 days') => {
  const { userName, _id } = config;
  const options = { userName, _id };
  const custom = { expiresIn };
  // 通过配置参数，然后调用JWT.sign方法就会生成token
  return JWT.sign(options, JWT_SECRET, custom);
};

// 暴露出密钥
// 这里将密钥暴露出去是为了后面验证的时候会用到
// 为了统一，不用处处写'system-user-token'这个字符串而已
exports.JWT_SECRET = JWT_SECRET;
```

- 请求拦截验证token

现在完成了登录接口生成token问题，那么在用户请求的时候，我们还需要拦截用户请求并验证是否过期。下当然就是`koa-jwt`上场了：

首先安装：

```javascript
// 安装koa-jwt
cnpm i koa-jwt -S
```

app.js中做统一拦截,并设置不需要token的接口（例如登录、注册等接口）:

```javascript
// 引入jwt
const jwt = require('koa-jwt');
// 拿到我们的密钥字符串
const { JWT_SECRET } = require('./utils/account');

// jwt验证错误的处理
// jwt会对验证不通过的路由返回401状态码
// 我们通过koa拦截错误，并对状态码为401的返回无权限的提示
// 注意：需要放在jwt中间件挂载之前
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
// secret参数是用于验证的密钥
// unless方法，设置不需要token的接口
app.use(
    jwt({ secret: JWT_SECRET }).unless({
        path: [
            '/login',
            '/register'
        ]
    })
);
```

其实，koa-jwt是封装了[koa-less](https://github.com/Foxandxss/koa-unless)和[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)这两个中间件,。

`koa-less`的作用是只有在koa-less参数不匹配的时候才执行前面的中间件。
`jsonwebtoken`就是上面我们用的用于生成和解析token的。

看到这，小伙伴是不是想说：

![wtf](https://user-gold-cdn.xitu.io/2019/7/28/16c344358b01eb3c?w=400&h=400&f=jpeg&s=20292)


- 解析token

在很多时候我们需要拿到前端携带的token，从token中获取用户相关的信息，然后再做某些事情。例如，拿到用户的token后，根据token解析出用户的id，然后根据id查询用户存在后再执行某些操作。

api/article.js接口文件，这里的发布文章接口，我们在拿到用户提交的数据时，根据header中的authorization读取到用户的信息：

```javascript
// 省略了部分代码
const Router = require('koa-router');
const mongoose = require('mongoose');
// 先导入我们封装的两个方法
const { decodeToken, parseAuth } = require('../../utils/account');

// 定义文章发布接口
router.post('/article', async ctx => {
  let data = ctx.request.body;

  // 省略参数验证部分
  // ****
  
  // 解析出用户token
  const authorization = parseAuth(ctx);
  // 根据token解析出token中的用户_id
  const tokenDecoded = decodeToken(authorization);
  const { _id } = tokenDecoded;
  
  const userModal = mongoose.model('User');
  // 先查询用户是否存在，拿到用户信息
  await userModal.findById(_id).exec()
    // 在用户查到后，再进行创建文章的操作
    .then(async res => {
      data.author = res.userName
      const articleModal = mongoose.model('Article');
      const newArticle = articleModal(data);
      // 存储文章数据
      await newArticle.save()
        .then(() => {
          return ctx.body = {
            code: 200,
            message: '保存成功'
          };
        }).catch(error => {
          return ctx.body = {
            code: 500,
            message: error.message || '保存失败'
          };
        });
    })
    .catch(err => {
      return ctx.body = {
        code: 500,
        message: err.message || '用户不存在'
      }
    })
});

module.exports = router;
```

utils/account.js:

```javascript
const JWT = require('jsonwebtoken');

// 从ctx中解析authorization
exports.parseAuth = ctx => {
  if (!ctx || !ctx.header.authorization) return null;
  const parts = ctx.header.authorization.split(' ');
  if (parts.length < 2) return null;
  return parts[1];
}

// 解析JWT Token
exports.decodeToken = (token) => {
  return JWT.decode(token);
};
```

注意：
（1）主要思路就是，我们通过用户请求的header中携带的authorization，解析出用户的`_id`,然后通过`_id`去数据库查出用户对应的信息（项目大的话，这里会使用例如redis的缓存技术去读取用户的信息，而不是每次直接操作数据库），然后再创建文章。

（2）解析authorization的方法很简单，即使直接调用jsonwebtoken这个库的decode方法即可，相关介绍官网都有说明。

（3）关于怎么拿到authorization这里要说明一点，其实我们拿到的是下面这种数据，它其实包含了两部分，所以我们需要解析出我们想要的内容（即空格后面的内容）：

![authorization](https://user-gold-cdn.xitu.io/2019/7/28/16c345346b3de01e?w=2218&h=346&f=png&s=89449)

解析方法也很简单，就是根据空格分割，取后面那部分。

### 过滤用户数据，防止XSS攻击

上面提到了发布用户数据，那么对于用户提交的数据，如果不做过滤，用户很可能传一些`<script>alert('动态注入js')</script>`的恶意代码。

针对这种情况，我们可以对用户的内容进行过滤，对一些关键字符进行转译。

```javascript
// 安装xss库
cnpm i xss -S

// 使用，在我们存文章数据的schema中进行处理
// 在每次存的时候进行过滤
// schema/Article.js
const mongoose = require('mongoose');
const { Schema } = mongoose;
const xss = require('xss');

const articleSchema = new Schema({
    // 省略部分内容
});

// 每次保存时进行密码加密
// 注意此处pre的第二个参数，不能是箭头函数，不然拿不到this
articleSchema.pre('save', function(next) {
    // 对标题和内容进行xss过滤
    this.title = xss(this.title);
    this.content = xss(this.content);
    next();
});

mongoose.model('Article', articleSchema);
```

如下图，可以看到过滤前后的数据库数据对比：

![对比](https://user-gold-cdn.xitu.io/2019/7/28/16c345ad4afb277d?w=1976&h=436&f=png&s=750790)

更多关于xss的内容可查看[xss 中文文档](https://github.com/leizongmin/js-xss/blob/master/README.zh.md)

注意：如果是mySql等关系型数据库，我们还会处理防止sql的注入等操作，关于这块，有兴趣的小伙伴可以自行研究研究。

### 使用mocha进行同步、异步和接口的单元测试

单元测试常见的风格有：行为驱动开发（BDD），测试驱动开发（TDD）。那么两者有什么区别呢？

（1）BDD关注的是整个系统的最终实现是否和用户期望一致。

（2）TDD关注的是取得快速反馈，使所有功能都是可用的。

- 使用Mocha进行单元测试

首先安装：

```javascript
// 安装
cnpm i mocha -D
```

配置npm测试命令：

```javascript
// 配置npm script命令
"scripts": {
    "test": "mocha"
}
```

新建text/test.js，写测试代码：

```javascript
// 引入node的断言库
// 其实就像是一个工具库
const assert = require('assert');
// 引入待测试文件
const lib = require('./index');

// 测试iterate这个函数的功能
// describe定义测试的描述
// it定义打印的内容
describe('Math', () => {
  describe('#iterate', () => {
    it('should return 10', () => {
      // 通过断言判断是否通过测试
      assert.equal('10', lib.iterate(5, 5));
    });
    it('should return 0', () => {
      assert.equal('0', lib.iterate());
    });
    it('should return 10', () => {
      assert.equal('10', lib.iterate(1, 1));
    });
  });
});

// test/index.js
const iterate = (...arg) => {
  if (!arg.length) return 0;
  return arg.reduce((val, cur) => val + cur);
};

module.exports = {
  iterate
}

// 终端运行
// 会自动查找test文件夹下所有的测试文件并执行测试
npm test
```

可以看出，当结果不符合预期时会测试不通过：

![test result](https://user-gold-cdn.xitu.io/2019/7/28/16c345f0e58e7733?w=1950&h=1142&f=png&s=893187)

更多内容可以参考 [mocha 文档地址](https://mochajs.org/)

- 使用should断言库

上面的断言库我们使用的是node提供的asset断言模块，其实我还有很多其他选择，例如should.js和chai等等，因为这些库提供了比asset更为丰富的供。

这里演示一些should这个断言库：

```javascript
// 安装should
cnpm i should -D

// 引入
const should = require('should');

// 使用（和上面node的类似）
require('should');
const lib = require('./index');

/**
 * 单元测试
*/
describe('Math', () => {
    describe('#iterate', () => {
        it('should return 10', () => {
            lib.iterate(5, 5).should.be.equal(10);
        });
        it('should return 0', () => {
            lib.iterate().should.be.equal(0);
        });
        it('should return 10', () => {
            lib.iterate(1, 1).should.be.equal(10);
        });
    });
});
```

should断言库的内容比node的assert断言功能更丰富。断言效果如下：


![should result](https://user-gold-cdn.xitu.io/2019/7/28/16c3461510361869?w=1944&h=952&f=png&s=431646)

更多内容可以查看 [shuold文档地址](https://github.com/shouldjs/should.js)

到目前来看，chai其实更为流行一些，chai同时提供了TDD和BDD风格的用法。有兴趣的小伙伴可以翻阅其[文档](https://github.com/chaijs/chai)学习查看，基本用法也都大同小异吧。

- 使用mocha异步测试

以上演示都是一些同步测试，那么mocha对异步的测试该怎么做呢？其实很简单，只需要手动调用一个回调函数：

```javascript
// 待测试文件
// 模拟定义普通的一个异步函数
const asyncFunc = (cb) => {
    setTimeout(() => {
        console.log('async init after 1000')
        cb()
    }, 1000)
}

// 测试代码
// PS：省略导入导出的操作了

// 测试普通异步函数
describe('Async', () => {
    describe('#asyncFunc', () => {
        it('should an async function', done => {
            // eg：最关键的是在异步调用完成后，
            // 需要手动调用回调函数done，
            // 来告诉mocha异步调用完成
            asyncTest.asyncFunc(done)
        })
    })
});
```

效果如下：

![异步测试](https://user-gold-cdn.xitu.io/2019/7/28/16c3464cf9cda55c?w=1512&h=624&f=png&s=241905)

- 对于需要异步调用的情况

```javascript
// async异步函数的测试
// 模拟一个异步函数：
const getInfo = async (bool) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            // 如果参数是true，则成功返回
            // 否则返回失败
            if (bool) return resolve('success');
            return reject('fail');
        }, 1000);
    });
};

// 测试
describe('Async', () => {
    describe('#getInfo', () => {
        it('should return success', done => {
            // 还是需要手动调用回调函数
            // async函数需要写在内部
            (async function () {
                try {
                    // 等待异步完成后，手动调用done()
                    await asyncTest.getInfo(true);
                    done();
                } catch (error) {
                    done(error)
                }
            })();
        });
    });
})
```

效果如下：


![test success](https://user-gold-cdn.xitu.io/2019/7/28/16c34664525ad4db?w=1264&h=424&f=png&s=136661)

如果 `await asyncTest.getInfo(true);`参数传入false，模拟测试不通过的效果，会看到下这个样子：

![test error](https://user-gold-cdn.xitu.io/2019/7/28/16c3466b76aea5cc?w=1908&h=808&f=png&s=470067)

- 更简单的写法，可以直接将it的回调第二个参数写成异步函数：

```javascript
// 效果也是一样的
describe('#getInfo', () => {
    it('should return success', async () => {
      await asyncTest.getInfo(false);
    });
});
```

- 接口的单元测试

首先要安装supertest这个库

```javascript
// 安装
cnpm i supertest -D
```

测试内容：

```javascript
// 导入我们的服务
// 前提是在app.js文件中，将启动后的服务导出
//eg: moudle.exports = app.listen(3000)
const app = require('../app');
// 导入用于接口的测试的supertest
const request = require('supertest');

describe('GET /', () => {
  it('should return status with 200', (done) => {
    // 测试
    // get是测试get请求
    // expect是期望的内容
    request(app)
        .get('/')
        .expect(200)
        .end((err, res) => {
            // 在end中得到接口的内容
            // 然后根据情况手动调用done
            if (err) return done(err);
            done();
        });
    });
});
```

测试结果通过，如下图：

![api test success](https://user-gold-cdn.xitu.io/2019/7/28/16c34677af1a6807?w=1496&h=312&f=png&s=199957)


```javascript
// 文章详情接口需要authorization
// 我们的测试用例希望返回200状态码，但是返回了401
// 所以当前测试不通过
describe('GET /artiles/:id', () => {
    it('should an article info', (done) => {
        request(app)
        .get('/api/articles/5d2edc370fddf68b438b6b53')
        .expect(200, done);
    })
})
```

![fail result](https://user-gold-cdn.xitu.io/2019/7/28/16c3467e6dd5adbf?w=1696&h=648&f=png&s=474415)

更多内容可以参考 [supertest文档地址](https://npm.taobao.org/package/supertest)

### 单元测试覆盖率

关于单元测试覆盖率，简单提一下，可以测试出我们的测试代码的覆盖情况是怎样的。

- 安装

```javascript
// 首先安装istanbul这个库
cnpm i istanbul -D
```

- 使用

```javascript
 // 在test文件夹下，打开终端执行以下命令
 // 会测试index.js文件的代码测试覆盖情况
 istanbul cover index.js
```

如图所示，我们可以看到8块代码覆盖了3个，2个分支但是一个都没有覆盖到，0个函数，6行代码覆盖了个，以及对应的覆盖率是多少。

![istanbul cover result](https://user-gold-cdn.xitu.io/2019/7/28/16c346e24bab8f87?w=1286&h=476&f=png&s=86984)

同时，在test文件夹下可以看到生成了coverage文件夹，里面保存了覆盖率结果，可以点击index.html查看结果。

![](https://user-gold-cdn.xitu.io/2019/7/28/16c347213814b68a?w=512&h=712&f=png&s=68776)

index.html可以看的更直观：

![](https://user-gold-cdn.xitu.io/2019/7/28/16c347574b2c1731?w=2864&h=508&f=png&s=195625)

更多的内容参考[istanbul文档](https://www.npmjs.com/package/istanbul)吧。

好了，关于Koa2与mongodb的内容，就到这了，二期初步打算扩展以下关于Koa的内容：
- 拓展：Koa安装mySql数据库
- 扩展：Koa中mySql的基本操作（增删改查），做个curl仔
- 扩展：mySql数据库的可视化工具

### 参考文献
- [《koa官网》](https://koa.bootcss.com/)
- [《REST API规范》](https://www.liaoxuefeng.com/wiki/1022910821149312/1105003357927328)作者：廖雪峰
- [挑战全栈 Koa2免费视频教程 (共13集)](http://jspang.com/posts/2017/11/13/koa2.html)作者：技术胖
- 《Node.js开发实战》作者：忽如寄

<br>
[个人掘金地址](https://juejin.im/user/58ae78da8d6d8100584bc207/posts)
<br>

> 百尺竿头、日进一步  
> 我是愣锤，欢迎交流与分享
