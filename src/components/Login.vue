<template>
  <div class="login-wrapper">
    <!-- Decorative background shapes -->
    <div class="bg-shapes">
      <div class="shape shape-1"></div>
      <div class="shape shape-2"></div>
      <div class="shape shape-3"></div>
    </div>

    <div class="login-container">
      <div class="login-card">
        <!-- Branding -->
        <div class="brand">
          <div class="brand-icon">
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="4" y="8" width="40" height="32" rx="4" stroke="currentColor" stroke-width="2.5" fill="none"/>
              <line x1="4" y1="18" x2="44" y2="18" stroke="currentColor" stroke-width="2.5"/>
              <line x1="16" y1="8" x2="16" y2="40" stroke="currentColor" stroke-width="2.5" stroke-dasharray="2 3"/>
              <line x1="32" y1="8" x2="32" y2="40" stroke="currentColor" stroke-width="2.5" stroke-dasharray="2 3"/>
              <rect x="8" y="22" width="6" height="6" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="20" y="22" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="8" y="30" width="6" height="6" rx="1" fill="currentColor" opacity="0.5"/>
              <rect x="20" y="30" width="6" height="6" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="34" y="22" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
              <rect x="34" y="30" width="6" height="6" rx="1" fill="currentColor" opacity="0.7"/>
            </svg>
          </div>
          <h1 class="brand-title">日程计划系统</h1>
          <p class="brand-subtitle">Schedule Planner</p>
        </div>

        <!-- Tab Switcher -->
        <div class="tab-switcher">
          <button
            :class="['tab-btn', { active: !isRegister }]"
            @click="isRegister = false"
          >
            登录
          </button>
          <button
            :class="['tab-btn', { active: isRegister }]"
            @click="isRegister = true"
          >
            注册
          </button>
        </div>

        <!-- Login Form -->
        <el-form
          v-if="!isRegister"
          :model="loginForm"
          :rules="loginRules"
          ref="loginFormRef"
          label-position="top"
          class="login-form"
          @keyup.enter="handleLogin"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              :prefix-icon="UserIcon"
              size="large"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              :prefix-icon="LockIcon"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleLogin"
              :loading="loading"
              class="login-button"
              size="large"
            >
              {{ loading ? '登录中...' : '登 录' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Register Form -->
        <el-form
          v-if="isRegister"
          :model="registerForm"
          :rules="registerRules"
          ref="registerFormRef"
          label-position="top"
          class="login-form"
          @keyup.enter="handleRegister"
        >
          <el-form-item label="用户名" prop="username">
            <el-input
              v-model="registerForm.username"
              placeholder="用于登录的唯一用户名"
              :prefix-icon="UserIcon"
              size="large"
            />
          </el-form-item>
          <el-form-item label="显示名称" prop="name">
            <el-input
              v-model="registerForm.name"
              placeholder="你的姓名或昵称"
              size="large"
            />
          </el-form-item>
          <el-form-item label="邮箱" prop="email">
            <el-input
              v-model="registerForm.email"
              placeholder="example@company.com"
              size="large"
            />
          </el-form-item>
          <el-form-item label="密码" prop="password">
            <el-input
              v-model="registerForm.password"
              type="password"
              placeholder="至少6位密码"
              :prefix-icon="LockIcon"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item label="确认密码" prop="confirmPassword">
            <el-input
              v-model="registerForm.confirmPassword"
              type="password"
              placeholder="再次输入密码"
              :prefix-icon="LockIcon"
              size="large"
              show-password
            />
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              @click="handleRegister"
              :loading="registerLoading"
              class="login-button"
              size="large"
            >
              {{ registerLoading ? '注册中...' : '注 册' }}
            </el-button>
          </el-form-item>
        </el-form>

        <!-- Test Accounts (login mode only) -->
        <div v-if="!isRegister" class="test-accounts">
          <div class="divider">
            <span class="divider-text">测试账号</span>
          </div>
          <div class="account-row">
            <span class="account-role">普通用户</span>
            <code class="account-cred">user / 123456</code>
          </div>
          <div class="account-row">
            <span class="account-role">管理员</span>
            <code class="account-cred">admin / 123456</code>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <p class="login-footer"> Todo Schedule System</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, h } from 'vue'
import type { FormInstance } from 'element-plus'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { login, register } from '../utils/api'
import type { User as UserType } from '../types'

const UserIcon = h(User)
const LockIcon = h(Lock)

const emit = defineEmits<{
  (e: 'login-success', user: UserType): void
}>()

// Login refs
const loginFormRef = ref<FormInstance | null>(null)
const loading = ref(false)

// Register refs
const registerFormRef = ref<FormInstance | null>(null)
const registerLoading = ref(false)
const isRegister = ref(false)

// Login form
const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' }
  ]
}

