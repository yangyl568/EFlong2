# 日常开发积累

## 事件委托

```js
// 2. 利用事件委托，意思就是 通过监听父元素来获取 子元素信息
let ulNode = document.getElementById("ul");
ulNode.addEventListener("click", function (e) {
  // 严谨：确保点击得是 li 元素
  if (e.target.tagName === "LI") {
    // 获取索引：
    let liNodeList = this.querySelectorAll("li"); // 类数组
    // 类数组如果想要调用数组 indexOf 方法就得 通过 call 改变this到Array上，然后通过原型链去调用 Array 上得各种方法
    let index = Array.prototype.indexOf.call(liNodeList, e.target);
    console.log(`${e.target.innerHTML},索引为：${index}`);
  }
});

// 全局 禁用页面上得按钮
window.addEventListener(
  "click",
  function (e) {
    alert("该按钮不能点击");
    // e.stopPropagation() // 阻止捕获和冒泡阶段事件得进一步传播
    e.preventDefault(); // 阻止默认事件
  },
  true
);
```

## 对象操作

实现 new 实例

```js
function creatNew(fn, ...args) {
  // 1、创建一个新对象 obj
  // 2、新对象的 proto 指向构造函数的 原型
  // 3、利用 apply改变对象 this 指向,得到结果 result
  // 4、判断result如果返回的是一个 对象那直接返回结果，否则 返回新对象obj
  let obj = Object.create(null);
  obj.__proto__ = fn.prototype;
  let result = fn.apply(obj, args);
  if (result instanceof Object) {
    return result;
  } else {
    return obj;
  }
}
```

InstanceOf

```js
function myInstanceOf(son, father) {
  while (true) {
    son = son.__proto__;
    if (!son) return false;
    if (son === father.prototype) return ture;
  }
}
myInstanceOf([], Array); // true
```

call()

```js
Function.prototype.myApply = function (context, ...args) {
  // 1、改变 this 指向
  context.fn = this;
  // 2、调用函数
  let result = context.fn(...args);
  delete context.fn;
  return result;
};
```

apply()

```js
Function.prototype.myApply = function (context, args) {
  // 1、改变 this 指向
  context.fn = this;
  // 2、调用函数
  let result = context.fn(...args);
  delete context.fn;
  return result;
};
```

bind()

```js
Function.prototype.myBind = function (context, args1) {
  return (...args2) => this.apply(context, [...args1, ...args2]);
};
```

浅拷贝

```js
1、展开运算符
var newObj = {...obj}

2、assign
Object.assign({}, obj)

3、循环
function copy(obj) {
  let result = Array.isArray(obj) ? [] : {}
  Object.keys(obj).forEach(key => {
    result[key] = obj[key]
  })
  return result
}

```

深拷贝

```js
1、JSON.parse(JSON.stringify(obj))

2、利用遍历对象 + 递归对象
export function deepClone(source) {
  if (!source && typeof source !== "object") {
    throw new Error("error arguments", "deepClone");
  }
  const targetObj = source.constructor === Array ? [] : {};
  Object.keys(source).forEach((key) => {
    if (source[key] && typeof source[key] === "object") {
      targetObj[key] = deepClone(source[key]);
    } else {
      targetObj[key] = source[key];
    }
  });
  return targetObj;
}
```

封装继承

```js
// ES5
function Parent(n) {
  var name = n;
  function a() {
    return name;
  }

  function b() {
    return "我的名字" + name;
  }

  return {
    a: a,
    b: b,
  };
}

var xieN = Parent("龙哥");
console.log(xieN.a());
console.log(xieN.b());
```

类

```js
/************ ES5 定义类 ******************/
function User(name) {
  this.name = name;
}
// 添加函数
User.prototype.showUser = function () {
  console.log(this.name);
};
// 使用
const user = new User("my.yang");
user.showUser();

/************ ES6 定义类 ******************/
class Person {
  // 其实就是在 Person 的 prototype 上添加了属性和方法
  constructor(name) {
    this.name = name;
  }
  showName() {
    console.log(this.name);
  }
}

const person = new Person("My.Yang");
person.showName();
```

### 继承

ES6 class

```js
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

原型链继承:主要通过子类 prototype 指向父类实例

缺点：子类之间会相互影响

```js
// 父类
function Parent() {
  this.name = "我是小样";
}
// 给父类添加方法
Parent.prototype.getName = function () {
  return this.name;
};
// 子类
function Child() {}

