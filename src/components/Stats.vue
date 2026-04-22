<template>
  <div class="stats-container">
    <div class="stats-header">
      <h1>统计数据</h1>
      <div class="header-actions">
        <el-button circle size="small" class="action-btn" @click="loadStats">
          <span>🔄</span>
        </el-button>
        <el-button circle size="small" class="action-btn" @click="openTimeSettings">
          <span>⏰</span>
        </el-button>
        <el-button circle size="small" class="action-btn" @click="viewAchievements">
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
          <el-button text size="small" @click="prevDate">
            <span>❮</span>
          </el-button>
          <el-button text size="small" @click="nextDate">
            <span>❯</span>
          </el-button>
        </div>
      </div>
      <div class="daily-stats">
        <div class="daily-stat">
          <div class="stat-value">{{ currentDaySessions }}</div>
          <div class="stat-label">次数</div>
        </div>
        <div class="daily-stat">
          <div class="stat-value">{{ formatDuration(currentDayMinutes) }}</div>
          <div class="stat-label">时长</div>
        </div>
      </div>
    </el-card>

    <!-- 专注时长分布 -->
    <el-card class="stats-card">
      <div class="card-header">
        <span class="card-title">专注时长分布 {{ todayDate }}</span>
        <div class="card-actions">
          <el-button text size="small" @click="shareStats">分享</el-button>
          <div class="date-nav">
            <el-button text size="small" @click="prevDate">
              <span>❮</span>
            </el-button>
            <el-button text size="small" @click="nextDate">
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
      <div v-if="stats.sessionsByDate && stats.sessionsByDate.length > 0">
        <div ref="focusDistributionChart" class="chart-container"></div>
      </div>
      <div v-else class="distribution-empty">
        <p>暂无专注数据，点击待办上的开始按钮来专注计时吧</p>
      </div>
      <el-button class="view-record-btn" text @click="viewRecords">查看专注记录</el-button>
    </el-card>

    <!-- 本月专注时段分布 -->
    <el-card class="stats-card">
      <div class="card-header">
        <span class="card-title">本月专注时段分布 {{ currentMonth }}</span>
        <div class="date-nav">
          <el-button text size="small" @click="prevMonth">
            <span>❮</span>
          </el-button>
          <el-button text size="small" @click="nextMonth">
            <span>❯</span>
          </el-button>
        </div>
      </div>
      <div v-if="stats.sessionsByDate && stats.sessionsByDate.length > 0">
        <div ref="monthlyDistributionChart" class="chart-container"></div>
      </div>
      <div v-else class="monthly-empty">
        <p>暂无专注数据，点击待办上的开始按钮来专注计时吧</p>
      </div>
    </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { getFocusStats } from '../utils/api'
