1.npm create vite@latest . -- --template vue //vite创建项目

2.APP.VUE中编写主进程：
(4学时 :用于v-if v-bind 登响应式基础和页面部署)
<template>
  <div class="app-container">
    <header class="app-header">
      <h1>个人待办与日程管理</h1>
    </header>
    <main class="app-main">
      <div class="tabs">
        <button 
          :class="{ active: activeTab === 'todo' }" 
          @click="activeTab = 'todo'"
        >
          待办事项
        </button>
        <button 
          :class="{ active: activeTab === 'schedule' }" 
          @click="activeTab = 'schedule'"
        >
          日程安排
        </button>
      </div>
      
      <div class="tab-content">
        <TodoList v-if="activeTab === 'todo'" />
        <Schedule v-if="activeTab === 'schedule'" />
      </div>
    </main>
  </div>
</template>

<script>
import TodoList from './components/TodoList.vue'
import Schedule from './components/Schedule.vue'

export default {
  name: 'App',
  components: {
    TodoList,
    Schedule
  },
  data() {
    return {
      activeTab: 'todo'
    }
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
}

.app-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  text-align: center;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #4CAF50;
  color: white;
  border-radius: 8px;
}

.app-header h1 {
  font-size: 2rem;
}

.tabs {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  gap: 10px;
}

.tabs button {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  background-color: #e0e0e0;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.tabs button:hover {
  background-color: #bdbdbd;
}

.tabs button.active {
  background-color: #4CAF50;
  color: white;
}

.tab-content {
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .app-container {
    padding: 10px;
  }
  
  .app-header h1 {
    font-size: 1.5rem;
  }
  
  .tabs {
    flex-direction: column;
    align-items: center;
  }
  
  .tabs button {
    width: 100%;
    max-width: 200px;
  }
}
</style>

调度不同的网站

3.