Child.prototype = new Parent(); // 直接把父类实例赋给 子类的 原型对象
Child.prototype.constructor = Child; // 根据原型链的规则,顺便绑定一下constructor, 这一步不影响继承, 只是在用到constructor时会需要

const child = new Child();
child.name; // 我是小样
child.getName(); // 我是小样
```

构造函数继承: 在子类构造函数中执行父类构造函数并绑定子类 this

缺点：继承不了父类原型上的属性和方法

```js
function Parent(name) {
  this.name = [name];
}
Parent.prototype.getName = function () {
  return this.name;
};
function Child() {
  Parent.call(this, "参数1"); // 执行父类构造方法并绑定子类的this, 使得父类中的属性能够赋到子类的this上
}

//测试
const child1 = new Child();
const child2 = new Child();
child1.name[0] = "foo";
console.log(child1.name); // ['foo']
console.log(child2.name); // ['zhangsan']
child2.getName(); // 报错,找不到getName(), 构造函数继承的方式 继承不到父类原型上的属性和方法
```

组合式继承
就是把上面俩个整合：prototype + 构造函数调用父类 CALL

缺点：子类实例执行了两次构造函数【Parent.call() 和 new Parent()】

```js
function Parent(name) {
  this.name = [name];
}
Parent.prototype.getName = function () {
  return this.name;
};

function Child() {
  Parent.call(this, "参数"); // 改变 Parent this 指向，并带参数
}
Child.prototype = new Parent(); // 把父类实例 赋值给 子类原型
Child.prototype.constructor = Child;

var child = new Child();
var child2 = new Child();
child1.name = "yang";
console.log(child1.name); // yang
console.log(child2.name); // 参数
child2.getName(); // 参数
```

寄生式组合继承【最终版】

主要是 优化了原型链继承方式

```js
function Parent(name) {
  this.name = [name];
}
Parent.prototype.getName = function () {
  return this.name;
};
function Child() {
  // 构造函数继承
  Parent.call(this, "zhangsan");
}
//原型链继承
// Child.prototype = new Parent()
Child.prototype = Object.create(Parent.prototype); //将`指向父类实例`改为`指向父类原型`
Child.prototype.constructor = Child;

//测试
const child = new Child();
const parent = new Parent();
child.getName(); // ['zhangsan']
parent.getName(); // 报错, 找不到getName()
```

## 数组操作

排平-扁平化

```js
/**
 * 最简单方式 利用循环递归
 * 循环遍历 判断当前是否 数组，是的话 递归下一层，拼接到新数组中，否则直接 push 到新数组中
 */
function flatten1(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    let elm = arr[i];
    if (Array.isArray(elm)) {
      result = result.concat(flatten1(elm));
    } else {
      result.push(elm);
    }
  }
  return result;
}

/**
 * 利用 reduce 和 递归
 * arr.reduce(callback, [initialValue])
 * callback （执行数组中每个值的函数，包含四个参数）

    1、previousValue （上一次调用回调返回的值，或者是提供的初始值（initialValue））
    2、currentValue （数组中当前被处理的元素）
    3、index （当前元素在数组中的索引）
    4、array （调用 reduce 的数组）

  initialValue （作为第一次调用 callback 的第一个参数。）
  */
function flatten2(arry) {
  return arry.reduce(function (prev, curr) {
    return prev.concat(Array.isArray(curr) ? flatten2(curr) : curr);
  }, []);
}

/**
 * 利用 es6 flat
 */
function flatten4(arry) {
  // return arry.flat(2) // 两层
  return arry.flat(Infinity); // 无穷层次
}
```

## 防抖-节流

防抖:固定时间内连续触发事件，只有最后一次会执行

```js
// 场景： 搜索输入框，提高体验度，在用户输入后可以立即展示搜索结果，而不需要每次点击搜索按钮。
// 分析： 设置定时器，如果存在定时器则代表还在时间内 执行清除定时器事件，否则设置定时器

function debuouncES5(fn, await) {
  let timer = null;
  let thia = this;
  return function () {
    if (timer) clearTimeout(timer);

    timer = setTimeout(function () {
      fn.apply(that, arguments);
    }, await);
  };
}

