<template>
  <div class="study-room-list">
    <div class="page-header">
      <h2>自习室</h2>
      <div class="header-actions">
        <el-button size="small" @click="$emit('goLeaderboard')">排行榜</el-button>
        <el-button type="primary" size="small" @click="showCreateDialog = true">创建房间</el-button>
      </div>
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
          <span class="room-count">{{ room.onlineCount }}人在线</span>
          <span class="room-max">/ {{ room.maxMembers }}</span>
        </div>
      </div>
    </div>

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

const emit = defineEmits<{
  (e: 'enterRoom', roomId: number): void
  (e: 'goLeaderboard'): void
}>()

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
  } catch {
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
.header-actions {
  display: flex;
  gap: 8px;
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
