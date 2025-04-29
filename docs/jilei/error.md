---
title: error
createTime: 2025/04/24 17:43:38
permalink: /article/4d19tfzr/
---

# 错误信息和解决方案

## js 常见错误类型

### 一 SyntaxError JS 引擎解析代码时发生的语法错误

- 声明的变量名不符合规范：**首位**必须是 字母、下划线（\_）或美元符号（$）

`var 1 // SyntaxError: Unexpected number`

- 给关键字赋值

`function = 5 、 var 1a // _Uncaught SyntaxError: Unexpected token_`

### 二 TypeError 类型错误

- 变量或参数不是预期类型时发生的错误
- 调用不存在的方法 `123() 、 var oo = {} oo.run()`
- new 关键字后接基本类型： `var a = new 123`

### 三 ReferenceError 这玩意不存在

- 调用了一个未被定义的变量 `ReferenceError: xxx is not defined`
- 给一个无法被赋值的对象赋值：`console.log("123") = 1`

### 四 RangeError

当一个值超出有效范围时发生的错误。

- 数组长度为负数

`new Array(-1); // RangeError: Invalid array length`

- Number 对象的方法参数超出范围
- 函数堆栈超过最大值

## vs code 配合 eslint

参考方案: [点击查看](https://zhuanlan.zhihu.com/p/421867479)

Vue2.0 项目配置 ESLint [点击查看](https://www.jianshu.com/p/bfc13fb6c6ed)

Vite vue3 EsLint [点击查看](https://www.jianshu.com/p/4b94540dd998)

## try catch 兜底

任何你感觉可能会出现问题的地方都可以使用 tray catch 包起来给你兜底

```js
try {
  alert("把代码放到这里");
  alert("如果某个代码报错了");
  alert("这里是异常后的语句"); // 发生异常，所以不会执行到这里
} catch (error) {
  alert("发生异常了，来到我这里了");
}
```

```js
try {
  alert("把代码放到这里");
  alert("如果某个代码报错了");
  alert("这里是异常后的语句"); // 发生异常，所以不会执行到这里
} catch (error) {
  alert("发生异常了，来到我这里了");
} finally {
  alert("不管任何情况，都会来到我这里了"); // 厉害吧
}
```

## 切换 radio 的时候谷歌浏览器报：Blocked aria-hidden on an element xxx

解决方案：

```css
div[aria-hidden="true"] {
  display: none !important;
}
```

## npm 包版本禁用提示或者删除

```bash

#废弃提示
npm deprecate @webuy/lib@2.0.1-betax "此版本存在问题，请立即升级到 2.0.2 版本"

#直接删除
npm unpublish @webuy/lib@2.0.0-beta1 --force（废弃2.0.0-beta1版本）
```

## yarn 报 network connection. Retrying... 错误 等待 120s

### 方案一

把 yarn 改为 yarn install --non-interactive

### 方案二

yarn config set disable-self-update-check true（修改配置禁止检查更新）

### 方案三

把项目的 yarn.lock 删掉试试

## vscode ide 配置

```json
"editor.cursorBlinking": "expand", // 设置光标闪烁样式为扩展
"editor.cursorSmoothCaretAnimation": "on", // 启用光标平滑动画
"editor.guides.bracketPairs": "active", // 显示括号配对指南
```

## npm 打包（基础）

```sh
npm run build:lib
npm run release
beta 的话就跟上 beta
1.0.10-beta12  
1.0.11
```

## nodejs 如果需要给某个接口设置独立的请求时长

`this.ctx.req.setTimeout(60 * 60 * 1000);`
