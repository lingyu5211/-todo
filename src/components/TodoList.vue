<template>
  <div class="todo-list-container">
    <div class="todo-header">
      <h1>待办</h1>
      <div class="header-actions">
        <el-button circle size="small" class="header-btn">
          <span>🔔</span>
        </el-button>
        <el-button circle size="small" class="header-btn" @click="showAddForm = !showAddForm">
          <span>➕</span>
        </el-button>
        <el-button circle size="small" class="header-btn">
          <span>⋮</span>
        </el-button>
      </div>
    </div>
    
    <div class="todo-info">
      <p>点击开启学霸模式</p>
    </div>
    
    <TodoInput v-if="showAddForm" @add-todo="addTodo" />
    
    <div class="todo-filters">
      <el-button 
        :type="filter === 'all' ? 'primary' : 'default'"
        @click="filter = 'all'"
        size="small"
      >
        全部
      </el-button>
      <el-button 
        :type="filter === 'active' ? 'primary' : 'default'"
        @click="filter = 'active'"
        size="small"
      >
        未完成
      </el-button>
      <el-button 
        :type="filter === 'completed' ? 'primary' : 'default'"
        @click="filter = 'completed'"
        size="small"
      >
        已完成
      </el-button>
    </div>
    
    <el-empty 
      v-if="filteredTodos.length === 0"
      description="暂无待办事项"
    />
    
    <div v-else class="todo-items">
      <TodoItem 
        v-for="todo in filteredTodos" 
        :key="todo.id"
        :todo="todo"
        :editing-id="editingId"
        @toggle="toggleTodo"
        @edit="startEdit"
        @save="saveTodo"
        @cancel="cancelEdit"
        @delete="deleteTodo"
        @start-focus="startFocus"
      />
    </div>
    
    <TodoFooter 
      :remaining-count="remainingCount"
      :completed-count="completedCount"
      @clear-completed="clearCompleted"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getTodos, createTodo, updateTodo, deleteTodo as deleteTodoApi } from '../utils/api'
import TodoInput from './TodoInput.vue'
import TodoItem from './TodoItem.vue'
import TodoFooter from './TodoFooter.vue'

