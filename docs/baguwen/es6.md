> 收录 项目开发当中常用ES6、7、8的 知识点

ES6推荐的编码风格：[http://es6.ruanyifeng.com/#docs/style](http://es6.ruanyifeng.com/#docs/style) 值得注意

# 简介

## ECMAScript

ECMAScript 和 JavaScript 的关系是，前者是后者的规格，后者是前者的一种实现

## ES2015 (ES6)

2015年6月正式通过成为国际标准。

### Babel转码器

[Babel](https://babeljs.io/) 是一个广泛使用的 ES6 转码器，可以将 ES6 代码转为 ES5 代码，从而在现有环境执行。

# 变量

var的时代主要有**三大痛点**：

1. 可重复声明
2. 没有块级作用域
3. 不可限制(常量、变量)

ES6 const和let的出现就是为了解决以上三个痛点。

## const：声明常量

声明后不可再次修改，否则会报错。

## let：声明变量

支持块级作用域

## 变量提升问题

```javascript
// var 的情况
console.log(foo); // 输出undefined
var foo = 2;

// let 的情况
console.log(bar); // 报错ReferenceError
let bar = 2;
```

## 块级作用域｛｝

同一块级作用域{}下不可重复声明

块级作用域的出现，使得获得广泛应用的匿名立即执行函数表达式（匿名 IIFE）不再必要了。

```javascript
反例：
window.onload=function (){
  var aBtn = document.getElementsByTagName('input');

  for(var i=0;i < aBtn.length;i++){
    aBtn[i].onclick=function (){
      alert(i); //猜想弹出的i是多少？
    };
  }
};
```

# 解构赋值

**对象**的解构与**数组**有一个重要的不同。

**数组的元素是按次序排列的**，变量的取值由它的位置决定；而对象的属性没有次序，**变量必须与属性同名**，才能取到正确的值。

```javascript
// 左边和右边 必须对应起来
对象：
let {a, b, c } = {a:123, b:12313, c:35234234}  // 对象解构赋值
let { baz } = { foo: 'aaa', bar: 'bbb' };
baz // undefined



数组：
let [a, b, c] = [12, 5, 8];   // 数组解构赋值
let [head, ...tail] = [1, 2, 3, 4];
head // 1
tail // [2, 3, 4]

let [bar, foo] = [1];
以上情况都属于解构不成功，foo的值都会等于undefined。


```

# 字符串的新增方法

## includes(), startsWith(), endsWith()

- **includes()**：返回布尔值，表示是否找到了参数字符串。
- **startsWith()**：返回布尔值，表示参数字符串是否在原字符串的头部。
- **endsWith()**：返回布尔值，表示参数字符串是否在原字符串的尾部。

```javascript
let url = "http://www.bing.com/a";
url.startsWith("http://") || url.startsWith("https://");

url.startsWith("http"); // true
url.endsWith("a"); // true
url.includes("o"); // true
```

## Math 对象的扩展

### Math.trunc()

`Math.trunc`方法用于去除一个数的小数部分，返回整数部分。

```javascript
Math.trunc(4.1); // 4
Math.trunc(-4.1); // -4
Math.trunc(-0.1234); // -0
```

# 函数的扩展

## rest 参数

形式为`...变量名`），用于获取函数的多余参数，这样就不需要使用`arguments`对象了。rest 参数搭配的变量是一个数组，该变量将多余的参数放入数组中。

```javascript
function push(array, ...items) {
```

## 箭头函数

### 精髓

主要修复this指向的问题。

**函数体内的this对象 就是定义时所在的对象，而不是之前使用时所在的对象。**

### 简洁

```javascript
function(参数){   }
(参数)=>{ return xxx  }

如果，有且仅有1个参数，()也可以省
如果，有且仅有1条语句-return，{}可以省
```

# 数组的扩展

[https://coffe1891.gitbook.io/frontend-hard-mode-interview/1/1.2.9](https://coffe1891.gitbook.io/frontend-hard-mode-interview/1/1.2.9)

- map 映射 1对1
- forEach 遍历 循环一遍
- filter 过滤true  
  aItems.filter(item=>item.loc==cur_loc) //单个条件  
  .filter(item=>item.price>=60 && item.price<100);//多个条件
- reduce 减少 多对1  
  求和、求平均数...

## Array.from()

`Array.from`方法用于将两类对象转为真正的数组：类似数组的对象（array-like object）和可遍历（iterable）的对象（包括 ES6 新增的数据结构 Set 和 Map）。



```javascript
let arrayLike = {
  0: "a",
  1: "b",
  2: "c",
  length: 3,
};
// ES5的写法
var arr1 = [].slice.call(arrayLike); // ['a', 'b', 'c']
// ES6的写法
let arr2 = Array.from(arrayLike); // ['a', 'b', 'c']
```

## 数组实例的 find() 和 findIndex()

- find():用于找出第一个符合条件的数组成员

```plain
[1, 4, -5, 10].find((n) => n < 0)
// -5
```

- findIndex():返回第一个符合条件的数组成员的位置，如果所有成员都不符合条件，则返回-1

## 数组实例的 includes() ES7

`Array.prototype.includes`方法返回一个布尔值，表示某个数组是否包含给定的值，与字符串的`includes`方法类似

```javascript
[1, 2, 3]
  .includes(2) // true
  [(1, 2, 3)].includes(4) // false
  [(1, 2, NaN)].includes(NaN); // true
```

##

# 对象的扩展

## 属性的遍历

1. for...in: 循环遍历对象自身的和继承的**可枚举属性**（不含 Symbol 属性）。
2. Object.keys(obj)：返回数组，包括对象自身的(不含继承的)**所有可枚举属性的键名**。
3. Object.getOwnPropertyNames(obj):返回数组，包含对象自身的**所有属\*\***性\***\*的键名**（不含symbol属性，但**包含不可枚举属性**）

## 比较两个值是否真相等Object.is()

```javascript
Object.is("foo", "foo");
// true
Object.is({}, {});
// false
```

## Object.assign浅拷贝

`Object.assign`方法用于对象的合并，将源对象（source）的所有可枚举属性，复制到目标对象（target）。

```javascript
let ab = { ...a, ...b };
// 等同于
let ab = Object.assign({}, a, b);
```



## Object.getOwnPropertyDescriptors() ES8

ES5 的`Object.getOwnPropertyDescriptor()`方法会返回某个对象属性的描述对象（descriptor）。ES2017 引入了`Object.getOwnPropertyDescriptors()`方法，返回指定对象所有自身属性（非继承属性）的描述对象。



# Promise 对象

是异步编程的一种解决方案，比传统的 -- 回调函数和事件 更合理和更强大。

## 原理介绍

两大特点：

1. 对象不受外界影响（承诺）：有三种状态：`pending`（进行中）、`fulfilled`（已成功）和`rejected`（已失败），只有异步操作的结果，可以决定当前是哪一种状态，任何其他操作都无法改变这个状态。
2. `Promise`对象的状态改变，只有两种可能：从`pending`变为`fulfilled`和从`pending`变为`rejected`。

有了`Promise`对象，就可以将异步操作以同步操作的流程表达出来，避免了层层嵌套的回调函数。此外，`Promise`对象提供统一的接口，使得控制异步操作更加容易。

## 基本用法

创建一个Promise实例

```javascript
const promise = new Promise(function(resolve, reject) {
  // ... some code

  if (/* 异步操作成功 */){
    resolve(value);
  } else {
    reject(error);
  }
});
```

`Promise`实例生成以后，可以用`then`方法分别指定`resolved`状态和`rejected`状态的回调函数。

```javascript
promise.then(
  function (value) {
    // success 状态变为resolved时调用
  },
  function (error) {
    // failure 状态变为rejected时调用
  },
);
```

## Promise.prototype.catch()

`Promise.prototype.catch`方法是`.then(null, rejection)`或`.then(undefined, rejection)`的别名，用于指定发生错误时的回调函数。

```javascript
getJSON("/posts.json")
  .then(function (posts) {
    // ...
  })
  .catch(function (error) {
    // 处理 getJSON 和 前一个回调函数运行时发生的错误
    console.log("发生错误！", error);
  });
```

## Promise.all()

`Promise.all()`方法用于将多个 Promise 实例，包装成一个新的 Promise 实例。

```javascript
const p = Promise.all([p1, p2, p3]);
```

`p`的状态由`p1`、`p2`、`p3`决定，分成两种情况。

（1）只有`p1`、`p2`、`p3`的状态都变成`fulfilled`，`p`的状态才会变成`fulfilled`，此时`p1`、`p2`、`p3`的返回值组成一个数组，传递给`p`的回调函数。

（2）只要`p1`、`p2`、`p3`之中有一个被`rejected`，`p`的状态就变成`rejected`，此时第一个被`reject`的实例的返回值，会传递给`p`的回调函数。

```javascript
Promise.all([
  $.ajax({ url: "data/1.json", dataType: "json" }),
  $.ajax({ url: "data/2.json", dataType: "json" }),
  $.ajax({ url: "data/3.json", dataType: "json" }),
]).then(
  (arr) => {
    let [data1, data2, data3] = arr;

    console.log(data1, data2, data3);
  },
  (res) => {
    alert("错了");
  },
);
```

# async\await ES8

ES2017标准引入async函数，使得异步操作变得更加方便。它是 Generator函数的语法糖。

1. 内置执行器：与普通函数一样直接调用
2. 更好的语义：async 表示函数里有异步操作、await 表示紧跟在后面的表达式需要同步(等待结果)。
3. 更广的适用性：可以是Promise对象 和 原始类型的值（会自动转成立即resolved的Promise对象）
4. 返回值 是 Promise：这样就可以直接适用 then来执行下一步操作了。

进一步说，`async`函数完全可以看作多个异步操作，包装成的一个 Promise 对象，而`await`命令就是内部`then`命令的语法糖。

# Object.fromEntries ES10

在 JavaScript 操作中，数据在各种数据结构之间的转换都是很容易的，比如 Map 到数组、Map 到 Set、对象到 Map 等等。

```javascript
let map = new Map().set("foo", true).set("bar", false);
let arr = Array.from(map);
let set = new Set(map.values());

let obj = { foo: true, bar: false };
//下一句 Object.entries() 方法返回给定对象 obj 自身可枚举属性的键值对数组,
//形如：[["foo",true],["bar",false]]
let newMap = new Map(Object.entries(obj));
```

但是如果我们需要**将一个键值对列表转换为对象**，就要写点费劲的代码了。

```javascript
let map = new Map().set("foo", true).set("bar", false);

let obj = Array.from(map).reduce((acc, [key, val]) => {
  return Object.assign(acc, {
    [key]: val,
  });
}, {});
```

该特性的目的在于为对象添加一个新的静态方法 `Object.fromEntries`，用于将符合键值对的列表（例如 Map、数组等）转换为一个对象。上一块的代码中的转换逻辑，现在我们只需要一行代码即可搞定。

```javascript
const map = new Map().set("foo", true).set("bar", false);
let obj = Object.fromEntries(map);
```

# class

## 基本用法

生成实例对象的传统方法是通过 构造函数，

```javascript
function People(name,age){
 this.name = name;
 this.age = age;
}

People.prototype.say=function（）{
    console.log("hello)
}

People.see=function（）{
    alert("how are you")
}
```

ES6引入Class的概念，让 对象原型的写法更加清晰、更像面向对象编程的语法(就是一个语法糖)

```javascript
class People {
  constructor(name, age) {
    this.name = name;
    this.age = age;
  }

  static see() {
    alert("how are you");
  }

  say() {
    console.log("hello");
  }
}
```

### class 原理

[JS之理解ES6声明类class原理](https://segmentfault.com/a/1190000010361428)

[JS之理解原型和原型链](https://segmentfault.com/a/1190000010354583)

## 继承 extends

Class 可以通过`extends`关键字实现继承，这比 ES5 的通过修改原型链实现继承，要清晰和方便很多。

```javascript
class ColorPoint extends Point {
  constructor(x, y, color) {
    super(x, y); // 调用父类的constructor(x, y)
    this.color = color;
  }

  toString() {
    return this.color + " " + super.toString(); // 调用父类的toString()
  }
}
```

**super: 既可以 当作函数使用，也可以当作对象使用。**

子类必须在`constructor`方法中调用`super`方法，否则新建实例时会报错。

`super`它在这里表示父类的构造函数，用来新建父类的`this`对象。

### extends 原理

[JS之理解ES6 继承extends](https://segmentfault.com/a/1190000010407445)

# Module 模块体系

## 语法

在ES6之前 社区主要有 CommonJS 和 AMD 两种。前者用于服务器，后者用于浏览器。 ES6的诞生完全取代了两者，成为 浏览器和服务器通用的模块解决方案。

**特点：**

es6模块的设计思想是 尽量的静态化，使得编译时就能确定模块的依赖关系，以及输入和输出的变量。CommonJS和AMD 都只能在运行时确定这些东西。

- **CommonJS 模块输出的是一个值的拷贝，ES6 模块输出的是值的引用。**
- **CommonJS 模块是运行时加载，ES6 模块是编译时输出接口。**

**基础**

ES6 模块不是对象，而是通过`export`命令显式指定**输出的代码**，再通过`import`命令**输入**。

```javascript
// profile.js
export var firstName = "Michael"; //1. 普通方式

var year = 1958; // 2. 使用{}指定索要输出的一组变量 （推荐写法）
export { year };

// export-default.js
export default function () {
  xxx;
} //3. 默认输出函数，其他模块加载该模块时，import命令可以为该匿名函数指定任意名字。
// import-default.js
import customName from "./export-default";
customName(); // 'foo'
```

## js加载实现

**默认方式：**

```javascript
<!-- 外部脚本 -->
<script type="application/javascript" src="path/to/myModule.js"></script>
//默认情况下，浏览器是同步加载 JavaScript 脚本，即渲染引擎遇到<script>标签就会停下来，等到执行完脚本，再继续向下渲染。
```

**ES6 方式：**

```javascript
<script src="path/to/myModule.js" defer></script>
<script src="path/to/myModule.js" async></script>
// <script>标签打开defer或async属性，脚本就会异步加载。
```

一句话，`defer`是“渲染完再执行”，`async`是“下载完就执行”。另外，如果有多个`defer`脚本，会按照它们在页面出现的顺序加载，而多个`async`脚本是不能保证加载顺序的。



**ES6模块：\*\***  
\*\*浏览器加载 ES6 模块，也使用`<script>`标签，但是要加入`type="module"`属性。、

```javascript
<script type="module" src="./foo.js"></script>
```
