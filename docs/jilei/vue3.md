# 使用 Vue3 创建一个 TODO List 项目

预计使用技术栈：

- Vue3
- TypeScript
- Vite
- Pinia
- Unocss
- Element Plus

后端：

- NestJS
- Prisma
- MySQL
- Redis

## 四大 ORM 框架

- TypeORM
- Prisma [2024 推荐](https://juejin.cn/post/7323203806794498082)
- Sequelize
- MikroORM

[比较四个流行的 NestJS ORMs](https://juejin.cn/post/7162050367767707679)

## 功能介绍

- 任务的增删改查 (CRUD)
- 任务状态切换（完成/未完成）
- 任务优先级设置
- 搜索和筛选功能
- 后端 API 的集成与同步
- Redis 缓存（后端）
- 持久化（MySQL 数据库）

## 项目结构

```bash
/todo-list
│
├── /frontend   // 前端代码
│   ├── /src
│   │   ├── /components
│   │   ├── /store
│   │   ├── /views
│   │   │   ├── ToDoList.vue
│   │   ├── /router
│   │   ├── App.vue
│   │   └── main.ts
│   └── vite.config.ts
│
└── /backend    // 后端代码
    ├── /src
    │   ├── /modules
    │   │   ├── todo
    │   │   │   ├── todo.controller.ts
    │   │   │   └── todo.service.ts
    │   ├── app.module.ts
    │   ├── main.ts
    │   └── prisma.service.ts
    └── prisma/schema.prisma

```

## 前端详细实现

> node 版本：>=18.17.1

### 1. 初始化项目并安装依赖

```bash
npm create vite@latest frontend
cd frontend
npm install
npm install vue-router@4 pinia element-plus axios unocss
```

### 2. 创建 Pinia Store

```typescript
// src/store/todoStore.ts
import { defineStore } from "pinia";
import axios from "axios";

export interface Todo {
  id: number;
  title: string;
  priority: "Low" | "Medium" | "High";
  completed: boolean;
}
const baseUrl = "http://localhost:3000";

export const useTodoStore = defineStore("todo", {
  state: () => ({
    todos: [] as Todo[],
    filter: "" as string,
  }),

  actions: {
    async fetchTodos() {
      const { data } = await axios.get(`${baseUrl}/todo`);
      this.todos = data;
    },
    async addTodo(title: string, priority: "Low" | "Medium" | "High") {
      const { data } = await axios.post(`${baseUrl}/todo`, { title, priority });
      this.todos.push(data);
    },
    async updateTodo(id: number, updatedFields: Partial<Todo>) {
      await axios.put(`${baseUrl}/todo/${id}`, updatedFields);
      this.fetchTodos();
    },
    async deleteTodo(id: number) {
      await axios.delete(`${baseUrl}/todo/${id}`);
      this.todos = this.todos.filter((todo) => todo.id !== id);
    },

    setFilter(filter: string) {
      this.filter = filter;
    },
  },

  getters: {
    filteredTodos: (state) => {
      if (state.filter === "completed") {
        return state.todos.filter((todo) => todo.completed);
      } else if (state.filter === "pending") {
        return state.todos.filter((todo) => !todo.completed);
      }
      return state.todos;
    },
  },
});
```

### 3. 创建 Vue Router

```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from "vue-router";
import Home from "./../components/HelloWorld.vue";
import ToDoList from "../views/ToDoList.vue";

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", component: Home },
    { path: "/todo", component: ToDoList },
  ],
});

export default router;
```

### 4. 创建 App.vue

```vue
<script setup lang="ts"></script>

<template>
  <div>
    <a href="https://vite.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <router-view />
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
```

### 5. 创建 main.ts

```typescript
// src/main.ts
import { createApp } from "vue";
import { createPinia } from "pinia";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import router from "./router";

import "./style.css";
import App from "./App.vue";

const pinia = createPinia();

createApp(App).use(pinia).use(ElementPlus).use(router).mount("#app");
```

### 创建 ToDoList.vue

```vue
<template>
  <el-container>
    <el-header>TODO List</el-header>
    <el-main>
      <el-input
        v-model="newTask"
        placeholder="Add a new task"
        @keyup.enter="addNewTodo"
      />
      <el-select v-model="priority" placeholder="Select Priority">
        <el-option label="Low" value="Low"></el-option>
        <el-option label="Medium" value="Medium"></el-option>
        <el-option label="High" value="High"></el-option>
      </el-select>
      <el-button @click="addNewTodo">添加</el-button>

      <el-table :data="filteredTodos" style="width: 100%">
        <el-table-column prop="title" label="Task"></el-table-column>
        <el-table-column prop="priority" label="Priority"></el-table-column>
        <el-table-column label="Completed">
          <template #default="scope">
            <el-checkbox
              v-model="scope.row.completed"
              @change="toggleCompletion(scope.row.id)"
            ></el-checkbox>
          </template>
        </el-table-column>
        <el-table-column>
          <template #default="scope">
            <el-button type="danger" @click="deleteTodo(scope.row.id)"
              >Delete</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<script setup lang="ts">
import { ref, onBeforeMount, computed } from "vue";
import { useTodoStore } from "../store/todoStore";

const newTask = ref("");
const priority = ref<"Low" | "Medium" | "High">("Low");
const store = useTodoStore();
// 将直接引用改为computed属性
const filteredTodos = computed(() => store.filteredTodos);

const addNewTodo = () => {
  console.log(newTask.value);
  if (newTask.value.trim() === "") {
    return;
  }
  store.addTodo(newTask.value, priority.value);
  newTask.value = "";
};

const deleteTodo = (id: number) => {
  store.deleteTodo(id);
};

const toggleCompletion = (id: number) => {
  store.updateTodo(id, {
    completed: !store.todos.find((todo) => todo.id === id)?.completed,
  });
};

onBeforeMount(async () => {
  await store.fetchTodos();
});
</script>
```

## 后端详细实现（NestJS + Prisma + MySQL）

我们将重新整理后端实现部分，确保更完整、更清晰。后端将包含：

- 数据库模型（Prisma）：创建任务表 Todo
- NestJS 模块与服务：实现增删改查（CRUD）
- API 控制器：定义 RESTful API
- 数据持久化到 MySQL

1. 初始化项目并安装

创建项目：

```bash
npm i -g @nestjs/cli
nest new backend
cd backend
npm install prisma @prisma/client mysql2 // 安装 Prisma 和数据库相关依赖
```

初始化 Prisma：

```bash
npx prisma init # 执行后会生成 prisma/schema.prisma 文件和 .env 文件。
```

配置数据库：

```bash
# 在 .env 文件中配置数据库连接信息
DATABASE_URL="mysql://username:password@localhost:3306/todo_db"
# 替换 username 和 password 为你的 MySQL 用户名和密码，todo_db 为数据库名。

```

在 MySQL 中创建数据库：

```bash
npx prisma db push
```

### 2. 创建 Prisma 模型

打开 prisma/schema.prisma，定义 Todo 模型：

```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Todo {
  id        Int      @id @default(autoincrement())
  title     String
  priority  String
  completed Boolean  @default(false)
  createdAt DateTime @default(now())
}
```

保存后，运行以下命令生成 Prisma Client：

```bash
npx prisma generate
```

### 3. 创建 Prisma 服务

src/prisma/prisma.service.ts：

```typescript
import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
```

### 4. 创建 Todo 模块

4.1 生成模块和服务：

> 为了快速创建内置 validation 的 CRUD 控制器，你可以使用 CLI 的 增删改查生成器：nest g resource [name]。

```bash
nest g module todo
nest g service todo
nest g controller todo
```

4.2 Todo 服务(src/todo/todo.service.ts)

```typescript
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Todo } from '@prisma/client';

@Injectable()
export class TodoService {
  constructor(private prisma: PrismaService) {}

  // 获取所有任务
  async getAllTodos(): Promise<Todo[]> {
    return this.prisma.todo.findMany();
  }

  // 创建新任务
  async createTodo(data: Prisma.TodoCreateInput): Promise<Todo> {
    return this.prisma.todo.create({ data });
  }

  // 更新任务
  async updateTodo(id: number, data: Prisma.TodoUpdateInput): Promise<Todo> {
    return this.prisma.todo.update({ where: { id }, data });
  }

  // 删除任务
  async deleteTodo(id: number): Promise<Todo> {
    return this.prisma.todo.delete({ where: { id } });
  }
}

```

### 5. 创建 Todo 控制器

src/todo/todo.controller.ts：

```typescript
import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { TodoService } from './todo.service';
import { Prisma } from '@prisma/client';

@Controller('todos')
export class TodoController {
  constructor(private readonly todoService: TodoService) {}

  @Get()
  async getAllTodos() {
    return this.todoService.getAllTodos();
  }

  @Post()
  async createTodo(@Body() data: Prisma.TodoCreateInput) {
    return this.todoService.createTodo(data);
  }

  @Put(':id')
  async updateTodo(@Param('id') id: number, @Body() data: Prisma.TodoUpdateInput) {
    return this.todoService.updateTodo(+id, data);
  }

  @Delete(':id')
  async deleteTodo(@Param('id') id: number) {
    return this.todoService.deleteTodo(+id);
  }
}

```

### 6. 配置主模块

src/app.module.ts：

```typescript
import { Module } from '@nestjs/common';
import { TodoModule } from './todo/todo.module';
import { PrismaService } from './prisma/prisma.service';

@Module({
  imports: [TodoModule],
  providers: [PrismaService],
})
export class AppModule {}

```

![配置module](./public/vue3/nestjs-Module.png)

### 7. 配置 main.ts

src/main.ts：

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // 启用 CORS
  app.enableCors();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

```

### 8. 启动项目

```bash
npm run start:dev
```

此时，NestJS 应用将运行在 http://localhost:3000，并提供以下 API：

- GET /todos：获取所有任务
- POST /todos：创建新任务
- PUT /todos/:id：更新任务
- DELETE /todos/:id：删除任务
