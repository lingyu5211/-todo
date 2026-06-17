<template>
  <div class="app-container">
    <div v-if="isLoading" class="loading-container">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>
    
    <Login v-else-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    
    <div v-else class="main-content">
      <TodoList v-if="activeTab === 'todo'" :active-tab="activeTab" ref="todoListRef" @start-focus="handleStartFocus" />
      <Schedule v-if="activeTab === 'schedule'" />
      <TodoSet v-if="activeTab === 'todoSet'" @start-focus="handleStartFocus" />
      <SelfDiscipline v-if="activeTab === 'lock'" :focus-todo="currentFocusTodo" @update:todo="handleUpdateTodo" />
      <StatsDashboard v-if="activeTab === 'stats'" />
      <StudyRoomList v-if="activeTab === 'studyRoom'" @enter-room="handleEnterStudyRoom" @go-leaderboard="activeTab = 'leaderboard'" />
      <StudyRoom v-if="activeTab === 'studyRoomDetail' && currentRoomId !== null" :room-id="currentRoomId" @back="handleStudyRoomBack" />
      <Leaderboard v-if="activeTab === 'leaderboard'" />
      <Profile v-if="activeTab === 'profile'" :user-info="userInfo" @logout="handleLogout" />
    </div>

    <BottomNav v-if="isLoggedIn" :activeTab="activeTab" @changeTab="handleTabChange" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import TodoList from './components/TodoList.vue'
import Schedule from './components/Schedule.vue'
import SelfDiscipline from './components/SelfDiscipline.vue'
import BottomNav from './components/BottomNav.vue'
import StatsDashboard from './components/stats/StatsDashboard.vue'
import Profile from './components/Profile.vue'
import TodoSet from './components/TodoSet.vue'
import Login from './components/Login.vue'
import StudyRoomList from './views/StudyRoomList.vue'
import StudyRoom from './views/StudyRoom.vue'
import Leaderboard from './views/Leaderboard.vue'
import { login as apiLogin } from './utils/api'
import { useTheme } from './composables/useTheme'
import type { User, Todo } from './types'

const { initTheme } = useTheme()

const API_BASE_URL = 'http://localhost:3000/api'

const activeTab = ref<string>('todo')
const currentFocusTodo = ref<Todo | null>(null)
const isLoggedIn = ref<boolean>(false)
const isLoading = ref<boolean>(true)
const userInfo = ref<User | null>(null)
const currentRoomId = ref<number | null>(null)
const todoListRef = ref<InstanceType<typeof TodoList> | null>(null)

const checkLoginStatus = async () => {
  isLoading.value = true
  try {
    const token = localStorage.getItem('token')
    const savedUser = localStorage.getItem('userInfo')
    
    if (token && savedUser) {
      try {
        const user = JSON.parse(savedUser)
        const response = await fetch(`${API_BASE_URL}/user/info`, {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        
        if (response.ok) {
          const freshUserInfo = await response.json()
          userInfo.value = {
            ...user,
            ...freshUserInfo,
          }
          isLoggedIn.value = true
        } else {
          throw new Error('Token invalid')
        }
      } catch (error) {
        console.error('Token expired or invalid:', error)
        localStorage.removeItem('token')
        localStorage.removeItem('userInfo')
        isLoggedIn.value = false
        userInfo.value = null
      }
    } else {
      isLoggedIn.value = false
      userInfo.value = null
    }
  } catch (error) {
    console.error('Error checking login status:', error)
    isLoggedIn.value = false
    userInfo.value = null
  } finally {
    isLoading.value = false
  }
}

const handleTabChange = (tab: string) => {
  activeTab.value = tab
}

const handleStartFocus = (todo: Todo) => {
  currentFocusTodo.value = todo
  activeTab.value = 'lock'
}

const handleUpdateTodo = (updatedTodo: Todo) => {
  currentFocusTodo.value = updatedTodo
  if (todoListRef.value) {
    todoListRef.value.loadTodos()
  }
}

const handleLoginSuccess = async (user: User) => {
  localStorage.setItem('userInfo', JSON.stringify(user))
  localStorage.setItem('token', user.token)
  
  try {
    const freshUserInfo = await getUserInfo()
    userInfo.value = {
      ...user,
      ...freshUserInfo,
    }
  } catch (error) {
    userInfo.value = user
  }
  
  isLoggedIn.value = true
  activeTab.value = 'todo'
  
  if (todoListRef.value) {
    todoListRef.value.loadTodos()
  }
}

const handleLogout = async () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
  isLoggedIn.value = false
  userInfo.value = null
  activeTab.value = 'todo'
}

const handleEnterStudyRoom = (roomId: number) => {
  currentRoomId.value = roomId
  activeTab.value = 'studyRoomDetail'
}

const handleStudyRoomBack = () => {
  activeTab.value = 'studyRoom'
}

onMounted(() => {
  initTheme()
  checkLoginStatus()
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  min-height: 100vh;
  overflow-x: hidden;
}

.app-container {
  width: 100%;
  min-height: 100vh;
  position: relative;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 5px solid rgba(255, 255, 255, 0.1);
  border-top-color: var(--theme-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-container p {
  margin-top: 20px;
  color: #fff;
  font-size: 16px;
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

@media (min-width: 1024px) {
  .app-container {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
