---
title: frame
permalink: /article/hhpphdcq/
---
# 框架篇

面试复习建议：每个点优先掌握

1. 这是什么（定义/目标）
1. 为什么需要（解决什么问题）
1. 怎么做（关键机制/数据流）
1. 有什么坑（边界/缺点/性能）
1. （常见追问）

## 观察者模式-发布订阅模式

### 观察者模式

定义：存在明确的“被观察者(Subject)”与“观察者(Observer)”，Subject 维护 Observer 列表，状态变化时主动通知 Observer。

特征：

- **耦合度**：Observer 通常需要直接订阅到具体 Subject（Subject 知道 Observer 的存在，至少知道回调集合）。
- **通知方式**：多为同步或受控的异步回调。

典型场景：组件状态变化触发多个视图更新、数据层变化触发渲染层更新（MVC 里常见）。

常见追问：

- Subject 通知是同步还是异步？如何避免 Observer 里再触发状态变更导致循环？
- 如何做事件“撤销订阅”防止内存泄漏？

### 发布订阅模式

定义：发布者(Publisher)与订阅者(Subscriber)不直接通信，通过第三方“事件通道/消息中心(Broker/EventBus)”解耦。

特征：

- **解耦**：发布者不知道订阅者是谁；订阅者也不需要知道发布者是谁。
- **可扩展**：Broker 可以做过滤、缓存、重放、优先级、一次性订阅等。

例子修正：**微信公众号更像发布订阅**（微信平台充当 Broker；公众号发布消息；用户订阅并接收推送）。

观察者 vs 发布订阅（面试一句话）：

- 观察者：Subject 直接维护 Observer 列表并通知（更“直连”）。
- 发布订阅：通过 Broker 间接通信（更“解耦”）。

## MVC 架构 （model、controller、view）

- View: 检测用户输入、操作（键盘、鼠标）行为，传递调用 Controller 执行对应逻辑。View 更新需要重新获取 Model 的数据。
- Controller：是 View 和 Model 之间协作的应用层，负责业务逻辑处理。
- Model：数据层，数据变化后 通过观察者模式通知 View 更新视图。

优点：

- 模块化：低耦合、可替换、可扩展性、可复用性强
- 多视图更新：使用观察者模式可以做到 单方 Model 通知多视图 实现数据更新

缺点：

- 依赖强：View 和 Model 强依赖，很难抽离成 组件化
- 职责易膨胀：Controller 容易变成“大泥球”（业务越多越难维护）

常见追问：

- MVC 和 MVP / MVVM 的核心差异是什么？
- 为什么前端（尤其 SPA）更常见 MVVM？

## MVVM 框架核心原理