// Register form
const registerForm = reactive({
  username: '',
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
})

const validateConfirmPassword = (_rule: any, value: string, callback: any) => {
  if (value !== registerForm.password) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

const registerRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 20, message: '用户名长度在3-20个字符之间', trigger: 'blur' }
  ],
  name: [
    { required: true, message: '请输入显示名称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginFormRef.value) return

  try {
    const valid = await loginFormRef.value.validate()
    if (!valid) return
    loading.value = true

    const userInfo = await login(loginForm.username, loginForm.password)
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('token', userInfo.token)

    emit('login-success', userInfo)
  } catch (error) {
    console.error('Login error:', error)
    ElMessage.error(error instanceof Error ? error.message : '登录失败，请检查用户名和密码')
  } finally {
    loading.value = false
  }
}

const handleRegister = async () => {
  if (!registerFormRef.value) return

  try {
    const valid = await registerFormRef.value.validate()
    if (!valid) return
    registerLoading.value = true

    const userInfo = await register({
      username: registerForm.username,
      password: registerForm.password,
      name: registerForm.name,
      email: registerForm.email
    })
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    localStorage.setItem('token', userInfo.token)

    ElMessage.success('注册成功！欢迎使用日程计划系统')
    emit('login-success', userInfo)
  } catch (error) {
    console.error('Register error:', error)
    ElMessage.error(error instanceof Error ? error.message : '注册失败，请稍后重试')
  } finally {
    registerLoading.value = false
  }
}
</script>

<style scoped>
.login-wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #1a1a2e 100%);
}

