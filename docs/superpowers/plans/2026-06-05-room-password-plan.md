# Room Password Protection — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add optional password protection to study rooms — creator sets password at creation, room list shows lock icon, non-creator must enter password to join.

**Architecture:** Add `password` VARCHAR(255) column (bcrypt hash) to `rooms` table. Backend handles verification in REST join route. Frontend tries joining without password first; if backend returns 403, shows password dialog. Creator bypass via server-side `creatorId` check.

**Tech Stack:** bcryptjs (backend), Vue 3 + Element Plus (frontend)

---

### Task 1: Install bcryptjs

**Files:**
- Modify: `backend/package.json`

- [ ] **Step 1: Install bcryptjs**

Run:
```bash
cd backend && npm install bcryptjs && npm install -D @types/bcryptjs
```
Expected: packages added to `node_modules` and `package.json`

---

### Task 2: Add password field to Room model

**Files:**
- Modify: `backend/src/models/Room.ts:4-12` (interface), `backend/src/models/Room.ts:16-26` (class), `backend/src/models/Room.ts:28-63` (init)

- [ ] **Step 1: Add `password` to RoomAttributes interface**

```typescript
interface RoomAttributes {
  id: number;
  name: string;
  description: string;
  topic: string;
  maxMembers: number;
  creatorId: number;
  isPublic: boolean;
  password: string | null;
}
```

- [ ] **Step 2: Add `password` to Room class**

```typescript
class Room extends Model<RoomAttributes, RoomCreationAttributes> implements RoomAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public topic!: string;
  public maxMembers!: number;
  public creatorId!: number;
  public isPublic!: boolean;
  public password!: string | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}
```

- [ ] **Step 3: Add `password` to Room.init()**

```typescript
password: {
  type: DataTypes.STRING(255),
  allowNull: true,
  defaultValue: null,
},
```
Place after `isPublic` field (line 62, before the closing `},`).

- [ ] **Step 4: Sync the model to create the new column**

Run:
```bash
cd backend && npx ts-node src/scripts/sync.ts
```
Expected: No errors. Verify with MySQL that `rooms` table has `password` column.

Note: If no sync script exists, Sequelize will add the column on next `sync({ alter: true })` call during server startup.

---

### Task 3: Update backend room routes

**Files:**
- Modify: `backend/src/routes/rooms.ts:1` (import bcrypt), `backend/src/routes/rooms.ts:10-26` (list), `backend/src/routes/rooms.ts:28-42` (create), `backend/src/routes/rooms.ts:62-79` (join)

- [ ] **Step 1: Import bcryptjs**

At top of file, after line 5:
```typescript
import bcrypt from 'bcryptjs';
```

- [ ] **Step 2: Add `hasPassword` to GET /api/rooms**

Replace the map callback in `router.get('/')` (lines 17-20):

```typescript
const result = await Promise.all(rooms.map(async (room) => {
  const onlineCount = await RoomMember.count({ where: { roomId: room.id, isOnline: true } });
  return { ...room.toJSON(), onlineCount, hasPassword: !!room.password };
}));
```

- [ ] **Step 3: Accept and hash password in POST /api/rooms**

Replace the create route (lines 28-42):

```typescript
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const { name, description, topic, maxMembers = 100, isPublic = true, password } = req.body;

    if (!name || !topic) {
      return res.status(400).json({ error: '房间名称和主题不能为空' });
    }

    if (password !== undefined && password !== null && password !== '') {
      if (typeof password !== 'string' || password.length < 4 || password.length > 16) {
        return res.status(400).json({ error: '密码长度需要4-16个字符' });
      }
    }

    const hashedPassword = (password && password !== '') ? bcrypt.hashSync(password, 10) : null;

    const room = await Room.create({
      name, description: description || '', topic, maxMembers,
      creatorId: user.id, isPublic, password: hashedPassword,
    } as any);

    await RoomMember.create({ roomId: room.id, userId: user.id, isOnline: false, studyStatus: 'idle' } as any);
    res.status(201).json(room);
  } catch (error: any) {
    console.error('Error creating room:', error.message);
    res.status(500).json({ error: '创建房间失败' });
  }
});
```

- [ ] **Step 4: Add password verification to POST /api/rooms/:id/join**

Replace the join route (lines 62-79):

```typescript
router.post('/:id/join', authenticateToken, async (req: Request, res: Response) => {
  try {
    const user = (req as AuthenticatedRequest).user!;
    const roomId = parseInt(req.params.id as string, 10);
    const { password } = req.body;

    const room = await Room.findByPk(roomId);
    if (!room) return res.status(404).json({ error: '房间不存在' });

    const isCreator = user.id === room.creatorId;

    if (room.password && !isCreator) {
      if (!password) {
        return res.status(403).json({ error: 'Password required' });
      }
      if (!bcrypt.compareSync(password, room.password)) {
        return res.status(403).json({ error: 'Incorrect password' });
      }
    }

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
```

