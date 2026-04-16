<template>
  <div class="profile-container">
    <!-- 顶部背景和用户信息 -->
    <div class="profile-header">
      <img 
        src="../img/bg1.jpg" 
        alt="背景" 
        class="header-bg"
      />
      <div class="header-content">
        <div class="header-actions">
          <el-button circle size="small" class="action-btn">
            <span>❓</span>
          </el-button>
          <el-button circle size="small" class="action-btn">
            <span>⚙️</span>
          </el-button>
          <el-button circle size="small" class="action-btn" @click="handleLogout">
            <span>🚪</span>
          </el-button>
        </div>
        <div class="user-info">
            <div class="avatar">
              <div class="avatar-img">
                {{ userInfo.avatar }}
              </div>
              <span class="crown">👑</span>
            </div>
            <div class="stats-badges">
              <el-tag type="danger" class="stat-badge">共专注{{ userInfo.totalFocusDays }}天</el-tag>
              <el-tag type="danger" class="stat-badge">连续专注{{ userInfo.consecutiveFocusDays }}天</el-tag>
              <el-tag v-if="userInfo.role === 'admin'" type="warning" class="stat-badge">管理员</el-tag>
            </div>
            <div class="user-name">
              <h2>{{ userInfo.name }}</h2>
            </div>
            <p class="user-motto">{{ userInfo.motto }}</p>
          </div>
      </div>
    </div>

    <!-- 快捷功能 -->
    <el-card class="feature-card">
      <div class="feature-grid">
        <div class="feature-item">
          <div class="feature-icon">
            <span>🎯</span>
          </div>
          <p>未来倒计时</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <span>📊</span>
          </div>
          <p>专注历史记录</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon">
            <span>📈</span>
          </div>
          <p>自习室 | 许愿墙</p>
        </div>
      </div>
    </el-card>

    <!-- 设置选项列表 -->
    <div class="settings-list">
      <!-- 季度卡 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon vip">VIP</span>
            <div class="setting-info">
              <h3>季度卡</h3>
              <p>众多新颖高级功能，助你养成专注好习惯</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 备份恢复 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">☁️</span>
            <div class="setting-info">
              <h3>备份 | 恢复 | 云同步</h3>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 专注计时核心设置 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">⏰</span>
            <div class="setting-info">
              <h3>专注计时核心设置</h3>
              <p>铃声震动 | 专注格言 | 休息时长</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 海报背景和外观 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">🎨</span>
            <div class="setting-info">
              <h3>海报背景和外观</h3>
              <p>待办和专注背景</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 自定义底栏模块 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">🔧</span>
            <div class="setting-info">
              <h3>自定义底栏模块</h3>
              <p>选择要在主界面展示的功能</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 主题颜色搭配 -->
      <el-card class="setting-card" @click="showThemeDialog = true">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">🎨</span>
            <div class="setting-info">
              <h3>主题颜色搭配</h3>
              <p>主题色 | 专注分布图配色</p>
            </div>
          </div>
          <div class="setting-right">
            <div class="color-preview" :style="{ backgroundColor: currentTheme.color }"></div>
          </div>
        </div>
      </el-card>

      <!-- 桌面小组件选项 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">📱</span>
            <div class="setting-info">
              <h3>桌面小组件选项</h3>
              <p>小组件功能 | 背景图等</p>
            </div>
          </div>
        </div>
      </el-card>

      <!-- 其他设置 -->
      <el-card class="setting-card">
        <div class="setting-item">
          <div class="setting-left">
            <span class="setting-icon">⚙️</span>
            <div class="setting-info">
              <h3>其他设置</h3>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 主题选择对话框 -->
    <el-dialog v-model="showThemeDialog" title="主题颜色搭配" width="90%">
      <div class="theme-grid">
        <div 
          v-for="theme in themes" 
          :key="theme.id"
          class="theme-item"
          :class="{ active: currentTheme.id === theme.id }"
          @click="selectTheme(theme)"
        >
          <div class="theme-color" :style="{ backgroundColor: theme.color }"></div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { getThemeSettings, saveThemeSettings } from '../utils/api'

