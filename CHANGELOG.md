# Changelog

所有重要的项目变更都会记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
项目版本遵循 [语义化版本 (Semantic Versioning)](https://semver.org/lang/zh-CN/)。

---

## [4.1.0] - 2026-04-24

### 安全重构 🔒

- **重构** DeepSeek API 调用方式，从前端直连改为后端代理
- **新增** 环境变量管理（dotenv），API 密钥不再暴露于前端代码
- **新增** 后端代理路由 `/api/deepseek/analyze-todo-set`
- **新增** 输入验证机制，防止恶意输入
- **优化** 使用 Node.js 内置 `https` 模块，无需额外安装 axios 依赖
- **优化** 统一错误处理和降级策略

### 安全说明

> **重要**：原硬编码在前端的 API 密钥 `sk-c281c9a6ae4f4eeeb5c584d08a2e17de` 已废弃，请前往 DeepSeek 开放平台创建新密钥并配置到 `backend/.env` 文件中。

---

## [4.0.0] - 2026-04-15

### 功能迭代 🚀

- **新增** 用户认证系统（登录/登出）
- **新增** 待办集管理功能
- **新增** 专注时间跟踪（自律钟）
- **新增** 数据统计可视化（ECharts）
- **新增** AI 辅助分析（DeepSeek API 集成）

---

## [3.0.0] - 2026-03-20

### 技术重构 🔧

- **迁移** 数据库从 MongoDB 切换到 MySQL
- **引入** Sequelize ORM 管理数据模型
- **新增** 数据库自动建表和同步机制

---

## [2.0.0] - 2026-03-01

### 架构升级 🏗️

- **新增** Node.js + Express 后端服务
- **新增** RESTful API 接口
- **新增** CORS 跨域处理
- **迁移** 数据存储从 localStorage 迁移到后端

---

## [1.0.0] - 2026-02-15

### 初始发布 🎉

- **实现** 待办事项增删改查
- **实现** 日程事件管理
- **存储** 使用 localStorage 本地存储