---

### Task 4: Update frontend Room type

**Files:**
- Modify: `src/types/index.ts:108-118`

- [ ] **Step 1: Add `hasPassword` to Room interface**

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
  hasPassword: boolean;
  createdAt: string;
}
```

---

### Task 5: Update frontend API functions

**Files:**
- Modify: `src/utils/api.ts:484-495` (createRoom), `src/utils/api.ts:505-514` (joinRoom)

- [ ] **Step 1: Add password param to createRoom**

```typescript
export const createRoom = async (data: {
  name: string;
  description?: string;
  topic: string;
  maxMembers?: number;
  password?: string;
}): Promise<Room> => {
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
```

- [ ] **Step 2: Add password param to joinRoom**

```typescript
export const joinRoom = async (id: number, password?: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/rooms/${id}/join`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
    body: JSON.stringify(password ? { password } : {}),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || '加入房间失败');
  }
};
```

---

### Task 6: Update StudyRoomList.vue

**Files:**
- Modify: `src/views/StudyRoomList.vue:1-67` (template), `src/views/StudyRoomList.vue:70-122` (script)

- [ ] **Step 1: Add password field to create dialog template**

Replace the create dialog section (lines 48-66):

```html
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
    <el-form-item label="房间密码（可选）">
      <el-input
        v-model="form.password"
        type="password"
        show-password
        maxlength="16"
        minlength="4"
        placeholder="4-16位，留空则无密码"
      />
    </el-form-item>
  </el-form>
  <template #footer>
    <el-button @click="showCreateDialog = false">取消</el-button>
    <el-button type="primary" @click="createRoom" :disabled="!form.name || !form.topic">创建</el-button>
  </template>
</el-dialog>
```

- [ ] **Step 2: Add lock icon and encryption tag to room cards**

Replace the room card template (lines 29-45):

```html
<div v-else class="room-grid">
  <div
    v-for="room in filteredRooms"
    :key="room.id"
    class="room-card"
    @click="enterRoom(room)"
  >
    <div class="room-name">
      {{ room.name }}
      <span v-if="room.hasPassword" class="lock-icon">🔒</span>
      <span v-else class="lock-icon unlock">🔓</span>
    </div>
    <div class="room-topic">
      <el-tag size="small">{{ room.topic }}</el-tag>
    </div>
    <div class="room-desc" v-if="room.description">{{ room.description }}</div>
    <div class="room-footer">
      <span class="room-count">{{ room.onlineCount }}人在线</span>
      <span class="room-max">/ {{ room.maxMembers }}</span>
      <span v-if="room.hasPassword" class="room-locked">🔒 加密</span>
    </div>
  </div>
</div>
```

- [ ] **Step 3: Add password to form ref and modify createRoom/enterRoom logic**

Replace the script setup (lines 70-122):

```typescript
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getRooms, createRoom as apiCreateRoom, joinRoom as apiJoinRoom } from '@/utils/api'
import type { Room } from '@/types'
import JoinPasswordDialog from '@/components/JoinPasswordDialog.vue'

const emit = defineEmits<{
  (e: 'enterRoom', roomId: number): void
  (e: 'goLeaderboard'): void
}>()

const topics = ['考研', '考公', '雅思', '托福', '自习', '阅读', '编程', '其他']
const rooms = ref<Room[]>([])
const loading = ref(false)
const selectedTopic = ref('')
const showCreateDialog = ref(false)
const form = ref({ name: '', topic: '', description: '', password: '' })

const showPasswordDialog = ref(false)
const pendingRoom = ref<Room | null>(null)

const filteredRooms = computed(() => {
  if (!selectedTopic.value) return rooms.value
  return rooms.value.filter(r => r.topic === selectedTopic.value)
})

const loadRooms = async () => {
  loading.value = true
  try {
    rooms.value = await getRooms()
  } catch {
    ElMessage.error('加载房间列表失败')
  } finally {
    loading.value = false
  }
}

const createRoom = async () => {
  try {
    const data: any = { name: form.value.name, topic: form.value.topic, description: form.value.description }
    if (form.value.password) data.password = form.value.password
    const room = await apiCreateRoom(data)
    showCreateDialog.value = false
    form.value = { name: '', topic: '', description: '', password: '' }
    ElMessage.success('房间创建成功')
    emit('enterRoom', room.id)
  } catch (e: any) {
    ElMessage.error(e.message || '创建失败')
  }
}

const enterRoom = async (room: Room) => {
  try {
    await apiJoinRoom(room.id)
    emit('enterRoom', room.id)
  } catch (e: any) {
    if (e.message === 'Password required') {
      pendingRoom.value = room
      showPasswordDialog.value = true
    } else {
      ElMessage.error(e.message || '加入房间失败')
    }
  }
}

const onPasswordDialogClose = () => {
  showPasswordDialog.value = false
  pendingRoom.value = null
}

onMounted(() => {
  loadRooms()
})
</script>
```

- [ ] **Step 4: Add styles for lock icon and encryption tag**

Add to the `<style scoped>` block (after `.room-count`):

```css
.lock-icon {
  font-size: 16px;
}
.lock-icon.unlock {
  opacity: 0.3;
}
.room-locked {
  color: #f56c6c;
  font-size: 11px;
  margin-left: 6px;
}
```

- [ ] **Step 5: Add JoinPasswordDialog component in template**

Add before the closing `</template>` tag:

```html
<JoinPasswordDialog
  :visible="showPasswordDialog"
  :room-name="pendingRoom?.name || ''"
  :room-id="pendingRoom?.id || 0"
  @close="onPasswordDialogClose"
  @joined="(roomId: number) => { showPasswordDialog = false; pendingRoom = null; emit('enterRoom', roomId) }"
/>
```

---

### Task 7: Create JoinPasswordDialog.vue

**Files:**
- Create: `src/components/JoinPasswordDialog.vue`

- [ ] **Step 1: Create the component**

```html
<template>
  <el-dialog
    :model-value="visible"
    title="加入房间"
    width="90%"
    @close="handleClose"
  >
    <div class="password-dialog">
      <div class="password-icon">🔒</div>
      <p class="password-label">{{ roomName }}</p>
      <p class="password-hint">此房间需要密码才能加入</p>
      <el-input
        v-model="password"
        type="password"
        show-password
        placeholder="请输入房间密码"
        maxlength="16"
        @keyup.enter="handleSubmit"
      />
      <p v-if="errorMsg" class="password-error">{{ errorMsg }}</p>
    </div>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" :disabled="!password" :loading="submitting" @click="handleSubmit">
        加入房间
      </el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { joinRoom as apiJoinRoom } from '@/utils/api'

const props = defineProps<{
  visible: boolean
  roomName: string
  roomId: number
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'joined', roomId: number): void
}>()

const password = ref('')
const errorMsg = ref('')
const submitting = ref(false)

watch(() => props.visible, (val) => {
  if (val) {
    password.value = ''
    errorMsg.value = ''
  }
})

const handleClose = () => {
  password.value = ''
  errorMsg.value = ''
  emit('close')
}

const handleSubmit = async () => {
  if (!password.value) return
  submitting.value = true
  errorMsg.value = ''
  try {
    await apiJoinRoom(props.roomId, password.value)
    emit('joined', props.roomId)
  } catch (e: any) {
    errorMsg.value = '密码错误，请重试'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.password-dialog {
  text-align: center;
  padding: 8px 0;
}
.password-icon {
  font-size: 48px;
  margin-bottom: 12px;
}
.password-label {
  font-size: 16px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 4px 0;
}
.password-hint {
  font-size: 13px;
  color: #909399;
  margin: 0 0 20px 0;
}
.password-error {
  color: #f56c6c;
  font-size: 12px;
  margin: 8px 0 0 0;
}
</style>
```

---

### Task 8: Verify and commit

- [ ] **Step 1: Restart backend and test**

Run:
```bash
cd backend && npm run dev
```
Expected: Server starts without errors on port 3000.

- [ ] **Step 2: Verify frontend compiles**

Run:
```bash
npm run dev
```
Expected: Vite dev server starts without errors.

- [ ] **Step 3: Manual smoke test**

1. Create a room with a password → should enter directly
2. Refresh room list → should see 🔒 icon and "加密" tag
3. Create a room without password → should see 🔓 icon
4. Click a password-protected room → should see JoinPasswordDialog
5. Enter wrong password → should see error
6. Enter correct password → should enter room
7. As creator, re-enter own room → should skip password (no dialog on second click since already joined)

- [ ] **Step 4: Commit all changes**

```bash
git add backend/src/models/Room.ts backend/src/routes/rooms.ts backend/package.json backend/package-lock.json
git add src/types/index.ts src/utils/api.ts src/views/StudyRoomList.vue src/components/JoinPasswordDialog.vue
git commit -m "feat: add optional password protection to study rooms"
```
