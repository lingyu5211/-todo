<template>
  <div class="stats-container">
    <div class="stats-header">
      <h1>统计数据</h1>
      <div class="header-actions">
        <el-button circle size="small" class="action-btn" @click="loadStats">
          <span>🔄</span>
        </el-button>
        <el-button circle size="small" class="action-btn">
          <span>⏰</span>
        </el-button>
        <el-button circle size="small" class="action-btn">
          <span>🏆</span>
        </el-button>
      </div>
    </div>
    
    <el-skeleton v-if="loading" :rows="10" animated />
    <div v-else>

    <!-- 累计专注统计 -->
    <el-card class="stats-card">
      <div class="card-header">
        <span class="card-title">累计专注</span>
        <el-button text size="small">
          <span>🗓️</span>
        </el-button>
      </div>
      <div class="stats-grid">
        <div class="stat-item">
          <div class="stat-value">{{ stats.totalSessions }}</div>
          <div class="stat-label">次数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatDuration(stats.totalMinutes) }}</div>
          <div class="stat-label">时长</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ formatAvgDuration(stats.avgMinutes) }}</div>
          <div class="stat-label">日均时长</div>
        </div>
      </div>
    </el-card>

    <!-- 当日专注 -->
    <el-card class="stats-card">
      <div class="card-header">
        <span class="card-title">当日专注 {{ todayDate }}</span>
        <div class="date-nav">
          <el-button text size="small">
            <span>❮</span>
          </el-button>
          <el-button text size="small">
            <span>❯</span>
          </el-button>
        </div>
      </div>
      <div class="daily-stats">
        <div class="daily-stat">
          <div class="stat-value">{{ stats.todaySessions }}</div>
          <div class="stat-label">次数</div>
        </div>
        <div class="daily-stat">
          <div class="stat-value">{{ formatDuration(stats.todayMinutes) }}</div>
          <div class="stat-label">时长</div>
        </div>
      </div>
    </el-card>

    <!-- 专注时长分布 -->
    <el-card class="stats-card">
      <div class="card-header">
        <span class="card-title">专注时长分布 {{ todayDate }}</span>
        <div class="card-actions">
          <el-button text size="small">分享</el-button>
          <div class="date-nav">
            <el-button text size="small">
              <span>❮</span>
            </el-button>
            <el-button text size="small">
              <span>❯</span>
            </el-button>
          </div>
        </div>
      </div>
      <div class="time-distribution-tabs">
        <el-button 
          v-for="tab in timeTabs" 
          :key="tab"
          :type="activeTimeTab === tab ? 'primary' : 'default'"
          size="small"
          @click="activeTimeTab = tab"
        >
          {{ tab }}
        </el-button>
      </div>
      <div class="distribution-empty">
        <p>暂无专注数据，点击待办上的开始按钮来专注计时吧</p>
      </div>
      <el-button class="view-record-btn" text>查看专注记录</el-button>
    </el-card>

    <!-- 本月专注时段分布 -->
    <el-card class="stats-card">
      <div class="card-header">
        <span class="card-title">本月专注时段分布 {{ currentMonth }}</span>
        <div class="date-nav">
          <el-button text size="small">
            <span>❮</span>
          </el-button>
          <el-button text size="small">
            <span>❯</span>
          </el-button>
        </div>
      </div>
      <div class="monthly-distribution">
        <div class="y-axis">
          <div>80 分钟</div>
          <div>60 分钟</div>
          <div>40 分钟</div>
        </div>
        <div class="chart-container">
          <div class="bar" style="height: 100%;"></div>
        </div>
      </div>
    </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { getFocusStats } from '../utils/api'

export default {
  name: 'Stats',
  setup() {
    const timeTabs = ['日', '周', '月', '自定义']
    const activeTimeTab = ref('日')
    const loading = ref(true)
    
    const stats = ref({
      totalSessions: 0,
      totalMinutes: 0,
      avgMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0
    })

    const todayDate = computed(() => {
      const now = new Date()
      return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
    })

    const currentMonth = computed(() => {
      const now = new Date()
      return `${now.getFullYear()}年${now.getMonth() + 1}月`
    })

    const formatDuration = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      if (hours > 0) {
        return `${hours}小时${minutes > 0 ? minutes + '分钟' : ''}`
      }
      return `${minutes}分钟`
    }

    const formatAvgDuration = (totalMinutes) => {
      const hours = Math.floor(totalMinutes / 60)
      const minutes = totalMinutes % 60
      return `${hours}小时${minutes}分钟`
    }

    const loadStats = async () => {
      loading.value = true
      try {
        const data = await getFocusStats()
        stats.value = data
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      timeTabs,
      activeTimeTab,
      stats,
      loading,
      todayDate,
      currentMonth,
      formatDuration,
      formatAvgDuration,
      loadStats
    }
  }
}
</script>

<style scoped>
.stats-container {
  padding: 0;
  padding-bottom: 100px;
  background: linear-gradient(to bottom, #e0f7fa, #ffffff);
  min-height: 100vh;
}

.stats-header {
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

.stats-header h1 {
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

.action-btn {
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

.action-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.stats-card {
  margin: 20px;
  border-radius: 16px;
  border: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.card-title {
  font-weight: bold;
  color: #0288d1;
}

.card-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

.date-nav {
  display: flex;
  gap: 5px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: #0288d1;
}

.stat-label {
  font-size: 14px;
  color: #607d8b;
}

.daily-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.daily-stat {
  text-align: center;
}

.time-distribution-tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  justify-content: center;
}

.distribution-empty {
  text-align: center;
  padding: 40px 20px;
  color: #607d8b;
}

.view-record-btn {
  width: 100%;
  text-align: center;
  margin-top: 10px;
}

.monthly-distribution {
  display: flex;
  align-items: flex-end;
  height: 200px;
  position: relative;
}

.y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  font-size: 12px;
  color: #607d8b;
}

.chart-container {
  flex: 1;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  border-left: 1px solid #e0e0e0;
  padding-left: 20px;
}

.bar {
  width: 30px;
  background: linear-gradient(to top, #4fc3f7, #81c784);
  border-radius: 4px 4px 0 0;
}

/* PC端样式 */
@media (min-width: 1024px) {
  .stats-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .stats-header h1 {
    font-size: 32px;
  }
  
  .stat-value {
    font-size: 42px;
  }
}

/* 移动端样式 */
@media (max-width: 768px) {
  .stats-container {
    padding: 15px;
    padding-bottom: 100px;
  }
  
  .stats-header h1 {
    font-size: 24px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .stats-grid {
    gap: 10px;
  }
}
</style>