# qiankun 微应用

主要是基于 single-spa 封装的企业级微应用框架，解决原本巨石应用（不管是开发协作、维护、发布都很困难）、多技术栈、多应用共存的前端架构问题（比如：商家后台：主应用+商品子应用+商家子应用+会场子应用等等），核心：主应用统一管理，子应用独立开发、部署、运行，是目前国内落地最为广泛的微前端方案。

原理：

qiankun 是基于 single-spa 来实现的：核心是：

1. 主应用会维护一套子应用注册表
2. 通过监听拦截路由的方式匹配子应用
3. 通过 import-html-entry 加载子应用资源
4. 通过ES6 proxy 来实现 js 隔离
5. css 隔离 通过开启 严格样式隔离 showdow DOM
6. 通过路由匹配控制子应用生命周期

# 一、技术实现问题（qiankun核心落地方案）

## 1️⃣ 样式隔离（必须落地的规范 + 技术组合）

### 方案 A（推荐）

- Vue3：`<style scoped>` + CSS Modules
- 命名规范：BEM
- 禁止全局样式

```css
/* good */
.user-card {
}
.user-card__title {
}

/* bad */
.title {
}
.container {
}
```

---

### 方案 B（增强隔离）

qiankun 开启：

```javascript
start({
  sandbox: {
    strictStyleIsolation: true,
  },
});
```

👉 原理：Shadow DOM

---

### ⚠️ 真实踩坑（重点）

- Element Plus 弹窗（Teleport）会**穿透 Shadow DOM**
- z-index / body 挂载组件异常

👉 **解决方案：统一挂载容器**

```javascript
// main.ts
app.config.globalProperties.$ELEMENT = {
  zIndex: 3000,
};
```

或：

```javascript
ElMessage({
  appendTo: container, // qiankun container
});
```

---

## 2️⃣ JS 隔离（禁止污染 window）

### ❌ 禁止写法

```javascript
window.userInfo = {};
```

---

### ✅ 标准通信注入（qiankun props）

主应用：

```javascript
registerMicroApps([
  {
    name: "app1",
    entry: "//localhost:3001",
    container: "#container",
    activeRule: "/app1",
    props: {
      getToken,
      eventBus,
    },
  },
]);
```

子应用：

```javascript
export async function mount(props) {
  props.getToken();
}
```

---

### ✅ 全局能力封装（企业推荐）

定义统一 SDK（关键！）：

```typescript
// shared/sdk.ts
export const useGlobal = (props) => {
  return {
    token: props.getToken(),
    emit: props.eventBus.emit,
  };
};
```

👉 所有子应用只用 SDK，不直接用 props

---

## 3️⃣ 生命周期防泄漏（强制规范）

### ❗ 企业级强制规则

👉 所有副作用必须可销毁

---

### ✅ 标准写法（Vue3）

```typescript
let timer: any;

export async function mount() {
  timer = setInterval(() => {}, 1000);
}

export async function unmount() {
  clearInterval(timer);
}
```

---

### ✅ 更优方案（推荐）

封装统一 Hook：

```typescript
// useUnmount.ts
const cleanups: Function[] = [];

export const onCleanup = (fn: Function) => {
  cleanups.push(fn);
};

export const runCleanup = () => {
  cleanups.forEach((fn) => fn());
};
```

子应用：

```typescript
onCleanup(() => {
  window.removeEventListener("resize", fn);
});
```

unmount：

```typescript
runCleanup();
```

---

# 二、通信方案（重点：可控 + 解耦）

## 1️⃣ 通信分层（必须制定规范）

| 类型       | 方案         |
| ---------- | ------------ |
| 登录态     | 主应用 props |
| UI状态     | 子应用内部   |
| 跨应用通信 | EventBus     |
| 数据请求   | HTTP（推荐） |

---

## 2️⃣ 推荐通信架构（企业落地）

### ✅ 方案：EventBus + SDK

```typescript
// main app
import mitt from "mitt";

const eventBus = mitt();

registerMicroApps([
  {
    props: { eventBus },
  },
]);
```

---

子应用：

```typescript
props.eventBus.on("login", (data) => {
  console.log(data);
});
```

---

## 3️⃣ ❗ 禁止滥用 globalState

qiankun：

```javascript
const actions = initGlobalState({});
```

👉 问题：

- 不可控
- 难调试
- 类似 Vuex 地狱

---

### ✅ 替代方案（更优）

👉 所有共享数据走接口

```typescript
await fetch("/api/user");
```

👉 优点：

- 解耦
- 可缓存
- 易扩展

---

# 三、性能优化（真实上线方案）

## 1️⃣ 子应用加载策略（核心）

### ✅ qiankun 预加载

```javascript
start({
  prefetch: "all",
});
```

---

### ✅ 更精细控制（推荐）

```javascript
start({
  prefetch: (apps) => {
    return apps.filter((app) => app.name !== "heavy-app");
  },
});
```

---

## 2️⃣ 资源共享（解决重复加载）

### 方案 A：CDN external（简单有效）

```javascript
// vite.config.ts
export default {
  build: {
    rollupOptions: {
      external: ["vue"],
    },
  },
};
```

HTML：

```html
<script src="https://cdn.jsdelivr.net/npm/vue@3"></script>
```

---

### 方案 B（更优）：Module Federation

👉 比 qiankun 更先进的共享机制

但复杂度更高（适合你这个阶段）

---

## 3️⃣ 子应用懒加载

```javascript
registerMicroApps([
  {
    activeRule: "/app1",
  },
]);
```

👉 qiankun 默认按路由加载

---

## 4️⃣ 首屏优化（组合拳）

### ✅ 必做：

- 主应用 skeleton
- 子应用 loading

```html
<div id="container">
  <div class="loading">Loading...</div>
</div>
```

---

### ✅ 进阶：

- HTTP2 / CDN
- gzip / brotli
- 资源拆包

---

## 5️⃣ 构建优化（Vite）

```typescript
build: {
  chunkSizeWarningLimit: 1000,
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['vue', 'vue-router'],
      },
    },
  },
}
```

---

# 四、你可以直接落地的一套“企业标准”

我帮你总结一套可以写进团队规范的：

---

## ✅ 微前端开发规范（精简版）

### 1. 样式

- 禁止全局样式
- 必须 scoped / module
- UI库必须指定挂载点

---

### 2. JS

- 禁止 window 挂载
- 所有共享能力走 props + SDK

---

### 3. 生命周期

- 所有副作用必须清理
- 必须实现 unmount 清理逻辑

---

### 4. 通信

- 禁止 globalState 滥用
- EventBus + HTTP

---

### 5. 性能

- 必须 external 核心依赖
- 必须开启 prefetch
- 必须懒加载

---
