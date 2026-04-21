<template>
  <div class="todo-set-container">
    <div class="todo-set-header">
      <h1>待办集</h1>
      <div class="header-actions">
        <el-button circle size="small" class="header-btn">
          <span>⚙️</span>
        </el-button>
        <el-button circle size="small" class="header-btn">
          <span>🔒</span>
        </el-button>
        <el-button circle size="small" class="header-btn" @click="showAddForm = !showAddForm">
          <span>➕</span>
        </el-button>
        <el-button circle size="small" class="header-btn">
          <span>⋮</span>
        </el-button>
      </div>
    </div>
    
    <div class="todo-set-info">
      <el-button type="primary" class="study-mode-btn">
        点击开启学霸模式
      </el-button>
    </div>
    
    <div v-if="showAddForm" class="add-todo-set-form">
      <el-card>
        <el-form :model="newTodoSet" label-width="80px">
          <el-form-item label="待办集名称">
            <el-input v-model="newTodoSet.name" placeholder="请输入待办集名称" />
          </el-form-item>
          <el-form-item label="描述">
            <el-input type="textarea" v-model="newTodoSet.description" placeholder="请输入待办集描述" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="addTodoSet">创建待办集</el-button>
            <el-button type="success" @click="analyzeWithAI" :loading="isAnalyzing">
              <span v-if="!isAnalyzing">AI分析</span>
              <span v-else>分析中...</span>
            </el-button>
            <el-button @click="showAddForm = false">取消</el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </div>
    
    <div class="todo-set-list">
      <el-skeleton v-if="isLoading" :rows="10" animated />
      <div v-else>
        <div v-for="(todoSet, index) in todoSets" :key="index" class="todo-set-item">
          <div class="todo-set-header-row">
            <h3 class="todo-set-title">{{ todoSet.name }}</h3>
            <div class="todo-set-actions">
              <el-button circle size="small" @click="toggleTodoSet(index)">
                <span>{{ todoSet.expanded ? '▼' : '▶' }}</span>
              </el-button>
              <el-button circle size="small" @click="loadTodos">
                <span>🔄</span>
              </el-button>
              <el-button circle size="small">
                <span>⚙️</span>
              </el-button>
              <el-button circle size="small" @click="showAddTaskForm = index">
                <span>➕</span>
              </el-button>
            </div>
          </div>
          
          <div v-if="todoSet.expanded" class="todo-set-tasks">
            <div v-if="todoSet.tasks.length === 0" class="no-tasks">
              <el-empty description="暂无任务" />
            </div>
            <div v-else>
              <div v-for="(task, taskIndex) in todoSet.tasks" :key="task.id || taskIndex" class="task-item" :class="getTaskClass(taskIndex)">
                <div class="task-info">
                  <h4 class="task-title">{{ task.title }}</h4>
                  <p class="task-meta">{{ task.type }} {{ task.progress }} 今日 {{ task.todayMinutes }}/{{ task.totalMinutes }} 分钟</p>
                </div>
                <el-button type="primary" class="start-btn">开始</el-button>
              </div>
            </div>
            
            <div v-if="showAddTaskForm === index" class="add-task-form">
              <el-card>
                <el-form :model="newTask" label-width="80px">
                  <el-form-item label="任务名称">
                    <el-input v-model="newTask.title" placeholder="请输入任务名称" />
                  </el-form-item>
                  <el-form-item label="任务类型">
                    <el-select v-model="newTask.type" placeholder="请选择任务类型">
                      <el-option label="正向计时-习惯" value="正向计时-习惯" />
                      <el-option label="固定时长" value="固定时长" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="总时长">
                    <el-input-number v-model="newTask.totalMinutes" :min="1" :max="480" label="分钟" />
                  </el-form-item>
                  <el-form-item>
                    <el-button type="primary" @click="addTask(index)">添加任务</el-button>
                    <el-button @click="showAddTaskForm = null">取消</el-button>
                  </el-form-item>
                </el-form>
              </el-card>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { analyzeTodoSet, createTodo, getTodos } from '../utils/api'

