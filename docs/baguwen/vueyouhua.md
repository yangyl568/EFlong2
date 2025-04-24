# vue 项目性能优化(最强)

> 原创自：https://juejin.im/post/5d548b83f265da03ab42471d

## 一、代码层面的优化

> v-for 遍历必须为 item 添加 key，且避免同时使用 v-if

方便 Vue.js 内部机制精准找到该条列表数据。当 state 更新时，新的状态值和旧的状态值对比，较快地定位到 diff 。

> 长列表性能优化

Vue 会通过 Object.defineProperty 对数据进行劫持，来实现视图响应数据的变化，然而有些时候我们的组件就是纯粹的数据展示，不会有任何改变，我们就不需要 Vue 来劫持我们的数据，在大量数据展示的情况下，这能够很明显的减少组件初始化的时间，那如何禁止 Vue 劫持我们的数据呢？可以通过 Object.freeze 方法来冻结一个对象，一旦被冻结的对象就再也不能被修改了。

```js
this.users = Object.freeze(users);
```

> 事件的销毁

如果在 js 内使用 addEventListene 等方式是不会自动销毁的，我们需要在组件销毁时手动移除这些事件的监听，以免造成内存泄露，如：

```js
created() {
  addEventListener('click', this.click, false)
},
beforeDestroy() {
  removeEventListener('click', this.click, false)
}
```

> 图片资源懒加载

使用 Vue 的 vue-lazyload 插件：对于图片过多的页面，为了加速页面加载速度，所以很多时候我们需要将页面内未出现在可视区域内的图片先不做加载， 等到滚动到可视区域后再去加载。这样对于页面加载性能上会有很大的提升，也提高了用户体验。

```js
（1）安装插件

npm install vue-lazyload --save-dev
（2）在入口文件 man.js 中引入并使用

import VueLazyload from 'vue-lazyload'
然后再 vue 中直接使用

Vue.use(VueLazyload)
或者添加自定义选项

Vue.use(VueLazyload, {
preLoad: 1.3,
error: 'dist/error.png',
loading: 'dist/loading.gif',
attempt: 1
})
（3）在 vue 文件中将 img 标签的 src 属性直接改为 v-lazy ，从而将图片显示方式更改为懒加载显示：

<img v-lazy="/static/img/1.png">
```

> 路由懒加载

Vue 是单页面应用，可能会有很多的路由引入 ，这样使用 webpcak 打包后的文件很大，当进入首页时，加载的资源过多，页面会出现白屏的情况，不利于用户体验。

```js
const Com = () => import("./Com.vue");
const router = new VueRouter({
  routes: [{ path: "/foo", component: Foo }],
});
```

> 第三方 插件的按需引入

具体怎么做，需要查找下文档

> 优化无限列表性能 （这个需要再研究）

如果你的应用存在非常长或者无限滚动的列表，那么需要采用 窗口化 的技术来优化性能，只需要渲染少部分区域的内容，减少重新渲染组件和创建 dom 节点的时间。 你可以参考以下开源项目 `vue-virtual-scroll-list` 和 `vue-virtual-scroller` 来优化这种无限列表的场景的。

## 二、Webpack 层面的优化

> 优化 resolve.extensions 配置

