# Todo Schedule App - 企业级全栈待办管理系统

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9%2B-blue.svg)](https://www.typescriptlang.org/)
[![Vue 3](https://img.shields.io/badge/Vue-3.3%2B-green.svg)](https://vuejs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-orange.svg)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.18%2B-lightgrey.svg)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0%2B-blue.svg)](https://www.mysql.com/)
[![Sequelize](https://img.shields.io/badge/Sequelize-6.32%2B-ccc.svg)](https://sequelize.org/)

***

## 📋 项目概述

**Todo Schedule App** 是一个基于 **Vue 3 + TypeScript + Node.js + MySQL** 的企业级全栈待办事项和日程管理应用。项目已完成 JavaScript 到 TypeScript 的全面重构，具备完整的类型安全保障和现代化的开发体验。

### 🎯 核心功能

| 模块    | 功能                  | 状态    |
| ----- | ------------------- | ----- |
| 待办管理  | 待办事项增删改查、优先级管理、进度追踪 | ✅ 已完成 |
| 日程管理  | 日程事件 CRUD、日历视图、颜色标记 | ✅ 已完成 |
| 待办集管理 | 批量任务分组、AI 智能分析      | ✅ 已完成 |
| 专注时钟  | Pomodoro 计时器、时间统计   | ✅ 已完成 |
| 数据可视化 | 专注统计图表、趋势分析         | ✅ 已完成 |
| 用户认证  | 登录状态管理              | ✅ 已完成 |

***

## 🛠️ 技术栈

### 前端技术栈

| 技术           | 版本   | 说明                  |
| ------------ | ---- | ------------------- |
| Vue          | 3.3+ | 渐进式 JavaScript 框架   |
| TypeScript   | 5.3+ | 类型安全的 JavaScript 超集 |
| Element Plus | 2.4+ | Vue 3 企业级 UI 组件库    |
| Vite         | 5.0+ | 下一代前端构建工具           |
| ECharts      | 5.4+ | 数据可视化图表库            |
| Vue Router   | 4.2+ | Vue 路由管理            |

### 后端技术栈

| 技术         | 版本    | 说明             |
| ---------- | ----- | -------------- |
| Node.js    | 18+   | JavaScript 运行时 |
| Express    | 4.18+ | Web 应用框架       |
| TypeScript | 5.3+  | 类型安全开发         |
| MySQL      | 8.0+  | 关系型数据库         |
| Sequelize  | 6.32+ | ORM 框架         |
| CORS       | 2.8+  | 跨域资源共享         |
| dotenv     | 16+   | 环境变量管理         |

***

## 📁 项目结构

```
todo-schedule-app/
├── backend/                              # 后端服务
│   ├── src/
│   │   ├── config/                      # 配置文件
│   │   │   └── db.ts                    # 数据库连接配置
│   │   ├── models/                      # 数据模型 (TypeScript)
│   │   │   ├── Todo.ts                  # 待办事项模型
│   │   │   ├── Event.ts                 # 日程事件模型
│   │   │   ├── FocusSession.ts          # 专注会话模型
│   │   │   └── TodoSet.ts               # 待办集模型
│   │   ├── routes/                      # API 路由 (TypeScript)
│   │   │   ├── todos.ts                 # 待办事项路由
│   │   │   ├── events.ts                # 日程事件路由
│   │   │   ├── focusSessions.ts         # 专注会话路由
│   │   │   ├── todoSets.ts              # 待办集路由
│   │   │   └── deepseek.ts              # AI 分析路由
│   │   ├── types/                       # 类型定义
│   │   │   └── index.ts                 # 全局类型声明
│   │   └── index.ts                     # 后端主入口
│   ├── .env                             # 环境变量配置
│   ├── package.json                     # 后端依赖
│   ├── tsconfig.json                    # TypeScript 配置
│   └── node_modules/                    # 依赖目录
├── src/                                 # 前端代码
│   ├── components/                      # Vue 组件 (TypeScript)
│   │   ├── App.vue                      # 应用根组件
│   │   ├── BottomNav.vue                # 底部导航
│   │   ├── Login.vue                    # 登录组件
│   │   ├── Profile.vue                  # 用户配置
│   │   ├── Schedule.vue                 # 日程管理
│   │   ├── SelfDiscipline.vue           # 自律钟
│   │   ├── Stats.vue                    # 统计分析
│   │   ├── TodoSet.vue                  # 待办集管理
│   │   └── TodoList.vue                 # 待办列表
│   ├── types/                           # 前端类型定义
│   │   └── index.ts                     # 全局类型声明
│   ├── utils/                           # 工具函数
│   │   └── api.ts                       # API 服务 (TypeScript)
│   ├── App.vue                          # 应用主组件
│   ├── main.ts                          # 前端入口
│   └── style.css                        # 全局样式
├── .gitignore                           # Git 忽略配置
├── package.json                         # 前端依赖
├── tsconfig.json                        # 前端 TypeScript 配置
├── tsconfig.node.json                   # Vite TypeScript 配置
├── vite.config.ts                       # Vite 构建配置
└── README.md                            # 项目文档
```

***

## 🔄 TypeScript 重构记录

### 📅 重构时间线

| 阶段   | 时间                       | 内容                         |
| ---- | ------------------------ | -------------------------- |
| 规划阶段 | 2026-04-01               | 分析现有代码结构，制定重构计划            |
| 前端重构 | 2026-04-02 \~ 2026-04-05 | 前端 JavaScript → TypeScript |
| 后端重构 | 2026-04-06 \~ 2026-04-10 | 后端 JavaScript → TypeScript |
| 类型定义 | 2026-04-11 \~ 2026-04-12 | 完善类型系统                     |
| 测试验证 | 2026-04-13 \~ 2026-04-15 | 类型检查、编译验证、功能测试             |
| 文档更新 | 2026-04-16               | 更新技术文档                     |

### ✅ 重构成果

| 维度       | 重构前     | 重构后       |
| -------- | ------- | --------- |
| **类型安全** | 无类型检查   | 完整类型推断与约束 |
| **代码提示** | 基本无     | 智能 IDE 提示 |
| **错误发现** | 运行时     | 编译时发现     |
| **可维护性** | 依赖开发者经验 | 类型即文档     |
| **开发效率** | 中等      | 大幅提升      |
| **代码质量** | 依赖代码审查  | 编译器保障     |

### 🔧 重构关键点

1. **类型定义统一**
   - 前端：`src/types/index.ts`
   - 后端：`backend/src/types/index.ts`
2. **组件 TypeScript 化**
   - 使用 `defineProps<Props>()` 和 `defineEmits<Emits>()`
   - 添加响应式状态类型注解
3. **API 层类型安全**
   - 定义请求/响应接口
   - 统一错误处理类型
4. **数据库模型类型**
   - Sequelize 模型添加泛型类型
   - 定义属性接口

***

## 🚀 快速开始

### 1. 环境要求

| 依赖      | 版本        | 说明             |
| ------- | --------- | -------------- |
| Node.js | >= 18.0.0 | JavaScript 运行时 |
| MySQL   | >= 8.0.0  | 关系型数据库         |
| npm     | >= 9.0.0  | 包管理器           |

### 2. 安装依赖

```bash
# 安装前端依赖
cd todo-schedule-app
npm install

# 安装后端依赖
cd backend
npm install
```

### 3. 配置环境变量

创建并配置 `backend/.env` 文件：

```env
# 数据库配置
DB_NAME=todo-app
DB_USER=root
DB_PASSWORD=your_password_here
DB_HOST=localhost
DB_PORT=3306

# 服务器配置
PORT=5000

# DeepSeek AI 配置（可选）
DEEPSEEK_API_KEY=your_api_key_here
DEEPSEEK_API_URL=https://api.deepseek.com/v1/chat/completions
```

### 4. 启动服务

```bash
# 启动后端服务（开发模式）
cd backend
npm run dev

# 启动前端开发服务器（新开终端）
cd todo-schedule-app
npm run dev
```

### 5. 构建生产版本

```bash
# 构建前端
npm run build

# 构建后端
cd backend
npm run build
```

### 6. 访问应用

| 服务     | 地址                      | 说明             |
| ------ | ----------------------- | -------------- |
| 前端应用   | <http://localhost:5173> | Vue 开发服务器      |
| 后端 API | <http://localhost:5000> | Express API 服务 |

***

## 📡 API 接口文档

### 待办事项 API

| 方法     | 路径               | 描述       | 认证 |
| ------ | ---------------- | -------- | -- |
| GET    | `/api/todos`     | 获取所有待办事项 | 否  |
| POST   | `/api/todos`     | 创建新待办事项  | 否  |
| PATCH  | `/api/todos/:id` | 更新待办事项   | 否  |
| DELETE | `/api/todos/:id` | 删除待办事项   | 否  |

**POST 请求体示例：**

```json
{
  "text": "完成项目文档",
  "completed": false,
  "priority": "high",
  "targetMinutes": 25
}
```

### 日程事件 API

| 方法     | 路径                | 描述       | 认证 |
| ------ | ----------------- | -------- | -- |
| GET    | `/api/events`     | 获取所有日程事件 | 否  |
| POST   | `/api/events`     | 创建新日程事件  | 否  |
| DELETE | `/api/events/:id` | 删除日程事件   | 否  |

### 专注会话 API

| 方法   | 路径                          | 描述       | 认证 |
| ---- | --------------------------- | -------- | -- |
| GET  | `/api/focus-sessions`       | 获取所有专注会话 | 否  |
| POST | `/api/focus-sessions`       | 创建专注会话   | 否  |
| GET  | `/api/focus-sessions/stats` | 获取专注统计   | 否  |

### 待办集 API

| 方法     | 路径                   | 描述      | 认证 |
| ------ | -------------------- | ------- | -- |
| GET    | `/api/todo-sets`     | 获取所有待办集 | 否  |
| POST   | `/api/todo-sets`     | 创建待办集   | 否  |
| PATCH  | `/api/todo-sets/:id` | 更新待办集   | 否  |
| DELETE | `/api/todo-sets/:id` | 删除待办集   | 否  |

### AI 分析 API

| 方法   | 路径                               | 描述       | 认证 |
| ---- | -------------------------------- | -------- | -- |
| POST | `/api/deepseek/analyze-todo-set` | AI 分析待办集 | 否  |

***

## 🗄️ 数据库设计

### Todo 表（待办事项）

| 字段             | 类型          | 约束                           | 说明       |
| -------------- | ----------- | ---------------------------- | -------- |
| id             | INT         | PRIMARY KEY, AUTO\_INCREMENT | 主键       |
| text           | TEXT        | NOT NULL                     | 待办内容     |
| completed      | BOOLEAN     | DEFAULT FALSE                | 是否完成     |
| priority       | VARCHAR(20) | DEFAULT 'medium'             | 优先级      |
| dueDate        | DATETIME    | NULL                         | 截止日期     |
| targetMinutes  | INT         | DEFAULT 25                   | 目标时长(分钟) |
| currentMinutes | INT         | DEFAULT 0                    | 当前时长(分钟) |
| progress       | INT         | DEFAULT 0                    | 进度百分比    |
| timeInfo       | VARCHAR(50) | DEFAULT ''                   | 时间信息     |
| todoSetId      | INT         | NULL                         | 待办集外键    |
| createdAt      | DATETIME    | <br />                       | 创建时间     |

### Event 表（日程事件）

| 字段     | 类型           | 约束                           | 说明   |
| ------ | ------------ | ---------------------------- | ---- |
| id     | INT          | PRIMARY KEY, AUTO\_INCREMENT | 主键   |
| title  | VARCHAR(255) | NOT NULL                     | 事件标题 |
| start  | DATETIME     | NOT NULL                     | 开始时间 |
| end    | DATETIME     | NOT NULL                     | 结束时间 |
| allDay | BOOLEAN      | DEFAULT FALSE                | 全天事件 |
| color  | VARCHAR(20)  | DEFAULT '#409EFF'            | 颜色标记 |

### FocusSession 表（专注会话）

| 字段        | 类型       | 约束                           | 说明   |
| --------- | -------- | ---------------------------- | ---- |
| id        | INT      | PRIMARY KEY, AUTO\_INCREMENT | 主键   |
| todoId    | INT      | NOT NULL                     | 关联待办 |
| duration  | INT      | NOT NULL                     | 专注时长 |
| date      | DATE     | NOT NULL                     | 专注日期 |
| startTime | TIME     | NOT NULL                     | 开始时间 |
| endTime   | TIME     | NOT NULL                     | 结束时间 |
| createdAt | DATETIME | <br />                       | 创建时间 |

### TodoSet 表（待办集）

| 字段          | 类型           | 约束                           | 说明    |
| ----------- | ------------ | ---------------------------- | ----- |
| id          | INT          | PRIMARY KEY, AUTO\_INCREMENT | 主键    |
| name        | VARCHAR(255) | NOT NULL                     | 待办集名称 |
| description | TEXT         | NULL                         | 描述    |
| createdAt   | DATETIME     | <br />                       | 创建时间  |

***

## 🔧 开发指南

### TypeScript 规范

#### 类型定义原则

1. **明确类型注解**：函数参数、返回值必须添加类型注解
2. **接口优先**：使用 `interface` 定义数据结构
3. **类型断言谨慎使用**：避免滥用 `any` 类型
4. **泛型合理应用**：复用类型逻辑

#### 编码风格

```typescript
// ✅ 推荐：使用 interface 定义类型
interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

// ✅ 推荐：明确函数类型
function fetchTodos(): Promise<Todo[]> {
  return fetch('/api/todos').then(res => res.json());
}

// ❌ 避免：使用 any 类型
// function fetchTodos(): Promise<any[]> { ... }
```

### 代码审查要点

| 检查项   | 说明                                   |
| ----- | ------------------------------------ |
| 类型完整性 | 所有变量、函数、组件都应有明确类型                    |
| 接口一致性 | 前后端接口类型保持一致                          |
| 错误处理  | Promise 必须有 `.catch()` 或 try-catch   |
| 命名规范  | 使用 PascalCase（类/接口）、camelCase（变量/函数） |

***

## 🛡️ 安全最佳实践

### 后端安全

1. **输入验证**：所有用户输入必须进行验证
2. **SQL 注入防护**：使用 ORM 参数化查询（Sequelize 自动防护）
3. **CORS 配置**：限制允许的来源
4. **环境变量保护**：敏感信息（数据库密码、API Key）存储在 `.env` 文件中，不上传版本控制

### 前端安全

1. **XSS 防护**：使用 Vue 模板自动转义
2. **CSRF 防护**：考虑添加 CSRF token
3. **敏感数据处理**：不在前端存储敏感信息

***

## 📊 性能优化

### 后端优化

1. **数据库索引**：为常用查询字段添加索引
2. **查询优化**：避免 N+1 查询问题
3. **连接池配置**：合理配置数据库连接池

### 前端优化

1. **代码分割**：使用 Vite 按需加载
2. **缓存策略**：合理使用 HTTP 缓存
3. **懒加载**：组件和图片懒加载

***

## 🧪 测试策略

### 单元测试

- **后端**：使用 Jest 测试模型和服务
- **前端**：使用 Vue Test Utils 测试组件

### 集成测试

- API 接口测试
- 数据库操作测试

### E2E 测试

- 使用 Cypress 进行端到端测试

***

## 🚢 部署方案

### 开发环境

```bash
# 后端开发模式（热重载）
npm run dev

# 前端开发模式（热重载）
npm run dev
```

### 生产环境

```bash
# 构建前端
npm run build

# 构建后端
cd backend && npm run build

# 使用 PM2 启动后端
pm2 start dist/index.js --name todo-schedule-api
```

### Docker 部署（推荐）

```dockerfile
# Dockerfile 示例
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist/ ./dist/

EXPOSE 5000

CMD ["node", "dist/index.js"]
```

***

## 🔄 CI/CD 流程

### GitHub Actions 示例

```yaml
name: CI/CD

on:
  push:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v4
    
    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: TypeScript type check
      run: npx tsc --noEmit
    
    - name: Build frontend
      run: npm run build
    
    - name: Build backend
      run: cd backend && npm ci && npm run build
```

***

## 📈 版本历史

| 版本         | 日期            | 变更内容                    |
| ---------- | ------------- | ----------------------- |
| v1.0.0     | 2026-03-01    | 初始版本，使用 localStorage 存储 |
| v2.0.0     | 2026-03-15    | 迁移到 Node.js + MySQL 后端  |
| v3.0.0     | 2026-03-30    | 添加待办集、专注时钟、统计功能         |
| v3.1.0     | 2026-04-01    | 添加 AI 辅助分析功能            |
| **v4.0.0** | **2026-05-5** | **TypeScript 全面重构**     |
| v4.0.1     | 2026-05-6     | 修复数据库连接问题               |

***

## 🤝 贡献指南

### 代码提交规范

```
<类型>(<模块>): <描述>

类型：
- feat: 新功能
- fix: 修复 bug
- refactor: 代码重构
- docs: 文档更新
- style: 代码格式
- test: 测试用例
```

### 开发流程

1. Fork 仓库
2. 创建特性分支 (`feature/xxx` 或 `fix/xxx`)
3. 提交代码
4. 发起 Pull Request
5. 代码审查通过后合并

***

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：

- **Issue 报告**：在 GitHub 仓库提交 Issue
- **技术讨论**：通过项目讨论区交流

***

## 📄 许可证

该项目无 LICENSE 文件

***

*文档最后更新：2026-05-06*