export default {
  name: 'Profile',
  props: {
    userInfo: {
      type: Object,
      required: true
    }
  },
  emits: ['logout'],
  setup(props, { emit }) {
    const showThemeDialog = ref(false)
    
    const themes = [
      { id: 1, color: '#409EFF' },
      { id: 2, color: '#67C23A' },
      { id: 3, color: '#E6A23C' },
      { id: 4, color: '#F56C6C' },
      { id: 5, color: '#909399' },
      { id: 6, color: '#9C27B0' },
      { id: 7, color: '#00BCD4' },
      { id: 8, color: '#FF9800' }
    ]
    
    const currentTheme = ref(themes[0])
    
    // 加载主题设置
    const loadThemeSettings = async () => {
      try {
        const data = await getThemeSettings()
        // 找到对应的主题
        const theme = themes.find(t => t.id === data.id) || themes[0]
        currentTheme.value = theme
      } catch (error) {
        console.error('Error loading theme settings:', error)
      }
    }
    
    const selectTheme = async (theme) => {
      currentTheme.value = theme
      try {
        await saveThemeSettings(theme)
        console.log('Theme saved successfully')
      } catch (error) {
        console.error('Error saving theme:', error)
      }
    }
    
    const handleLogout = () => {
      emit('logout')
    }
    
    onMounted(() => {
      loadThemeSettings()
    })
    
    return {
      showThemeDialog,
      themes,
      currentTheme,
      selectTheme,
      handleLogout
    }
  }
}
</script>

<style scoped>
.profile-container {
  background-color: #f5f5f5;
  min-height: 100vh;
  padding-bottom: 100px;
}

.profile-header {
  position: relative;
  height: 280px;
  overflow: hidden;
}

.header-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: brightness(0.8);
}

.header-content {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  padding: 20px;
}

.header-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.action-btn {
  background-color: rgba(255, 255, 255, 0.3);
  color: white;
}

.user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.avatar {
  position: relative;
  margin-bottom: 10px;
}

.avatar-img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: #1a237e;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36px;
  border: 3px solid white;
}

.crown {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 24px;
}

.stats-badges {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.stat-badge {
  background-color: rgba(255, 107, 129, 0.9);
  border: none;
  color: white;
}

.user-name h2 {
  color: white;
  font-size: 24px;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.user-motto {
  color: white;
  font-size: 14px;
  margin: 5px 0 0;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.feature-card {
  margin: -30px 20px 20px;
  border-radius: 20px;
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 10;
  position: relative;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  padding: 20px 0;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
}

.feature-icon {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  margin-bottom: 8px;
}

.feature-item:nth-child(1) .feature-icon {
  background-color: rgba(100, 221, 23, 0.1);
}

.feature-item:nth-child(2) .feature-icon {
  background-color: rgba(102, 126, 234, 0.1);
}

.feature-item:nth-child(3) .feature-icon {
  background-color: rgba(255, 107, 129, 0.1);
}

.feature-item p {
  margin: 0;
  font-size: 12px;
  color: #606266;
}

.settings-list {
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.setting-card {
  border-radius: 12px;
  border: none;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 5px 0;
}

.setting-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.setting-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  background-color: #f0f2f5;
}

.setting-icon.vip {
  background-color: rgba(139, 119, 101, 0.1);
  color: #8b7765;
  font-weight: bold;
  font-size: 14px;
}

.setting-info h3 {
  margin: 0;
  font-size: 16px;
  color: #303133;
}

.setting-info p {
  margin: 4px 0 0;
  font-size: 12px;
  color: #909399;
}

.setting-right {
  display: flex;
  align-items: center;
}

.color-preview {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px 0;
}

.theme-item {
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

.theme-color {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  transition: transform 0.3s ease;
  border: 3px solid transparent;
}

.theme-item.active .theme-color {
  border-color: #303133;
  transform: scale(1.1);
}

.theme-item:hover .theme-color {
  transform: scale(1.05);
}

/* PC端样式 */
@media (min-width: 1024px) {
  .profile-container {
    max-width: 600px;
    margin: 0 auto;
  }
  
  .profile-header {
    height: 320px;
  }
  
  .feature-card {
    margin: -30px auto 20px;
    max-width: 560px;
  }
  
  .settings-list {
    max-width: 560px;
    margin: 0 auto;
  }
}
</style>