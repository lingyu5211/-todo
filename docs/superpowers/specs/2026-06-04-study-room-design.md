# 百人自习室功能设计

## 概述

在现有 Todo Schedule App 基础上新增多人在线自习室功能，支持多房间、实时聊天、学习状态广播、排行榜。

## 需求摘要

- 多房间模式（用户可创建/加入不同主题房间，每房间上限 100 人）
- 实时聊天（文字消息秒级送达）+ 系统通知
- 在线成员列表 + 学习状态实时显示（学习中 / 休息中 / 空闲）
- 与现有专注计时（FocusSession）打通：自习室开始学习 = 创建计时记录
- 排行榜（日/周/月），基于专注时长聚合

## 技术决策

| 决策 | 选择 | 理由 |
|------|------|------|
| 实时通信 | Socket.io | 与 Express 无缝集成，浏览器兼容性最好 |
| 房间状态 | 进程内存 Map | 百人级别无需 Redis，服务重启可接受 |
| 聊天存储 | MySQL（messages 表） | 数据量可控，减少技术栈复杂度 |
| 部署 | 单机 VPS + Nginx + pm2 | 预算可控，学习价值高 |

## 架构

```
客户端 (Vue 3)
  ├─ REST API (HTTPS)     →  创建/加入房间、获取排行榜、用户信息
  └─ WebSocket (WSS)      →  实时聊天、在线状态、学习状态广播

Nginx (:443)
  ├─ /api/*       →  Express (:3000)
  └─ /socket.io/* →  Express (:3000)

Express + Socket.io (同一进程，端口 3000)
  ├─ REST 路由 (不变)
  ├─ Socket.io 事件处理
  └─ 房间状态管理 (内存 Map)
        ↓
     MySQL
```

关键：Socket.io 和 Express 共用同一端口，Nginx 根据路径升级 WebSocket 连接。

## 数据库新增表

### rooms

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | — |
| name | VARCHAR(50) NOT NULL | 房间名称 |
| description | VARCHAR(200) | 房间简介 |
| topic | VARCHAR(30) NOT NULL | 主题标签（考研/雅思/考公/自习） |
| max_members | INT DEFAULT 100 | 人数上限 |
| creator_id | INT NOT NULL | 创建者，FK → users.id |
| is_public | BOOLEAN DEFAULT TRUE | 是否公开 |
| created_at | DATETIME DEFAULT NOW() | — |

### room_members

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | — |
| room_id | INT NOT NULL | FK → rooms.id |
| user_id | INT NOT NULL | FK → users.id |
| is_online | BOOLEAN DEFAULT FALSE | 当前 WebSocket 连接状态 |
| study_status | ENUM('idle','studying','resting') DEFAULT 'idle' | — |
| joined_at | DATETIME DEFAULT NOW() | — |

唯一约束：(room_id, user_id)

### messages

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INT PK AUTO_INCREMENT | — |
| room_id | INT NOT NULL | FK → rooms.id |
| user_id | INT NOT NULL | FK → users.id |
| content | TEXT NOT NULL | — |
| type | ENUM('text','system') DEFAULT 'text' | 系统通知 vs 用户消息 |
| created_at | DATETIME DEFAULT NOW() | — |

索引：(room_id, created_at) 联合索引，用于按房间翻页拉取历史消息。

## WebSocket 事件协议

### 客户端 → 服务端

| 事件 | 参数 | 说明 |
|------|------|------|
| `room:join` | `{ roomId }` | 进入房间 |
| `room:leave` | `{ roomId }` | 离开房间 |
| `study:start` | — | 开始学习（同时调 REST 创建 focus_session） |
| `study:stop` | — | 结束学习（同时调 REST 结束 focus_session） |
| `chat:send` | `{ content }` | 发送消息 |

### 服务端 → 客户端

| 事件 | 数据 | 说明 |
|------|------|------|
| `room:member_joined` | `{ userId, username, studyStatus }` | 有人进入房间 |
| `room:member_left` | `{ userId }` | 有人离开 |
| `room:member_status` | `{ userId, studyStatus }` | 学习状态变化 |
| `chat:message` | `{ id, userId, username, content, type, createdAt }` | 新消息（广播给房间内所有人） |
| `room:members` | `[{ userId, username, isOnline, studyStatus }]` | 加入时收到全量成员列表 |

### 认证

WebSocket 连接时携带 JWT token 作为查询参数：

```
socket = io(SERVER_URL, {
  path: '/socket.io',
  auth: { token: jwtToken }
})
```

服务端在 `io.use()` 中间件中验证 token，拒绝未认证连接。

### 与专注计时的联动

```
用户点击"开始学习"
  ├─ REST: POST /api/focus-sessions   → 创建计时记录
  └─ WS:   emit study:start           → 广播给房间所有人

计时结束或手动停止
  ├─ REST: PATCH /api/focus-sessions/:id → 更新结束时间
  └─ WS:   emit study:stop              → 广播状态变更
```

计时数据以 REST 为准，WebSocket 只管状态广播。断线重连不影响计时数据完整性。

## 服务端房间管理

