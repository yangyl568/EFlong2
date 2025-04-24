# 工程化

## 本地存储

共同点：都是保存在浏览器端，且都遵循同源策略。

### cookie 的操作与封装

- 存储量太小，只有 4KB；
- 每次 HTTP 请求都会发送到服务端，影响获取资源的效率；
- 需要自己封装获取、设置、删除 cookie 的方法；

### localStorage 和 sessionStorage

- 限制有 5M , 不同浏览器可能不同。
- 同源窗口（协议、域名、端口一致），不同页面可以共享 localStorage 值
- *sessionStorage 关闭页面即消失，但是通过跳转的页面可以共享 sessionStorage 值*

## HTTP、HTTPS、HTTP/2

[十分钟搞懂 HTTP 和 HTTPS](https://zhuanlan.zhihu.com/p/72616216) 、 [超详细版本](https://segmentfault.com/a/1190000022662058)

### HTTP 协议

请求与响应、头信息、状态码

![HTTP 协议.png](https://s4.ax1x.com/2021/12/15/Tp5XJH.png)

### HTTP/2

HTTP/2 是 HTTP/1.x 的扩展，而非替代。

所以 HTTP 的语义不变，提供的功能不变，HTTP 方法、状态码、URL 和首部字段等这些核心概念也不变。

#### 多路复用 - 巨大的性能提升

在 HTTP/1.1 中，如果客户端想发送多个并行的请求，那么必须使用多个 TCP 连接。

而 HTTP/2 的**二进制分帧层突破了这一限制**，所有的请求和响应都在同一个 TCP 连接上发送：客户端和服务器把 HTTP 消息分解成多个帧，然后乱序发送，最后在另一端再根据流 ID 重新组合起来。

#### 服务器推送

HTTP/2 新增的一个强大的新功能，就是服务器可以对一个客户端请求发送多个响应。换句话说，除了对最初请求的响应外，服务器还可以额外向客户端推送资源，而无需客户端明确地请求。

![服务器推送.png](https://s4.ax1x.com/2021/12/15/TpIpOP.png)

### HTTPS

**http 中存在如下问题：**

1. 请求信息**明文传输**，容易被窃听截取。
2. 数据的**完整性未校验**，容易被篡改
3. **没有验证对方身份**，存在冒充危险

为了解决上述 HTTP 存在的问题，就用到了 HTTPS。

本质上它是 HTTP 的变种，主要解决安全问题，使用了加密传输。

加密有三种方式：分别是 证书、对称加密和非对称加密，相比 HTTP 多了一层 SSL/TSL。

1. 证书加密：
首先申请该服务器的证书，然后在 HTTPS 的请求过程服务器端会把证书发送给客户端，客户端进行证书验证，以此来 **验证服务器身份**。

2. 对称加密：
HTTPS 请求中，客户端和服务器之间的通信时通过对称加密算法进行加密的。对称加密，即 **在加密和解密的过程使用同一个私钥进行加密和解密**。

- 加密过程：加密算法 + 明文 + 私钥 ---》密文
- 解密过程：解密算法 + 密文 + 私钥 ---》明文
- 使用场景：对大量数据进行加密时，对称加密是适用的，速度快

3. 非对称加密:
加密和解密使用了不同的密钥，一个公钥 对外公开、一个私钥 解密使用。由于公钥和私钥是分开的，所以加密算法安全级别高，密文长度有限制，速度较慢。

- 【 公钥加密、私钥解密】
流程：A 端向 B 端发送请求， B 端把公钥返回，然后 A 使用公钥加密传递加密数据给 B，B 再使用自己的私钥进行解密。

- 【私钥加密，公钥解密】
流程正好相反

### HTTP 和 HTTPS 区别

1. HTTP 明文传输、HTTPS 密文传输
2. 默认链接的端口号是不同的，HTTP 80 HTTPS 443
3. HTTPS = HTTP + 加密 + 认证 + 完整性保护

## 前后端交互（待完善）

### FormData、upload

```javascript
var data = new FormData();
data.append("foo", "bar");
data.append("bar", "foo");
```

### ajax 的封装

post 请求发送 form 数据和 json 数据的示例：

- 设置 request 的 content-type 为 application/x-www-form-urlencoded
- 设置 request 的 content-type 为 application/json

```js
<script>
    // 封装自己的ajax函数
    /* 参数1：{string} method 请求方法
        参数2：{string} url 请求地址
        参数2：{Object} params 请求参数
        参数3：{function} done 请求完成后执行的回调函数
    */
    function ajax(method,url,params,done){
        // 创建xhr对象，兼容写法
        var xhr = window.XMLHttpRequest 
        ? new XMLHttpRequest()
        : new ActiveXObject("Microsoft.XMLHTTP");

        // 将method转换成大写
        method = method.toUpperCase();
        // 参数拼接
        var pair = [];
        for(var k in params){
            pair.push(k + "=" + params[k]);
        }
        var str = pair.join("&");
        // 判断请求方法
        if(method === "GET"){
            // 字符串拼接 或者 模板字符串
            url += "?" + str;
        }
        xhr.open(method,url);

        var data = null;
        if(method === "POST"){
            // 需要请求头
            xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
            data = str;
        }
        xhr.send(data);

        // 指定xhr状态变化事件处理函数
        // 执行回调函数
        xhr.onreadystatechange = function (){
            if(this.readyState === 4){
                // 返回的应该是一个对象，这样客户端更好渲染
                done(JSON.parse(xhr.responseText));
            }
        }
    }

    //    调用自己写的ajax函数
    ajax("get","http://localhost:3000/users",{
        name:"zs",
        age:45
    },function (a){
        console.log(a);
    });
</script>

```

### axios 的封装

我这里就不多赘述了，轮子已经有很多：
[直接看吧](https://www.cnblogs.com/xw-01/p/17556298.html)

## 跨域：jsonp、cors 跨域设置、后端代理

这里有一篇很好的文章讲解[链接](https://segmentfault.com/a/1190000011145364)

> 跨域是指: 一个域下的文档或脚本试图去请求另一个域下的资源，这里跨域是广义的  
> 我们前端通常所说的跨域是狭义的，由**同源策略**限制引起的

### 什么是同源策略

是一种约定，是浏览器最核心也是最基本的安全功能，如果缺了同源策略，浏览器很容易受到 XSS、CSFR 等攻击。

同源是指：「**协议 + 域名 + 端口**」满足三者相同。

**限制以下几种行为：**

```js
1. Cookie、LocalStorage 和 IndexDB 无法读取
2. DOM 和 JS 对象无法获得
3. AJAX 请求不能发送
```

### 解决跨域方案

1. 通过 **jsonp** 利用 script 标签没有跨域的漏洞，
通过 指向一个需要访问的地址并提供一个回调函数接收数据。缺点：只能实现 get 一种请求。

2. **跨域资源共享（CORS）**

普通跨域请求：主要是服务端 header 设置 Access-Control-Allow-Origin 标识哪些域名可以访问资源。

分两种情况：简单请求、复杂请求

- 简单请求：GET POST HEAD \ content-type: 非 json
- 复杂请求：除了以上情况，会首先发起一个 option 预检请求，用来检测同福段是否允许跨域请求。

3. nginx 配置反向代理解决跨域 （利用服务器之间不跨域）
4. nodejs 中间件代理跨域

**Vue 框架的跨域：** 利用 node + webpack + webpack-dev-server(proxy)代理接口跨域

## fetch 请求、axios 源码解析

目前阶段会使用、可以自己封装 就 OK 了

## H5 核心

### 文件操作、音频、视频操作

推荐这篇大神写的 [链接](https://segmentfault.com/a/1190000006600936) TODO： 自己实现一遍最爽

### canvas

这里有详细讲解 [链接](https://www.jianshu.com/p/df98fcaf0a92)

### Echarts、HeighCharts、D3

第三方数据可视化插件

## 后模块化时代

显然使用 ESModule 的模块明显符合 JS 开发的历史进程，因为任何一个支持 JS 的环境随着对应解释器得分升级，最终一定会支持 ESModule 的标准。

但是 并不一定对市面上的浏览器使用新特性，由此 诞生了 大家所熟知的 **babel ，能把静态高版本规范代码编译为低版本规范代码，让更多浏览器支持。**

但是并不理想，对于 模块化相关的 import 和 export 关键字，babel 最终编译为 require 和 exports 的 CommonJS 规范。导致浏览器中无法运行，为此 我们又做了一步 叫做  **打包(bundle)**
**browserify 和 webpack 都是非常优秀的打包工具，browserify 能够处理 CommonJS 模块化规范的包为 web 直接使用， webpack 则能处理任何模块化规范的内容**

## Webpack

模块打包机：webpack 是基于入口的。

webpack 会自动地递归解析入口所依赖的所有资源文件，然后用不同的 Loader 来处理不同的文件，用 Plugin 来扩展 webpack 功能。 [链接](https://zhuanlan.zhihu.com/p/44438844)

### Loader 加载器

> 让 webpack 拥有加载和解析「非 js 文件」的能力

- css-loader: 加载 CSS，支持模块化、压缩、文件导入等特性
- style-loader: 使用 `<style>` 把 css-loader 生成的内容挂在到 html 页面中
- babel-loader: 转换 ES6、7 等 js 新特性语法为 ES5
- `awesome-typescript-loader`：将 TypeScript 转换成 JavaScript，性能优于 ts-loader
- file-loader: 把文件输出到一个文件夹中，在代码中通过相对 URL 去引用输出的文件
- url-loader: 和 file-loader 类似，小于设置阈(yu)值情况下以 base64 的方式把文件内容注入到代码中 (例如小图)
- source-map-loader：加载额外的 Source Map 文件，以方便断点调试
- image-loader：加载并且压缩图片文件
- eslint-loader：通过 ESLint 检查 JavaScript 代码

### Plugin 插件

> 插件扩展 webpack 的功能，在生命周期中广播事件，Plugin 监听事件，在合适的时机 通过 API 改变输出结果。

- HtmlWebpackPlugin：打包结束后自动生成一个 html 文件，并把打包生成的 js 模块引入到该 html 中。
- clean-webpack-plugin：打包的时候 清理输出目录文件
- define-plugin：定义环境变量（webpack4 之后指定 mode 会自动配置）
- uglifyjs-webpack-plugin 不支持 ES6 压缩 (Webpack4 以前)，如果需要 ES6 代码压缩，请使用 **terser-webpack-plugin**
- 主要是**删除未引用代码(dead code)的能力**，生产环境下默认使用 [TerserPlugin](https://webpack.docschina.org/plugins/terser-webpack-plugin)
- webpack-parallel-uglify-plugin: 多核压缩,提高压缩速度
- webpack-bundle-analyzer: 可视化 webpack 输出文件的体积
- [css-minimizer-webpack-plugin](https://webpack.docschina.org/plugins/css-minimizer-webpack-plugin/) 压缩 css 代码

### 用法

- **Loader** 在 `module.rules` 中配置，也就是说他作为模块的解析规则而存在。 类型为数组，每一项都是一个 `Object`，里面描述了对于什么类型的文件（`test`），使用什么加载(`loader`)和使用的参数（`options`）

- **Plugin**在 `plugins`中单独配置, 类型为数组，每一项是一个`plugin`的实例，参数都通过构造函数传入。

### Webpack 构建流程

简单说

1. **初始化**：启动构建，读取与合并配置参数，加载 Plugin，实例化 Compiler
2. **编译**：从 Entry 出发，针对每个模块 Module 调用对应的 Loader 去翻译/解析文件的内容，再找到该 Module 依赖的 Module，递归地进行编译处理，得到最终内容以及它们之间的依赖关系。
3. **输出**：将编译后的 Module 组合成 Chunk，将 Chunk 转换成文件，根据配置确定输出路径和文件名，把文件内容写入到文件系统。

### Hot Module Repacement 热更新 HMR（[必会](https://zhuanlan.zhihu.com/p/30669007)）

> 这个机制可以做到不用刷新浏览器，把旧模块更新为新模块。

HMR 的核心就是客户端从服务端拉去更新后的文件，准确的说是 chunk diff (chunk 需要更新的部分)，实际上 WDS （webpack-dev-server）与浏览器之间维护了一个 `Websocket`，当本地资源发生变化时，WDS 会向浏览器推送更新，并带上构建时的 hash，让客户端与上一次资源进行对比。

客户端对比出差异后会向 WDS 发起 `Ajax` 请求来获取更改内容(文件列表、hash)，这样客户端就可以再借助这些信息继续向 WDS 发起 `jsonp` 请求获取该 chunk 的增量更新。

后续的部分(拿到增量更新之后如何处理？哪些状态该保留？哪些又需要更新？)由 `HotModulePlugin` 来完成，提供了相关 API 以供开发者针对自身场景进行处理，像`react-hot-loader` 和 `vue-loader` 都是借助这些 API 实现 HMR。
![HMR.PNG](https://s4.ax1x.com/2021/12/15/TpIEWj.jpg)

### Babel ES6+ 转 ES5

- 解析：将代码字符串解析成抽象语法树 AST
  - 词法分析：将代码(字符串)分割为 token 流，即语法单元成的数组
  - 语法分析：分析 token 流(上面生成的数组)并生成 AST
- 转换：访问 AST 的节点进行变换操作生产新的 AST
  - [Taro 就是利用 babel 完成的小程序语法转换](https://github.com/NervJS/taro/blob/master/packages/taro-transformer-wx/src/index.ts#L15)
- 生成：以新的 AST 为基础生成代码字符串

### speed-measure-webpack-plugin

简称 SMP，分析出 Webpack 打包过程中 Loader 和 Plugin 的耗时，有助于找到构建过程中的性能瓶颈。

### 文件指纹

文件指纹是打包后输出的文件名的后缀。

- `Hash`：和整个项目的构建相关，只要项目文件有修改，整个项目构建的 hash 值就会更改

- `Chunkhash`：和 Webpack 打包的 chunk 有关，不同的 entry 会生出不同的 chunkhash

- `Contenthash`：根据文件内容来定义 hash，文件内容不变，则 contenthash 不变

```json
(module.exports = {
  "entry": {
    "app": "./scr/app.js",
    "search": "./src/search.js"
  },
  "output": {
    "filename": "[name][chunkhash:8].js",
    "path": __dirname + "/dist"
  }
})
```

## Tree Shaking

移除 js 上下文中的未引用代码（dead-code）依赖于 ES6 模块语法 import export。

通过 package.json 的 "sideEffects" 属性作为标记，向 compiler 提供提示，表明项目中的哪些文件是 "pure(纯正 ES2015 模块)"，由此可以安全地删除文件中未使用的部分。

## 开发和生产环境

**开发环境中**，我们需要：强大的 source map 和一个有着 live reloading(实时重新加载) 或 hot module replacement(热模块替换) 能力的 dev server。

**生产环境**目标则转移至其他方面，关注点在于压缩 bundle、更轻量的 source map、资源优化等，通过这些优化方式改善加载时间。

## webpack 有哪些性能优化

1. 压缩代码、使用 uglifyjs 删除多余的代码、注释、简化代码的写法等等方式
1. 使用 import() 实现路由懒加载
1. 使用 babel-plugin-componten 实现 ui 组件按需加载
1. 利用 `CDN` 加速。在构建过程中，将引用的静态资源路径修改为 `CDN` 上对应的路径
1. 删除未使用片段、死代码 `Tree Shaking`
1. 优化图片，对于小图可以使用 `base64` 的方式写入文件中
1. 给打包出来的文件名添加哈希，实现浏览器缓存文件
1. 使用 SMP 插件 分析 打包过程中哪些 Loader 和 Plugin 的耗时，方便有针对性完善

## 如何提高 webpack 的构建速度？

1. 利用`DllPlugin`和`DllReferencePlugin`预编译资源模块 通过`DllPlugin`来对那些我们引用但是绝对不会修改的 npm 包来进行预编译，再通过`DllReferencePlugin`将预编译的模块加载进来。
1. 使用`Happypack` 实现多线程加速编译
1. 使用`webpack-uglify-parallel`来提升`uglifyPlugin`的压缩速度。 原理上`webpack-uglify-parallel`采用了多核并行压缩来提升压缩速度
1. 使用`Tree-shaking`来剔除多余代码

---

## Git 操作与管理

### 常用命令

- 切换 aaa 分支 `git checkout aaa`
- 把 aaa 分支的代码合并到 当前分支 `git merge aaa`
- 超好用：
  - `git stash`: 暂存当前修改的文件到
  - `git stash pop`: 取出暂存的文件并删除暂存记录
  - `git stash apply`: 取出 但是不删除记录
- `git pull 、 git push -u origin aaa`
- `git merge --abort`将会抛弃合并过程并且尝试重建合并前的状态。但是，当合并开始时如果存在未 commit 的文件，`git merge --abort`在某些情况下将无法重现合并前的状态。
- 删除本地分支： `git branch -d aaaa`
- 如果删除不了可以强制删除，`git branch -D aaaa`
- 有必要的情况下，删除远程分支 **(慎用)**：`git push origin --delete aaaa`

### git-flow 工作流 [链接](https://segmentfault.com/a/1190000021929465)

就像代码需要代码规范一样，代码管理同样需要一个清晰的流程和规范
![git-flow.png](https://s4.ax1x.com/2021/12/15/TpIQTU.png)

### git-cz 提交规范 [链接](http://note.youdao.com/noteshare?id=ea8185cbae21a6ce91775c8831de0cc8)

**目的：** 统一团队 Git commit 文本标准，便于后续代码 review 和团队协作；

Git 流程规范配置

<!-- ![git流程规范配置.png](./../docs/public/imgs/peitu/git%20%E6%B5%81%E7%A8%8B%E8%A7%84%E8%8C%83.png) -->

## 服务

### Jenkins 搭建和使用

在 jenkins（一个网站界面）中通过获取代码仓库中最新代码，进行自动化部署，而省去手动打包、上传服务器、部署这一系列步骤，非常方便。

### 多分支选择配置实战 [链接](https://www.yuque.com/docs/share/10907144-f776-4a40-896e-4fa34a8ebc9b?#)

### mock.js 的使用

## 调试(必备)

### postman：调试接口

### [whistle](https://segmentfault.com/a/1190000016058875)：基于 Node 实现的 跨平台 web 调试代理工具

### Fiddler：抓包工具

[这边文章介绍很清楚](https://juejin.im/post/6844904042422861831)
汉化版软件下载：
链接: [https://pan.baidu.com/s/1f5kQrCzYhRBUP5m7vP1SMg](https://pan.baidu.com/s/1f5kQrCzYhRBUP5m7vP1SMg) 提取码: 4bp4

### 移动端调试神器： vconsole
