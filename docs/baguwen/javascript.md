# javascript 高级

## 专业术语

- 常量、变量（可读、可写）、数据类型（基础、引用）

- symbol: 生成一个全局唯一的值，Symbol(1) !== Symbol(1)

- 形参： 函数（这里定义的）、实参：实际输入的值
- 函数四种形态：声明形态、表达式形态、嵌套形态、闭包
- 堆: FIFO、栈: FILO 先进后出(木桶原理)
- 同步、异步、进程、线程

### 堆 heap

**被称为优先队列**，队列中允许的操作是 **先进先出**（FIFO），在队尾插入元素，在队头取出元素。  
而堆也是一样，在**堆底插入元素，在堆顶取出元素**。

### 栈 stack

又名堆栈，作为一个 **先进后出** 的数据结构。（**注意：这里的堆栈本身就是栈，只是换了个抽象的名字**。）  

它是一种运算受限的线性表。其限制是仅允许在表的一端进行插入和删除运算。这一端被称为栈顶，相对地，把另一端称为栈底。

向一个栈插入新元素又称作进栈、入栈或压栈，它是把新元素放到栈顶元素的上面，使之成为新的栈顶元素；

从一个栈删除元素又称作出栈或退栈，它是把栈顶元素删除掉，使其相邻的元素成为新的栈顶元素。

### 队列 queue

- 是一种特殊的线性表，特殊之处在于它只允许在表的前端进行删除操作，在后端进行插入**和栈一样**，是一种操作受限制的线性表。
- 采用 先进先出 FIFO ，新元素插入到尾部，读取的时候总是从头部开始。

（1）**值类型(基本类型)**：数值 (number)、布尔值 (boolean)、string (在赋值传递中会以引用类型的方式来处理)、null、undefined。

（2）**引用类型**：对象、数组、函数。

## 执行上下文

当函数执行时，去创建一个称为「执行上下文( execution contex )」的环境，分为 **创建、执行和回收三个阶段。**

**作⽤域是在函数执⾏上下⽂创建时定义好的**，不是函数执⾏时定义的

### 创建阶段

是指 **函数被调用但未被执行任何代码时，** 创建了一个拥有 **3 个属性的对象（出现 var 变量提升、函数声明提升）**

```javascript
executionContext = {
  scopeChain: {}, // 创建作⽤域链（scope chain）
  variableObject: {}, // 初始化变量、函数、形参
  this: {}, // 指定this
};
```

创建阶段： 函数声明比变量声明优先级高

### 代码执行阶段

主要工作:

1. 分配变量、函数的引用、赋值
2. 执行代码

```javascript
// ⼀段这样的代码
function demo(num) {
  var name = 'xiaowa';
  var getData = function getData() {};
  function c() {}
}
demo(100);

// 创建阶段⼤致这样，在这个阶段就出现了【变量提升(Hoisting)】
executionContext = {
  scopeChain: { ... },
  variableObject: {
    arguments: { // 创建了参数对象
      0: 100,
      length: 1
    },
    num: 100, // 创建形参名称，赋值/或创建引⽤拷⻉
    c: pointer to function c() // 有内部函数声明的话，创建引⽤指向函数体
    name: undefined, // 有内部声明变量a，初始化为undefined
    getData: undefined // 有内部声明变量b，初始化为undefined
  },
  this: { ... }
}

// 代码执⾏阶段，在这个阶段主要是赋值并执⾏代码
executionContext = {
  scopeChain: { ... },
  variableObject: {
    arguments: {
      0: 100,
      length: 1
    },
    num: 100,
    c: pointer to function c()
    name: 'xiaowa', // 分配变量，赋值
    getData: pointer to function getData() // 分配函数的引⽤，赋值
  },
  this: { ... }
}
```

### 执行栈（执行上下文栈）

由于 JS 是单线程的，所以代码中只有一个【全局执行上下文】，和无数个【函数执行上下文】，共同组成了执行上下文栈（Execution Stack）。

**当一个函数执行时会被压入上下文栈，内容执行完毕后，会被移出执行上下文栈。**

递归函数循环次数太多的时候(超过当前浏览器分配的内存临界值)，会报错 **内存溢出** 什么的，就是因为这个。函数一直没有执行完毕，一直往内存中添加直到临界点报错！

## 基础类型和引用类型区别

### 基础类型

`String、Number、Boolean、Null、Undefined、symbol(ES6)`

**特性：** 基础类型的数据是按值存储的，也就是说，变量中存储的实际上是值本身，而不是指向值的内存地址。因此，基础类型的数据是不可变的，一旦创建就不能被修改。

### 引用类型

`对象 Object、数组 Array、函数 Function`

