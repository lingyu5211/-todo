# Study Room Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add multi-room real-time study room feature with chat, presence, and leaderboard to the existing Todo Schedule App.

**Architecture:** Socket.io mounted on existing Express server, room state in memory Map, chat history in MySQL. Frontend uses tab-based navigation (no Vue Router), socket.io-client for real-time, existing REST patterns for CRUD.

**Tech Stack:** TypeScript (backend), Vue 3 + Element Plus (frontend), Socket.io 4.x, Sequelize + MySQL, ECharts (already installed)

---

## Stage 1: Backend Foundation

### Task 1: Install socket.io dependency

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install socket.io**

```bash
cd backend && npm install socket.io
```

- [ ] **Step 2: Install socket.io types (dev)**

```bash
cd backend && npm install --save-dev @types/socket.io
```

Note: If `@types/socket.io` doesn't exist for socket.io v4, skip — socket.io v4 ships its own types.

---

### Task 2: Create Room model

**Files:**
- Create: `backend/src/models/Room.ts`

- [ ] **Step 1: Write Room.ts**

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoomAttributes {
  id: number;
  name: string;
  description: string;
  topic: string;
  maxMembers: number;
  creatorId: number;
  isPublic: boolean;
}

interface RoomCreationAttributes extends Optional<RoomAttributes, 'id'> {}

class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public topic!: string;
  public maxMembers!: number;
  public creatorId!: number;
  public isPublic!: boolean;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Room.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: '',
    },
    topic: {
      type: DataTypes.STRING(30),
      allowNull: false,
      defaultValue: '自习',
    },
    maxMembers: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 100,
    },
    creatorId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isPublic: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
  },
  {
    sequelize,
    tableName: 'rooms',
    timestamps: true,
  }
);

export default Room;
```

- [ ] **Step 2: Compile check**

```bash
cd backend && npx tsc --noEmit
```
Expected: No errors related to Room.ts

---

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/Room.ts backend/package.json backend/package-lock.json
git commit -m "feat: add Room model and socket.io dependency"
```

---

### Task 3: Create RoomMember model

**Files:**
- Create: `backend/src/models/RoomMember.ts`

- [ ] **Step 1: Write RoomMember.ts**

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface RoomMemberAttributes {
  id: number;
  roomId: number;
  userId: number;
  isOnline: boolean;
  studyStatus: 'idle' | 'studying' | 'resting';
}

interface RoomMemberCreationAttributes extends Optional<RoomMemberAttributes, 'id'> {}

class RoomMember extends Model<RoomMemberAttributes, RoomMemberCreationAttributes> implements RoomMemberAttributes {
  public id!: number;
  public roomId!: number;
  public userId!: number;
  public isOnline!: boolean;
  public studyStatus!: 'idle' | 'studying' | 'resting';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

RoomMember.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isOnline: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    studyStatus: {
      type: DataTypes.ENUM('idle', 'studying', 'resting'),
      allowNull: false,
      defaultValue: 'idle',
    },
  },
  {
    sequelize,
    tableName: 'room_members',
    timestamps: true,
    indexes: [
      { unique: true, fields: ['roomId', 'userId'] },
    ],
  }
);

export default RoomMember;
```

- [ ] **Step 2: Compile check**

```bash
cd backend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/RoomMember.ts
git commit -m "feat: add RoomMember model"
```

---

### Task 4: Create Message model

**Files:**
- Create: `backend/src/models/Message.ts`

- [ ] **Step 1: Write Message.ts**

```typescript
import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/db';

interface MessageAttributes {
  id: number;
  roomId: number;
  userId: number;
  content: string;
  type: 'text' | 'system';
}

interface MessageCreationAttributes extends Optional<MessageAttributes, 'id'> {}

class Message extends Model<MessageAttributes, MessageCreationAttributes> implements MessageAttributes {
  public id!: number;
  public roomId!: number;
  public userId!: number;
  public content!: string;
  public type!: 'text' | 'system';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Message.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    roomId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('text', 'system'),
      allowNull: false,
      defaultValue: 'text',
    },
  },
  {
    sequelize,
    tableName: 'messages',
    timestamps: true,
    indexes: [
      { fields: ['roomId', 'createdAt'] },
    ],
  }
);

export default Message;
```

- [ ] **Step 2: Compile check**

```bash
cd backend && npx tsc --noEmit
```

- [ ] **Step 3: Commit**

```bash
git add backend/src/models/Message.ts
git commit -m "feat: add Message model"
```

---

### Task 5: Create rooms REST route

**Files:**
- Create: `backend/src/routes/rooms.ts`
- Modify: `backend/src/index.ts` (import and mount route)

- [ ] **Step 1: Write rooms.ts route**

```typescript
import { Router, Request, Response } from 'express';
import Room from '../models/Room';
import RoomMember from '../models/RoomMember';
import Message from '../models/Message';
import User from '../models/User';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

// GET /api/rooms — list public rooms, optional ?topic= filter
router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { topic } = req.query;
    const where: any = { isPublic: true };
    if (topic) where.topic = topic;

    const rooms = await Room.findAll({ where, order: [['createdAt', 'DESC']] });
    const result = await Promise.all(rooms.map(async (room) => {
      const onlineCount = await RoomMember.count({ where: { roomId: room.id, isOnline: true } });
      return { ...room.toJSON(), onlineCount };
    }));
    res.json(result);
  } catch (error: any) {
    console.error('Error fetching rooms:', error.message);
    res.json([]);
  }
});

// POST /api/rooms — create room
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const { name, description, topic, maxMembers = 100, isPublic = true } = req.body;
    if (!name || !topic) {
      return res.status(400).json({ error: '房间名称和主题不能为空' });
    }
    const room = await Room.create({ name, description: description || '', topic, maxMembers, creatorId: user.id, isPublic } as any);
    await RoomMember.create({ roomId: room.id, userId: user.id, isOnline: false, studyStatus: 'idle' } as any);
    res.status(201).json(room);
  } catch (error: any) {
    console.error('Error creating room:', error.message);
    res.status(500).json({ error: '创建房间失败' });
  }
});