```js
// 进程内存结构
const rooms = new Map(); // roomId → Map<socketId, { userId, username, avatar }>
```

- 用户连接时加入对应 roomId 的 Map
- 断线时从 Map 移除，更新 DB `is_online = false`，广播离开事件
- 重连时重新加入，广播进入事件
- 服务重启后 Map 清空，用户重连即可恢复（DB 中 is_online 全量重置为 false）

## 新增 REST API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/rooms | 获取公开房间列表，支持 ?topic=xxx 筛选 |
| POST | /api/rooms | 创建房间 |
| GET | /api/rooms/:id | 房间详情 + 成员列表 |
| POST | /api/rooms/:id/join | 加入房间 |
| POST | /api/rooms/:id/leave | 离开房间 |
| GET | /api/rooms/:id/messages | 分页获取历史消息 |
| GET | /api/leaderboard | 排行榜，支持 ?period=day\|week\|month |

排行榜 SQL（从现有 focus_sessions 聚合）：

```sql
SELECT user_id, SUM(duration) AS total_minutes
FROM focus_sessions
WHERE status = 'completed'
  AND created_at >= :period_start
GROUP BY user_id
ORDER BY total_minutes DESC
LIMIT 100
```

## 前端组件

### 新增文件

```
src/
├─ views/
│   ├─ StudyRoomList.vue   ← 房间列表页
│   ├─ StudyRoom.vue       ← 房间主容器（Socket.io 生命周期管理）
│   └─ Leaderboard.vue     ← 排行榜页
├─ components/
│   ├─ MemberPanel.vue     ← 成员列表 + 状态标签
│   ├─ ChatPanel.vue       ← 聊天消息 + 输入框
│   ├─ RoomHeader.vue      ← 房间信息 + 在线人数
│   └─ StudyTimer.vue      ← 学习计时器（调用现有 focus-sessions API）
└─ composables/
    └─ useSocket.ts        ← Socket.io 连接管理 composable
```

### 依赖新增

```json
// 前端
{ "socket.io-client": "^4.x" }

// 后端
{ "socket.io": "^4.x" }
```

### 路由

```
/study-rooms          → StudyRoomList.vue
/study-rooms/:id      → StudyRoom.vue
/leaderboard          → Leaderboard.vue
```

BottomNav 新增"自习室"tab，图标用读书/书本类图标。

### 组件职责

| 组件 | 职责 | 通信方式 |
|------|------|----------|
| StudyRoomList | 房间列表、主题筛选、创建房间弹窗 | REST |
| StudyRoom | 初始化/销毁 Socket.io，管理房间生命周期 | REST + WS |
| MemberPanel | 在线成员列表，学习状态标签（🟢学习中 / 🟡休息 / ⚪空闲） | WS |
| ChatPanel | 消息列表（自动滚底）、发送消息、系统通知样式区分 | WS |
| RoomHeader | 房间名、主题标签、在线人数、退出按钮 | REST |
| StudyTimer | 计时器 UI + 开始/暂停按钮，调用 focus-sessions API | REST → WS |
| Leaderboard | 日/周/月切换 tab，ECharts 柱状图 + 排名列表 | REST（定时刷新） |

## 部署

### 环境要求

- 云服务器：2 核 4G，Ubuntu 22.04 / CentOS 8
- Node.js 18+
- MySQL 8.0
- Nginx 1.24+
- 已备案域名 + SSL 证书（Let's Encrypt）

### Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    # WebSocket 升级
    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # REST API
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # 前端静态文件
    location / {
        root /var/www/todo-app/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

### 进程管理

```bash
pm2 start dist/index.js --name todo-backend
pm2 save
pm2 startup
```

### 环境变量

```
DB_HOST=127.0.0.1
DB_USER=xxx
DB_PASSWORD=xxx
DB_NAME=todo_app
JWT_SECRET=xxx
DEEPSEEK_API_KEY=xxx
PORT=3000
```

### 前端环境切换

```ts
// composables/useSocket.ts
const SOCKET_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : 'https://your-domain.com'
```

## 风险与约束

| 风险 | 缓解措施 |
|------|----------|
| 单点故障 | pm2 自动重启 + MySQL 数据持久化，聊天消息不丢 |
| 百人并发压力 | Node.js 单进程轻松扛千级 WS 连接；Nginx 做连接缓冲 |
| WebSocket 断线 | 前端自动重连（Socket.io 内置），重连后服务端下发全量成员列表 |
| 恶意消息 | 前端限制发送频率（1条/秒），后端做内容长度校验（≤500字） |
| 房间内存泄漏 | 定期清理超过 24 小时无成员的房间（定时任务） |

## 实施阶段

| 阶段 | 内容 | 预估工作量 |
|------|------|------------|
| 1 | 后端：新增数据库迁移 + rooms/messages REST API + WebSocket 服务 | 1 天 |
| 2 | 前端：StudyRoomList + StudyRoom + 子组件 + Socket.io 集成 | 1 天 |
| 3 | 排行榜页面（前端 + 后端聚合查询） | 半天 |
| 4 | 部署：服务器购买、Nginx 配置、SSL、上线测试 | 半天 |
