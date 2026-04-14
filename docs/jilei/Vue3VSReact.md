# Vue 对比掌握 React 的学习路径

## 一、技术栈对照表

| 功能           | Vue 生态                 | 本项目使用            |
| -------------- | ------------------------ | --------------------- |
| **框架**       | Vue 3                    | React 18              |
| **路由**       | Vue Router               | react-router-dom v6   |
| **状态管理**   | Pinia / Vuex             | Zustand（类似 Pinia） |
| **样式方案**   | Scoped CSS / CSS Modules | styled-components     |
| **Hooks 工具** | VueUse                   | ahooks                |
| **UI 组件**    | Vant / Element Plus      | antd-mobile           |
| **构建工具**   | Vite                     | Vite（通用）          |

---

## 二、核心概念对照

### 1. 组件定义

```tsx
// Vue 3 Composition API
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)
</script>

// React
import { useState, useMemo } from 'react'

const [count, setCount] = useState(0)
const doubled = useMemo(() => count * 2, [count])
```

**关键差异**：

- Vue：`ref` 自动解包，模板中直接用 `count`
- React：状态变量就是普通值，更新必须调用 `setCount`

---

### 2. 响应式系统

| Vue                 | React                      | 说明     |
| ------------------- | -------------------------- | -------- |
| `ref(0)`            | `useState(0)`              | 基础状态 |
| `reactive({})`      | `useState({})`             | 对象状态 |
| `computed(() => x)` | `useMemo(() => x, [deps])` | 计算属性 |
| `watch(x, fn)`      | `useEffect(() => fn, [x])` | 侦听器   |

**核心差异**：

- Vue：**依赖自动追踪**，自动知道 `computed` 依赖哪些 ref
- React：**手动声明依赖数组**，漏写会导致 bug

---

### 3. 生命周期 → Hooks

```tsx
// Vue 3
onMounted(() => {
  /* 挂载后 */
});
onUnmounted(() => {
  /* 卸载前 */
});
onUpdated(() => {
  /* 更新后 */
});

// React
useEffect(() => {
  // 挂载 + 更新时执行
  return () => {
    // 卸载时执行（清理函数）
  };
}, [dependencies]);
```

**对照表**：

| Vue           | React                                  |
| ------------- | -------------------------------------- |
| `onMounted`   | `useEffect(() => {}, [])`              |
| `onUnmounted` | `useEffect(() => return () => {}, [])` |
| `onUpdated`   | `useEffect(() => {})`（无依赖数组）    |

---

### 4. Props 与事件

```tsx
// Vue 3
<script setup>
const props = defineProps<{ title: string }>()
const emit = defineEmits<{ (e: 'change', val: number): void }>()
</script>

// React
interface Props {
  title: string;
  onChange?: (val: number) => void;
}

const Component: React.FC<Props> = ({ title, onChange }) => {
  // 直接使用 props
}
```

**差异**：

- Vue：`emit` 显式声明事件
- React：回调函数作为 props 传递

---

### 5. 条件渲染与列表

```tsx
// Vue
<template>
  <div v-if="show">条件内容</div>
  <div v-for="item in list" :key="item.id">{{ item.name }}</div>
</template>

// React（JSX）
<>
  {show && <div>条件内容</div>}
  {list.map(item => (
    <div key={item.id}>{item.name}</div>
  ))}
</>
```

---

## 三、本项目中的 React 实战模式

### 1. 状态管理（Zustand ≈ Pinia）

```tsx
// src/stores/filterStore.ts
import { create } from "zustand";

const useFilterStore = create<FilterStore>((set) => ({
  // 状态
  selectedBrandId: null,

  // 方法（类似 Pinia actions）
  setBrand: (id) => set({ selectedBrandId: id }),
}));

// 组件中使用
const { selectedBrandId, setBrand } = useFilterStore();
```

**对比 Pinia**：

- Zustand 更轻量，无需 actions/getters 概念
- 直接在组件内调用 hook，无需 `storeToRefs`

---

### 2. 路由

```tsx
// App.tsx
<BrowserRouter>
  <Routes>
    <Route path="/goods-list" element={<GoodsList />} />
  </Routes>
</BrowserRouter>;

// 组件内导航
const navigate = useNavigate();
navigate("/goods-detail?saleLinkId=xxx");

// 获取参数
const [searchParams] = useSearchParams();
const id = searchParams.get("saleLinkId");
```

**对比 Vue Router**：

- `useNavigate` ≈ `router.push`
- `useSearchParams` ≈ `useRoute().query`
- 无 `router-link`，直接用 `<a>` 或 `onClick`

---

### 3. 样式方案

```tsx
// 类似 Vue 的 scoped CSS
const Page = styled.div<{ $isPortrait: boolean }>`
  width: 100vw;
  background: ${(props) => (props.$isPortrait ? "#fff" : "#f5f5f5")};
`;

// 使用
<Page $isPortrait={isPortrait}>内容</Page>;
```

---

### 4. 自定义 Hook（类似 Vue Composable）

```tsx
// src/hooks/useDeviceType.ts
const useDeviceType = () => {
  const [isPortrait, setIsPortrait] = useState(true);

  useEffect(() => {
    const check = () => setIsPortrait(window.innerHeight > window.innerWidth);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  return { isPortrait };
};

// 使用
const { isPortrait } = useDeviceType();
```

**对比**：与 Vue Composable 几乎一致，只是用 `useState` + `useEffect` 替代 `ref` + `onMounted`

---

## 四、面试高频问题（React 专项）

### 1. 必问：Hooks 依赖数组

**问题**：`useEffect` 的依赖数组漏写会怎样？

```tsx
// ❌ 错误：闭包陷阱
useEffect(() => {
  const timer = setInterval(() => console.log(count), 1000);
  return () => clearInterval(timer);
}, []); // count 永远是初始值 0

// ✅ 正确
useEffect(() => {
  const timer = setInterval(() => console.log(count), 1000);
  return () => clearInterval(timer);
}, [count]);
```

---

### 2. 必问：虚拟 DOM 与 Diff 算法

**对比 Vue**：

- Vue：双端 Diff，静态提升
- React：Fiber 架构，可中断渲染

**关键词**：

- React 18 并发模式
- 时间切片
- 优先级调度

---

### 3. 必问：状态更新与重渲染

```tsx
// React：必须返回新对象才会触发重渲染
setList([...list, newItem]); // ✅
list.push(newItem);
setList(list); // ❌ 引用未变

// Vue：ref 自动追踪，直接修改即可
list.value.push(newItem); // ✅
```

---

### 4. 高频：性能优化

| 技术            | 用途                            |
| --------------- | ------------------------------- |
| `React.memo`    | 类似 `v-memo`，避免子组件重渲染 |
| `useMemo`       | 缓存计算结果                    |
| `useCallback`   | 缓存回调函数，避免子组件重渲染  |
| `useTransition` | React 18 新特性，低优先级更新   |

---