// GET /api/rooms/:id — room detail + members
router.get('/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id, 10);
    const room = await Room.findByPk(id);
    if (!room) return res.status(404).json({ error: '房间不存在' });
    const members = await RoomMember.findAll({ where: { roomId: id } });
    const memberUsers = await Promise.all(members.map(async (m) => {
      const u = await User.findByPk(m.userId);
      return { userId: m.userId, username: u?.username || 'unknown', name: u?.name || '', avatar: u?.avatar || '', isOnline: m.isOnline, studyStatus: m.studyStatus };
    }));
    const onlineCount = members.filter(m => m.isOnline).length;
    res.json({ ...room.toJSON(), onlineCount, members: memberUsers });
  } catch (error: any) {
    console.error('Error fetching room:', error.message);
    res.status(500).json({ error: '获取房间信息失败' });
  }
});

// POST /api/rooms/:id/join
router.post('/:id/join', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const roomId = parseInt(req.params.id, 10);
    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ error: '房间不存在' });
    const count = await RoomMember.count({ where: { roomId } });
    if (count >= room.maxMembers) return res.status(400).json({ error: '房间已满' });
    let member = await RoomMember.findOne({ where: { roomId, userId: user.id } });
    if (!member) {
      member = await RoomMember.create({ roomId, userId: user.id, isOnline: false, studyStatus: 'idle' } as any);
    }
    res.json(member);
  } catch (error: any) {
    console.error('Error joining room:', error.message);
    res.status(500).json({ error: '加入房间失败' });
  }
});

// POST /api/rooms/:id/leave
router.post('/:id/leave', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const roomId = parseInt(req.params.id, 10);
    await RoomMember.update({ isOnline: false, studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
    res.json({ success: true });
  } catch (error: any) {
    console.error('Error leaving room:', error.message);
    res.status(500).json({ error: '离开房间失败' });
  }
});

// GET /api/rooms/:id/messages — paginated history
router.get('/:id/messages', authenticateToken, async (req: Request, res: Response) => {
  try {
    const roomId = parseInt(req.params.id, 10);
    const page = parseInt(req.query.page as string) || 1;
    const limit = 50;
    const offset = (page - 1) * limit;
    const msgs = await Message.findAll({
      where: { roomId },
      order: [['createdAt', 'DESC']],
      limit,
      offset,
    });
    const result = await Promise.all(msgs.map(async (m) => {
      const u = await User.findByPk(m.userId);
      return { id: m.id, userId: m.userId, username: u?.username || 'unknown', name: u?.name || '', avatar: u?.avatar || '', content: m.content, type: m.type, createdAt: m.createdAt };
    }));
    res.json(result.reverse());
  } catch (error: any) {
    console.error('Error fetching messages:', error.message);
    res.json([]);
  }
});

export default router;
```

- [ ] **Step 2: Create middleware file** (if not exists, to share authenticateToken and AuthenticatedRequest)

```bash
# Check if backend/src/middleware/auth.ts exists
ls backend/src/middleware/ 2>/dev/null || echo "NOT FOUND"
```

If middleware/auth.ts does not exist, create `backend/src/middleware/auth.ts`:

```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: { id: number; username: string; role: 'user' | 'admin' };
}

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: '访问被拒绝，需要登录' });
  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.status(403).json({ error: '无效的 token' });
    (req as AuthenticatedRequest).user = user;
    next();
  });
};
```

- [ ] **Step 3: Mount route in index.ts**

In `backend/src/index.ts`, after the existing `app.use(express.json());` line, add:

```typescript
import roomsRouter from './routes/rooms';
// ... existing imports ...

// after app.use(express.json());
app.use('/api/rooms', roomsRouter);
```

- [ ] **Step 4: Compile and verify**

```bash
cd backend && npx tsc --noEmit
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/rooms.ts backend/src/middleware/auth.ts backend/src/index.ts
git commit -m "feat: add rooms REST API routes"
```

---

### Task 6: Create socket.io setup

**Files:**
- Create: `backend/src/socket/index.ts`
- Create: `backend/src/socket/roomManager.ts`
- Modify: `backend/src/index.ts` (integrate socket.io)

- [ ] **Step 1: Write roomManager.ts**

```typescript
// In-memory room state manager
// Key: roomId (number), Value: Map<socketId, { userId, username, name, avatar }>

const rooms = new Map<number, Map<string, { userId: number; username: string; name: string; avatar: string }>>();

export const addUser = (roomId: number, socketId: string, user: { userId: number; username: string; name: string; avatar: string }) => {
  if (!rooms.has(roomId)) rooms.set(roomId, new Map());
  rooms.get(roomId)!.set(socketId, user);
};

export const removeUser = (roomId: number, socketId: string) => {
  const room = rooms.get(roomId);
  if (room) {
    room.delete(socketId);
    if (room.size === 0) rooms.delete(roomId);
  }
};

export const getRoomUsers = (roomId: number) => {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.values());
};

export const getRoomUserCount = (roomId: number) => {
  const room = rooms.get(roomId);
  return room ? room.size : 0;
};

