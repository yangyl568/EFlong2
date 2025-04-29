# 扔掉 Electron，拥抱基于 Rust 开发的 Tauri

[Tauri 官网](https://tauri.app/)

[Tauri 中文文档](https://tauri.app/zh-cn/docs/)

## Tauri 是什么

Tauri 是一个跨平台 GUI 框架，与 Electron 的思想基本类似。Tauri 的前端实现也是基于 Web 系列语言，Tauri 的后端使用 Rust。Tauri 可以创建体积更小、运行更快、更加安全的跨平台桌面应用。

## 实战 Tauri

> 使用 Tauri + Vue 3 + TypeScript 开发一个功能完善的 ToDoList 应用，可以很好地学习 Tauri 和前端的结合开发。以下是一个详细的实战开发方案。

### 项目功能目标

1 核心功能：

- 添加任务（标题、描述、截止日期、优先级）。
- 标记任务完成或未完成。
- 删除任务。
- 编辑任务。
- 任务分类（按优先级、完成状态、时间）。
- 数据持久化（文件存储或数据库，如 SQLite）。
- 导入/导出任务列表（JSON 文件）。

2 Tauri 功能使用

- 文件系统操作（本地数据存储）。
- 调用 Rust 后端处理逻辑（如复杂计算或持久化）。
- 调用系统通知（如任务到期提醒）。
- 自定义窗口设置（大小、标题栏隐藏等）。
