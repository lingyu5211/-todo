<template>
  <div class="todo-footer">
    <el-card class="footer-card">
      <div class="footer-content">
        <span class="remaining-count">
          <el-icon class="count-icon"><Timer /></el-icon>
          {{ remainingCount }} 项待完成
        </span>
        <span class="completed-count">
          <el-icon class="count-icon"><Check /></el-icon>
          {{ completedCount }} 项已完成
        </span>
        <el-button 
          v-if="completedCount > 0"
          type="danger" 
          size="small" 
          @click="handleClearCompleted"
          icon="Delete"
        >
          清除已完成
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script>
import { Check, Timer } from '@element-plus/icons-vue'

export default {
  name: 'TodoFooter',
  props: {
    remainingCount: {
      type: Number,
      required: true
    },
    completedCount: {
      type: Number,
      required: true
    }
  },
  emits: ['clear-completed'],
  components: {
    Check,
    Timer
  },
  setup(props, { emit }) {
    const handleClearCompleted = () => {
      emit('clear-completed')
    }

    return {
      handleClearCompleted
    }
  }
}
</script>

<style scoped>
.todo-footer {
  margin-top: 20px;
}

.footer-card {
  border-radius: 8px;
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
}

.remaining-count,
.completed-count {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.count-icon {
  font-size: 16px;
}

.remaining-count .count-icon {
  color: var(--theme-primary);
}

.completed-count .count-icon {
  color: #67C23A;
}

@media (max-width: 768px) {
  .footer-content {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>