export default {
  name: 'TodoSet',
  setup() {
    const showAddForm = ref(false)
    const showAddTaskForm = ref(null)
    const isAnalyzing = ref(false)
    const isLoading = ref(false)
    const newTodoSet = ref({
      name: '',
      description: ''
    })
    const newTask = ref({
      title: '',
      type: '正向计时-习惯',
      totalMinutes: 60,
      todayMinutes: 0,
      progress: '0%'
    })
    
    const todoSets = ref([
      {
        id: 1,
        name: '实习',
        expanded: true,
        tasks: []
      },
      {
        id: null,
        name: '未分类',
        expanded: true,
        tasks: []
      }
    ])
    
    // 加载待办事项并分配到待办集
    const loadTodos = async () => {
      isLoading.value = true
      try {
        const todos = await getTodos()
        
        // 清空现有任务
        todoSets.value.forEach(set => {
          set.tasks = []
        })
        
        // 分配todos到对应的待办集
        todos.forEach(todo => {
          // 根据todoSetId分配到对应的待办集
          const todoSet = todoSets.value.find(set => set.id === todo.todoSetId)
          if (todoSet) {
            // 分配到指定待办集
            todoSet.tasks.push({
              id: todo.id,
              title: todo.text,
              type: todo.progressLabel || '正向计时-习惯',
              progress: `${todo.progress}%`,
              todayMinutes: todo.currentMinutes || 0,
              totalMinutes: todo.targetMinutes || 60
            })
          } else {
            // 分配到未分类待办集
            const uncategorizedSet = todoSets.value.find(set => set.id === null)
            if (uncategorizedSet) {
              uncategorizedSet.tasks.push({
                id: todo.id,
                title: todo.text,
                type: todo.progressLabel || '正向计时-习惯',
                progress: `${todo.progress}%`,
                todayMinutes: todo.currentMinutes || 0,
                totalMinutes: todo.targetMinutes || 60
              })
            }
          }
        })
      } catch (error) {
        console.error('Error loading todos:', error)
      } finally {
        isLoading.value = false
      }
    }
    
    const toggleTodoSet = (index) => {
      todoSets.value[index].expanded = !todoSets.value[index].expanded
    }
    
    const addTodoSet = () => {
      if (newTodoSet.value.name) {
        // 生成唯一id（实际项目中应该由后端生成）
        const newId = Math.max(...todoSets.value.filter(set => set.id !== null).map(set => set.id), 0) + 1
        todoSets.value.push({
          id: newId,
          name: newTodoSet.value.name,
          description: newTodoSet.value.description,
          expanded: false,
          tasks: []
        })
        newTodoSet.value.name = ''
        newTodoSet.value.description = ''
        showAddForm.value = false
      }
    }
    
    const addTask = async (todoSetIndex) => {
      if (newTask.value.title) {
        const todoSet = todoSets.value[todoSetIndex]
        console.log('Adding task to todo set:', todoSet.name, 'with id:', todoSet.id)
        // 先添加到待办集
        const task = {
          id: Date.now(), // 临时id，实际应该由后端生成
          title: newTask.value.title,
          type: newTask.value.type,
          totalMinutes: newTask.value.totalMinutes,
          todayMinutes: 0,
          progress: '0%'
        }
        todoSets.value[todoSetIndex].tasks.push(task)
        
        // 同时添加到todos
        try {
          const todoData = {
            text: newTask.value.title,
            completed: false,
            targetMinutes: newTask.value.totalMinutes,
            currentMinutes: 0,
            progress: 0,
            progressLabel: newTask.value.type,
            timeInfo: `0/${newTask.value.totalMinutes} 分钟`,
            todoSetId: todoSet.id // 添加待办集id
          }
          console.log('Creating todo with data:', todoData)
          await createTodo(todoData)
        } catch (error) {
          console.error('Error adding task to todos:', error)
        }
        
        // 重置表单
        newTask.value.title = ''
        newTask.value.type = '正向计时-习惯'
        newTask.value.totalMinutes = 60
        showAddTaskForm.value = null
      }
    }
    
    const analyzeWithAI = async () => {
      if (!newTodoSet.value.name) return
      
      isAnalyzing.value = true
      try {
        const tasks = await analyzeTodoSet(newTodoSet.value.name, newTodoSet.value.description)
        
        if (tasks.length > 0) {
          // 生成唯一id（实际项目中应该由后端生成）
          const newId = Math.max(...todoSets.value.filter(set => set.id !== null).map(set => set.id), 0) + 1
          const newSet = {
            id: newId,
            name: newTodoSet.value.name,
            description: newTodoSet.value.description,
            expanded: true,
            tasks: []
          }
          
          // 添加任务到待办集并同时添加到todos
          for (const task of tasks) {
            const taskData = {
              title: task.title,
              type: '固定时长',
              progress: '0%',
              todayMinutes: 0,
              totalMinutes: task.estimatedMinutes
            }
            newSet.tasks.push(taskData)
            
            // 同时添加到todos
            try {
              await createTodo({
                text: task.title,
                completed: false,
                targetMinutes: task.estimatedMinutes,
                currentMinutes: 0,
                progress: 0,
                progressLabel: '固定时长',
                timeInfo: `0/${task.estimatedMinutes} 分钟`,
                todoSetId: newId // 添加待办集id
              })
            } catch (error) {
              console.error('Error adding task to todos:', error)
            }
          }
          
          todoSets.value.push(newSet)
          newTodoSet.value.name = ''
          newTodoSet.value.description = ''
          showAddForm.value = false
        }
      } catch (error) {
        console.error('Error analyzing todo set:', error)
      } finally {
        isAnalyzing.value = false
      }
    }
    
    const getTaskClass = (index) => {
      const classes = ['task-item-green', 'task-item-pink', 'task-item-orange']
      return classes[index % classes.length]
    }
    
    // 组件挂载时加载数据
    onMounted(() => {
      loadTodos()
    })
    
    return {
      showAddForm,
      showAddTaskForm,
      isAnalyzing,
      isLoading,
      newTodoSet,
      newTask,
      todoSets,
      toggleTodoSet,
      addTodoSet,
      addTask,
      analyzeWithAI,
      getTaskClass,
      loadTodos
    }
  }
}
</script>

