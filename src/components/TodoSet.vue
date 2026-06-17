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
              <el-button circle size="small" @click="showTodoSetMenu(index, $event)">
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
                <el-button type="primary" class="start-btn" @click="startFocus(task)">开始</el-button>
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
    
    <!-- 待办集菜单 -->
    <div v-if="showMenu" class="todo-set-menu" :style="{ left: menuPosition.x + 'px', top: menuPosition.y + 'px' }">
      <div class="menu-item" @click="editTodoSet">修改待办集信息</div>
      <div class="menu-item" @click="reAnalyzeTodoSet">重新AI分析</div>
      <div class="menu-item delete" @click="deleteTodoSetItem">删除待办集</div>
    </div>
    
    <!-- 编辑待办集表单 -->
    <el-dialog v-model="showEditForm" title="修改待办集" width="400px">
      <el-form>
        <el-form-item label="待办集名称">
          <el-input v-model="editingTodoSet.name" placeholder="请输入待办集名称" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input type="textarea" v-model="editingTodoSet.description" placeholder="请输入待办集描述" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showEditForm = false">取消</el-button>
          <el-button type="primary" @click="saveTodoSet">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { analyzeTodoSet, createTodo, getTodos, getTodoSets, createTodoSet } from '../utils/api'

export default {
  name: 'TodoSet',
  emits: ['start-focus'],
  setup(props, { emit }) {
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
        id: null,
        name: '未分类',
        expanded: true,
        tasks: []
      }
    ])
    
    // 待办集菜单状态
    const showMenu = ref(false)
    const menuPosition = ref({ x: 0, y: 0 })
    const currentTodoSetIndex = ref(-1)
    
    // 修改待办集状态
    const editingTodoSet = ref(null)
    const showEditForm = ref(false)
    
    // 加载待办集
    const loadTodoSets = async () => {
      try {
        const sets = await getTodoSets()
        // 清空现有待办集（保留未分类）
        const uncategorizedSet = todoSets.value.find(set => set.id === null)
        todoSets.value = [uncategorizedSet]
        
        // 添加从数据库加载的待办集
        sets.forEach(set => {
          todoSets.value.push({
            id: set.id,
            name: set.name,
            description: set.description,
            expanded: true,
            tasks: []
          })
        })
      } catch (error) {
        console.error('Error loading todo sets:', error)
      }
    }
    
    // 加载待办事项并分配到待办集
    const loadTodos = async () => {
      isLoading.value = true
      try {
        // 先加载待办集
        await loadTodoSets()
        
        // 再加载todos
        const todos = await getTodos()
        
        // 清空现有任务
        todoSets.value.forEach(set => {
          set.tasks = []
        })
        
        // 分配todos到对应的待办集
        console.log('Loaded todo sets:', todoSets.value)
        console.log('Loaded todos:', todos)
        
        todos.forEach(todo => {
          console.log('Processing todo:', todo.text, 'with todoSetId:', todo.todoSetId)
          // 根据todoSetId分配到对应的待办集
          const todoSet = todoSets.value.find(set => set.id === todo.todoSetId)
          if (todoSet) {
            console.log('Found todo set:', todoSet.name, 'for todo:', todo.text)
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
            console.log('No todo set found for todo:', todo.text, 'with todoSetId:', todo.todoSetId)
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
    
    const addTodoSet = async () => {
      if (newTodoSet.value.name) {
        try {
          // 使用API创建待办集，由后端生成id
          const createdSet = await createTodoSet({
            name: newTodoSet.value.name,
            description: newTodoSet.value.description
          })
          
          // 添加到本地待办集列表
          todoSets.value.push({
            id: createdSet.id,
            name: createdSet.name,
            description: createdSet.description,
            expanded: false,
            tasks: []
          })
          
          // 重置表单
          newTodoSet.value.name = ''
          newTodoSet.value.description = ''
          showAddForm.value = false
        } catch (error) {
          console.error('Error adding todo set:', error)
        }
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
          // 使用API创建待办集，由后端生成id
          const createdSet = await createTodoSet({
            name: newTodoSet.value.name,
            description: newTodoSet.value.description
          })
          
          const newSet = {
            id: createdSet.id,
            name: createdSet.name,
            description: createdSet.description,
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
                todoSetId: createdSet.id // 添加待办集id
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
    
    const startFocus = (task) => {
      // 构建与TodoList相同格式的任务对象
      const focusTask = {
        id: task.id,
        text: task.title,
        targetMinutes: task.totalMinutes,
        currentMinutes: task.todayMinutes || 0,
        progress: parseInt(task.progress) || 0,
        progressLabel: task.type,
        timeInfo: task.timeInfo || `${task.todayMinutes || 0}/${task.totalMinutes} 分钟`
      }
      emit('start-focus', focusTask)
    }
    
    // 显示待办集菜单
    const showTodoSetMenu = (index, event) => {
      event.stopPropagation()
      const rect = event.target.getBoundingClientRect()
      menuPosition.value = {
        x: rect.left,
        y: rect.bottom + 10
      }
      currentTodoSetIndex.value = index
      showMenu.value = true
      
      // 点击其他地方关闭菜单
      setTimeout(() => {
        document.addEventListener('click', closeMenu)
      }, 0)
    }
    
    // 关闭待办集菜单
    const closeMenu = () => {
      showMenu.value = false
      document.removeEventListener('click', closeMenu)
    }
    
    // 编辑待办集
    const editTodoSet = () => {
      const todoSet = todoSets.value[currentTodoSetIndex.value]
      editingTodoSet.value = { ...todoSet }
      showEditForm.value = true
      closeMenu()
    }
    
    // 保存待办集修改
    const saveTodoSet = async () => {
      if (!editingTodoSet.value.name) return
      
      try {
        // 这里应该调用API更新待办集
        // 暂时直接更新本地数据
        todoSets.value[currentTodoSetIndex.value] = { ...editingTodoSet.value }
        showEditForm.value = false
        editingTodoSet.value = null
      } catch (error) {
        console.error('Error updating todo set:', error)
      }
    }
    
    // 重新AI分析
    const reAnalyzeTodoSet = async () => {
      const todoSet = todoSets.value[currentTodoSetIndex.value]
      if (!todoSet.name) return
      
      isAnalyzing.value = true
      closeMenu()
      
      try {
        const tasks = await analyzeTodoSet(todoSet.name, todoSet.description || '')
        
        if (tasks.length > 0) {
          // 清空现有任务
          todoSet.tasks = []
          
          // 添加新任务
          for (const task of tasks) {
            const taskData = {
              id: Date.now() + Math.random(),
              title: task.title,
              type: '固定时长',
              progress: '0%',
              todayMinutes: 0,
              totalMinutes: task.estimatedMinutes
            }
            todoSet.tasks.push(taskData)
            
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
                todoSetId: todoSet.id
              })
            } catch (error) {
              console.error('Error adding task to todos:', error)
            }
          }
        }
      } catch (error) {
        console.error('Error analyzing todo set:', error)
      } finally {
        isAnalyzing.value = false
      }
    }
    
    // 删除待办集
    const deleteTodoSetItem = async () => {
      if (currentTodoSetIndex.value === -1) return
      
      const todoSet = todoSets.value[currentTodoSetIndex.value]
      if (todoSet.id === null) {
        // 不能删除未分类待办集
        return
      }
      
      if (confirm(`确定要删除待办集 "${todoSet.name}" 吗？`)) {
        try {
          // 这里应该调用API删除待办集
          // 暂时直接从本地数据中删除
          todoSets.value.splice(currentTodoSetIndex.value, 1)
          closeMenu()
        } catch (error) {
          console.error('Error deleting todo set:', error)
        }
      }
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
      loadTodos,
      loadTodoSets,
      startFocus,
      showMenu,
      menuPosition,
      showTodoSetMenu,
      closeMenu,
      editTodoSet,
      saveTodoSet,
      reAnalyzeTodoSet,
      deleteTodoSetItem,
      showEditForm,
      editingTodoSet
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
}

.todo-set-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.3);
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
  background: rgba(255, 255, 255, 0.05);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
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
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  overflow: hidden;
}

.todo-set-header-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.todo-set-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
  color: rgba(255, 255, 255, 0.9);
}

.todo-set-actions {
  display: flex;
  gap: 8px;
}

.todo-set-actions .el-button {
  background-color: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.todo-set-actions .el-button:hover {
  background: rgba(255, 255, 255, 0.08);
}

.todo-set-tasks {
  padding: 10px 0;
}

.task-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s;
}

.task-item:last-child {
  border-bottom: none;
}

.task-item:hover {
  background: rgba(255, 255, 255, 0.04);
}

.task-item-green {
  background: rgba(103, 194, 58, 0.08);
}

.task-item-pink {
  background: rgba(245, 108, 108, 0.08);
}

.task-item-orange {
  background: rgba(230, 162, 60, 0.08);
}

.task-info {
  flex: 1;
}

.task-title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 5px;
  color: rgba(255, 255, 255, 0.85);
}

.task-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
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

/* 待办集菜单样式 */
.todo-set-menu {
  position: fixed;
  background: rgba(30, 27, 75, 0.98);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  z-index: 1000;
  min-width: 150px;
}

.menu-item {
  padding: 10px 16px;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.2s;
}

.menu-item:hover {
  background: rgba(255, 255, 255, 0.08);
}

.menu-item.delete {
  color: #f87171;
}

.menu-item.delete:hover {
  background: rgba(248, 113, 113, 0.1);
}

/* 编辑表单样式 */
.dialog-footer {
  text-align: right;
}

.dialog-footer .el-button {
  margin-left: 8px;
}
</style>