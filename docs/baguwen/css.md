# CSS 中高级

- 结构性属性： display、position、overflow、float、margin、padding
- 表现性属性： background、border、font、text

## css 选择器

id、类、标签名、

伪类（:link、:visited、:hover、:active、[:nth-child(n)](https://www.runoob.com/cssref/sel-nth-child.html)）、

伪元素（::before、::after）

[关系选择器](https://developer.mozilla.org/zh-CN/docs/Learn/CSS/Building_blocks/Selectors/Combinators)

### 关系选择器：空格、>、+ 和 ~

- 后代选择器: 空格。div p, div 里的 所有 p 标签都会匹配到
- 子代关系选择器: > 。只会在选择器选中直接子元素的时候匹配。
- 邻接兄弟选择器: + 。紧跟的同级元素。
- 通用兄弟: ~ 。p ~ img 所有 p 元素后 任何地方的 img 元素。

### 权重、优先级

```js
权重计算规则

第一优先级：!important会覆盖页面内任何位置的元素样式
1.内联样式，如style="color: green"，权值为 1000
2.ID选择器，如#app，权值为 0100
3.类、伪类、属性选择器，如 .foo, :first-child, div[class="foo"]，权值为 0010
4.标签、伪元素选择器，如div::first-line，权值为 0001
5.通配符、子类选择器、兄弟选择器，如*, >, +，权值为 0000
6.继承的样式没有权值
```

## css 设计模式

> 设计模式：是一套反复使用的、多数人知晓的、经过分类、代码设计经验的总结。

### 遵循三大原则

- 分：功能模块分类
- 拆：分之后，还可以把重复 冗余的代码 拆出来
- 排：经过 分、拆 之后其实就已经十分清晰了，这一步 主要是多文件引用排序问题

### OOCSS- Object Oriented CSS (提供了思想)

直译过来就是，**结构和皮肤分离，容器和内容分离。**

即不要把结构和皮肤以及内容进行强耦合，而是相互独立，所要达到的目标是更易复用和组合，可以选择使用，选择引用等。

### SMACSS - Scalable and Modular Architecture for CSS (实战)

1. Base（基础）
   基础的样式，就是一些需要最先定义好，针对于某一类元素的通用固定样式。
2. Layout（布局）
   布局样式，是跟页面整体结构相关，譬如，列表，主内容，侧边栏的位置、宽高、布局方式等。
3. Module（模块）
   模块样式，就是我们在对页面进行拆的过程中，所抽取分类的模块，这类的样式分别写到一起。
4. State（状态）
   页面中的某些元素会需要响应不同的状态，比如，可用、不可用、已用、过期、警告等等。将这类样式可以组织到一起。
5. Theme（主题）
   主题是指版面整个的颜色、风格之类，一般网站不会有频繁的较大的改动，给我们印象比较深的是 QQ 空间，其他应用的不是很多，所以，这个一般不会用到，但有这样一个意识是好的，需要用到的时候，就知道该怎样规划。

### BEM

它是一种怎样去组织、编写代码的思想，而且，看似简单的它，对前端界的影响却是巨大的。

它的核心如下： **Block（块）、Element（元素）、Modifier（修饰符）**

它帮助我们定义页面中每一部分的级别属性，从某种意义上说，也是一种“拆”。

## 盒模型

> box-sizing 有两个常用值：content-box **标准盒模型** 和 border-box **怪异盒模型**

诞生缘由

默认盒模型实际占用空间为：
`margin + border + padding + width(height)`  这种计算方式非常不方便，比如：对于非 px 为单位的宽高设置：

```css
.div {
  width: 50%;
  border: 1px solid #ccc;
}
/* 我们想要宽度为50%，但实际大小却是 50%+2px */
```

- content-box(默认值):  **border+padding+ width**
- border-box(推荐用法)：**宽高是包含 border 和 padding 的，这样我们就可以准确的设计 盒子的大小**

## 块级格式化上下文

### BFC

- 浮动元素 (元素的 float 不是 none)
- 绝对定位元素 (元素具有 position 为 absolute 或 fixed)
- display: inline-block (内联块)、table-cell (表格单元格)、
- 具有 overflow 且值不是 visible 的块元素，
- flex item 和 grid item

特点

- 块级盒的垂直方向距离由上下 margin 决定
- BFC 就是页面上的**一个隔离的独立容器**，容器里面的子元素不会影响到外面的元素。反之也如此；
- 计算 BFC 的高度时，浮动元素也参与计算。

### IFC

- 水平方向上，当所有盒的总宽度小于匿名行盒的宽度时，那么水平方向排版由 `text-align` 属性来决定；
- 垂直方向上，行内级盒的对齐方式由 `vertical-align` 控制，默认对齐为 `baseline`；
- 行盒的高度由内部子元素中实际高度最高的盒子计算出来，值得注意的是，行内盒（inline boxes）的垂直的 `border`，`padding` 与 `margin` 都不会撑开行盒的高度。

### 问题 1

item 之间会产生水平间隙，是因为换行产生空白符。有两种解决方案：

1. 代码不换行
2. 设置父元素 font-size 为 0，重置子元素的 font-size

### 问题 2

一般为了避免这个垂直的间隙，在设置 inline-block 的时候，还需要顺手带个 `vertical-align: middle;`

## 双飞翼、圣杯、flex - 三列布局

考点：margin: - 负边距

通过负边距进行偏移的元素，它会放弃偏移前占据的空间，这样它后面文档流中的其它元素就会“流”过来填充这部分空间。

**负边距对浮动元素的影响**
![image.png](https://z3.ax1x.com/2021/04/28/giZawD.png)

![image.png](https://z3.ax1x.com/2021/04/28/giZsSI.png)

都是为了实现一个 **两侧宽度固定，中间宽度自适应的三栏布局**。

### 圣杯布局

```html
<body>
  <div class="content">
    <div class="middle"></div>
    <div class="left"></div>
    <div class="right"></div>
  </div>
</body>
<style>
  /* 主设置 padding */
  .content {
    overflow: hidden;
    padding: 0 100px;
  }

  .middle,
  .left,
  .right {
    position: relative;
    float: left;
    height: 80px;
  }

  .middle {
    width: 100%;
    background: green;
  }

  .left {
    width: 100px;
    left: -100px;
    margin-left: -100%;
    background: yellow;
  }

  .right {
    width: 100px;
    right: -100px;
    margin-left: -100px;
    background: pink;
  }
</style>
```

1. 先写 middle, 然后是 left 和 right，因为需要先渲染 middle
2. left、right 需设置 `position:relative` 以及相应的 left、right 值
3. 理解负边距的作用，left 的 `margin-left:-100%` 使它上移一行，同时 right 向左移占据 left 原先位置，同理，right 的`margin-left:-100px` 使它上移并靠右

### 双飞翼布局

区别在于 中间多了一曾包裹，其他基本一致，利用 float: left + margin-left 负边距

```html
<style>
  .middle {
    width: 100%;
  }

  .middle,
  .left,
  .right {
    height: 500px;
    float: left;
  }

  .inner-middle {
    height: 100%;
    background-color: #555;
  }

  .left {
    width: 200px;
    margin-left: -100%;
    background-color: #333;
  }

  .right {
    width: 200px;
    margin-left: -200px;
    background-color: #999;
  }
</style>

<body>
  <div class="middle">
    <div class="inner-middle">这就是中间地带</div>
  </div>
  <div class="left">左边</div>
  <div class="right">右边</div>
</body>
```

### flex 布局实现

```html
<style>
  .content {
    display: flex;
  }

  .middle,
  .left,
  .right {
    height: 200px;
  }

  .middle {
    /* flex: 1;  */
    /* 1 1 0% */

    flex: auto;
    /* 1 1 auto */

    /* flex: none;  */
    /* 0 0 auto */

    background: green;
  }

  .left {
    width: 100px;
    order: -1;
    background: yellow;
  }

  .right {
    width: 100px;
    background: pink;
  }
</style>

<body>
  <div class="content">
    <div class="middle">中间</div>
    <div class="left">左边</div>
    <div class="right">右边</div>
  </div>
</body>
```

## 弹性布局 flex (重点必考)

- 详细用法移步阮一峰的[flex 语法](http://www.ruanyifeng.com/blog/2015/07/flex-grammar.html)
- [flex 实战](http://www.ruanyifeng.com/blog/2015/07/flex-examples.html)，讲得非常通俗易懂.

### 关键点

不确定多少的列表展示，**最后一行需要左对齐的时候**，解决方案：

flex: 组合值： flex-grow、flex-shrink、flex-basis 是否放大、缩小、本身大小

```css
/* 多列多行，最后一行 靠左正常顺序显示 */
.ul:after {
  content: "";
  flex: auto; /* （1，1，auto） */
}
```

- flex: initial； 0 1 auto; => 又剩余空间的尺寸时-不会放大、会缩小、自适应本身内容 fit-content
- flex: auto ; 1 1 auto =>
- flex: 1; 1 1 0%
- flex: none; 0 0 auto

## 网页生成的过程

1. HTML 代码转化成 DOM
1. CSS 代码转换成 CSSOM（CSS Object Model）
1. DOM 和 CSSOM 结合，生成一颗渲染树 (render tree) 包含每个节点的视觉信息
1. 生成布局（Layout）即将所有渲染树的所有节点进行平面合成
1. 将布局绘制（paint）在屏幕上

**以上五步里面，1-3 都非常快，4-5 是最耗时的。**

> 生成布局（flow）和绘制（paint）这两步，合称为 渲染（render）

![网页生成的过程](https://s4.ax1x.com/2021/12/14/oxhAE9.png)

## 重绘 (repaint) 和重排 (reflow)

**重绘**：对页面 **视觉表现属性** 的修改，比如：背景色、文字颜色。

**重排**：修改布局必然导致重绘，比如：DOM 操作、元素大小、间距等。

### 注意点

- 样式表越简单，重排和重绘就越快。
- 重排和重绘的 DOM 元素层级越高，成本就越高。
- table 元素的重排和重绘成本，要高于 div 元素

### 提高性能的技巧

1. DOM 的多个读操作（或多个写操作），应该放在一起。不要两个读操作之间，加入一个写操作。
2. 不要一条条地改变样式，而要通过改变 class，或者 csstext 属性，一次性地改变样式。
3. position 属性为 absolute 或 fixed 的元素，重排的开销会比较小，因为不用考虑它对其他元素的影响。
4. 只在必要的时候，才将元素的 display 属性为可见，因为**不可见的元素不影响重排和重绘**。另外，visibility : hidden 的元素只对重绘有影响，不影响重排。
5. 使用虚拟 DOM 的脚本库，比如 React、Vue 等。
6. 使用 window.requestAnimationFrame()、window.requestIdleCallback() 这两个方法调节重新渲染

## link 和 @import 的区别

- link 属于 XHTML 标签，而 @import 是 CSS 提供的。
- 页面被加载时，link 会同时被加载，而 @import 引用的 CSS 会等到页面被加载完再加载。
- link 方式的样式权重高于 @import 的权重。
- 使用 dom 控制样式时的差别：当使用 javascript 控制 dom 去改变样式的时候，只能使用 link 标签，因为 @import 不是 dom 可以控制的。

## Sass\less\Scss

### 记录和介绍常用语法

- & 代表当前所属选择器： `&:hover {xxx}`
- 定义 $width:5em  ：变量，后期直接使用。$width: 5em !global; 全局可用。
- @import "foo.scss" : 导入本地 scss
- @extend .cssname: 将.cssname**下的所有样式继承给 当前作用域**
- **@for、@each 可以有规律的循环输出多个类元素**

### mixin 混合指令（性能比 @extend 更好）

- 定义: @mixin 后添加名称与样式

```css
@mixin large-text {
  font: {
    family: Arial;
    size: 20px;
    weight: bold;
  }
  color: #ff0000;
}
```

- 使用 @include 指令引用混合 mixin 样式

```css
.page-title {
  @include large-text;
  padding: 4px;
  margin-top: 10px;
}
```

### 如何优雅的使用 BEM

- 灵活的 &\_\_

```css
.aboutSection {
    &__wrapper {
        max-width 108rem;
        padding: 3rem 0;
    }
    &__headingContainer {
        background-color: steelblue;
    }
}
```

- @extend

```css
.nav {
  background-color: steelblue;
  &__container {
    display: flex;
    justify-content: space-between;
  }
  &__item {
    color: white;
    &--active {
      @extend .nav__item;
      border-bottom: 1px solid red;
    }
  }
}

// 解析成css

.nav {
  background-color: steelblue;
}
.nav__container {
  display: flex;
  justify-content: space-between;
}
.nav__item,
.nav__item--active {
  color: white;
}
.nav__item--active {
  border-bottom: 1px solid red;
}
```