export const getSocketIds = (roomId: number) => {
  const room = rooms.get(roomId);
  return room ? Array.from(room.keys()) : [];
};
```

- [ ] **Step 2: Write socket/index.ts**

```typescript
import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import RoomMember from '../models/RoomMember';
import Message from '../models/Message';
import User from '../models/User';
import { addUser, removeUser, getRoomUsers, getSocketIds } from './roomManager';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const setupSocketIO = (httpServer: HttpServer) => {
  const io = new Server(httpServer, {
    path: '/socket.io',
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Auth middleware
  io.use((socket: Socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    jwt.verify(token as string, JWT_SECRET, (err: any, decoded: any) => {
      if (err) return next(new Error('Invalid token'));
      (socket as any).user = decoded;
      next();
    });
  });

  io.on('connection', (socket: Socket) => {
    const user = (socket as any).user as { id: number; username: string };
    console.log(`User ${user.username} connected via socket ${socket.id}`);

    // Join room
    socket.on('room:join', async ({ roomId }: { roomId: number }) => {
      const dbUser = await User.findByPk(user.id);
      const displayName = dbUser?.name || user.username;
      const avatar = dbUser?.avatar || '';

      addUser(roomId, socket.id, { userId: user.id, username: user.username, name: displayName, avatar });
      socket.join(`room:${roomId}`);

      // Update DB online status
      await RoomMember.update({ isOnline: true }, { where: { roomId, userId: user.id } });
      const member = await RoomMember.findOne({ where: { roomId, userId: user.id } });

      // Broadcast to room
      socket.to(`room:${roomId}`).emit('room:member_joined', {
        userId: user.id,
        username: user.username,
        name: displayName,
        avatar,
        studyStatus: member?.studyStatus || 'idle',
      });

      // Send full member list to joining user
      socket.emit('room:members', getRoomUsers(roomId).map(u => ({
        userId: u.userId,
        username: u.username,
        name: u.name,
        avatar: u.avatar,
        isOnline: true,
        studyStatus: 'idle', // will be updated via separate query if needed
      })));
    });

    // Leave room
    socket.on('room:leave', async ({ roomId }: { roomId: number }) => {
      socket.leave(`room:${roomId}`);
      removeUser(roomId, socket.id);
      await RoomMember.update({ isOnline: false, studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
      io.to(`room:${roomId}`).emit('room:member_left', { userId: user.id });
    });

    // Study status change
    socket.on('study:start', async () => {
      const userRooms = Array.from(socket.rooms).filter(r => r.startsWith('room:'));
      for (const roomName of userRooms) {
        const roomId = parseInt(roomName.split(':')[1], 10);
        await RoomMember.update({ studyStatus: 'studying' }, { where: { roomId, userId: user.id } });
        io.to(roomName).emit('room:member_status', { userId: user.id, studyStatus: 'studying' });
      }
    });

    socket.on('study:stop', async () => {
      const userRooms = Array.from(socket.rooms).filter(r => r.startsWith('room:'));
      for (const roomName of userRooms) {
        const roomId = parseInt(roomName.split(':')[1], 10);
        await RoomMember.update({ studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
        io.to(roomName).emit('room:member_status', { userId: user.id, studyStatus: 'idle' });
      }
    });

    // Chat message
    socket.on('chat:send', async ({ roomId, content }: { roomId: number; content: string }) => {
      if (!content || content.trim().length === 0) return;
      if (content.length > 500) return;

      const dbUser = await User.findByPk(user.id);
      const msg = await Message.create({ roomId, userId: user.id, content: content.trim(), type: 'text' } as any);

      io.to(`room:${roomId}`).emit('chat:message', {
        id: msg.id,
        userId: user.id,
        username: user.username,
        name: dbUser?.name || '',
        avatar: dbUser?.avatar || '',
        content: content.trim(),
        type: 'text',
        createdAt: msg.createdAt,
      });
    });

    // Disconnect
    socket.on('disconnect', async () => {
      console.log(`User ${user.username} disconnected`);
      for (const roomName of socket.rooms) {
        if (roomName.startsWith('room:')) {
          const roomId = parseInt(roomName.split(':')[1], 10);
          removeUser(roomId, socket.id);
          await RoomMember.update({ isOnline: false, studyStatus: 'idle' }, { where: { roomId, userId: user.id } });
          io.to(roomName).emit('room:member_left', { userId: user.id });
        }
      }
    });
  });

  return io;
};
```

- [ ] **Step 3: Modify index.ts to create HTTP server and attach Socket.io**

In `backend/src/index.ts`, replace the `app.listen` block at the bottom:

```typescript
import http from 'http';
import { setupSocketIO } from './socket';

// ... existing code ...

initDatabase().then(() => {
  const server = http.createServer(app);
  setupSocketIO(server);
  server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
```

Also change `const PORT` to use 3000 to match the spec:
```typescript
const PORT = process.env.PORT || 3000;
```

- [ ] **Step 4: Compile check**

```bash
cd backend && npx tsc --noEmit
```

If @types/jsonwebtoken or @types/socket.io missing types, use `any` casts or check actual installed type packages.

- [ ] **Step 5: Commit**

```bash
git add backend/src/socket/ backend/src/index.ts
git commit -m "feat: add Socket.io real-time server with room management"
```

---

### Task 7: Create leaderboard REST route

**Files:**
- Create: `backend/src/routes/leaderboard.ts`
- Modify: `backend/src/index.ts` (mount route)

- [ ] **Step 1: Write leaderboard.ts**

```typescript
import { Router, Request, Response } from 'express';
import { Op } from 'sequelize';
import FocusSession from '../models/FocusSession';
import User from '../models/User';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const period = (req.query.period as string) || 'week';
    let startDate: Date;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'week':
      default:
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        startDate = new Date(now.getFullYear(), now.getMonth(), diff);
        break;
    }

    // Aggregate focus duration per user
    const sessions = await FocusSession.findAll({
      where: {
        createdAt: { [Op.gte]: startDate },
      },
      attributes: ['userId'],
    });

    const userMinutes: Record<number, number> = {};
    for (const s of sessions) {
      const uid = s.userId!;
      userMinutes[uid] = (userMinutes[uid] || 0) + s.duration;
    }

    const ranked = await Promise.all(
      Object.entries(userMinutes)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 100)
        .map(async ([userId, minutes], index) => {
          const u = await User.findByPk(parseInt(userId));
          return {
            rank: index + 1,
            userId: parseInt(userId),
            username: u?.username || 'unknown',
            name: u?.name || '',
            avatar: u?.avatar || '',
            totalMinutes: minutes,
          };
        })
    );

    res.json({ period, startDate: startDate.toISOString(), leaderboard: ranked });
  } catch (error: any) {
    console.error('Error fetching leaderboard:', error.message);
    res.json({ period: 'week', startDate: new Date().toISOString(), leaderboard: [] });
  }
});

export default router;
```

- [ ] **Step 2: Mount in index.ts**

```typescript
import leaderboardRouter from './routes/leaderboard';
// ...
app.use('/api/leaderboard', leaderboardRouter);
```

- [ ] **Step 3: Compile and commit**

```bash
cd backend && npx tsc --noEmit
git add backend/src/routes/leaderboard.ts backend/src/index.ts
git commit -m "feat: add leaderboard API"
```

---

### Task 8: Install socket.io-client in frontend

**Files:**
- Modify: `package.json` (project root)

- [ ] **Step 1: Install socket.io-client**

```bash
npm install socket.io-client
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add socket.io-client frontend dependency"
```

---

## Stage 2: Frontend Components

### Task 9: Create useSocket composable

**Files:**
- Create: `src/composables/useSocket.ts`

- [ ] **Step 1: Write useSocket.ts**

```typescript
import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://your-domain.com';

export function useSocket() {
  const socket = ref<Socket | null>(null);
  const connected = ref(false);

  const connect = () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const url = import.meta.env.DEV ? DEV_URL : PROD_URL;
    socket.value = io(url, {
      path: '/socket.io',
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: Infinity,
    });

    socket.value.on('connect', () => { connected.value = true; });
    socket.value.on('disconnect', () => { connected.value = false; });
  };

  const disconnect = () => {
    socket.value?.disconnect();
    socket.value = null;
    connected.value = false;
  };

  const emit = (event: string, data?: any) => {
    socket.value?.emit(event, data);
  };

  const on = (event: string, handler: (...args: any[]) => void) => {
    socket.value?.on(event, handler);
  };

  const off = (event: string, handler?: (...args: any[]) => void) => {
    socket.value?.off(event, handler);
  };

  onUnmounted(() => {
    disconnect();
  });

  return { socket, connected, connect, disconnect, emit, on, off };
}
```

- [ ] **Step 2: Verify TypeScript compilation**

```bash
npx vue-tsc --noEmit 2>&1 | head -20
```
May show pre-existing errors unrelated to new code — only check for errors mentioning `useSocket.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useSocket.ts
git commit -m "feat: add useSocket composable for WebSocket management"
```

---

### Task 10: Add study room types

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Append to src/types/index.ts**

```typescript
export interface Room {
  id: number;
  name: string;
  description: string;
  topic: string;
  maxMembers: number;
  creatorId: number;
  isPublic: boolean;
  onlineCount: number;
  createdAt: string;
}

export interface RoomMember {
  userId: number;
  username: string;
  name: string;
  avatar: string;
  isOnline: boolean;
  studyStatus: 'idle' | 'studying' | 'resting';
}

export interface ChatMessage {
  id: number;
  userId: number;
  username: string;
  name: string;
  avatar: string;
  content: string;
  type: 'text' | 'system';
  createdAt: string;
}

export interface LeaderboardEntry {
  rank: number;
  userId: number;
  username: string;
  name: string;
  avatar: string;
  totalMinutes: number;
}

export interface LeaderboardData {
  period: 'day' | 'week' | 'month';
  startDate: string;
  leaderboard: LeaderboardEntry[];
}
```

Also update TabName to include 'studyRoom':
```typescript
export type TabName = 'todo' | 'todoSet' | 'lock' | 'stats' | 'studyRoom' | 'profile';
```

- [ ] **Step 2: Commit**

```bash
git add src/types/index.ts
git commit -m "feat: add study room TypeScript types"
```

---

### Task 11: Add REST API functions for rooms and leaderboard

**Files:**
- Modify: `src/utils/api.ts`

- [ ] **Step 1: Append to api.ts**

```typescript
import type { Room, ChatMessage, LeaderboardData } from '@/types';

// --- Rooms ---

export const getRooms = async (topic?: string): Promise<Room[]> => {
  const url = topic ? `${API_BASE_URL}/rooms?topic=${encodeURIComponent(topic)}` : `${API_BASE_URL}/rooms`;
  const response = await fetch(url, { headers: { ...getAuthHeader() } });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const createRoom = async (data: { name: string; description?: string; topic: string; maxMembers?: number }): Promise<Room> => {
  const response = await fetch(`${API_BASE_URL}/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '创建房间失败');
  }
  return response.json();
};

export const getRoomDetail = async (id: number): Promise<Room & { members: any[] }> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
};

export const joinRoom = async (id: number): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}/join`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '加入房间失败');
  }
};

export const leaveRoom = async (id: number): Promise<void> => {
  await fetch(`${API_BASE_URL}/rooms/${id}/leave`, {
    method: 'POST',
    headers: { ...getAuthHeader() },
  });
};

export const getRoomMessages = async (roomId: number, page: number = 1): Promise<ChatMessage[]> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/messages?page=${page}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) return [];
  return response.json();
};