![MVVM](https://s4.ax1x.com/2021/12/15/TpIam6.png)

图上可以看到，view 通过 viewmodel 的 DOM Listeners 将事件绑定到 Model 上，而 Model 则通过 Data Bindings 来管理 View 中的数据，View-Model 从中起到一个连接桥的作用。

更详细的查看 [https://segmentfault.com/a/1190000015895017](https://segmentfault.com/a/1190000015895017)

面试补充：

- ViewModel 的核心价值是把“状态与 UI 映射关系”抽象出来，View 更偏声明式。
- MVVM 并不等于“双向绑定”；双向绑定只是数据同步的一种策略，现代框架更多是“单向数据流 + 受控输入”。

## 双向数据绑定(响应式)原理

Vue2：采用 `Object.defineProperty()` 对属性做 getter/setter 劫持 + 依赖收集 + 派发更新。

Vue3：采用 `Proxy` 拦截对象读写 + 更细粒度的依赖追踪，解决了 Vue2 对新增/删除属性、数组索引等场景的局限。

Vue 实现这种数据双向绑定的效果，需要三大模块：

- Observer：能够对数据对象的所有属性进行监听，如有变动可拿到最新值并通知订阅者
- Compile：对每个元素节点的指令进行扫描和解析，根据指令模板替换数据，以及绑定相应的更新函数
- Watcher：作为连接 Observer 和 Compile 的桥梁，能够订阅并收到每个属性变动的通知，执行指令绑定的相应回调函数，从而更新视图

面试常问的响应式链路（以 Vue2 为例）：

1. 组件渲染触发 getter：把当前渲染 watcher 作为依赖收集目标（Dep.target）
1. getter 收集依赖：`dep.depend()` 把 watcher 加入 dep
1. setter 触发通知：`dep.notify()` 通知相关 watcher
1. watcher 入队：去重 + 异步批处理（nextTick）
1. 刷新队列：重新执行渲染 watcher -> patch 更新 DOM

### 数组响应式的实现

1、先获取原生 Array 的原型方法，push\pop\shift\unshift\sort\splice\reverse
2、对 7 个 原型方法使用 Object.defineProperty 做一些拦截操作
3、把拦截的 Array 类型的数据原型指向改造后原型: 【 原生方法.apply(this, args)】

补充：Vue2 的数组拦截主要是为了解决“无法拦截下标赋值/length 变化”的问题；因此变更数组建议用变异方法或 `Vue.set`。

## Vue 全家桶

### 网上都说操作真实 DOM 慢，但测试结果却比 React 更快，为什么？ - 知乎

[https://www.zhihu.com/question/31809713](https://www.zhihu.com/question/31809713)

### 一次关于 Vue 的自我模拟面试

[https://mp.weixin.qq.com/s/\_MFOv_uCVwHrEtU_InU06w](https://mp.weixin.qq.com/s/_MFOv_uCVwHrEtU_InU06w)

## 组件深入( 组件通信、生命周期 )

- 使用 kebab-case my-component-name 或者 MyComponentName

**组件通信：**

1. 父子之间：props ----- $emit
1. this.$parent.event 调用父组件的方法、this.$refs.xxx.属性/方法：父组件里直接获取子组件 方法和属性
1. eventBus 模式：新建 Vue 事件 bus 对象，然后通过 bus.$emit 触发事件，bus.$on 监听触发事件。

补充（面试常问的通信方式大全）：

1. 祖先/后代：`provide/inject`（注意响应式与默认值）
1. 跨层级：状态管理（Vuex/Pinia）
1. 插槽：`slot` / scoped slot（父传子“渲染能力”）
1. 双向绑定：`v-model`（本质是 `value` + `input` / `modelValue` + `update:modelValue`）

追问：

- 为什么不推荐滥用 `$parent/$refs`？（强耦合、难维护、破坏组件边界）
- EventBus 的问题？（全局隐式依赖、难追踪、易内存泄漏；Vue3 已不推荐）

### mixin

![mixin.png](https://s4.ax1x.com/2021/12/15/TpIBkD.png)

### slot

- 核心分类：默认插槽（单区域定制）、具名插槽（多区域定制）、作用域插槽（父组件使用子组件数据定制）；
- 核心价值：解决组件 “通用逻辑封装” 与 “个性化内容定制” 的矛盾，提升组件复用性；

## Vue Router 路由 原理

### HashHistory：利用 URL 中的 hash("#")

- hash 是用来指导浏览器动作的，对服务器端完全无用，因此改变 hash 不会重新加载页面。
- 可以为 hash 的改变添加监听事件：`window.addEventListener("`**`hashchange`**`", funcRef, false)`
- 每次改变 hash（window.location.hash）都会在浏览器的**访问历史中增加一个记录**

利用这几点特性，就可以实现前端路由 【更新视图但不重新请求页面】的功能了

补充：hash 模式依赖 `hashchange` 事件；首次进入页面 hash 会在浏览器侧处理，不会发给服务端。

#### HashHistory.push()

从设置路由改变到视图更新的流程如下：
$router.push() --> HashHistory.push() --> History.transitionTo() --> History.updateRoute() --> {app.\_route = route} --> vm.render()

#### HashHistory.replace()

其实和 push()类似，不同就是 替换掉当前路由，调用的是 window.location.replace 方法。

### HTML5History：利用 HTML5 中新增的方法 pushState\replaceState

- pushState() 、replaceState() 使得我们可以对**浏览器历史记录栈进行修改**

```javascript
window.history.pushState(stateObject, title, URL);
window.history.replaceState(stateObject, title, URL);
```

实现原理：代码结构以及更新视图的逻辑与 hash 模式基本类似，只不过将对 window.location.hash 直接进行赋值 window.location.replace()，改为了调用 history.pushState() 和 history.replaceState()方法。

补充（面试必考）：

- `pushState/replaceState` **不会触发** `popstate`，只有浏览器前进/后退、以及调用 `history.back/forward/go` 才会触发 `popstate`。
- history 模式的 404 问题：刷新或直达子路由会向服务端请求真实路径，需要服务端配置“所有路由都回退到 index.html”。

### 路由按需加载

```javascript
// vue异步组件和webpack的【代码分块点】功能结合，实现了按需加载
const App = () => import("../component/Login.vue");

// webpack3提供了Magic Comments（魔法注释）
const App = () =>
  import(/* webpackChunkName:'login'*/ "../component/Login.vue");
// 这样我们就为打包出来的chunk指定一个名字，最终生成login.js的chunk包。
```

如果您使用的是 Babel，你将需要添加  syntax-dynamic-import  插件，才能使 Babel 可以正确地解析语法。

## vuex 原理

### 为什么使用 vuex

主要解决两大问题：

1. 多个视图依赖于同一个状态
2. 来自不同视图的行为需要变更同一状态
   对于问题一，传参的方法对于多层嵌套的组件将会非常繁琐，并且对于兄弟组件间的状态传递无能为力。

对于问题二，我们经常会采用父子组件直接引用或者通过事件来变更和同步状态的多份拷贝。以上的这些模式非常脆弱，通常会导致无法维护的代码。

因此，我们为什么不把组件的共享状态抽取出来，以一个全局单例模式管理.

补充：Vuex 解决的是“**状态共享 + 可预测的状态变更**”。核心是单向数据流：View -> dispatch/commit -> mutation -> state -> View。

### 优势

1. vuex 的状态存储是响应式的。当 vue 组件从 store 中读取的时候，如果 store 中的状态发生变化，那么相应的组件也会得到高效的更新。
2. 不能直接修改 storre 的状态。唯一办法就是 通过 提交(commit) mutation。可以方便的跟踪每一个状态的变化，从而通过工具帮我们更好的了解应用。

补充：

- 严格模式（strict）：开发环境下检测是否通过 mutation 修改 state
- 模块化（modules）：大型应用拆分 store
- 插件机制：持久化、日志、时间旅行等

### state: 存储数据(相当于 data)

### getter：获取 store 属性方法 （相当于 computed）

### mutations: 更改 store 中状态的唯一方法就是 提交 mutation,类似于调用事件(methods)

视图通过点击事件，触发 mutattions 中的方法，可以更改 state 中的数据，此时 getters 把数据反映到视图。

### action: 提交 mutation 去变更状态

那么 action 可以理解是 为了处理异步，单纯多加的一层。

### dispatch、commit

在 vue 中 我们触发 click 事件，就能触发 methods 中的方法。但是 vuex 就不行，一定要有个东西来触发才行，就相当于自定义事件 on\emit。

关系就是，通过 dispatch 来触发 actions 中得方法，action 中 commi 去触发 mutions 中方法。

常见追问：

- mutation 为什么必须同步？（为了可追踪、时间旅行、状态一致性；异步会让状态变更时序不可预测）
- Vuex 与 Pinia 的区别（设计理念/写法/TS 体验/是否需要 mutation）

## Proxy 与 Object.defineProperty

Proxy 的优势：

- 直接监听对象而非属性
- 可以直接监听数组的变化
- Proxy 返回的是一个新对象,我们可以只操作新的对象达到目的,而 `Object.defineProperty`只能遍历对象属性直接修改
- 作为新标准会收到浏览器厂商重点持续的性能优化。

补充：`Proxy` 无法被 polyfill（语义层面缺失），因此对旧浏览器兼容策略与 Vue2 不同。

## 虚拟 dom 原理

Virtual DOM 是对 DOM 的抽象,本质上是 JavaScript 对象,这个对象就是更加轻量级的对 DOM 的描述.

补充（面试一句话）：Virtual DOM 的核心是“用 JS 描述 UI”，再通过 diff/patch 把状态变化映射成最小化 DOM 操作。

### 主流

现代前端框架的一个基本要求就是无须手动操作 DOM,
一方面是因为手动操作 DOM 无法保证程序性能,多人协作的项目中如果 review 不严格,可能会有开发者写出性能较低的代码,
另一方面更重要的是省略手动 DOM 操作可以大大提高开发效率.

### 实现流程

1、需要一个 **函数创建单个 Virtual DOM**，这个函数很简单,接受一定的参数,再根据这些参数返回一个对象,这个对象就是 DOM 的抽象.

```javascript
/**
 * 生成 vnode
 * @param  {String} type     类型，如 'div'
 * @param  {String} key      key vnode的唯一id
 * @param  {Object} data     data，包括属性，事件等等
 * @param  {Array} children  子 vnode
 * @param  {String} text     文本
 * @param  {Element} elm     对应的 dom
 * @return {Object}          vnode
 */
function vnode(type, key, data, children, text, elm) {
  const element = {
    __type: VNODE_TYPE,
    type,
    key,
    data,
    children,
    text,
    elm,
  };
  return element;
}
```

2、DOM 其实是一个 Tree ,我们接下来要做的就是声明一个**函数用于创建 DOM Tree 的抽象** -- Virtual DOM Tree.

3、Virtual DOM 归根到底是 JavaScript 对象,我们得想办法将 Virtual DOM 与真实的 DOM 对应起来,也就是说,需要我们声明一个函数,此**函数可以将 vnode 转化为真实 DOM.**

4、Virtual DOM 的 diff 才是整个 Virtual DOM 中最难理解也最核心的部分, diff 的目的就是比较新旧 Virtual DOM Tree 找出差异并更新.

补充：diff 的前提假设通常包含

- 同层比较（tree diff）
- 通过 `key` 提升列表节点复用能力
- 不同类型节点直接替换

## Virtual DOM 的优化

snabbdom.js 已经是社区内主流的 Virtual DOM 实现了**,vue 2.0 阶段与 snabbdom.js 一样**都采用了上面讲解的
**「双端比较算法」**,那么有没有一些优化方案可以使其更快?

其实，社区内有更快的算法，例如 inferno.js 就**号称最快 react-like 框架**(虽然 inferno.js 性能强悍的原因不仅仅是算法,但是其 diff 算法的确是目前最快的),而 **vue 3.0 就会借鉴 inferno.js 的算法进行优化**.

补充：Vue3 的编译优化（面试常问）

- 静态提升（hoistStatic）
- PatchFlag（标记动态节点，减少比对）
- Block Tree（把动态节点收敛到块中）

## Vue 中的 key 到底有什么用？

diff 算法的过程中,先会进行新旧节点的首尾交叉对比,当无法匹配的时候会用新节点的`key`与旧节点进行比对,然后超出差异.

快速: key 的唯一性可以被 Map 数据结构充分利用,相比于遍历查找的时间复杂度 O(n),Map 的时间复杂度仅仅为 O(1).

补充：

- 不要用 index 作为 key（列表插入/删除会导致复用错误，出现输入框错位、动画异常等）
- key 的目标不是“更快”，而是“更稳定正确的节点复用策略”

## $nextTick 的原理

> 将回调延迟到下次 DOM 更新循环之后执行。在修改数据之后立即使用它，然后等待 DOM 更新。

```javascript
<template>
  <div id="example">{{message}}</div>
</template>
<script>
    var vm = new Vue({
      el: '##example',
      data: {
        message: '123'
      }
    })
    vm.message = 'new message' // 更改数据
    console.log(vm.$el.innerHTML) // '123'
    Vue.nextTick(function () {
      console.log(vm.$el.innerHTML) // 'new message'
    })
</script>
```

在上面这个例子中，当我们通过  `vm.message = 'new message'`更新数据时，此时该组件不会立即重新渲染。当刷新事件队列时，组件会在下一个事件循环“tick”中重新渲染。所以当我们更新完数据后，此时又想基于更新后的  `DOM`  状态来做点什么，此时我们就需要使用`Vue.nextTick(callback)`，把基于更新后的`DOM`  状态所需要的操作放入回调函数`callback`中，这样回调函数将在  `DOM`  更新完成后被调用。

补充（原理层面）：nextTick 的核心是

- watcher 更新是异步批处理（队列去重）
- nextTick 把回调放入同一轮“刷新队列完成后”的任务队列
- 优先使用 microtask（Promise.then / MutationObserver），降级到 macrotask（setTimeout）

## 数据为什么频繁变化但只会更新一次

vue 异步执行 DOM 更新（批处理 + 去重）

补充：

- 同一 tick 内多次 set 会合并，只触发一次渲染
- 多个 watcher 入队会按一定顺序（父->子、用户 watcher -> 渲染 watcher 等）执行

## 首屏加载性能优化

此点其实在说的是 白屏问题，白屏时间就是 **当用户地址栏按下确认键开始到首次内容绘制(即看到第一个内容)。**
**所以 解决 白屏问题 才是关键 优化点。**

我们先梳理下白屏时间内发生了什么:

1. 回车按下,浏览器解析网址,进行 DNS 查询,查询返回 IP,通过 IP 发出 HTTP(S) 请求
1. 服务器返回 HTML,浏览器开始解析 HTML,此时触发请求 js 和 css 资源
1. js 被加载,开始执行 js,调用各种函数创建 DOM 并渲染到根节点,直到第一个可见元素产生

### 开启 HTTP2

1. http2 的通信效率更高
1. 可以进行多路复用
1. http2 可以头部压缩,能够节省消息头占用的网络的流量

### 使用骨架屏

补充（可展开回答的优化抓手）：

1. 资源层：HTTP2/3、CDN、缓存策略（强缓存/协商缓存）、压缩（gzip/br）、图片格式（webp/avif）、字体裁剪
1. 构建层：代码分割（路由/组件级）、tree-shaking、按需引入、减少 polyfill
1. 渲染层：SSR/预渲染、关键 CSS 内联、减少首屏 JS 执行（减少大依赖、避免同步阻塞）
1. 体验层：骨架屏、占位/渐进式加载、预取（prefetch/preload）

---

## React 全家桶

（React）专注于提供一个非常基础的 UI 模型，它专注于提供更底层的原生实现，基于此你可以构建出一套属于自己的抽象。

### 组件、数据流、事件、表单

面试要点：

- 数据流：单向数据流（props 向下），状态提升与组合优先于继承
- 受控组件 vs 非受控组件：表单用 state 控制值（受控）更可预测
- 事件系统：合成事件（SyntheticEvent），事件委托（历史上委托到 document，现代版本有调整）

追问：

- setState 是同步还是异步？（在 React 事件/生命周期中批处理，某些场景可同步）
- key 在 React 里有什么用？（同样影响列表 diff 与复用）

### 生命周期

补充：

- 旧生命周期与替代方案：`componentWillMount/ReceiveProps/Update` 已不推荐，使用 `getDerivedStateFromProps` / `componentDidUpdate` / hooks
- 错误边界：`componentDidCatch` / `static getDerivedStateFromError`（只能捕获子组件渲染错误）

### 路由 react-router

补充：

- 声明式路由 + history 管理
- v6 常用能力：`Routes/Route`、`useNavigate`、`Outlet`、loader/action（数据路由）

### react-hooks

面试必背：

- hooks 解决什么：复用状态逻辑、避免 HOC/Render Props 嵌套地狱
- 常用 hooks：`useState/useEffect/useMemo/useCallback/useRef/useContext/useReducer`
- 规则：只能在函数组件顶层调用；不能在条件/循环中调用

追问：

- useEffect 依赖数组怎么写才对？闭包陷阱怎么解释？
- useMemo/useCallback 的收益与风险（过度缓存反而慢；依赖不正确导致 bug）

### redux

补充：

- 核心：单一 store、state 只读、reducer 纯函数
- 中间件：处理副作用（thunk/saga/observable）
- RTK（Redux Toolkit）：推荐写法，减少样板代码

### antd UI 库

补充：组件库的价值：一致性、可访问性、设计规范落地；代价：包体积、定制成本。

---

## TypeScript

而 TS 是一门强类型静态的语言，强大的类型系统，不仅能开发阶段推导类型，带来开发的便利，同时为每一个变量函数声明类型，有助于代码的维护和重构。
TS 的 ROI（投入回报率）是勾型的。**小型且不长久的项目慎入，越是需要多人合作和生命周期越长的项目，回报率越高。**

### ts 环境配置

面试要点：

- `tsconfig.json` 核心选项：`target/module/moduleResolution/lib/jsx/baseUrl/paths`、`strict`、`noImplicitAny`、`skipLibCheck`
- Babel vs tsc：Babel 只转译不做类型检查；类型检查仍需要 `tsc --noEmit` 或 `fork-ts-checker-webpack-plugin`

### ts 类型深入、函数、类

补充：

- 结构化类型系统（鸭子类型）：看“形状”而不是“名义”
- 函数：可选参数、默认参数、函数重载（声明多签名 + 实现签名）
- 类：public/protected/private、readonly、抽象类、this 类型

### 类型 新增：void、any、never、元组、枚举 enum、高级类型

补充（常考点纠正）：

- `any`：放弃类型检查；`unknown`：更安全的顶层类型（使用前必须收窄）
- `never`：不可能发生（穷尽检查、抛错函数返回值）
- `void`：无返回值（或返回值忽略）
- enum：会产生运行时代码；更推荐联合字面量 + `as const`

### 类：多态、封装、继承

接口之间可以相互继承、类之间也可以并实现复用。接口可以通过类实现，但是接口只能约束类的共有成员。

## ts 泛型、装饰器、模块系统

### 泛型：类型也是动态传入的，实现类型的灵活。也可以理解为 不预先确定的数据类型，具体类型只有在使用的时候才能确定

补充（面试高频）：

- 泛型约束：`<T extends Xxx>`
- 默认泛型：`<T = Default>`
- 常用内置工具类型：`Partial/Required/Readonly/Record/Pick/Omit/Exclude/Extract/NonNullable/ReturnType/Parameters`
- 条件类型与分布式条件：`T extends U ? X : Y`
- `infer`：在条件类型里提取类型

### 高级类型

建议掌握的可背诵点：

- 联合/交叉：`A | B`、`A & B`
- 类型收窄：`typeof`、`in`、`instanceof`、判别联合（tag 字段）
- 索引访问类型：`T[K]`
- 映射类型：`{ [K in keyof T]: ... }`

---

## 小程序

### 注意事项

- 不需要 视图使用的对象，不需要使用 this.setData()，直接 this.a = xxx 绑定到实例就行了。
- onLoad(options) //获取小程序页面参数 必须在这里获取
- 登录权限授权、和用户信息获取 时刻(什么时候保证可以获取、什么时候获取不到)
- 分享微信功能是 生命周期，里面的异步函数赋值 是不起作用的。
- 生成小程序码的 scene 长度不能超过 32(长度)
- 小程序 跳转方式   url: '/pages/home'  【开头必须是/】

补充（面试/实战常用）：

- 生命周期：`onLoad`（拿参数）/`onShow`（每次显示）/`onReady`（首次渲染完成）/`onHide`/`onUnload`
- `setData` 性能：
  - 只传变化的字段，避免大对象整颗更新
  - 高频更新合并（节流/防抖），动画/拖拽尽量用原生能力或 WXS（旧方案）
  - 避免把不用于渲染的数据放进 data（你已有这一条）
- 分包与首屏：主包尽量小；按路由/业务拆分分包；公共依赖抽离
- 网络与缓存：请求并发控制、失败重试、离线缓存（Storage）、图片预加载
- 登录授权（常问）：`wx.login` 拿 code -> 服务端换 session/openid；用户信息与授权弹窗时机（不要强弹）
- 页面通信：事件、全局状态、`EventChannel`（页面间）

## 项目结构、语法

这些基础直接看官网就知道了

## 核心组件

## 核心 API

- 存储
- 跳转

## 相关权限、打包上传

## mpvue 框架使用

补充：目前更多使用 Taro/uni-app 等跨端方案；回答时强调

- 跨端的收益（多端复用）与代价（运行时体积、受限能力、排错复杂度）
- 关键差异：路由/生命周期、组件体系、样式与布局差异