引用类型的数据是存储在堆内存中的，变量中存储的是指向实际对象在内存中的地址。因此，引用类型的数据是可变的，可以修改对象属性的值或者向数组中添加或删除元素。
**因此赋值过程其实是指向同一个地址，会相互影响。**

## 函数的四种形态

只有**声明形态的函数，才具有变量提升的特性**。(所谓**提升**：意思就是代码的执行顺序提升到最前面)

```javascript
//函数的声明形态    只有声明形态的函数，才具有提升的特性。
function func() {
  console.log("函数的声明形态");
}

//函数的表达式形态 之一
let func0 = (function () {
  console.log("函数的表达式形态");
})(
  //函数的表达式形态 之二
  function func1() {}
);

//函数的嵌套形态
let func2 = function () {
  console.log("函数的嵌套形态");
  let func3 = function () {
    console.log("func2嵌套在func1里");
  };
  func3();
};

// 函数的闭包形态
let func4 = function () {
  var a = "func4";
  return function () {
    console.log("我是以闭包形态存在的函数:" + a);
  };
};
//所有的函数都通过一对括号"()"调用
func();
func0();
func1();
func2();
func4()(); // 闭包
```

## 作用域( Scope )

js 中有三种：

**全局作用域、函数作用域**，es6 中又增加了 **块级作用域**。

作用域最大的用途就是 **隔离变量或函数**，并**控制他们的生命周期**。
**作用域是**在函数执行上下文**创建时定义好的**，**不是**函数执行时定义的。（**执行时根据定义时的关系向外层寻找**）

### 作用域链

当一个**块或函数**嵌套在另一个块或函数中时，就发生了作用域的嵌套。

如果在**当前作用域无法找到会向上一级作用域寻找，直到找到或抵达全局作用域**，这样的链式关系就是 作用域链( Scope Chain )

## 闭包

> **函数内层的作用域访问它外层函数作用域里的【参数/变量/函数】时，闭包就产生了**

- 可以读取函数内部的变量
- 让这些变量始终保持在内存中，即：**闭包可以使它诞生的环境一直存在**。

### 写成闭包形式的好处

因为闭包只有内部作用域可以访问，这样就可以**实现软件设计上的封装**了。
设计出强大的类库、框架：jQuery、Vue.js

```javascript
// ES6之前 类的封装
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

### 平时怎么用，应用场景[链接](https://juejin.im/post/5d50c6ef6fb9a06b1d21358d)

什么节点循环绑定事件，解决方案 立即执行函数、var => let

```javascript
for (var i = 1; i <= 5; i++) {
  setTimeout(function test() {
    console.log(i); //>> i引用了去全局作用域里面的i，当for循环完毕后，i的值为6 6 6 6 6
  }, i * 1000);
}

// 使用闭包解决
for (var i = 1; i <= 5; i++) {
  (function fun(j) {
    setTimeout(function test() {
      console.log(j); //>> 1 2 3 4 5
    }, j * 1000);
  })(i);
}
```

### 缺点

JS 垃圾回收(GC): 如果对象不再被引用，或者对象互相引用形成孤岛后且没有被孤岛之外的其他对象引用，就会被 JS 引擎的垃圾回收器回收。

**过度使用闭包，会导致内存占用过多，不会被回收，甚至内存泄漏。**

## this 的 5 种场景

![this5.png](https://s4.ax1x.com/2021/12/15/TpZUhD.png)

注意：this 的值是在执行的时候才能确认，定义的时候不能确认！

### 场景区分

```javascript
// 1、直接调用
function foo() {
  console.log(this.a); // 直接调用函数 this 指向 window => this.a = 1
}
var a = 1;
foo();

// 2、对象赋值调用
function fn() {
  console.log(this);
}
var obj = { fn: fn };
obj.fn(); // this 指向被调用的对象 obj

// 3、实例化
function CreateJsPerson(name, age) {
  this.name = name; // 尹华芝
  this.age = age; // 48
}
var p1 = new CreateJsPerson("尹华芝", 48); // this 指向 实例化 对象 p1

// 4、call、apply 改变 this 指向
function add(c, d) {
  return this.a + this.b + c + d;
}
var o = { a: 1, b: 3 };
add.call(o, 5, 7); // 1 +3+5+7
add.apply(o, [10, 20]); // 1+3+10+20

// 5、箭头函数 没有 this
<button id="btn1">箭头函数this</button>;
let btn1 = document.getElementById("btn1");
let obj = {
  name: "kobe",
  age: 39,
  getName: function () {
    btn1.onclick = () => {
      console.log(this); // 指向 箭头函数外层第一个普通函数的 this， obj.getName();
    };
  },
};
obj.getName();
```

### call、apply、bind(借用方法的理念)

```javascript
func.call(thisArg, param1, param2, ...) //func是个函数, 返回func 执行的结果 ；