function debuouncES6(fn, await) {
  let timer = null;
  return (...args) => {
    if (timer) clearTimeout(timer);

    timer = setTimeout(() => {
      fn.apply(this, args); // es6 解构
    }, await);
  };
}
```

节流：固定时间内连续触发事件，会按照事件间隔依次执行
需求场景：滚动 scroll、resize 事件监听

```js
// 1. 时间戳写法 简单
// 缺点：第一次立马执行
function throttle(fn, awit) {
  let lastTime = 0;
  return function () {
    // 时间戳写法 第一次立马执行
    let nowTime = Date.now();
    if (nowTime - lastTime >= awit) {
      lastTime = nowTime;
      fn.apply(this, arguments);
    }
  };
}

// 2. 第一次不立马执行，需要使用 定时器延迟，
// 缺点：最后一次也是延迟执行的
function throttleTime(fn, await) {
  let timer = null;
  return function () {
    let that = this;
    let arg = arguments;
    // 如果 不存在定时器，则设置定时，执行函数并清除定时器
    if (!timer) {
      timer = setTimeout(function () {
        fn.apply(that, arg);
        // 确保每次执行完之后 进来都是 新的 timer
        timer = null;
      }, await);
    }
  };
}

// 3. 由于前两个都有缺点，结合两者优点：再出一个。
// 分析：利用 函数调用时间-开始时间 = 剩余时间 与 间隔时间 对比，<=0 则立马执行函数，否则设置定时器执行

function throttlePlus(fn, await) {
  let timer = null;
  let startTime = Date.now();
  return function () {
    let that = this;
    let args = arguments;

    let currTime = Date.now(); // 记录当前时间，用来计算 剩余时间，多久执行下一次
    let shiyongTime = currTime - startTime; // 已用的时间
    let remainning = await - shiyongTime; // 剩余时间，用来判断 和 计时器

    clearTimeout(timer); // 确保每次都是新计时器
    // 间隔时间 与 已使用时间比较，<=0 代表时间到了 该执行函数了，并且把 开始时间重置到现在
    if (remainning <= 0) {
      fn.apply(that, args);
      startTime = Date.now();
    } else {
      timer = setTimeout(fn, remainning); // 把剩余时间继续
    }
  };
}
```

## 排序和查找

### 插入排序

```js
function sort(arr) {
  for (let i in arr) {
    while (i > 0 && arr[i] < arr[i - 1]) {
      // 跟前面那个去比较
      [arr[i], arr[i - 1]] = [arr[i - 1], arr[i]];
      i--;
    }
  }
}
```

## 设计模式

### 发布订阅模式

```js
// 实现一个 事件触发器
class EventEmiter {
  constructor() {
    // 存储事件和对应的回调函数  { 'click': [fn1,fn2] ,change: [fn3, fn4]}
    this.subs = Object.create(null);
  }

  // 注册事件，因为可以是多个事件，所以是数组形式
  $on(eventType, handle) {
    this.subs[eventType] = this.subs[eventType] || []; // 初始化当前注册的事件（因为刚开始没有事件）
    this.subs[eventType].push(handle); // 数组的形式存起来
  }
  // 触发(发布)事件
  $emit(eventType) {
    // 根据 事件类型 找到所有注册的事件，遍历依次执行
    this.subs[eventType].forEach((handle) => {
      handle();
    });
  }
}
// 测试
let em = new EventEmiter();
em.$on("click", () => {
  console.log("em.$on");
});
```

### 观察者模式

```js
// 观察者 Watcher：当事件触发的时候，需要去调用的函数 update()
// 发布者 Dep：收集观察者并当数据发生变化时通知各个观察者
// subs: 存储各个观察者
// addSub(): 添加观察者
// notify() : 当数据发生变化时 通知各个订阅者(观察者)去调用 他们自己的函数 update

// 定义 观察者 需要做的事情
class Watcher {
  update() {
    console.log("我是观察者 update 函数");
  }
}
// 发布
class Dep {
  constructor() {
    this.subs = [];
  }
  addSub(sub) {
    // 确保是一个 观察者
    if (sub && sub.update) {
      this.subs.push(sub);
    }
  }
  notify() {
    // 遍历所有观察者调用自己的方法
    this.subs.forEach((sub) => {
      sub.update();
    });
  }
}
// 测试
let wac = new Watcher();
let dep = new Dep();
dep.addSub(wac);
dep.notify();
```
