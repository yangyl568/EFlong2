# Node.js 基础相关

查看一下 npm 当前版本 `npm -v`

npm 更新到最新版本:  `npm install npm@latest -g`

如果想更新到指定版本 `npm -g install npm@2.9.1` （@后跟版本号），

输入以下命令，切换到淘宝镜像源：

npm install -g cnpm --registry=[http://registry.npm.taobao.org](http://registry.npm.taobao.org)

之后所有用到的  npm  命令都可以使用  cnpm  来代替进行  install。但是  cnpm  不支持  publish  命令，需要注意。
关于淘宝  npm  镜像的其他使用问题，请参考： [https://npm.taobao.org/](https://npm.taobao.org/)

## Node.js 环境搭建

### npm init

执行  `npm init`  的时候,会有一个初始化  `pacakge.json`  过程，然后一路回车，其实可以直接使用  `npm init --yes`  在命令后追加  `--yes`  参数即可，

### package.json 中的常规属性

#### dependenices

通过命令 ``npm install packageName -S 、npm i packageName --save`  把包装在此依赖项里。默认是最新版本，npm i vue@3.0.1 -S 指定版本

> 从`npm 5.x`开始，可以不用手动添加`-S/--save`指令

#### devdependenices

只是在开发环境中使用的到。   npm install -D xxxx

#### main

`main` 属性指定程序的主入口文件，其他项目在引用这个 `npm` 包时，实际上引入的是 `lib/index` 中暴露出去的模块。

```javascript
{
  "main": "lib/index.js",
}
```

#### npm script（重）

```javascript
"scripts": {
  "test": "test.js"
  "build": "tsc",
},
```

比如：test 命令对应的脚本是 node test.js， 在命令行中使用 npm run key(命令)，就可以执行这段脚本。

直接执行： `npm run`  可以查看项目中所有 npm 脚本命令。

### 钩子（生命周期）

其实  `package.json`  中的  `script`也是有生命周期的。`npm`  脚本有两个钩子，`pre`  和  `post`，当我们执行`start`脚本时候，`start`  的钩子就是  `prestart`  和  `poststart`。

```bash
npm run prestart && npm run start && npm run poststart
```

所以 在实际开发当中，我们可以做一些 **准备或者清理工作。**

```javascript
"clean": "rimraf ./dist && mkdir dist",
"prebuild": "npm run clean",
"build": "cross-env NODE_ENV=production webpack"
```

### 执行顺序

`npm` 脚本执行多任务分为两种情况

- 并行任务(同时的平行执行)，使用&符号

```bash
npm run script1.js & npm run script2.js
```

- 串行任务(前一个任务成功，才执行下一个任务)，使用 && 符号

```bash
npm run script1.js && npm run script2.js
```

## npm 包发布

### 标准的 npm 模块目录

基于 CommonJS 模块化规范实现的，除了 描述文件 package.json 以外还需要包含一下目录：

- bin: 存放可执行 二进制文件的目录
- lib： 存放 js 代码的目录
- doc：存放文档的目录
- test: 存放单元测试用例代码的目录

### 如何写好你的 README

推荐： [链接](https://www.zhihu.com/question/29100816)

### 发布自己的 npm 包

1. 先去[注册账号](https://www.npmjs.com/login)，然后 执行命令： npm adduser #根据提示输入用户名密码即可
2. 使用命令发布自己的包： npm publish

记得 配置一个 .npmignore 文件来排除垃圾文件。可以直接 复制 .gitignore
3. 发布成功之后，就可以使用了： npm install xxxxx

- 关于 npm 包更新

```javascript
# 升级补丁版本号
$ npm version patch

# 升级小版本号
$ npm version minor

# 升级大版本号
$ npm version major

先更改版本号然后，再次执行 npm publish来发布。
```

### 本地开发的 npm 包如何调试

在本地开发的模块包的时候，可以使用 `npm link` 调试，将模块链接到对应的运行项目中去，方便地对模块进行调试和测试。具体使用步骤如下

- 假如我的项目是 `koalaNpmStudy`，假如我的 npm 模块包名称是 `npm-ikoala`
- 进入到 模块包 `npm-ikoala` 目录中，执行 `npm link`
- 在自己的项目 `koalaNpmStudy` 中创建连接执行 `npm link npm-ikoala`
- 在自己项目的 `node_module` 中会看到链接过来的模块包，然后就可以像使用其他的模块包一样使用它了。
- 调试结束后可以使用 `npm unlink` 取消关联
  > npm link 主要做了两件事：
  > 为目标 npm 模块创建软链接，将其链接到全局 node 模块安装路径 /usr/local/lib/node_modules/。
  > 为目标 npm 模块的可执行 bin 文件创建软链接，将其链接到全局 node 命令安装路径 /usr/local/bin/。

## Node.js 常用模块

### Global 模块

全局共享的不需要导入模块 即可使用。
常用的属性:
    **dirname : 文件所在的文件夹路径
    **filename : 文件所在的路径
    require() : 导入需要的模块
    module : 自定义模块时用到
    exports : 自定义模块时用到

### fs 文件操作模块

fs 模块的常见方法(所有的读方法，文件必须存在，不存在就会报错，所有的写方法，如果文件不存在，则创建该文件)：

### util 模块

1. util.promisify(fn); //十分常用
1. util.inherits(Child, Parent);
1. util.isArray([]) util.isString();

### path  简化路径相关操作，并提升代码可读性

- **path.resolve([...paths])：**方法将一系列路径或路径段解析为绝对路径。

- **path.basename(path[, ext])：**该方法返回路径的最后一部分。目录分隔符"/"会被自动忽略。

```bash

path.basename('/foo/bar/baz/asdf/quux.html');
// Returns: 'quux.html'

path.basename('/foo/bar/baz/asdf/quux.html', '.html');
// Returns: 'quux'
```

### http 提供两种使用方式

- 作为服务端使用时，创建一个 HTTP 服务器，监听 HTTP 客户端请求并返回响应。

- 作为客户端使用时，发起一个 HTTP 客户端请求，获取服务端响应。

## Koa2 基础 （Request、Response、Application、Context）

[《Koa2 进阶学习笔记》已完结](https://chenshenhai.com/koa2-note)