func.apply(thisArg, [param1,param2,...]) // 同上

func.bind(thisArg, param1, param2, ...) // 返回func的拷贝，并拥有指定的this值和初始参数 ()
```

> **call()、apply()、bind() 都是用来重定义 this 指向！必须是函数才可以调用** > **双 a 记忆法**：`apply`是以 a 开头，它传给`func`的参数是类 Array 对象（类数组对象）。

- **call：**的参数是**直接放进去**的 `obj.myFun.call(db,param1,paramN,... )`
- **apply：** 参数都放在一个**数组里面传进去** `obj.myFun.apply(db,[param1,param1,...])`
- **bind：**返回是函数,需要自己再执行，它 的**参数和 call**一样

**[它们的应用场景](https://coffe1891.gitbook.io/frontend-hard-mode-interview/1/1.2.4#yi-2-44-ying-yong-chang-jing)**
用 js 代码手写实现： 这也是一个 高频考题

### this 最强总结：一字一句都是重点

1. 对于**直接调⽤的函数**来说，**不管函数被放在了什么地⽅**，**this 都是 window**
2. 对于**被别⼈调⽤的函数**来说，**被谁点出来的，this 就是谁**
3. 在构造函数中，类中(函数体中)出现的 this.xxx = xxx 中的 **this 是当前类的⼀个实例**
4. call、apply 时，this 是第⼀个参数。bind 要优于 call/apply 哦，**call 参数多，apply 参数少**
5. 箭头函数没有⾃⼰的 this，需要看其外层是否有函数，**如果有，外层函数的 this 就是内部箭头函数**
**的 this，如果没有，则 this 是 window**

## 面向对象

- 类：封装、多态、继承
- 构造函数、实例、对象字面量
- 命名空间
- 内置对象、宿主对象、本地对象
  > 首先 JS 中没有类，都是基于原型的。无论是 ES5/ES6 中引入的 class 只是基于原型继承模型的语法糖。

![面向对象.png](https://s4.ax1x.com/2021/12/15/TpZOCF.png)

### 构造函数

本身就是一个函数，为了规范**一般将首字母大写**，区别在于 使用 **new 生成实例的函数就是构造函数**，直接调用的就是 普通函数。

```javascript
// ********** 手写 new 的几个步骤 ********** //
// 1、创建一个新对象，
// 2、把 构造函数的 prototype 赋值给新对象的 proto,
// 3、把构造函数的 this 指向新对象并返回结果
// 4、判断如果结果是对象则 返回 ，否则返回 新对象

function myNew(fn, ...args) {
  let newobj = {};
  newobj.__proto__ = fn.prototype;
  let resObj = fn.apply(newobj, args);
  // 判断如果结果是对象则 返回 ，否则返回 新对象
  return resObj instanceof Object ? resObj : newobj;
}
// 测试
function Parsen() {
  this.name = "龙哥";
  this.age = "18";
}
Parsen.prototype.getName = function () {
  return this.name;
};
var parsen = myNew(Parsen);
```

### 原型和原型链

#### 原型模式

原型是在构造函数中的
**每声明一个函数的时候：**
浏览器会在内存中创建一个对象，对象中新增一个 `constructor` 属性，浏览器把 `constructor` 属性指向 构造函数，构造函数.prototype 赋值给对象。

Javascript 对象从原型继承方法和属性，而`Object.prototype`在继承链的顶部。Javascript prototype 关键字还可以用于向构造函数添加新值和方法。

**原型链：**
代码读取某个属性的时候，首先在实例中找到了则返回，如果没有找到，则继续在 实例的原型对象(**proto**)中搜索，直到找到为止。还没找到则继续 原型对象的原型对象上找。 直到最后 Object 为止，返回 null

#### 关系

- prototype: 函数的一个属性：是一个对象 {}
- **proto**: 对象 Object 的一个属性：对象 {}
- **每个对象实例都有一个 \_\_*****proto\_\_*** ，它指向构造函数的 prototype
- **以上关系可以使用 console.log 去测试**

```javascript
function Test() {
  this.a = 1;
};
var t = new Test();

// 因为 对象的 __proto__ 保存着该对象构造函数的 prototype 所以
t.__proto__ === Test.prototype // true

Test.prototype.__proto__ === Object.prototype // true： 这样一个链式调用形成 - 原形链

Object.prototype.__proto__ // null  原形链顶层为 null

/************* 原形链 *****************/

Test.prototype.b = 2; // 给构造函数的原型添加一个 属性b=2
Object.prototype.c = 3
console.log(test)
// 画一下这个关系链：
// test:
// {
//     a: 1,
//     __proto__: Test.prototype = {
//         b: 2,
//         __proto__: Oject.prototype = {
//         c:3
//         没有 __proto__
//         }
//     }
// }
// 原形链： 沿着__proto__为节点去找构造函数prototype 连起来的一个链条， 一层一层往上寻找 直到 null