/* ============ Decorative Background ============ */
.bg-shapes {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.shape {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.15;
}

.shape-1 {
  width: 600px;
  height: 600px;
  background: #3b82f6;
  top: -200px;
  right: -100px;
  animation: float 20s ease-in-out infinite;
}

.shape-2 {
  width: 400px;
  height: 400px;
  background: #8b5cf6;
  bottom: -100px;
  left: -100px;
  animation: float 25s ease-in-out infinite reverse;
}

.shape-3 {
  width: 300px;
  height: 300px;
  background: #06b6d4;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  animation: float 15s ease-in-out infinite;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}

/* ============ Layout ============ */
.login-container {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 440px;
  padding: 20px;
  animation: fadeUp 0.8s ease-out;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* ============ Card ============ */
.login-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 40px 32px 32px;
  box-shadow:
    0 4px 6px rgba(0, 0, 0, 0.1),
    0 12px 40px rgba(0, 0, 0, 0.2),
    0 0 0 1px rgba(255, 255, 255, 0.05) inset;
  transition: box-shadow 0.3s ease;
}

/* ============ Branding ============ */
.brand {
  text-align: center;
  margin-bottom: 24px;
}

.brand-icon {
  width: 56px;
  height: 56px;
  margin: 0 auto 16px;
  color: #60a5fa;
  animation: pulseGlow 3s ease-in-out infinite;
}

@keyframes pulseGlow {
  0%, 100% { filter: drop-shadow(0 0 8px rgba(96, 165, 250, 0.3)); }
  50% { filter: drop-shadow(0 0 16px rgba(96, 165, 250, 0.6)); }
}

.brand-title {
  font-size: 26px;
  font-weight: 700;
  color: #f1f5f9;
  letter-spacing: 2px;
  margin: 0 0 6px;
}

.brand-subtitle {
  font-size: 14px;
  color: #94a3b8;
  letter-spacing: 4px;
  text-transform: uppercase;
  margin: 0;
}

/* ============ Tab Switcher ============ */
.tab-switcher {
  display: flex;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  color: #64748b;
  font-size: 15px;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.25s ease;
  letter-spacing: 2px;
}

.tab-btn.active {
  background: rgba(59, 130, 246, 0.2);
  color: #60a5fa;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
}

.tab-btn:hover:not(.active) {
  color: #94a3b8;
}

/* ============ Form ============ */
.login-form {
  margin-bottom: 8px;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 20px;
}

.login-form :deep(.el-form-item__label) {
  color: #cbd5e1;
  font-size: 14px;
  font-weight: 500;
  padding-bottom: 6px;
}

.login-form :deep(.el-input__wrapper) {
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 10px;
  box-shadow: none;
  padding: 4px 12px;
  transition: all 0.25s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  border-color: rgba(96, 165, 250, 0.4);
  background: rgba(255, 255, 255, 0.08);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  border-color: #3b82f6;
  background: rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.login-form :deep(.el-input__inner) {
  color: #f1f5f9;
  height: 42px;
  font-size: 15px;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: #64748b;
}

.login-form :deep(.el-input__prefix) {
  margin-right: 8px;
}

.login-form :deep(.el-input__prefix-inner) {
  color: #64748b;
  font-size: 18px;
}

.login-form :deep(.el-input__wrapper.is-focus) .el-input__prefix-inner {
  color: #60a5fa;
}

.login-form :deep(.el-input__suffix) .el-input__icon {
  color: #64748b;
}

.login-form :deep(.el-form-item.is-error .el-input__wrapper) {
  border-color: #f87171;
  background: rgba(248, 113, 113, 0.06);
}

.login-form :deep(.el-form-item__error) {
  color: #f87171;
  font-size: 12px;
  padding-top: 4px;
}

/* ============ Button ============ */
.login-button {
  width: 100%;
  height: 48px;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 4px;
  border-radius: 10px;
  border: none;
  margin-top: 4px;
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: #fff;
  transition: all 0.25s ease;
  cursor: pointer;
}

.login-button:hover {
  background: linear-gradient(135deg, #60a5fa, #3b82f6);
  transform: translateY(-1px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.35);
}

.login-button:active {
  transform: translateY(0);
}

.login-button.is-loading {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  opacity: 0.8;
}

.login-button:focus-visible {
  outline: 2px solid #60a5fa;
  outline-offset: 2px;
}

/* ============ Test Accounts ============ */
.test-accounts {
  margin-top: 24px;
}

.divider {
  display: flex;
  align-items: center;
  margin-bottom: 16px;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.15) 50%,
    transparent
  );
}

.divider-text {
  padding: 0 16px;
  font-size: 12px;
  color: #64748b;
  letter-spacing: 2px;
  text-transform: uppercase;
  white-space: nowrap;
}

.account-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 14px;
  margin-bottom: 6px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.account-row:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.1);
}

.account-role {
  font-size: 13px;
  color: #94a3b8;
  font-weight: 500;
}

.account-cred {
  font-size: 12px;
  color: #64748b;
  background: rgba(255, 255, 255, 0.06);
  padding: 3px 10px;
  border-radius: 4px;
  font-family: 'SF Mono', 'Fira Code', 'Courier New', monospace;
}

/* ============ Footer ============ */
.login-footer {
  text-align: center;
  margin-top: 20px;
  font-size: 12px;
  color: #475569;
  letter-spacing: 1px;
}

/* ============ Responsive ============ */
@media (max-width: 480px) {
  .login-container {
    padding: 16px;
  }

  .login-card {
    padding: 28px 20px 24px;
    border-radius: 16px;
  }

  .brand-icon {
    width: 48px;
    height: 48px;
  }

  .brand-title {
    font-size: 22px;
  }

  .brand-subtitle {
    font-size: 12px;
    letter-spacing: 3px;
  }

  .login-form :deep(.el-form-item) {
    margin-bottom: 16px;
  }

  .account-row {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
    padding: 10px 14px;
  }
}

@media (max-width: 768px) and (min-width: 481px) {
  .login-card {
    padding: 36px 28px 28px;
  }
}

/* ============ Reduced Motion ============ */
@media (prefers-reduced-motion: reduce) {
  .shape {
    animation: none;
  }

  .login-container {
    animation: none;
  }

  .brand-icon {
    animation: none;
  }
}
</style>
