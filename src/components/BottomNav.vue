<template>
  <div class="bottom-nav">
    <div 
      v-for="item in navItems" 
      :key="item.name"
      class="nav-item"
      :class="{ active: activeTab === item.name }"  
      @click="navigateTo(item.name)"
    >
      <component :is="item.icon" class="nav-icon" />
      <div class="nav-label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { List, FolderOpened, Lock, PieChart, User, Reading } from '@element-plus/icons-vue'
import type { NavItem } from '@/types'

const props = defineProps<{
  activeTab: string
}>()

const emit = defineEmits<{
  (e: 'changeTab', name: string): void
}>()

const navItems: NavItem[] = [
  { name: 'todo', icon: List, label: '待办' },
  { name: 'todoSet', icon: FolderOpened, label: '待办集' },
  { name: 'lock', icon: Lock, label: '锁机' },
  { name: 'stats', icon: PieChart, label: '统计数据' },
  { name: 'studyRoom', icon: Reading, label: '自习室' },
  { name: 'profile', icon: User, label: '我的' }
]

const navigateTo = (name: string) => {
  emit('changeTab', name)
}
</script>

<style scoped>
.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  justify-content: space-around;
  align-items: center;
  background: rgba(15, 12, 41, 0.88);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 10px 0;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.4);
  transition: color var(--transition-normal);
}

.nav-item.active {
  color: var(--theme-primary);
}

.nav-icon {
  width: 24px;
  height: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
}

.main-content {
  padding-bottom: 80px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
</style>