console.log(test.constructor) // Test(){}
其实 test.constructor 指向的就是 实例化 test 对象的构造函数
所以：constructor 是可以被赋值修改的，


/************* 特殊性 *****************/
Function、Object：函数 对象
Test.__proto__ === Function.prototype // true
Function.__proto__ === Function.prototype // true  因为函数自己构造了自己
Object.__proto__ === Function.prototype // true

/************* 属性的查找 *****************/
// test => {a: 1, b:2}
test.hasOwnProperty('a') // true    查找当前对象上的原型属性
test.hasOwnProperty('b') // true
test.hasOwnProperty('c') // false    是继承过来的所以没有

'a' in test // true   in: 链上查找
```

### Class

```javascript
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

/******************* 类的实例 ***************************/

// 实例的属性除了 this 定义在本身，其他都是定义在原型上
console.log(person.hasOwnProperty("name")); // true
console.log(person.hasOwnProperty("showName")); // false
console.log(person.__proto__.hasOwnProperty("showName")); // true

// 与 ES5 一样，类的所有实例共享一个原型对象。
var a1 = new Person("long");
var a2 = new Person("mmmmm");
console.log(a1.__proto__ === a2.__proto__);

// 所以不推荐直接通过 __proto__ 添加私有属性和方法，因为 共享的实例都会受到影响

/****************注意点：********************/
// 1、类和模块的内部默认使用严格模式
// 2、不存在变量提升  提前访问会报错 ReferenceError

// 静态方法：static
// 添加 static 关键字，表示该方法不会被【实例】继承，只能通过类.直接调用，但是可以被 子类继承 extends

// 私有方法和属性
// 私有方法：通过内部使用 _xxx、_func 的方式来定义
```

1. 创建了一个 名为 User 的函数，该函数将成为类声明的结果
2. 在 User.prototype 中存储所有方法，例如 showUser ( 跟 ES5 一样把函数存到 prototype 上 )
3. 类必须使用 new ，否则无法调用类构造函数 报错
4. 类方法 是不可以枚举的

### 继承

Class 使用 **extends**实现继承，比 ES5 通过修改原型链实现继承，要清晰和方便很多。

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

注意：
子类必须在 constructor 中先调用 super(),否则新建实例就会报错。ReferenceError
主要是 解决 this 问题，需要先把 父类属性和方法加到 this 上，然后再用子类构造函数修改 this 。

使用 Object.getPrototypeOf() 判断 类是否继承了另一个类
`Obkect.getPrototypeOf(Xxxx) === XXX`

**super 既可以当作函数又可以是对象**
当作函数： super() 代表 父类的构造函数。 => A.prototype.constructor.call(this)

当作对象：super 在普通方法中，指向 父类的原型对象 A.prototype；在静态方法中 指向父类。

#### 1、原型链继承

**直接让子类的原型对象 prototype 指向父类实例**，当子类实例找不到对应的属性和方法时，就会往它的原型对象(父类实例上找)，从而实现对父类的属性和方法的继承。

```javascript
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

缺点：【**子类相互影响**】 子类实例原型都指向父类实例，因此 某个 子类实例修改了 父类引用方法或函数的时候 会影响所有子类。 **同时无法向父类构造函数传参**。

#### 2、构造函数继承

**在子类构造函数中执行 父类构造函数并绑定子类 this**, 使得 父类中的属性能够赋值到子类的 this 上。这样就 避免实例之间共享一个原型实例，又能向父类构造函数传参。
缺点很明显： **继承不了父类原型上的属性和方法**

```javascript
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

#### 3、组合式继承

说白了就是 把上面两个整合在一起, prototype、构造函数调用父类 call

```javascript
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

缺点： 每次创建子类实例都**执行了两次构造函数**【Parent.call() 和 new Parent()】,导致子类创建实例时，原型中会**存在两份相同的属性和方法**，很不优雅。

#### 4、寄生式组合继承【终极方案】

为了解决 组合式继承 构造函数被执行两次的问题，我们将 **指向父类实例改为指向 拷贝的父类原型**，去掉一次构造函数的执行，并且 不会相互影响。

```javascript
主要是把原来的 ，其他都一样。
Child.prototype = new Parent() => Child.prototype = Parent.prototype
```

但是 问题又出来了，**子类原型和父类原型都指向同一个对象，那还是会相互影响**。

所以：给 父类原型做一个 浅拷贝
`Child.prototype = Object.create(Parent.prototype)`
到这里 ES5 的所有继承都有了，**babel 对 ES6 继承的转换也是 使用了 寄生组合式继承**