// --- Leaderboard ---

export const getLeaderboard = async (period: 'day' | 'week' | 'month' = 'week'): Promise<LeaderboardData> => {
  const response = await fetch(`${API_BASE_URL}/leaderboard?period=${period}`, {
    headers: { ...getAuthHeader() },
  });
  if (!response.ok) return { period: 'week', startDate: '', leaderboard: [] };
  return response.json();
};
```

Note: `API_BASE_URL` should be updated to port 3000 to match the backend:
```typescript
const API_BASE_URL = 'http://localhost:3000/api';
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/api.ts
git commit -m "feat: add rooms and leaderboard API functions"
```

---

### Task 12: Create StudyRoomList view

**Files:**
- Create: `src/views/StudyRoomList.vue`
- Modify: `src/App.vue` (add import and conditional render)
- Modify: `src/components/BottomNav.vue` (add study room tab)

- [ ] **Step 1: Write StudyRoomList.vue**

```vue
<template>
  <div class="study-room-list">
    <div class="page-header">
      <h2>自习室</h2>
      <el-button type="primary" size="small" @click="showCreateDialog = true">创建房间</el-button>
    </div>

    <div class="topic-filter">
      <el-tag
        v-for="t in topics"
        :key="t"
        :type="selectedTopic === t ? 'primary' : 'info'"
        class="topic-tag"
        @click="selectedTopic = selectedTopic === t ? '' : t"
      >
        {{ t }}
      </el-tag>
    </div>

    <div v-if="loading" class="loading-text">加载中...</div>

    <div v-else-if="filteredRooms.length === 0" class="empty-text">
      暂无房间，点击"创建房间"来创建第一个吧
    </div>

    <div v-else class="room-grid">
      <div
        v-for="room in filteredRooms"
        :key="room.id"
        class="room-card"
        @click="enterRoom(room.id)"
      >
        <div class="room-name">{{ room.name }}</div>
        <div class="room-topic">
          <el-tag size="small">{{ room.topic }}</el-tag>
        </div>
        <div class="room-desc" v-if="room.description">{{ room.description }}</div>
        <div class="room-footer">
          <span class="room-count">🟢 {{ room.onlineCount }}人在线</span>
          <span class="room-max">/ {{ room.maxMembers }}</span>
        </div>
      </div>
    </div>

    <!-- Create room dialog -->
    <el-dialog v-model="showCreateDialog" title="创建自习室" width="90%">
      <el-form :model="form" label-position="top">
        <el-form-item label="房间名称">
          <el-input v-model="form.name" maxlength="20" placeholder="给房间起个名字" />
        </el-form-item>
        <el-form-item label="主题">
          <el-select v-model="form.topic" placeholder="选择主题" style="width: 100%">
            <el-option v-for="t in topics" :key="t" :label="t" :value="t" />
          </el-select>
        </el-form-item>
        <el-form-item label="简介（可选）">
          <el-input v-model="form.description" type="textarea" maxlength="100" placeholder="简单介绍一下" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateDialog = false">取消</el-button>
        <el-button type="primary" @click="createRoom" :disabled="!form.name || !form.topic">创建</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRooms, createRoom as apiCreateRoom } from '@/utils/api'
