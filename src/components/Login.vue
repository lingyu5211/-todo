<template>
  <div class="login-container">
    <div class="login-card">
      <h2 class="login-title">登录</h2>
      <el-form :model="loginForm" :rules="rules" ref="loginFormRef" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="loginForm.password" type="password" placeholder="请输入密码" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" class="login-button">
            登录
          </el-button>
        </el-form-item>
      </el-form>
      <div class="login-info">
        <p>测试账号：</p>
        <p>普通用户：user / 123456</p>
        <p>管理员：admin / 123456</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import { login } from '../utils/api'

export default {
  name: 'Login',
  emits: ['login-success'],
  setup(props, { emit }) {
    const loginFormRef = ref(null)
    const loading = ref(false)
    const loginForm = reactive({
      username: '',
      password: ''
    })
    const rules = {
      username: [
        { required: true, message: '请输入用户名', trigger: 'blur' }
      ],
      password: [
        { required: true, message: '请输入密码', trigger: 'blur' }
      ]
    }

    const handleLogin = async () => {
      if (!loginFormRef.value) return
      
      try {
        await loginFormRef.value.validate()
        loading.value = true
        
        const userInfo = await login(loginForm.username, loginForm.password)
        // 保存用户信息到本地存储
        localStorage.setItem('userInfo', JSON.stringify(userInfo))
        localStorage.setItem('token', userInfo.token)
        
        emit('login-success', userInfo)
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error(error.message || '登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    }

    return {
      loginFormRef,
      loading,
      loginForm,
      rules,
      handleLogin
    }
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.login-card {
  background-color: white;
  border-radius: 12px;
  padding: 30px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
  font-size: 24px;
  font-weight: bold;
}

.login-button {
  width: 100%;
  margin-top: 20px;
  padding: 12px;
  font-size: 16px;
}

.login-info {
  margin-top: 20px;
  padding: 15px;
  background-color: #f5f7fa;
  border-radius: 8px;
  font-size: 14px;
  color: #606266;
}

.login-info p {
  margin: 5px 0;
}

.login-info p:first-child {
  font-weight: bold;
  margin-bottom: 10px;
}

@media (max-width: 768px) {
  .login-card {
    padding: 20px;
  }
  
  .login-title {
    font-size: 20px;
    margin-bottom: 20px;
  }
}
</style>