<style scoped>
.todo-set-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 0;
  min-height: 100vh;
  background: linear-gradient(to bottom, #e0f7fa, #ffffff);
}

.todo-set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.todo-set-header h1 {
  font-size: 18px;
  font-weight: bold;
  color: white;
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.header-btn {
  background-color: transparent;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: white;
  font-size: 16px;
}

.header-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.todo-set-info {
  padding: 15px 20px;
  background-color: white;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.study-mode-btn {
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
}

.add-todo-set-form {
  margin: 20px;
}

.todo-set-list {
  margin: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.todo-set-item {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.todo-set-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
}

.todo-set-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: #303133;
}

.todo-set-actions {
  display: flex;
  gap: 8px;
}

.todo-set-actions .el-button {
  background-color: transparent;
  border: none;
  color: #606266;
  font-size: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-set-actions .el-button:hover {
  background-color: #f5f7fa;
}

.todo-set-tasks {
  padding: 10px 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background-color: #f5f7fa;
}

.task-item-green {
  background-color: #f0f9eb;
}

.task-item-pink {
  background-color: #fef0f0;
}

.task-item-orange {
  background-color: #fdf6ec;
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 5px;
  color: #303133;
}

.task-meta {
  font-size: 12px;
  color: #909399;
  margin: 0;
}

.start-btn {
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 14px;
}

.add-task-form {
  margin: 15px 20px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .todo-set-container {
    padding: 0;
  }
  
  .todo-set-header {
    padding: 12px 16px;
  }
  
  .todo-set-header h1 {
    font-size: 16px;
  }
  
  .todo-set-info {
    padding: 12px 16px;
  }
  
  .study-mode-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
  
  .todo-set-list {
    margin: 15px;
    gap: 12px;
  }
  
  .todo-set-header-row {
    padding: 12px 16px;
  }
  
  .todo-set-title {
    font-size: 14px;
  }
  
  .task-item {
    padding: 12px 16px;
  }
  
  .task-title {
    font-size: 14px;
  }
  
  .start-btn {
    font-size: 12px;
    padding: 4px 12px;
  }
}
</style>