```javascript
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

> 我们回顾一下实现过程：

1. 一开始最容易想到的是 **原型链继承** ，通过把子类实例的原型指向父类实例来继承父类的属性和方法，但原型链继承的缺陷在于对子类实例继承的引用类型的修改会影响到所有的实例对象以及无法向父类的构造方法传参
2. 因此我们引入了**构造函数继承**, 通过在子类构造函数中调用父类构造函数并传入子类 this 来获取父类的属性和方法，但构造函数继承也存在缺陷，构造函数继承不能继承到父类原型链上的属性和方法。
3. 所以我们综合了两种继承的优点，提出了**组合式继承**，但组合式继承也引入了新的问题，它每次创建子类实例都执行了两次父类构造方法，我
4. 们通过将子类原型指向父类实例改为子类原型指向父类原型的浅拷贝来解决这一问题，也就是最终实现 —— **寄生组合式继承**

## 深拷贝 和 浅拷贝

浅拷贝只复制指向某个对象的指针，而不复制对象本身，新旧对象还是共享一个内存，相互影响。

### 来源于赋值(址)

- 基本数据类型 **赋值**之后两个变量互不影响
- 引用类型(对象、函数、数组) **赋址 ，两个变量具有相同得引用，指向同一个对象，相互影响（所以才出现了 深拷贝和浅拷贝）**

### 浅拷贝

简单来讲，浅拷贝 只解决了 **第一层问题** 基本类型值和引用类型地址

- Object.assign() : 如果目标对象只有一层的时候 是深拷贝

- 展开语法 Spread **...**

```javascript
let a = {
  name: "ceshi",
  book: {
    title: "You Don't Know JS",
    price: "45",
  },
};
let b = { ...a };
console.log(b);
// {
//  name: "ceshi",
//  book: {title: "You Don't Know JS", price: "45"}
// }
```

### 深拷贝

拷贝所有属性以及指向得动态分配的内存。拷贝前后两个 对象互不影响。

### JSON.parse(JSON.stringify(object))

- **拷贝对象没问题**，但是 **数组有问题**：undefined、symbol 和函数这三种情况，会直接忽略。
- 该方法是用`JSON.stringify`将对象序列化为字符串，然后在用`JSON.parse`将 json 字符串解析为对象，**解析的时候会自己去构建新的内存地址存放新对象。**
- **所以 诞生了 lodash.cloneDeep()**

### 总结

| --     | 和原数据是否指向同一对象 |   第一层数据为基本数据类型   |      原数据中包含子对象      |
| ------ | :----------------------: | :--------------------------: | :--------------------------: |
| 赋值   |            是            |    改变会使原数据一同改变    |  改变**会**使原数据一同改变  |
| 浅拷贝 |            否            | 改变**不会**使原数据一同改变 |  改变**会**使原数据一同改变  |
| 深拷贝 |            否            | 改变**不会**使原数据一同改变 | 改变**不会**使原数据一同改变 |

### 如何实现一个深拷贝

思路：**浅拷贝 + 递归**，浅拷贝时 判断属性值是否是对象，是对象就进行递归操作。

```javascript
function deep(source) {
  let result;
  for (let i in source) {
    let elment = source[i];
    if (checkType(elment) === "Object" || checkType(elment) === "Array") {
      result[i] = deep(elment);
    } else {
      result[i] = elment;
    }
  }
  return result;
}
function checkType(obj) {
  return Object.prototype.toString().call(obj).slice(8, -1);
}

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

---

## 基本概念

### js 常见错误类型 (前三种)

#### SyntaxError: 语法错误

1. 当 JavaScript 解析器在解析代码时发现语法错误，就会抛出语法错误。这种错误通常是由于书写错误、缺少括号、分号、花括号等引起的。

2. 给关键字赋值：`function = 5 、 var 1a // _Uncaught SyntaxError: Unexpected token_`

#### TypeError 类型错误(调用不存在的方法，乱调用)

当 JavaScript 引擎尝试执行无法完成的操作时，会抛出类型错误。比如，试图对一个未定义的变量进行操作、使用一个不存在的对象属性、调用一个非函数的对象等。

1. 调用不存在的方法 `123() 、 var oo = {} oo.run()`
2. new 关键字后接基本类型： `var a = new 123`

#### ReferenceError 引用错误(这玩意不存在)

当尝试使用一个未定义的变量、函数、对象属性等时，JavaScript 解释器会抛出引用错误。

1. 调用了不存在的变量
2. 给一个无法被赋值的对象赋值：console.log("123") = 1

### js 检测数据类型方法

#### typeof 检测基础类型

返回一个表示数据类型的字符串。**主要检测基本类型，除了 null**