import type { Room } from '@/types'

const emit = defineEmits<{ (e: 'enterRoom', roomId: number): void }>()

const topics = ['考研', '考公', '雅思', '托福', '自习', '阅读', '编程', '其他']
const rooms = ref<Room[]>([])
const loading = ref(false)
const selectedTopic = ref('')
const showCreateDialog = ref(false)
const form = ref({ name: '', topic: '', description: '' })

const filteredRooms = computed(() => {
  if (!selectedTopic.value) return rooms.value
  return rooms.value.filter(r => r.topic === selectedTopic.value)
})

const loadRooms = async () => {
  loading.value = true
  try {
    rooms.value = await getRooms()
  } catch (e) {
    ElMessage.error('加载房间列表失败')
  } finally {
    loading.value = false
  }
}

const createRoom = async () => {
  try {
    const room = await apiCreateRoom({ name: form.value.name, topic: form.value.topic, description: form.value.description })
    showCreateDialog.value = false
    form.value = { name: '', topic: '', description: '' }
    ElMessage.success('房间创建成功')
    emit('enterRoom', room.id)
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  }
}

const enterRoom = (roomId: number) => {
  emit('enterRoom', roomId)
}

onMounted(() => {
  loadRooms()
})
</script>

<style scoped>
.study-room-list {
  padding: 16px;
}
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.page-header h2 {
  font-size: 20px;
  color: #303133;
}
.topic-filter {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}
.topic-tag {
  cursor: pointer;
}
.room-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.room-card {
  background: white;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.08);
  cursor: pointer;
  transition: transform 0.15s;
}
.room-card:active {
  transform: scale(0.98);
}
.room-name {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}
.room-topic {
  margin-top: 6px;
}
.room-desc {
  margin-top: 6px;
  font-size: 13px;
  color: #909399;
}
.room-footer {
  margin-top: 10px;
  font-size: 13px;
  color: #606266;
}
.room-count {
  color: #67C23A;
}
.loading-text, .empty-text {
  text-align: center;
  color: #909399;
  margin-top: 40px;
}
</style>
```

- [ ] **Step 2: Modify BottomNav.vue to add study room tab**

Add to the `navItems` array:

```typescript
import { List, FolderOpened, Lock, PieChart, User, Reading } from '@element-plus/icons-vue'
```

And add the item before profile:
```typescript
{ name: 'studyRoom', icon: Reading, label: '自习室' },
```

- [ ] **Step 3: Modify App.vue to handle study room tab**

In the template add:
```html
<StudyRoomList v-if="activeTab === 'studyRoom'" @enter-room="handleEnterStudyRoom" />
```

In the script add:
```typescript
import StudyRoomList from './views/StudyRoomList.vue'

const currentRoomId = ref<number | null>(null)

