<template>
  <div class="room-header">
    <el-button circle size="small" @click="$emit('leave')">
      <el-icon><ArrowLeft /></el-icon>
    </el-button>
    <div class="header-info">
      <div class="header-name">{{ room?.name || '加载中...' }}</div>
      <div class="header-meta">
        <el-tag size="small">{{ room?.topic }}</el-tag>
        <span class="online-badge">{{ room?.onlineCount || 0 }}人在线</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
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