**问题描述：**
当遇到 require ( '. /data ’）这样的导入语句时，Webpack 会先去寻找./data .js 文件，如果该文件不存在，就去寻找./data.json 文件，如果还是找不到就报错。

**解决方案：**
在源码中写导入语句时，要尽可能带上后缀，从而可以避免寻找过程。例如在确定的情况下将 require(’. /data ’)写成 require(’. /data.json ’)

> Webpack 对图片进行压缩 ( **现在使用 tinyPNG 手动压缩也很方便** )

在 vue 项目中除了可以在 webpack.base.conf.js 中 url-loader 中设置 limit 大小来对图片处理，对小于 limit 的图片转化为 base64 格式，其余的不做操作。所以对有些较大的图片资源，在请求资源的时候，加载会很慢，我们可以用 image-webpack-loader 来压缩图片：
[查看详细使用](https://github.com/tcoopman/image-webpack-loader)

> 减少 ES6 转为 ES5 的冗余代码(这个有点意思)

Babel 插件会在将 ES6 代码转换成 ES5 代码时会注入一些辅助函数，例如下面的 ES6 代码：
`class HelloWebpack extends Component{...}`
这段代码再被转换成能正常运行的 ES5 代码时需要以下两个辅助函数：

```js
babel - runtime / helpers / createClass; // 用于实现 class 语法
babel - runtime / helpers / inherits; // 用于实现 extends 语法
```

在默认情况下， Babel 会在每个输出文件中内嵌这些依赖的辅助函数代码，如果多个源代码文件都依赖这些辅助函数，那么这些辅助函数的代码将会出现很多次，造成代码冗余。为了不让这些辅助函数的代码重复出现，可以在依赖它们时通过 require('babel-runtime/helpers/createClass') 的方式导入，这样就能做到只让它们出现一次。babel-plugin-transform-runtime 插件就是用来实现这个作用的，将相关辅助函数进行替换成导入语句，从而减小 babel 编译出来的代码的文件大小。

```js
（1）首先，安装 babel-plugin-transform-runtime ：
npm install babel-plugin-transform-runtime --save-dev

（2）然后，修改 .babelrc 配置文件为：
"plugins": [
    "transform-runtime"
]
```

> 优化 SourceMap

我们在项目进行打包后，会将开发中的多个文件代码打包到一个文件中，并且经过压缩、去掉多余的空格、babel 编译化后，最终将编译得到的代码会用于线上环境，那么这样处理后的代码和源代码会有很大的差别，当有 bug 的时候，我们只能定位到压缩处理后的代码位置，无法定位到开发环境中的代码，对于开发来说不好调式定位问题，因此 sourceMap 出现了，它就是为了解决不好调式代码问题的。

**开发环境推荐： cheap-module-eval-source-map
生产环境推荐： cheap-module-source-map**

> 构建结果输出分析 (cli3.0 之后自带)

Webpack 输出的代码可读性非常差而且文件非常大，让我们非常头疼。为了更简单、直观地分析输出结果，社区中出现了许多可视化分析工具。
Vue 项目中用到的分析工具：`webpack-bundle-analyzer`
**cli3.0 之后自带**
我们在项目中 `webpack.prod.conf.js` 进行配置：

```js
if (config.build.bundleAnalyzerReport) {
  var BundleAnalyzerPlugin = require("webpack-bundle-analyzer")
    .BundleAnalyzerPlugin;
  webpackConfig.plugins.push(new BundleAnalyzerPlugin());
}
```

执行 `$ npm run build --report` 后生成分析报告如下：

## 三、基础的 Web 技术优化

> 开启 gzip 压缩

gzip 压缩效率非常高，通常可以达到 70% 的压缩率，也就是说，如果你的网页有 30K，压缩之后就变成了 9K 左右

观察网络面板里面的 `Response Header , Content-Encoding: gzip`

> 浏览器缓存
> 使用 CDN

CDN 可以通过不同的域名来加载文件，从而使下载文件的并发连接数大大增加，且 CDN 具有更好的可用性，更低的网络延迟和丢包率 。

> 使用 Chrome Performance 查找性能瓶颈

Chrome 的 Performance 面板可以录制一段时间内的 js 执行细节及时间。使用 Chrome 开发者工具分析页面性能的步骤如下。

1. 打开 Chrome 开发者工具，切换到 Performance 面板
2. 点击 Record 开始录制
3. 刷新页面或展开某个节点
4. 点击 Stop 停止录制

## 如何减少白屏时间

主要是因为首次加载资源太多、太大请求慢导致的，所以从这几点入手解决。

1、因为 解析HTML 时遇到 script 会阻塞 DOM 的构建，所以 后置或者 异步 defer：异步加载，按照顺序执行， async 异步不按照顺序执行

2、静态资源可以使用 cdn

3、路由懒加载 import('....')

4、DNS 缓存、预加载策略 preload: 预先加载资源  prefetch：预判加载资源
