<template>
  <div class="app-container">
    <!-- 登录界面 -->
    <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    
    <!-- 主要内容区域 -->
    <div v-else class="main-content">
      <TodoList v-if="activeTab === 'todo'" :active-tab="activeTab" ref="todoListRef" @start-focus="handleStartFocus" />
      <Schedule v-if="activeTab === 'schedule'" />
      <TodoSet v-if="activeTab === 'todoSet'" />
      <SelfDiscipline v-if="activeTab === 'lock'" :focus-todo="currentFocusTodo" @update:todo="handleUpdateTodo" />
      <Stats v-if="activeTab === 'stats'" />
      <Profile v-if="activeTab === 'profile'" :user-info="userInfo" @logout="handleLogout" />
    </div>

    <!-- 底部导航栏 -->
    <BottomNav v-if="isLoggedIn" :activeTab="activeTab" @changeTab="handleTabChange" />
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import TodoList from './components/TodoList.vue'
import Schedule from './components/Schedule.vue'
import SelfDiscipline from './components/SelfDiscipline.vue'
import BottomNav from './components/BottomNav.vue'
import Stats from './components/Stats.vue'
import Profile from './components/Profile.vue'
import TodoSet from './components/TodoSet.vue'
import Login from './components/Login.vue'
import { getCurrentUser } from './utils/api'

export default {
  name: 'App',
  components: {
    TodoList,
    Schedule,
    SelfDiscipline,
    BottomNav,
    Stats,
    Profile,
    TodoSet,
    Login
  },
  setup() {
    const activeTab = ref('todo')
    const currentFocusTodo = ref(null)
    const isLoggedIn = ref(false)
    const userInfo = ref(null)
    const todoListRef = ref(null)

    // 检查登录状态
    const checkLoginStatus = async () => {
      try {
        const user = await getCurrentUser()
        if (user) {
          userInfo.value = user
          isLoggedIn.value = true
        } else {
          isLoggedIn.value = false
          userInfo.value = null
        }
      } catch (error) {
        console.error('Error checking login status:', error)
        isLoggedIn.value = false
        userInfo.value = null
      }
    }

    const handleTabChange = (tab) => {
      activeTab.value = tab
    }

    const handleStartFocus = (todo) => {
      currentFocusTodo.value = todo
      activeTab.value = 'lock'
    }

    const handleUpdateTodo = (updatedTodo) => {
      currentFocusTodo.value = updatedTodo
      // 无论当前在哪个标签页，都更新TodoList组件中的待办事项
      if (todoListRef.value) {
        todoListRef.value.loadTodos()
      }
    }

    const handleLoginSuccess = (user) => {
      userInfo.value = user
      isLoggedIn.value = true
      activeTab.value = 'todo'
    }

    const handleLogout = async () => {
      // 清除本地存储
      localStorage.removeItem('userInfo')
      localStorage.removeItem('token')
      isLoggedIn.value = false
      userInfo.value = null
    }

    onMounted(() => {
      checkLoginStatus()
    })

    return {
      activeTab,
      currentFocusTodo,
      isLoggedIn,
      userInfo,
      todoListRef,
      handleTabChange,
      handleStartFocus,
      handleUpdateTodo,
      handleLoginSuccess,
      handleLogout
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
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.main-content {
  padding-bottom: 80px;
  padding-bottom: calc(80px + env(safe-area-inset-bottom));
}

.placeholder-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  padding: 40px 20px;
}

.placeholder-page h2 {
  font-size: 24px;
  margin-bottom: 20px;
  color: #606266;
}

.placeholder-page p {
  font-size: 16px;
  color: #909399;
}

/* PC端样式 */
@media (min-width: 1024px) {
  .app-container {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>