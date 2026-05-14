# Todo Schedule App - API 接口文档

> **版本**：v4.0.0
> **更新日期**：2026-05-06
> **基础路径**：`http://localhost:5000`

---

## 📋 接口概览

| 模块 | 数量 | 说明 |
|------|------|------|
| 用户信息 | 4 | 用户资料、主题管理 |
| 认证 | 1 | 登出功能 |
| 待办事项 | 4 | CRUD 完整功能 |
| 日程事件 | 3 | 日程管理 |
| 专注会话 | 3 | 计时统计 |
| 待办集 | 4 | 任务分组管理 |
| AI 分析 | 1 | DeepSeek 智能分析 |
| **合计** | **20** | - |

---

## 1️⃣ 用户信息接口

### 1.1 获取用户信息

**接口地址**：`GET /api/user/info`

**请求参数**：无

**响应示例**：

```json
{
  "name": "嗨寻",
  "motto": "钱是第一驱动力",
  "totalFocusDays": 14,
  "consecutiveFocusDays": 1,
  "avatar": "🌙"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 是 | 用户昵称 |
| motto | string | 是 | 个性签名 |
| totalFocusDays | number | 是 | 累计专注天数 |
| consecutiveFocusDays | number | 是 | 连续专注天数 |
| avatar | string | 是 | 用户头像（emoji） |

---

### 1.2 更新用户信息

**接口地址**：`PATCH /api/user/info`

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "name": "新昵称",
  "motto": "新的签名",
  "avatar": "😎"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| name | string | 否 | 新昵称 |
| motto | string | 否 | 新签名 |
| avatar | string | 否 | 新头像 |

**响应示例**：

```json
{
  "name": "新昵称",
  "motto": "新的签名",
  "avatar": "😎"
}
```

---

### 1.3 获取主题配置

**接口地址**：`GET /api/user/theme`

**请求参数**：无

**响应示例**：

```json
{
  "id": 1,
  "color": "#409EFF"
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 主题 ID |
| color | string | 是 | 主题颜色（HEX） |

---

### 1.4 更新主题配置

**接口地址**：`POST /api/user/theme`

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "id": 1,
  "color": "#67C23A"
}
```

**响应示例**：

```json
{
  "id": 1,
  "color": "#67C23A"
}
```

---

## 2️⃣ 认证接口

### 2.1 用户登出

**接口地址**：`POST /api/auth/logout`

**请求参数**：无

**响应示例**：

```json
{
  "success": true
}
```

---

## 3️⃣ 待办事项接口

### 3.1 获取所有待办

**接口地址**：`GET /api/todos`

**查询参数**：

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| completed | boolean | 否 | 按完成状态筛选 |

**响应示例**：

```json
[
  {
    "id": 80,
    "text": "研究皇家厨师招聘标准与要求",
    "completed": false,
    "priority": "medium",
    "dueDate": null,
    "targetMinutes": 120,
    "currentMinutes": 0,
    "progress": 0,
    "timeInfo": "0/120 分钟",
    "todoSetId": 1,
    "createdAt": "2026-05-06T08:32:58.724Z"
  },
  {
    "id": 81,
    "text": "评估自身厨艺水平与差距",
    "completed": false,
    "priority": "medium",
    "dueDate": null,
    "targetMinutes": 90,
    "currentMinutes": 0,
    "progress": 0,
    "timeInfo": "0/90 分钟",
    "todoSetId": 1,
    "createdAt": "2026-05-06T08:33:01.000Z"
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 待办唯一标识 |
| text | string | 是 | 待办内容 |
| completed | boolean | 是 | 是否完成 |
| priority | string | 是 | 优先级：high/medium/low |
| dueDate | string/null | 否 | 截止日期（ISO 8601） |
| targetMinutes | number | 是 | 目标专注时长（分钟） |
| currentMinutes | number | 是 | 当前已专注时长（分钟） |
| progress | number | 是 | 完成进度（百分比 0-100） |
| timeInfo | string | 是 | 时间信息显示文本 |
| todoSetId | number/null | 否 | 所属待办集 ID |
| createdAt | string | 是 | 创建时间（ISO 8601） |

---

### 3.2 创建待办

**接口地址**：`POST /api/todos`

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "text": "完成项目文档",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-05-10T18:00:00Z",
  "todoSetId": 1,
  "targetMinutes": 25
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| text | string | 是 | - | 待办内容 |
| completed | boolean | 否 | false | 是否完成 |
| priority | string | 否 | medium | 优先级：high/medium/low |
| dueDate | string | 否 | null | 截止日期（ISO 8601） |
| todoSetId | number | 否 | null | 所属待办集 ID |
| targetMinutes | number | 否 | 25 | 目标专注时长（分钟） |

**响应示例**：

```json
{
  "id": 90,
  "text": "完成项目文档",
  "completed": false,
  "priority": "high",
  "dueDate": "2026-05-10T18:00:00.000Z",
  "targetMinutes": 25,
  "currentMinutes": 0,
  "progress": 0,
  "timeInfo": "0/25 分钟",
  "todoSetId": 1,
  "createdAt": "2026-05-06T09:00:00.000Z"
}
```

---

### 3.3 更新待办

**接口地址**：`PATCH /api/todos/:id`

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 待办 ID |

**请求头**：

```
Content-Type: application/json
```

**请求体**（部分更新）：

```json
{
  "text": "更新后的内容",
  "completed": true,
  "priority": "high",
  "currentMinutes": 15,
  "progress": 60
}
```

**响应示例**：

```json
{
  "id": 90,
  "text": "更新后的内容",
  "completed": true,
  "priority": "high",
  "dueDate": "2026-05-10T18:00:00.000Z",
  "targetMinutes": 25,
  "currentMinutes": 15,
  "progress": 60,
  "timeInfo": "15/25 分钟",
  "todoSetId": 1,
  "createdAt": "2026-05-06T09:00:00.000Z"
}
```

---

### 3.4 删除待办

**接口地址**：`DELETE /api/todos/:id`

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 待办 ID |

**响应示例**：

```json
{
  "success": true,
  "id": 90
}
```

---

## 4️⃣ 日程事件接口

### 4.1 获取所有日程

**接口地址**：`GET /api/events`

**响应示例**：

```json
[
  {
    "id": 1,
    "title": "项目会议",
    "start": "2026-04-10T09:00:00",
    "end": "2026-04-10T10:00:00",
    "allDay": false,
    "color": "#409EFF"
  },
  {
    "id": 2,
    "title": "健身",
    "start": "2026-04-10T18:00:00",
    "end": "2026-04-10T19:00:00",
    "allDay": false,
    "color": "#67C23A"
  },
  {
    "id": 3,
    "title": "生日聚会",
    "start": "2026-04-15",
    "end": "2026-04-15",
    "allDay": true,
    "color": "#F56C6C"
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 日程唯一标识 |
| title | string | 是 | 日程标题 |
| start | string | 是 | 开始时间（ISO 8601） |
| end | string | 是 | 结束时间（ISO 8601） |
| allDay | boolean | 是 | 是否全天事件 |
| color | string | 是 | 日程颜色（HEX） |

---

### 4.2 创建日程

**接口地址**：`POST /api/events`

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "title": "团队周会",
  "start": "2026-05-10T10:00:00",
  "end": "2026-05-10T11:00:00",
  "allDay": false,
  "color": "#409EFF"
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | 是 | - | 日程标题 |
| start | string | 是 | - | 开始时间（ISO 8601） |
| end | string | 是 | - | 结束时间（ISO 8601） |
| allDay | boolean | 否 | false | 是否全天事件 |
| color | string | 否 | #409EFF | 日程颜色（HEX） |

**响应示例**：

```json
{
  "id": 10,
  "title": "团队周会",
  "start": "2026-05-10T10:00:00",
  "end": "2026-05-10T11:00:00",
  "allDay": false,
  "color": "#409EFF"
}
```

---

### 4.3 删除日程

**接口地址**：`DELETE /api/events/:id`

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 日程 ID |

**响应示例**：

```json
{
  "success": true,
  "id": 10
}
```

---

## 5️⃣ 专注会话接口

### 5.1 获取所有专注会话

**接口地址**：`GET /api/focus-sessions`

**响应示例**：

```json
[
  {
    "id": 1,
    "todoId": 80,
    "duration": 25,
    "date": "2026-05-06",
    "startTime": "10:00:00",
    "endTime": "10:25:00",
    "createdAt": "2026-05-06T10:25:00.000Z"
  },
  {
    "id": 2,
    "todoId": 81,
    "duration": 50,
    "date": "2026-05-06",
    "startTime": "14:00:00",
    "endTime": "14:50:00",
    "createdAt": "2026-05-06T14:50:00.000Z"
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 会话唯一标识 |
| todoId | number | 是 | 关联的待办 ID |
| duration | number | 是 | 专注时长（分钟） |
| date | string | 是 | 专注日期（YYYY-MM-DD） |
| startTime | string | 是 | 开始时间（HH:mm:ss） |
| endTime | string | 是 | 结束时间（HH:mm:ss） |
| createdAt | string | 是 | 创建时间（ISO 8601） |

---

### 5.2 创建专注会话

**接口地址**：`POST /api/focus-sessions`

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "todoId": 80,
  "duration": 25,
  "date": "2026-05-06",
  "startTime": "10:00:00",
  "endTime": "10:25:00"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| todoId | number | 是 | 关联的待办 ID |
| duration | number | 是 | 专注时长（分钟） |
| date | string | 是 | 专注日期（YYYY-MM-DD） |
| startTime | string | 是 | 开始时间（HH:mm:ss） |
| endTime | string | 是 | 结束时间（HH:mm:ss） |

**响应示例**：

```json
{
  "id": 3,
  "todoId": 80,
  "duration": 25,
  "date": "2026-05-06",
  "startTime": "10:00:00",
  "endTime": "10:25:00"
}
```

---

### 5.3 获取专注统计

**接口地址**：`GET /api/focus-sessions/stats`

**响应示例**：

```json
{
  "totalSessions": 42,
  "totalMinutes": 1260,
  "avgMinutes": 30,
  "todaySessions": 3,
  "todayMinutes": 180,
  "weeklySessions": 15,
  "weeklyMinutes": 900,
  "monthlySessions": 60,
  "monthlyMinutes": 3600,
  "focusByCategory": {
    "work": 720,
    "study": 360,
    "health": 180
  },
  "focusByHour": {
    "9": 120,
    "10": 180,
    "11": 90,
    "14": 150,
    "15": 180,
    "16": 120,
    "19": 180,
    "20": 120
  }
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| totalSessions | number | 是 | 累计会话数 |
| totalMinutes | number | 是 | 累计专注总时长（分钟） |
| avgMinutes | number | 是 | 平均每次专注时长（分钟） |
| todaySessions | number | 是 | 今日会话数 |
| todayMinutes | number | 是 | 今日专注时长（分钟） |
| weeklySessions | number | 是 | 本周会话数 |
| weeklyMinutes | number | 是 | 本周专注时长（分钟） |
| monthlySessions | number | 是 | 本月会话数 |
| monthlyMinutes | number | 是 | 本月专注时长（分钟） |
| focusByCategory | object | 是 | 按分类统计的时长 |
| focusByHour | object | 是 | 按小时统计的会话数 |

---

## 6️⃣ 待办集接口

### 6.1 获取所有待办集

**接口地址**：`GET /api/todo-sets`

**响应示例**：

```json
[
  {
    "id": 1,
    "name": "实习",
    "description": "实习相关任务",
    "createdAt": "2026-04-01T09:00:00.000Z"
  },
  {
    "id": 2,
    "name": "学习计划",
    "description": "技术学习任务",
    "createdAt": "2026-04-05T14:30:00.000Z"
  }
]
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| id | number | 是 | 待办集唯一标识 |
| name | string | 是 | 待办集名称 |
| description | string | 否 | 待办集描述 |
| createdAt | string | 是 | 创建时间（ISO 8601） |

---

### 6.2 创建待办集

**接口地址**：`POST /api/todo-sets`

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "name": "新待办集",
  "description": "这是新待办集的描述"
}
```

| 字段 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| name | string | 是 | - | 待办集名称 |
| description | string | 否 | "" | 待办集描述 |

**响应示例**：

```json
{
  "id": 3,
  "name": "新待办集",
  "description": "这是新待办集的描述",
  "createdAt": "2026-05-06T10:00:00.000Z"
}
```

---

### 6.3 更新待办集

**接口地址**：`PATCH /api/todo-sets/:id`

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 待办集 ID |

**请求头**：

```
Content-Type: application/json
```

**请求体**（部分更新）：

```json
{
  "name": "更新后的名称",
  "description": "更新后的描述"
}
```

**响应示例**：

```json
{
  "id": 3,
  "name": "更新后的名称",
  "description": "更新后的描述",
  "createdAt": "2026-05-06T10:00:00.000Z"
}
```

---

### 6.4 删除待办集

**接口地址**：`DELETE /api/todo-sets/:id`

**路径参数**：

| 参数 | 类型 | 说明 |
|------|------|------|
| id | number | 待办集 ID |

**响应示例**：

```json
{
  "message": "Todo set deleted successfully"
}
```

---

## 7️⃣ AI 分析接口

### 7.1 AI 智能分析待办集

**接口地址**：`POST /api/deepseek/analyze-todo-set`

**功能说明**：调用 DeepSeek API 分析待办集，自动生成子任务分解和时间估计。

**请求头**：

```
Content-Type: application/json
```

**请求体**：

```json
{
  "todoSetName": "暑假学习计划",
  "description": "想在暑假期间提升自己的编程能力和算法水平"
}
```

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| todoSetName | string | 是 | 待办集名称 |
| description | string | 是 | 待办集描述 |

**响应示例**：

```json
{
  "tasks": [
    {
      "title": "学习 JavaScript 基础",
      "description": "掌握 JavaScript 基本语法、数据类型、函数和 DOM 操作",
      "estimatedMinutes": 180,
      "priority": "high"
    },
    {
      "title": "算法与数据结构",
      "description": "学习常见算法（排序、查找、图论）和数据结构（数组、链表、树）",
      "estimatedMinutes": 300,
      "priority": "high"
    },
    {
      "title": "完成实战项目",
      "description": "独立完成一个小型的全栈项目，如待办管理或博客系统",
      "estimatedMinutes": 240,
      "priority": "medium"
    }
  ]
}
```

**字段说明**：

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| tasks | array | 是 | AI 生成的子任务列表 |
| tasks[].title | string | 是 | 子任务标题 |
| tasks[].description | string | 是 | 子任务详细描述 |
| tasks[].estimatedMinutes | number | 是 | 预估完成时长（分钟） |
| tasks[].priority | string | 是 | 推荐优先级：high/medium/low |

**错误处理**：

| 情况 | 返回 |
|------|------|
| API Key 未配置 | 返回 mock 数据（3个示例任务） |
| API 调用失败 | 返回空任务数组 `{ tasks: [] }` |

---

## 🚨 通用错误码

| HTTP 状态码 | 含义 | 说明 |
|-------------|------|------|
| 200 | OK | 请求成功 |
| 400 | Bad Request | 请求参数错误 |
| 404 | Not Found | 资源不存在 |
| 500 | Internal Server Error | 服务器内部错误 |

---

## 📝 备注

1. **日期格式**：所有日期时间均使用 ISO 8601 标准格式（`YYYY-MM-DDTHH:mm:ss.sssZ`）
2. **CORS 配置**：已配置允许所有来源访问（开发环境）
3. **Mock 数据**：数据库连接失败时，自动返回 Mock 数据保证功能可用
4. **认证状态**：当前版本认证功能未完全实现，部分接口无需认证即可访问

---

*文档版本：v4.0.0*
*最后更新：2026-05-06*
