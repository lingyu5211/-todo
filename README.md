# Todo Schedule App 全栈项目文档

## 项目概述

这是一个基于 Vue 3 + Node.js + MySQL 的全栈待办事项和日程管理应用。项目将前端数据存储从 localStorage 迁移到了后端 MySQL 数据库，实现了数据的安全存储和管理。

**主要功能**：
- 待办事项管理（增删改查）
- 日程事件管理（增删改查）
- 待办集管理（创建、编辑、删除待办集）
- 专注时间跟踪（自律钟功能）
- 统计数据可视化（当日专注、月度专注分布）
- 用户认证（登录、权限管理）
- AI 辅助分析（自动生成子任务和时间估计）

## 技术栈

### 前端
- Vue 3
- Element Plus
- Vite
- ECharts（数据可视化）

### 后端
- Node.js
- Express
- MySQL (使用 Sequelize ORM)
- CORS
- dotenv

## 项目结构

```
todo-schedule-app/
├── backend/             # 后端代码
│   ├── config/          # 配置文件
│   │   └── db.js        # 数据库连接配置
│   ├── models/          # 数据模型
│   │   ├── Todo.js          # 待办事项模型
│   │   ├── Event.js         # 日程事件模型
│   │   ├── FocusSession.js  # 专注会话模型
│   │   └── TodoSet.js       # 待办集模型
│   ├── routes/          # API 路由
│   │   ├── todos.js         # 待办事项路由
│   │   ├── events.js        # 日程事件路由
│   │   ├── focusSessions.js # 专注会话路由
│   │   └── todoSets.js      # 待办集路由
│   ├── index.js         # 后端主入口
│   ├── package.json     # 后端依赖
│   └── package-lock.json
├── src/                 # 前端代码
│   ├── components/      # Vue 组件
│   │   ├── TodoInput.vue
│   │   ├── TodoItem.vue
│   │   ├── TodoList.vue
│   │   ├── TodoFooter.vue
│   │   ├── Schedule.vue
│   │   ├── SelfDiscipline.vue    # 自律钟组件
│   │   ├── Stats.vue             # 统计数据组件
│   │   ├── TodoSet.vue           # 待办集组件
│   │   └── Login.vue             # 登录组件
│   ├── utils/           # 工具函数
│   │   ├── api.js       # API 服务
│   │   └── storage.js   # 本地存储（已废弃，保留作为参考）
│   ├── App.vue          # 应用主组件
│   └── main.js          # 前端入口
├── package.json         # 前端依赖
├── vite.config.js       # Vite 配置
└── DOCUMENTATION.md     # 项目文档
```

## 快速开始

### 1. 环境要求

- Node.js 14+
- MySQL 5.7+

### 2. 安装依赖

```bash
# 安装前端依赖
npm install

# 安装后端依赖
cd backend
npm install
```

### 3. 配置数据库

修改 `backend/config/db.js` 文件中的数据库配置：

```javascript
// 请根据您的 MySQL 配置修改以下参数
const sequelize = new Sequelize('todo-app', 'root', 'your_password_here', {
  host: 'localhost',
  dialect: 'mysql',
  port: 3306,
  logging: console.log,
  dialectOptions: {
    connectTimeout: 10000
  }
});
```

### 4. 启动服务

```bash
# 启动后端服务
cd backend
npm start

# 启动前端开发服务（在项目根目录）
npm run dev
```

### 5. 访问应用

前端应用将运行在 `http://localhost:5173/`（或其他可用端口）
后端 API 将运行在 `http://localhost:5000/`

## API 文档

### 待办事项 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/todos | 获取所有待办事项 |
| POST | /api/todos | 创建新待办事项 |
| GET | /api/todos/:id | 获取单个待办事项 |
| PATCH | /api/todos/:id | 更新待办事项 |
| DELETE | /api/todos/:id | 删除待办事项 |

### 日程事件 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/events | 获取所有日程事件 |
| POST | /api/events | 创建新日程事件 |
| GET | /api/events/:id | 获取单个日程事件 |
| PATCH | /api/events/:id | 更新日程事件 |
| DELETE | /api/events/:id | 删除日程事件 |

### 专注会话 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/focus-sessions | 获取所有专注会话 |
| POST | /api/focus-sessions | 创建新专注会话 |
| GET | /api/focus-sessions/stats | 获取专注统计数据 |

### 待办集 API

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | /api/todo-sets | 获取所有待办集 |
| POST | /api/todo-sets | 创建新待办集 |
| GET | /api/todo-sets/:id | 获取单个待办集 |
| PATCH | /api/todo-sets/:id | 更新待办集 |
| DELETE | /api/todo-sets/:id | 删除待办集 |

### 用户认证 API

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | /api/auth/login | 用户登录 |
| POST | /api/auth/logout | 用户登出 |
| GET | /api/auth/current-user | 获取当前用户 |