import * as echarts from 'echarts'

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
      todayMinutes: 0,
      sessionsByDate: []
    })

    // 日期和月份状态
    const selectedDate = ref(new Date())
    const selectedMonth = ref(new Date())

    // 图表实例
    const focusDistributionChart = ref(null)
    const chartInstance = ref(null)
    const monthlyDistributionChart = ref(null)
    const monthlyChartInstance = ref(null)

    const todayDate = computed(() => {
      const date = selectedDate.value
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    })

    // 根据当前选择的日期获取对应的专注次数和时长
    const currentDaySessions = computed(() => {
      const sessionsByDate = stats.value.sessionsByDate || []
      const todayData = sessionsByDate.find(item => item.date === todayDate.value)
      return todayData ? todayData.sessions : 0
    })

    const currentDayMinutes = computed(() => {
      const sessionsByDate = stats.value.sessionsByDate || []
      const todayData = sessionsByDate.find(item => item.date === todayDate.value)
      return todayData ? todayData.minutes : 0
    })

    const currentMonth = computed(() => {
      const date = selectedMonth.value
      return `${date.getFullYear()}年${date.getMonth() + 1}月`
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
        // 更新图表
        updateChart()
        updateMonthlyChart()
      } catch (error) {
        console.error('Error loading stats:', error)
      } finally {
        loading.value = false
      }
    }

    // 初始化图表
    const initChart = () => {
      if (focusDistributionChart.value && !chartInstance.value) {
        chartInstance.value = echarts.init(focusDistributionChart.value)
        updateChart()
      }
      if (monthlyDistributionChart.value && !monthlyChartInstance.value) {
        monthlyChartInstance.value = echarts.init(monthlyDistributionChart.value)
        updateMonthlyChart()
      }
    }

    // 更新图表
    const updateChart = () => {
      if (chartInstance.value) {
        const sessionsByDate = stats.value.sessionsByDate || []
        
        // 准备图表数据 - 只显示当前选择日期的数据
        const selectedDateStr = todayDate.value
        const todayData = sessionsByDate.find(item => item.date === selectedDateStr)
        
        const dates = todayData ? [todayData.date] : [selectedDateStr]
        const minutes = todayData ? [todayData.minutes] : [0]
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
              interval: 0,
              rotate: 0
            }
          },
          yAxis: {
            type: 'value',
            name: '专注时长（分钟）',
            min: 0
          },
          series: [
            {
              name: '专注时长',
              type: 'bar',
              data: minutes,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#4fc3f7' },
                  { offset: 1, color: '#81c784' }
                ])
              }
            }
          ]
        }
        
        chartInstance.value.setOption(option)
      }
    }

    // 更新月度图表
    const updateMonthlyChart = () => {
      if (monthlyChartInstance.value) {
        const sessionsByDate = stats.value.sessionsByDate || []
        
        // 获取当前选择的月份
        const selectedMonthObj = new Date(selectedMonth.value)
        const selectedYear = selectedMonthObj.getFullYear()
        const selectedMonthNum = selectedMonthObj.getMonth() + 1 // 月份从0开始，需要加1
        const selectedMonthStr = `${selectedYear}-${String(selectedMonthNum).padStart(2, '0')}`
        
        // 过滤出当前选择月份的数据
        const monthlyData = sessionsByDate.filter(item => {
          return item.date.startsWith(selectedMonthStr)
        })
        
        // 准备图表数据 - 只显示当前选择月份的数据
        const dates = monthlyData.map(item => item.date)
        const minutes = monthlyData.map(item => item.minutes)
        
        const option = {
          tooltip: {
            trigger: 'axis',
            axisPointer: {
              type: 'shadow'
            }
          },
          grid: {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          },
          xAxis: {
            type: 'category',
            data: dates,
            axisLabel: {
              interval: 0,
              rotate: 45
            }
          },
          yAxis: {
            type: 'value',
            name: '专注时长（分钟）',
            min: 0
          },
          series: [
            {
              name: '专注时长',
              type: 'bar',
              data: minutes,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ff9800' },
                  { offset: 1, color: '#f57c00' }
                ])
              }
            }
          ]
        }
        
        monthlyChartInstance.value.setOption(option)
      }
    }

    // 监听窗口大小变化，调整图表大小
    const handleResize = () => {
      if (chartInstance.value) {
        chartInstance.value.resize()
      }
      if (monthlyChartInstance.value) {
        monthlyChartInstance.value.resize()
      }
    }

    // 日期导航
    const prevDate = () => {
      const newDate = new Date(selectedDate.value)
      newDate.setDate(newDate.getDate() - 1)
      selectedDate.value = newDate
      // 更新图表显示对应日期的数据
      updateChart()
      console.log('Previous date:', selectedDate.value)
    }

    const nextDate = () => {
      const newDate = new Date(selectedDate.value)
      newDate.setDate(newDate.getDate() + 1)
      selectedDate.value = newDate
      // 更新图表显示对应日期的数据
      updateChart()
      console.log('Next date:', selectedDate.value)
    }

    // 月份导航
    const prevMonth = () => {
      const newDate = new Date(selectedMonth.value)
      newDate.setMonth(newDate.getMonth() - 1)
      selectedMonth.value = newDate
      // 更新图表显示对应月份的数据
      updateMonthlyChart()
      console.log('Previous month:', selectedMonth.value)
    }

    const nextMonth = () => {
      const newDate = new Date(selectedMonth.value)
      newDate.setMonth(newDate.getMonth() + 1)
      selectedMonth.value = newDate
      // 更新图表显示对应月份的数据
      updateMonthlyChart()
      console.log('Next month:', selectedMonth.value)
    }

    // 分享功能
    const shareStats = () => {
      if (navigator.share) {
        navigator.share({
          title: '我的专注统计',
          text: `我已经专注了${stats.value.totalSessions}次，累计${formatDuration(stats.value.totalMinutes)}，日均${formatAvgDuration(stats.value.avgMinutes)}。`,
          url: window.location.href
        })
      } else {
        // 复制到剪贴板
        const text = `我已经专注了${stats.value.totalSessions}次，累计${formatDuration(stats.value.totalMinutes)}，日均${formatAvgDuration(stats.value.avgMinutes)}。`
        navigator.clipboard.writeText(text).then(() => {
          alert('分享内容已复制到剪贴板')
        })
      }
    }

    // 查看专注记录
    const viewRecords = () => {
      // 这里可以添加跳转到专注记录页面的逻辑
      console.log('View focus records')
      alert('查看专注记录功能开发中')
    }

    // 时间设置
    const openTimeSettings = () => {
      // 这里可以添加打开时间设置的逻辑
      console.log('Open time settings')
      alert('时间设置功能开发中')
    }

    // 成就系统
    const viewAchievements = () => {
      // 这里可以添加查看成就的逻辑
      console.log('View achievements')
      alert('成就系统功能开发中')
    }

    onMounted(() => {
      loadStats()
      // 延迟初始化图表，确保DOM已经渲染
      setTimeout(() => {
        initChart()
      }, 100)
      // 添加窗口大小变化监听
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      // 销毁图表实例
      if (chartInstance.value) {
        chartInstance.value.dispose()
        chartInstance.value = null
      }
      if (monthlyChartInstance.value) {
        monthlyChartInstance.value.dispose()
        monthlyChartInstance.value = null
      }
      // 移除窗口大小变化监听
      window.removeEventListener('resize', handleResize)
    })

    // 监听sessionsByDate变化，更新图表
    watch(() => stats.value.sessionsByDate, () => {
      updateChart()
      updateMonthlyChart()
    }, { deep: true })

    return {
      timeTabs,
      activeTimeTab,
      stats,
      loading,
      todayDate,
      currentDaySessions,
      currentDayMinutes,
      currentMonth,
      formatDuration,
      formatAvgDuration,
      loadStats,
      prevDate,
      nextDate,
      prevMonth,
      nextMonth,
      shareStats,
      viewRecords,
      openTimeSettings,
      viewAchievements,
      focusDistributionChart,
      monthlyDistributionChart
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

.distribution-empty,
.monthly-empty {
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

/* 专注分布图表容器 */
.chart-container {
  width: 100%;
  height: 300px;
  margin: 20px 0;
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