export default {
  name: 'TodoList',
  components: {
    TodoInput,
    TodoItem,
    TodoFooter
  },
  emits: ['start-focus'],
  setup(props, { emit }) {
    const todos = ref([])
    const filter = ref('all')
    const editingId = ref(null)
    const editText = ref('')
    const showAddForm = ref(false)

    // 默认风景图片列表
    const defaultImages = [
      new URL('../img/item1.png', import.meta.url).href,
      new URL('../img/item2.png', import.meta.url).href,
      new URL('../img/item3.png', import.meta.url).href,
      new URL('../img/item4.png', import.meta.url).href,
      new URL('../img/item5.png', import.meta.url).href
    ]

    const filteredTodos = computed(() => {
      if (filter.value === 'active') {
        return todos.value.filter(todo => !todo.completed)
      } else if (filter.value === 'completed') {
        return todos.value.filter(todo => todo.completed)
      }
      return todos.value
    })

    const remainingCount = computed(() => {
      return todos.value.filter(todo => !todo.completed).length
    })

    const completedCount = computed(() => {
      return todos.value.filter(todo => todo.completed).length
    })

    // 加载待办事项
    const loadTodos = async () => {
      const data = await getTodos()
      // 为每个待办事项添加默认值（如果没有的话）
      const updatedTodos = data.map(todo => {
        if (!todo.image) {
          todo.image = defaultImages[Math.floor(Math.random() * defaultImages.length)]
        }
        if (!todo.progress) {
          todo.progress = Math.floor(Math.random() * 30)
        }
        if (!todo.progressLabel) {
          todo.progressLabel = '正向计时-目标'
        }
        if (!todo.timeInfo) {
          const targetMinutes = Math.floor(Math.random() * 5000) + 1000
          const currentMinutes = Math.floor(targetMinutes * (todo.progress / 100))
          todo.timeInfo = `${currentMinutes}/${targetMinutes} 分钟`
        }
        return todo
      })
      todos.value = updatedTodos
    }

    const addTodo = async (text) => {
      if (text.trim()) {
        try {
          // 生成随机风景图
          const randomImage = defaultImages[Math.floor(Math.random() * defaultImages.length)]
          // 生成随机进度信息
          const progress = Math.floor(Math.random() * 30) // 0-30% 之间的随机进度
          const targetMinutes = Math.floor(Math.random() * 5000) + 1000 // 1000-6000 分钟的目标
          const currentMinutes = Math.floor(targetMinutes * (progress / 100))
          
          const newTodo = await createTodo({
            text: text.trim(),
            completed: false,
            image: randomImage,
            progress: progress,
            progressLabel: '正向计时-目标',
            timeInfo: `${currentMinutes}/${targetMinutes} 分钟`
          })
          
          // 如果后端没有保存这些字段，手动添加
          if (!newTodo.image) {
            newTodo.image = randomImage
            newTodo.progress = progress
            newTodo.progressLabel = '正向计时-目标'
            newTodo.timeInfo = `${currentMinutes}/${targetMinutes} 分钟`
          }
          
          todos.value.push(newTodo)
        } catch (error) {
          console.error('Error adding todo:', error)
        }
      }
    }

    const toggleTodo = async (id) => {
      const todo = todos.value.find(todo => todo.id === id)
      if (todo) {
        try {
          const updatedTodo = await updateTodo(id, {
            completed: !todo.completed
          })
          // 更新本地状态
          const index = todos.value.findIndex(t => t.id === id)
          if (index !== -1) {
            todos.value[index] = updatedTodo
          }
        } catch (error) {
          console.error('Error toggling todo:', error)
        }
      }
    }

    const deleteTodo = async (id) => {
      try {
        await deleteTodoApi(id)
        todos.value = todos.value.filter(todo => todo.id !== id)
      } catch (error) {
        console.error('Error deleting todo:', error)
      }
    }

    const startEdit = (id) => {
      const todo = todos.value.find(todo => todo.id === id)
      if (todo) {
        editingId.value = id
        editText.value = todo.text
      }
    }

    const saveTodo = async (id, text) => {
      try {
        const updatedTodo = await updateTodo(id, {
          text: text
        })
        // 更新本地状态
        const index = todos.value.findIndex(t => t.id === id)
        if (index !== -1) {
          todos.value[index] = updatedTodo
        }
      } catch (error) {
        console.error('Error saving todo:', error)
      }
      editingId.value = null
    }

    const cancelEdit = () => {
      editingId.value = null
    }

    const clearCompleted = async () => {
      const completedTodos = todos.value.filter(todo => todo.completed)
      for (const todo of completedTodos) {
        try {
          await deleteTodoApi(todo.id)
        } catch (error) {
          console.error('Error deleting completed todo:', error)
        }
      }
      // 重新加载数据
      await loadTodos()
    }

    onMounted(() => {
      loadTodos()
    })

    const startFocus = (todo) => {
      emit('start-focus', todo)
    }

    return {
      todos,
      filter,
      editingId,
      editText,
      showAddForm,
      filteredTodos,
      remainingCount,
      completedCount,
      addTodo,
      toggleTodo,
      deleteTodo,
      startEdit,
      saveTodo,
      cancelEdit,
      clearCompleted,
      startFocus
    }
  }
}
</script>

<style scoped>
.todo-list-container {

  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: beige;
  min-height: 100vh;
}

.todo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
  padding: 20px;
  border-radius: 16px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.todo-header h1 {
  font-size: 24px;
  font-weight: bold;
  color: white;
  margin: 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
}

.header-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.todo-info {
  background-color: rgba(255, 255, 255, 0.9);
  padding: 12px 16px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.todo-info p {
  margin: 0;
  font-size: 14px;
  color: #1890ff;
  font-weight: 500;
}

.todo-filters {
  display: flex;
  gap: 10px;
  margin: 20px 0;
  justify-content: center;
  flex-wrap: wrap;
}

.todo-items {
  margin-bottom: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 自定义按钮样式 */
.todo-filters .el-button {
  border-radius: 20px;
  padding: 6px 16px;
  transition: all 0.3s ease;
}

.todo-filters .el-button:hover {
  transform: scale(1.05);
}

/* PC端样式 */
@media (min-width: 1024px) {
  .todo-list-container {
    max-width: 900px;
    padding: 30px;
  }
  
  .todo-header h1 {
    font-size: 28px;
  }
  
  .header-btn {
    width: 40px;
    height: 40px;
  }
  
  .todo-filters {
    margin: 30px 0;
    gap: 15px;
  }
  
  .todo-items {
    margin-bottom: 30px;
    gap: 20px;
  }
}

/* 平板端样式 */
@media (min-width: 769px) and (max-width: 1023px) {
  .todo-list-container {
    max-width: 100%;
    padding: 20px;
  }
}

/* 移动端样式 */
@media (max-width: 768px) {
  .todo-list-container {
    max-width: 100%;
    padding: 15px;
  }
  
  .todo-header h1 {
    font-size: 20px;
  }
  
  .header-btn {
    width: 32px;
    height: 32px;
  }
  
  .todo-filters {
    gap: 8px;
    margin: 16px 0;
  }
  
  .todo-items {
    margin-bottom: 16px;
    gap: 12px;
  }
  
  .todo-filters .el-button {
    padding: 4px 12px;
    font-size: 12px;
  }
}
</style>