<template>
  <div class="app-container">
    <Login v-if="!isLoggedIn" @login-success="handleLoginSuccess" />
    
    <div v-else class="main-content">
      <TodoList v-if="activeTab === 'todo'" :active-tab="activeTab" ref="todoListRef" @start-focus="handleStartFocus" />
      <Schedule v-if="activeTab === 'schedule'" />
      <TodoSet v-if="activeTab === 'todoSet'" @start-focus="handleStartFocus" />
      <SelfDiscipline v-if="activeTab === 'lock'" :focus-todo="currentFocusTodo" @update:todo="handleUpdateTodo" />
      <Stats v-if="activeTab === 'stats'" />
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
import Stats from './components/Stats.vue'
import Profile from './components/Profile.vue'
import TodoSet from './components/TodoSet.vue'
import Login from './components/Login.vue'
import { getCurrentUser } from './utils/api'
import type { User, Todo } from './types'

const activeTab = ref<string>('todo')
const currentFocusTodo = ref<Todo | null>(null)
const isLoggedIn = ref<boolean>(false)
const userInfo = ref<User | null>(null)
const todoListRef = ref<InstanceType<typeof TodoList> | null>(null)

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

const handleLoginSuccess = (user: User) => {
  userInfo.value = user
  isLoggedIn.value = true
  activeTab.value = 'todo'
}

const handleLogout = async () => {
  localStorage.removeItem('userInfo')
  localStorage.removeItem('token')
  isLoggedIn.value = false
  userInfo.value = null
}

onMounted(() => {
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

@media (min-width: 1024px) {
  .app-container {
    max-width: 600px;
    margin: 0 auto;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  }
}
</style>