```javascript
typeof Symbol() ; // symbol
typeof new Function(); // function
typeof null \ [] ; // object
```

#### instanceof 引用类型

语法：object instanceof constructor A instanceof B: **判断 A 是否是 B 的实例**
概念：测试一个对象在其原型链中是否存在一个构造函数的 prototype 属性，但是不能检测 null 和 undefined

```javascript
[]  instanceof  Array;  //true
{}  instanceof  Object;//true
new  Date()  instanceof  Date;//true
new  RegExp()  instanceof  RegExp//true
null  instanceof  Null//报错
undefined  instanceof  undefined//报错
```

#### object.protype.toString().call() 强推

唯一一种获取[[class]]值的方法, 最准确最有效的方式。

```javascript
Object.prototype.toString.call([]); // "[object Array]"
Object.prototype.toString.call({}); // "[object Object]"
Object.prototype.toString.call(2); // "[object Number]"
Object.prototype.toString.call(null); // "[object Null]"
Object.prototype.toString.call(undefined); // "[object Undefined]"
```

## 数组

### [强大的数组](https://coffe1891.gitbook.io/frontend-hard-mode-interview/1/1.2.9)

你所不知道的 forEach、map、filter、find、sort、some 等易错点整理 - 简书
[https://www.jianshu.com/p/3529866b0854](https://www.jianshu.com/p/3529866b0854)

### 数组扁平化

![数组扁平化.png](https://s4.ax1x.com/2021/12/15/TpeeKA.png)

```javascript
// 数组排平 N 种解法

var a = [1, [2, [3, 4, 5], 6]];

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
flatten1(a);
console.log("flatten1:::", flatten1(a));

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
flatten2(a);
console.log("flatten2:::", flatten2(a));

/**
 * 利用 数组 toString 和 split
 * 数组转字符串，然后裁剪
 */
function flatten3(arry) {
  return arry.toString().split(",");
}
console.log("flatten3:::", flatten3(a));

/**
 * 利用 es6 flat
 */
function flatten4(arry) {
  // return arry.flat(2) // 两层
  return arry.flat(Infinity); // 无穷层次
}
console.log("flatten4:::", flatten4(a));
```

### 数组排序

![数组排序.png](https://s4.ax1x.com/2021/12/15/TpeKVP.png)

## 防抖和节流

![fan](https://cdn.nlark.com/yuque/0/2020/png/407340/1578199652179-0c520fe0-4509-42e9-831a-cb2490a1c461.png#align=left&display=inline&height=1061&margin=%5Bobject%20Object%5D&originHeight=268&originWidth=1920&size=0&status=done&style=none&width=7604#align=left&display=inline&height=268&margin=%5Bobject%20Object%5D&originHeight=268&originWidth=1920&status=done&style=none&width=1920)

### 防抖：debounce

> 函数在某段时间内多次触发，只执行最后一次。（会延长触发时间）

实现原理是利用定时器，函数**第一次执行时设置一个定时器**，调用时 发现**已有定时器那么清空之前定时器重新**设置一个**新的定时器**，直到最后一个定时器**到时触发函数执行**。

```javascript
function debounce(fn, awit = 50) {
  let timer = null;
  return function (...args) {
    // ...args 剩余参数 数组形式
    // 存在定时器则清空
    if (timer) clearTimeout(timer);
    // 第一次设置定时器
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, awit);
  };
}
const ceshiFnDeb = debounce(
  () => console.log("ceshiFnDeb防抖函数执行了"),
  1000
);
document.addEventListener("scroll", ceshiFnDeb);
```

### 节流：throttle 适合用于 函数被频繁调用的场景(滚动事件)

函数节流指的是 某个函数在 **指定时间内(n 秒)只执行一次**，不管后面函数如何调用请求，**不会延长时间间隔**，n 秒间隔结束后 第一次遇到 新的函数调用会触发执行，以此类推。

```javascript
// 节流 throttle: 固定间隔时间内只调用一次函数
// 思路1：根据两个时间戳来对比
function throttle(fn, awit = 50) {
  let startTime = 0;
  return function (...args) {
    let nowTime = +new Date();
    // 当前时间和上次时间做对比，大于间隔时间的话，就可以执行函数fn
    if (nowTime - startTime > awit) {
      // 执行完函数之后重置初始时间，等于最后一次触发的时间
      startTime = nowTime;
      fn.apply(this, args);
    }
  };
}
// 执行 throttle 函数返回新函数
const ceshiFn = throttle(() => console.log("ceshiFn节流函数执行了"), 2000);
// 每 10 毫秒执行一次 betterFn 函数，但是只有时间差大于 1000 时才会执行 fn
setInterval(ceshiFn, 10);
```

**不过市面上比较全的还是 lodash 的防抖节流函数**
\*\*

## 事件

### 事件冒泡

> 事件开始时由最具体的元素(层次最深的那个触发节点)接收，然后逐级向上传播到文档(window 对象)

事件从内到外传递

### 事件捕获

> 此顺序刚好和 事件冒泡相反。 先从文档再到具体元素。

事件从外到内传递

### DOM 事件流

三个阶段：

1. 首先事件捕获，为截获事件提供机会
1. 实际的目标(具体元素)接受到事件
1. 冒泡阶段对事件做出响应

## 事件对象

**preventDefault**() 取消默认行为，只有 cancelable 属性设置为 true 的事件才可以使用。例如取消 a 标签点击跳转默认行为。

**setopPropagation**() 立即取消进一步事件冒泡或捕获。一般避免触发注册在嵌套元素上注册的事件。

## 事件循环 Event Loop

[我见过最牛逼的讲解](https://www.bilibili.com/video/BV1kf4y1U7Ln/?spm_id_from=333.788.videocard.0) 必会版本

> Event Loop 是让 JS 做到即使单线程，又绝对不会阻塞的核心机制，是 JS 并发模型的基础。用来协调各种事件、用户交互、脚本执行、UI 渲染、网络请求等的一种机制。

Event Loop 是属于 JavaScript Runtime 的，是由宿主环境（比如浏览器）提供的。

### 作用

监控调用栈和任务队列，如果调用栈是空的，他就会取出队列中的第一个 callback 函数，然后将它压入到调用栈中，然后执行它。

[详细文档](<https://github.com/staven630/blog/blob/master/%E6%B7%B1%E7%A9%B6JavaScript/%E5%BC%82%E6%AD%A5/%E5%AE%8F%E4%BB%BB%E5%8A%A1(Macrotask)%E4%B8%8E%E5%BE%AE%E4%BB%BB%E5%8A%A1(Microtask).md>)

### 宏任务 MacroTask

script 全部代码

- 浏览器中：I/O、setTimeout、setInterval、requestAnimationFrame
- Node 中： I/O、setTimeout、setInterval、setImmediate

### 微任务 MicroTask

- 浏览器中：MutationObserver、Promise.then/.catch/.finally
- Node 中： process.nextTick 、Promise.then/.catch/.finally

new Promise() 在实例化的过程中所执行的代码都是同步执行的，而 **.then、.catch 和 .finally 都是异步执行**的。

1. 首先执行宏任务队列 **script**，一次只从队列中取一个任务执行，执行完后 去执行微任务队列中的任务；
2. 微任务队列中所有的任务会被 依次取出来执行，**直到 微任务队列 microtask queue 为空**；
3. 期间要执行 UI rendering，它的节点是在执行完所有 微任务之后，下一个宏任务之前

## Promise 对象 - 手写

> 本身是一个构造函数，自身有 all、reject、resolve 方法，原型上有 then、catch 方法

promise 的 then 可以接受两个函数，第一个 resolve ，第二个参数为 reject

- resolve：将 promise 的状态 padding 变为 fullfiled 已完成，一般用来进行业务代码处理
- reject：将状态 padding 变为 rejected 已拒绝，一般用来进行拦截报错处理
- then：就是把原来的回调写法分离出来，在异步操作 Async 执行完后，用**链式调用的方式执行回调函数**
- all：接受一个数组参数，并行 执行异步操作的能力，在所有异步操作执行完之后才执行回调 then，**all 会把所有异步操作的结果放进一个数组中传给 then。如果其中一个报错，全部到 catch 中，并且未报错的还会执行。**

### 手写 all

1、考虑 类型问题
2、考虑 顺序问题
![手写all.png](https://s4.ax1x.com/2021/12/15/TpeDGF.png)

## async 和 await

`async`和`await`关键字让我们可以用一种更简洁的方式写出基于 `[Promise](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Promise)`的异步行为，而无需刻意地链式调用`promise`。
函数返回一个 Promise 对象，如果内部发生异常则会导致返回的 Promise 对象状态变为 `reject` 状态。抛出的错误会被 `catch` 方法接收到。

### async 表示函数里有异步操作

`async` 函数内部 return 返回的值。会成为 `then` 方法回调函数的参数。

### await 表示紧跟在后面的表达式需要等待结果(同步)

**正常情况下，await 命令后面跟着的是 Promise 对象，返回对象的结果，如果不是的话，就直接返回对应的值。**

## Proxy 与 Object.definproperty()

### Object.defineProperty()

Vue 2.x 利用 Object.defineProperty()，并且把内部解耦为 Observer, Dep, 并使用 Watcher 相连

1. 不能监听数组的变化，这些方法无法触发 set：push、pop、shift、unshift、splice、sort、
1. 必须遍历对象的每个属性
1. 必须深层遍历嵌套的对象

### Proxy

Vue 在 3.x 版本之后改用 Proxy 进行实现

1. 针对**整个对象**而不是对象的某个属性
1. 支持数组
1. 嵌套支持 是 get 里面递归调用 Proxy 并返回

## 模块化编程

> 为了解决两大痛点：

1. 每个模块都要有**自己的 变量作用域**，两个模块之间的**内部变量不会产生冲突**。
2. 不同模块之间保留相互 导入和导出的方式方法，**模块之间能够相互通信**，模块的执行与加载遵循一定的规范，能保证**彼此之间的依赖关系**。

**模块化开发的 4 个好处：**

1. 避免变量污染，命名冲突
2. 提高代码复用率
3. 提高 维护性·
4. 方便管理依赖关系

### CommonJS

> 是服务器端模块的规范，Node.js 采用了这个规范。

每个 JS 文件就是一个模块( module )，每个模块内部使用 `require` 函数和 `module.exports` 对象来对模块进行导入和导出。

### AMD 异步模块定义 - 专为浏览器设计

> 适合 web 开发的模块化规范

模块文件中，我们使用 define 函数定义一个模块，在回调函数中接受定义组件内容。

这个回调函数接受一个 require 方法，能够在组件内部加载其他模块，这里我们分别传入 模块 ID,就能加载对应文件内的 AMD 模块。

```javascript
// moduleA.js
define(function (require) {
  var m = require("moduleB");
  setTimeout(() => console.log(m), 1000);
});

// moduleB.js
define(function (require) {
  var m = new Date().getTime();
  return m;
});

// index.js
require(["moduleA", "moduleB"], function (moduleA, moduleB) {
  console.log(moduleB);
});
```

### CMD 通用模块定义

CMD 规范是国内发展出来的，就像 AMD 有个`requireJS`，CMD 有个浏览器的实现`SeaJS`，`SeaJS`要解决的问题和`requireJS`一样，只不过在模块定义方式和模块加载（可以说运行、解析）时机上有所不同。

- AMD 是依赖关系前置,在定义模块的时候就要声明其依赖的模块;
- CMD 是按需加载依赖就近,只有在用到某个模块的时候再去 require：

![cmd](https://s4.ax1x.com/2021/12/15/TpeRVx.png)

### UMD

> 同时被 CommonJs 规范和 AMD 规范加载的 UMD 模块，一套**同时适用于 node.js 和 web 环境**

UMD 先判断是否支持 Node.js 的模块（exports）是否存在，存在则使用 Node.js 模块模式。
在判断是否支持 AMD（define 是否存在），存在则使用 AMD 方式加载模块。

### 原生 JS 模块化（ES6）

> ES6 为导入（importing）导出（exporting）模块带来了很多可能性

与前两者的最大区别在于，**ESModule**是由 JS 解释器实现，而后两者是 在宿主环境中运行时实现。ESModule 导入实际上是在语法层面新增了一个语句，而 AMD 和 ComminJs 加载模块实际上是调用了 require 函数。

![模块化ES6.png](https://s4.ax1x.com/2021/12/15/TpebqI.png)

## 正则表达式

> 正则表达式可以从一个基础字符串中根据一定的匹配模式替换文本中的字符串、验证表单、提取字符串等等。

最全正则表达式[链接](https://github.com/ziishaned/learn-regex/blob/master/translations/README-cn.md)
身份证号(15 位、18 位数字)：^\d{15}|\d{18}

正则表达式主要依赖于元字符。

| 元字符 | 描述                                                         |
| :----: | ------------------------------------------------------------ | --- |
|   .    | 句号匹配任意单个字符除了换行符。                             |
|  [ ]   | 字符种类。匹配方括号内的任意字符。                           |
|  [^ ]  | 否定的字符种类。匹配除了方括号里的任意字符                   |
|   \*   | 匹配>=0 个重复的在\*号之前的字符。                           |
|   +    | 匹配>=1 个重复的+号前的字符。                                |
|   ?    | 标记?之前的字符为可选.                                       |
| {n,m}  | 匹配 num 个大括号之间的字符 (n <= num <= m).                 |
| (xyz)  | 字符集，匹配与 xyz 完全相等的字符串.                         |
| &#124; | 或运算符，匹配符号前或后的字符.                              |
|   \\   | 转义字符,用于匹配一些保留的字符 `[ ] ( ) { } . \* + ? ^ $ \  |`|
|   ^    | 从开始行开始匹配.                                            |
|   $    | 从末端开始匹配.                                              |

## ES6 篇请移步-[链接](https://www.yuque.com/mryang-8oru4/kb/iyxpcu)
