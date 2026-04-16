<template>
  <div class="todo-card" :class="{ 'completed': todo.completed }" :style="{ backgroundImage: `url(${todo.image || defaultImages[Math.floor(Math.random() * defaultImages.length)]})` }">
    <div class="todo-content" v-if="!isEditing">
      <div class="todo-header">
        <div class="todo-title">
          <el-checkbox v-model="localCompleted" @change="handleToggle" class="todo-checkbox">
            <span class="todo-text">{{ todo.text }}</span>
          </el-checkbox>
        </div>
        <div class="todo-status" v-if="todo.status">
          {{ todo.status }}
        </div>
      </div>
      <div class="todo-progress">
        <div class="progress-info">
          <span class="progress-label">{{ todo.progressLabel || '正向计时-目标' }}</span>
          <span class="progress-percentage">{{ todo.progress || 0 }}%</span>
        </div>
        <el-progress 
          :percentage="todo.progress || 0" 
          :color="progressColor"
          :stroke-width="4"
          class="todo-progress-bar"
        />
        <div class="time-info">
          <span>{{ todo.timeInfo || '0/0 分钟' }}</span>
        </div>
      </div>
      <div class="todo-actions">
        <el-button 
          type="primary" 
          size="small" 
          @click="startFocus"
          class="start-btn"
        >
          开始
        </el-button>
        <div class="edit-delete-actions">
          <el-button 
            type="info" 
            size="small" 
            @click="handleEdit"
            class="edit-btn"
          >
            编辑
          </el-button>
          <el-button 
            type="danger" 
            size="small" 
            @click="handleDelete"
            class="delete-btn"
          >
            删除
          </el-button>
        </div>
      </div>
    </div>
    <div class="todo-edit" v-else>
      <el-input
        v-model="editText"
        @keyup.enter="handleSave"
        @keyup.esc="handleCancel"
        @blur="handleSave"
        class="edit-input"
        ref="editInput"
        placeholder="输入待办事项"
      />
      <div class="edit-actions">
        <el-button type="primary" size="small" @click="handleSave">
          保存
        </el-button>
        <el-button size="small" @click="handleCancel">
          取消
        </el-button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch, onMounted, nextTick, computed } from 'vue'

export default {
  name: 'TodoItem',
  props: {
    todo: {
      type: Object,
      required: true
    },
    editingId: {
      type: Number,
      default: null
    }
  },
  emits: ['toggle', 'edit', 'save', 'cancel', 'delete', 'start-focus'],
  setup(props, { emit }) {
    const localCompleted = ref(props.todo.completed)
    const isEditing = ref(false)
    const editText = ref(props.todo.text)
    const editInput = ref(null)

    const defaultImages = [
      new URL('../img/item1.png', import.meta.url).href,
      new URL('../img/item2.png', import.meta.url).href,
      new URL('../img/item3.png', import.meta.url).href,
      new URL('../img/item4.png', import.meta.url).href,
      new URL('../img/item5.png', import.meta.url).href
    ]

    const progressColor = computed(() => {
      const progress = props.todo.progress || 0
      if (progress < 30) return '#67c23a' 
      if (progress < 70) return '#e6a23c' 
      return '#f56c6c' 
    })

    watch(() => props.editingId, (newVal) => {
      isEditing.value = newVal === props.todo.id
      if (isEditing.value) {
        editText.value = props.todo.text
        nextTick(() => {
          editInput.value?.focus()
        })
      }
    })

    watch(() => props.todo.completed, (newVal) => {
      localCompleted.value = newVal
    })

    const handleToggle = () => {
      emit('toggle', props.todo.id)
    }

    const handleEdit = () => {
      emit('edit', props.todo.id)
    }

    const handleSave = () => {
      if (editText.value.trim()) {
        emit('save', props.todo.id, editText.value.trim())
      }
      emit('cancel')
    }

    const handleCancel = () => {
      emit('cancel')
    }

    const handleDelete = () => {
      emit('delete', props.todo.id)
    }

    const startFocus = () => {
      emit('start-focus', props.todo)
    }

    return {
      localCompleted,
      isEditing,
      editText,
      editInput,
      defaultImages,
      progressColor,
      handleToggle,
      handleEdit,
      handleSave,
      handleCancel,
      handleDelete,
      startFocus
    }
  }
}
</script>

<style scoped>
.todo-card {
  margin-bottom: 16px;
  border-radius: 16px;
  overflow: hidden;
  position: relative;
  min-height: 120px;
  background-size: cover;
  background-position: center;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.todo-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.3) 0%, rgba(0, 0, 0, 0.1) 100%);
  z-index: 1;
}

.todo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15);
}

.todo-content {
  position: relative;
  z-index: 2;
  padding: 20px;
  color: white;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.todo-title {
  flex: 1;
}

.todo-text {
  font-size: 18px;
  font-weight: bold;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
  margin-left: 8px;
}

.todo-checkbox {
  color: white;
}

.todo-checkbox .el-checkbox__input.is-checked .el-checkbox__inner {
  background-color: white;
  border-color: white;
}

.todo-checkbox .el-checkbox__input.is-checked .el-checkbox__inner::after {
  border-color: #409EFF;
}

.todo-status {
  background-color: rgba(255, 255, 255, 0.2);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: bold;
}

.todo-progress {
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.todo-progress-bar {
  margin-bottom: 8px;
}

.todo-progress-bar .el-progress__text {
  color: white;
  font-size: 12px;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.time-info {
  font-size: 12px;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.todo-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.start-btn {
  background-color: rgba(255, 255, 255, 0.9);
  color: #409EFF;
  border: none;
  border-radius: 20px;
  padding: 8px 20px;
  font-weight: bold;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.start-btn:hover {
  background-color: white;
  transform: scale(1.05);
}

.edit-delete-actions {
  display: flex;
  gap: 8px;
}

.edit-btn, .delete-btn {
  border-radius: 20px;
  padding: 6px 12px;
  font-size: 12px;
  opacity: 0.8;
}

.edit-btn:hover, .delete-btn:hover {
  opacity: 1;
  transform: scale(1.05);
}

.todo-edit {
  position: relative;
  z-index: 2;
  padding: 20px;
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  margin: 20px;
}

.edit-input {
  flex: 1;
  border-radius: 8px;
}

.edit-actions {
  display: flex;
  gap: 8px;
}

.todo-card.completed {
  opacity: 0.7;
  filter: grayscale(30%);
}

.todo-card.completed .todo-text {
  text-decoration: line-through;
}


@media (max-width: 768px) {
  .todo-card {
    margin-bottom: 12px;
    min-height: 100px;
  }
  
  .todo-content {
    padding: 16px;
  }
  
  .todo-text {
    font-size: 16px;
  }
  
  .progress-info {
    font-size: 12px;
  }
  
  .start-btn {
    padding: 6px 16px;
    font-size: 12px;
  }
  
  .edit-btn, .delete-btn {
    padding: 4px 8px;
    font-size: 10px;
  }
  
  .todo-edit {
    padding: 16px;
    margin: 16px;
  }
}
</style>