<template>
  <div class="bottom-nav">
    <div 
      v-for="item in navItems" 
      :key="item.name"
      class="nav-item"
      :class="{ active: activeTab === item.name }"
      @click="navigateTo(item.name)"
    >
      <div class="nav-icon">{{ item.icon }}</div>
      <div class="nav-label">{{ item.label }}</div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'
/* 
props 默认传参
传参声明了 activeTab 为字符串类型
并且 default设定了默认值为todo 也就是第一个网页
*/
export default {
  name: 'BottomNav',
  props: {
    activeTab: {
      type: String,
      default: 'todo'
    }
  },
  //绑定changeTab事件
  emits: ['changeTab'],
  //Props 与 事件用法
  // 也可以const Props = defineProps(['foo']);
  setup(props, { emit }) {
    const navItems = [
      { name: 'todo', icon: '📋', label: '待办' },
      { name: 'todoSet', icon: '📑', label: '待办集' },
      { name: 'lock', icon: '🔒', label: '锁机' },
      { name: 'stats', icon: '📊', label: '统计数据' },
      { name: 'profile', icon: '👤', label: '我的' }
    ]

    const navigateTo = (name) => {
      emit('changeTab', name)
    }

    return {
      navItems,
      navigateTo
    }
  }
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
  background-color: white;
  padding: 10px 0;
  padding-bottom: calc(10px + env(safe-area-inset-bottom));
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  color: #909399;
  transition: all 0.3s ease;
}

.nav-item.active {
  color: #409EFF;
}

.nav-icon {
  font-size: 24px;
  margin-bottom: 4px;
}

.nav-label {
  font-size: 12px;
}

/* 为底部内容留出空间 */
.main-content {
  padding-bottom: 80px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}
</style>