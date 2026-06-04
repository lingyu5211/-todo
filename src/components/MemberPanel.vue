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