## 数据模型

### Todo 模型

| 字段 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| id | INTEGER | 主键，自增 | 自动生成 |
| text | STRING | 待办事项内容 | 无，必填 |
| completed | BOOLEAN | 是否完成 | false |
| createdAt | DATETIME | 创建时间 | 当前时间 |
| dueDate | DATETIME | 截止日期 | null |
| priority | STRING | 优先级 | 'medium' |
| targetMinutes | INTEGER | 目标专注时间（分钟） | 60 |
| currentMinutes | INTEGER | 当前专注时间（分钟） | 0 |
| progress | INTEGER | 完成进度（百分比） | 0 |
| timeInfo | STRING | 时间信息 | '0/60 分钟' |
| todoSetId | INTEGER | 待办集 ID | null |

### Event 模型

| 字段 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| id | INTEGER | 主键，自增 | 自动生成 |
| title | STRING | 事件标题 | 无，必填 |
| date | STRING | 事件日期 | 无，必填 |
| time | STRING | 事件时间 | 无，必填 |
| color | STRING | 事件颜色 | '#409EFF' |
| createdAt | DATETIME | 创建时间 | 当前时间 |

### FocusSession 模型

| 字段 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| id | INTEGER | 主键，自增 | 自动生成 |
| todoId | INTEGER | 待办事项 ID | 无，必填 |
| duration | INTEGER | 专注时长（分钟） | 0 |
| date | STRING | 专注日期 | 无，必填 |
| startTime | DATETIME | 开始时间 | 无，必填 |
| endTime | DATETIME | 结束时间 | 无，必填 |
| createdAt | DATETIME | 创建时间 | 当前时间 |

### TodoSet 模型

| 字段 | 类型 | 描述 | 默认值 |
|------|------|------|--------|
| id | INTEGER | 主键，自增 | 自动生成 |
| name | STRING | 待办集名称 | 无，必填 |
| description | STRING | 待办集描述 | null |
| createdAt | DATETIME | 创建时间 | 当前时间 |

## 调试方法

### 前端调试

1. **浏览器开发者工具**：
   - 使用 Chrome DevTools 或 Firefox Developer Tools
   - 检查网络请求：Network 标签页查看 API 请求
   - 检查控制台：Console 标签页查看错误信息
   - 检查组件状态：Vue DevTools 扩展

2. **Vite 开发服务器**：
   - 热重载：修改代码后自动刷新
   - 错误提示：终端显示编译错误

### 后端调试

1. **控制台日志**：
   - 后端启动时会输出数据库连接状态
   - API 请求会在终端显示
   - 错误信息会在终端显示

2. **Postman 测试**：
   - 使用 Postman 或 Insomnia 测试 API 端点
   - 验证 CRUD 操作是否正常

3. **MySQL 数据库检查**：
   - 使用 MySQL Workbench 或 phpMyAdmin 查看数据库
   - 验证数据是否正确存储

## 常见问题

### 1. 数据库连接失败

**症状**：后端启动时显示 "Error: Access denied for user 'root'@'localhost'"

**解决方案**：
- 检查 MySQL 服务是否运行
- 检查用户名和密码是否正确
- 确保 root 用户有足够的权限

### 2. API 请求失败

**症状**：前端控制台显示 "Failed to fetch"

**解决方案**：
- 检查后端服务是否运行
- 检查 API 地址是否正确
- 检查 CORS 配置是否正确

### 3. 数据不显示

**症状**：前端页面没有显示数据

**解决方案**：
- 检查后端 API 是否返回数据
- 检查前端 API 调用是否正确
- 检查数据库中是否有数据

## 部署建议

1. **生产环境**：
   - 使用 PM2 管理后端进程
   - 配置环境变量文件
   - 启用 HTTPS

2. **数据库**：
   - 使用独立的数据库用户
   - 配置数据库备份
   - 优化数据库性能

3. **前端**：
   - 运行 `npm run build` 生成生产版本
   - 部署到静态文件服务器
   - 配置 CDN

## 学习资源

- [Vue 3 官方文档](https://vuejs.org/)
- [Express 官方文档](https://expressjs.com/)
- [Sequelize 官方文档](https://sequelize.org/)
- [MySQL 官方文档](https://dev.mysql.com/doc/)
- [Element Plus 文档](https://element-plus.org/)

## 版本历史

- v1.0.0：初始版本，使用 localStorage 存储
- v2.0.0：迁移到 Node.js + MongoDB 后端
- v3.0.0：迁移到 MySQL 数据库
- v4.0.0：添加用户认证、待办集管理、专注时间跟踪和统计数据可视化功能
- v4.1.0：添加 AI 辅助分析功能，支持自动生成子任务和时间估计