const handleEnterStudyRoom = (roomId: number) => {
  currentRoomId.value = roomId
  activeTab.value = 'studyRoomDetail'
}
```

Also add `'studyRoomDetail'` to the TabName type later when StudyRoom view is created.

- [ ] **Step 4: Commit**

```bash
git add src/views/StudyRoomList.vue src/App.vue src/components/BottomNav.vue
git commit -m "feat: add StudyRoomList view with room creation"
```

---

### Task 13: Create StudyRoom view (main room container)

**Files:**
- Create: `src/views/StudyRoom.vue`
- Create: `src/components/RoomHeader.vue`
- Create: `src/components/MemberPanel.vue`
- Create: `src/components/ChatPanel.vue`
- Create: `src/components/StudyTimer.vue`
- Modify: `src/App.vue` (integrate StudyRoom)

- [ ] **Step 1: Write RoomHeader.vue**

```vue
<template>
  <div class="room-header">
    <el-button :icon="'ArrowLeft'" circle size="small" @click="$emit('leave')" />
    <div class="header-info">
      <div class="header-name">{{ room?.name || '加载中...' }}</div>
      <div class="header-meta">
        <el-tag size="small">{{ room?.topic }}</el-tag>
        <span class="online-badge">🟢 {{ room?.onlineCount || 0 }}人在线</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Room } from '@/types'

defineProps<{ room: Room | null }>()
defineEmits<{ (e: 'leave'): void }>()
</script>

<style scoped>
.room-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-bottom: 1px solid #eee;
}
.header-name {
  font-size: 16px;
  font-weight: 600;
}
.header-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.online-badge {
  font-size: 12px;
  color: #67C23A;
}
</style>
```

- [ ] **Step 2: Write MemberPanel.vue**

```vue
<template>
  <div class="member-panel">
    <div class="panel-title">在线成员 ({{ onlineMembers.length }})</div>
    <div class="member-list">
      <div v-for="m in sortedMembers" :key="m.userId" class="member-item">
        <span class="member-avatar">{{ m.avatar || '👤' }}</span>
        <span class="member-name">{{ m.name || m.username }}</span>
        <span class="member-status" :class="statusClass(m.studyStatus)">
          {{ statusLabel(m.studyStatus) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RoomMember } from '@/types'

const props = defineProps<{ members: RoomMember[] }>()

const onlineMembers = computed(() => props.members.filter(m => m.isOnline))
const sortedMembers = computed(() =>
  [...onlineMembers.value].sort((a, b) => {
    const order = { studying: 0, idle: 1, resting: 2 } as Record<string, number>
    return (order[a.studyStatus] ?? 1) - (order[b.studyStatus] ?? 1)
  })
)

const statusLabel = (s: string) => ({ studying: '学习中', resting: '休息中', idle: '空闲' }[s] || s)
const statusClass = (s: string) => ({ studying: 'status-studying', resting: 'status-resting', idle: 'status-idle' }[s] || '')
</script>

<style scoped>
.member-panel {
  background: white;
  border-radius: 12px;
  padding: 12px;
  margin-bottom: 12px;
}
.panel-title {
  font-size: 14px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}
.member-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.member-item {
  display: flex;
  align-items: center;
  gap: 4px;
  background: #f5f7fa;
  border-radius: 20px;
  padding: 4px 10px 4px 6px;
  font-size: 12px;
}
.member-avatar { font-size: 16px; }
.member-name { color: #303133; }
.member-status { font-weight: 500; }
.status-studying { color: #67C23A; }
.status-resting { color: #E6A23C; }
.status-idle { color: #909399; }
</style>
```

- [ ] **Step 3: Write ChatPanel.vue**

```vue
<template>
  <div class="chat-panel">
    <div class="message-list" ref="msgListRef">
      <div v-for="msg in messages" :key="msg.id" class="message" :class="{ 'is-system': msg.type === 'system' }">
        <template v-if="msg.type === 'system'">
          <span class="system-text">{{ msg.content }}</span>
        </template>
        <template v-else>
          <span class="msg-sender">{{ msg.name || msg.username }}: </span>
          <span class="msg-content">{{ msg.content }}</span>
        </template>
      </div>
      <div v-if="messages.length === 0" class="empty-chat">暂无消息，来打个招呼吧</div>
    </div>
    <div class="input-bar">
      <el-input
        v-model="inputText"
        placeholder="说点什么..."
        maxlength="500"
        show-word-limit
        @keyup.enter="send"
      >
        <template #append>
          <el-button :disabled="!inputText.trim()" @click="send">发送</el-button>
        </template>
      </el-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'
import type { ChatMessage } from '@/types'

const props = defineProps<{ messages: ChatMessage[] }>()
const emit = defineEmits<{ (e: 'send', content: string): void }>()

const inputText = ref('')
const msgListRef = ref<HTMLElement | null>(null)

const send = () => {
  const text = inputText.value.trim()
  if (!text) return
  emit('send', text)
  inputText.value = ''
}

watch(() => props.messages.length, async () => {
  await nextTick()
  if (msgListRef.value) {
    msgListRef.value.scrollTop = msgListRef.value.scrollHeight
  }
})
</script>

<style scoped>
.chat-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
  border-radius: 12px;
  overflow: hidden;
}
.message-list {
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  max-height: 300px;
}
.message {
  margin-bottom: 8px;
  font-size: 13px;
  line-height: 1.5;
}
.message.is-system {
  text-align: center;
}
.system-text {
  color: #909399;
  font-size: 12px;
}
.msg-sender {
  color: #409EFF;
  font-weight: 500;
}
.msg-content {
  color: #303133;
}
.empty-chat {
  text-align: center;
  color: #C0C4CC;
  margin-top: 40px;
}
.input-bar {
  padding: 8px;
  border-top: 1px solid #eee;
}
</style>
```

- [ ] **Step 4: Write StudyTimer.vue**

```vue
<template>
  <div class="study-timer">
    <div class="timer-display">
      <span class="timer-label">{{ isStudying ? '专注中' : '准备开始' }}</span>
    </div>
    <el-button
      :type="isStudying ? 'warning' : 'success'"
      size="large"
      round
      @click="toggleStudy"
      style="width: 100%"
    >
      {{ isStudying ? '结束学习' : '开始学习' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createFocusSession } from '@/utils/api'

const emit = defineEmits<{
  (e: 'studyStart'): void
  (e: 'studyStop'): void
}>()

const isStudying = ref(false)
let sessionId: number | null = null
let startTimeStr = ''

const toggleStudy = async () => {
  if (isStudying.value) {
    // Stop studying
    isStudying.value = false
    emit('studyStop')
    ElMessage.success('学习结束')
  } else {
    // Start studying
    const now = new Date()
    startTimeStr = now.toTimeString().slice(0, 8)
    const dateStr = now.toISOString().slice(0, 10)
    try {
      const session = await createFocusSession({
        duration: 0,
        date: dateStr,
        startTime: startTimeStr,
        endTime: startTimeStr,
        todoId: undefined,
      })
      sessionId = session.id
    } catch {
      // Non-critical — focus session creation can fail, status broadcast still works
    }
    isStudying.value = true
    emit('studyStart')
    ElMessage.success('开始学习')
  }
}

// Update end time when stopping
const updateEndTime = async () => {
  if (!sessionId) return
  const now = new Date()
  const endTime = now.toTimeString().slice(0, 8)
  try {
    await fetch(`http://localhost:3000/api/focus-sessions/${sessionId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ endTime }),
    })
  } catch { /* non-critical */ }
  sessionId = null
}
</script>

<style scoped>
.study-timer {
  padding: 16px 0;
  text-align: center;
}
.timer-display {
  margin-bottom: 16px;
}
.timer-label {
  font-size: 24px;
  font-weight: 700;
  color: #303133;
}
</style>
```

- [ ] **Step 5: Write StudyRoom.vue (main container)**

```vue
<template>
  <div class="study-room-container">
    <RoomHeader :room="room" @leave="handleLeave" />
    <div class="room-body">
      <MemberPanel :members="members" />
      <StudyTimer @study-start="onStudyStart" @study-stop="onStudyStop" />
      <ChatPanel :messages="chatMessages" @send="sendMessage" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import RoomHeader from '@/components/RoomHeader.vue'
import MemberPanel from '@/components/MemberPanel.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import StudyTimer from '@/components/StudyTimer.vue'
import { useSocket } from '@/composables/useSocket'
import { getRoomDetail, joinRoom, leaveRoom, getRoomMessages } from '@/utils/api'
import type { Room, RoomMember, ChatMessage } from '@/types'

const props = defineProps<{ roomId: number }>()
const emit = defineEmits<{ (e: 'back'): void }>()

const { connect, disconnect, emit, on, off } = useSocket()
const room = ref<Room | null>(null)
const members = ref<RoomMember[]>([])
const chatMessages = ref<ChatMessage[]>([])

const handleLeave = async () => {
  emit('room:leave', { roomId: props.roomId })
  try { await leaveRoom(props.roomId) } catch {}
  disconnect()
  emit('back')
}

const onStudyStart = () => {
  emit('study:start')
}

const onStudyStop = () => {
  emit('study:stop')
}

const sendMessage = (content: string) => {
  emit('chat:send', { roomId: props.roomId, content })
}

const loadRoom = async () => {
  try {
    const detail = await getRoomDetail(props.roomId)
    room.value = detail
    members.value = detail.members || []
  } catch {
    ElMessage.error('加载房间信息失败')
  }
  try {
    const msgs = await getRoomMessages(props.roomId, 1)
    chatMessages.value = msgs
  } catch {}
}

const setupSocket = () => {
  connect()
  setTimeout(() => {
    emit('room:join', { roomId: props.roomId })
  }, 500) // wait for connection

  on('room:members', (data: any[]) => {
    members.value = data
  })

  on('room:member_joined', (data: any) => {
    const exists = members.value.find(m => m.userId === data.userId)
    if (!exists) {
      members.value.push({ ...data, isOnline: true })
    } else {
      exists.isOnline = true
      exists.studyStatus = data.studyStatus
    }
  })

  on('room:member_left', ({ userId }: { userId: number }) => {
    const m = members.value.find(x => x.userId === userId)
    if (m) m.isOnline = false
  })

  on('room:member_status', ({ userId, studyStatus }: { userId: number; studyStatus: string }) => {
    const m = members.value.find(x => x.userId === userId)
    if (m) m.studyStatus = studyStatus as any
  })

  on('chat:message', (msg: ChatMessage) => {
    chatMessages.value.push(msg)
  })
}

onMounted(async () => {
  try { await joinRoom(props.roomId) } catch {}
  await loadRoom()
  setupSocket()
})

onUnmounted(() => {
  emit('room:leave', { roomId: props.roomId })
  try { leaveRoom(props.roomId) } catch {}
  disconnect()
})
</script>

<style scoped>
.study-room-container {
  min-height: 100vh;
  background: #f5f5f5;
}
.room-body {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
```

- [ ] **Step 6: Update App.vue to integrate StudyRoom**

In `App.vue`, add the import and conditional render:
```typescript
import StudyRoom from './views/StudyRoom.vue'
```

```html
<StudyRoom
  v-if="activeTab === 'studyRoomDetail' && currentRoomId !== null"
  :room-id="currentRoomId"
  @back="activeTab = 'studyRoom'"
/>
```

Also add `'studyRoomDetail'` to the TabName type in `src/types/index.ts`.

- [ ] **Step 7: Commit**

```bash
git add src/views/StudyRoom.vue src/components/RoomHeader.vue src/components/MemberPanel.vue src/components/ChatPanel.vue src/components/StudyTimer.vue src/App.vue src/types/index.ts
git commit -m "feat: add StudyRoom view with real-time chat and member presence"
```

---

### Task 14: Create Leaderboard view

**Files:**
- Create: `src/views/Leaderboard.vue`
- Modify: `src/App.vue` (add tab handling)
- Modify: `src/components/BottomNav.vue` (optional — can access from stats or profile)

- [ ] **Step 1: Write Leaderboard.vue**

```vue
<template>
  <div class="leaderboard-page">
    <div class="page-header">
      <h2>学习排行榜</h2>
    </div>

    <div class="period-tabs">
      <el-radio-group v-model="period" @change="loadData">
        <el-radio-button value="day">今日</el-radio-button>
        <el-radio-button value="week">本周</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="loading" class="loading-text">加载中...</div>

    <div v-else-if="leaderboard.length === 0" class="empty-text">
      暂无数据，快去自习室开始学习吧
    </div>

    <div v-else class="rank-list">
      <div
        v-for="entry in leaderboard"
        :key="entry.userId"
        class="rank-item"
        :class="{ 'top-three': entry.rank <= 3 }"
      >
        <span class="rank-number" :class="rankClass(entry.rank)">
          {{ entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank }}
        </span>
        <span class="rank-avatar">{{ entry.avatar || '👤' }}</span>
        <span class="rank-name">{{ entry.name || entry.username }}</span>
        <span class="rank-minutes">{{ formatMinutes(entry.totalMinutes) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLeaderboard } from '@/utils/api'
import type { LeaderboardEntry } from '@/types'

const period = ref<'day' | 'week' | 'month'>('week')
const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const data = await getLeaderboard(period.value)
    leaderboard.value = data.leaderboard
  } catch {
    leaderboard.value = []
  } finally {
    loading.value = false
  }
}

const rankClass = (rank: number) => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return ''
}

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

onMounted(() => { loadData() })
</script>

<style scoped>
.leaderboard-page {
  padding: 16px;
}
.page-header h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 16px;
}
.period-tabs {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.rank-item.top-three {
  background: linear-gradient(135deg, #fff9e6, #fff);
}
.rank-number {
  font-size: 20px;
  width: 32px;
  text-align: center;
  font-weight: 700;
  color: #909399;
}
.rank-gold { color: #E6A23C; }
.rank-silver { color: #909399; }
.rank-bronze { color: #CD853F; }
.rank-avatar { font-size: 24px; }
.rank-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
.rank-minutes {
  font-size: 13px;
  color: #409EFF;
  font-weight: 600;
}
.loading-text, .empty-text {
  text-align: center;
  color: #909399;
  margin-top: 40px;
}
</style>
```

- [ ] **Step 2: Wire into App.vue**

Since Leaderboard is a standalone page, add it to App.vue:
```html
<Leaderboard v-if="activeTab === 'leaderboard'" />
```

```typescript
import Leaderboard from './views/Leaderboard.vue'
```

Optionally add a way to navigate to it — e.g., from the StatsDashboard or from the study room list header. For now, add a temporary button in StudyRoomList header:

In `StudyRoomList.vue`, add to the header:
```html
<el-button size="small" @click="$emit('goLeaderboard')">排行榜</el-button>
```

In `App.vue`, handle:
```html
<StudyRoomList v-if="activeTab === 'studyRoom'" @enter-room="handleEnterStudyRoom" @go-leaderboard="activeTab = 'leaderboard'" />
```

- [ ] **Step 3: Commit**

```bash
git add src/views/Leaderboard.vue src/App.vue src/views/StudyRoomList.vue
git commit -m "feat: add Leaderboard view"
```

---

## Stage 3: Integration & Verification

### Task 15: Build and test the full application

- [ ] **Step 1: Compile backend**

```bash
cd backend && npx tsc && echo "BUILD SUCCESS"
```

- [ ] **Step 2: Start backend**

```bash
cd backend && node dist/index.js &
```
Wait for "Server running on http://localhost:3000"

- [ ] **Step 3: Start frontend dev server**

```bash
npm run dev &
```
Wait for Vite dev server to start.

- [ ] **Step 4: Manual smoke test**

1. Open browser to `http://localhost:5173`
2. Login with `user` / `123456`
3. Click "自习室" tab → should see room list
4. Create a room → should transition to room view
5. See the RoomHeader, MemberPanel, ChatPanel, StudyTimer
6. Send a chat message → should appear in message list
7. Click "开始学习" → should change status
8. Click "排行榜" → should see leaderboard data (may be empty initially)

- [ ] **Step 5: Commit any fixes**

```bash
git add -A && git commit -m "chore: final integration fixes"
```

---

## Stage 4: Deployment Preparation

### Task 16: Build frontend for production

- [ ] **Step 1: Build frontend**

```bash
npm run build
```
Expected: `dist/` directory created with static files.

- [ ] **Step 2: Verify build output**

```bash
ls dist/index.html && echo "BUILD OK"
```

- [ ] **Step 3: Commit**

```bash
# dist is likely in .gitignore — no commit needed
```

---

### Task 17: Create Nginx config template

**Files:**
- Create: `deploy/nginx.conf`

- [ ] **Step 1: Write nginx.conf**

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate     /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;

    location /socket.io/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_read_timeout 86400s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        root /var/www/todo-app/dist;
        try_files $uri $uri/ /index.html;
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add deploy/nginx.conf
git commit -m "docs: add production nginx configuration template"
```

---

## Post-Implementation Checklist

- [ ] Backend compiles without errors (`npx tsc --noEmit`)
- [ ] Frontend builds without errors (`npm run build`)
- [ ] Room creation works via REST API
- [ ] WebSocket connect + join room works
- [ ] Chat messages are sent/received in real-time
- [ ] Study status changes broadcast to room members
- [ ] Leaderboard returns aggregated data
- [ ] User leaves room: status cleared, member removed
- [ ] Disconnect/reconnect: member rejoins correctly
