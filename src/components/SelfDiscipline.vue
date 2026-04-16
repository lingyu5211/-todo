<template>
  <div class="self-discipline-container">
    <!-- 开始界面 -->
    <div v-if="!isActive" class="discipline-start">
      <el-card class="start-card">
        <div class="start-content">
          <h2 class="title_self">自律钟</h2>
          <div v-if="focusTodo" class="focus-todo-info">
            <p class="focus-label">当前专注任务：</p>
            <p class="focus-text">{{ focusTodo.text }}</p>
          </div>
          
          <!-- 专注统计信息 -->
          <div class="stats-section">
            <h3>专注统计</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-label">今日专注</div>
                <div class="stat-value">{{ todayFocus }}分钟</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">本周专注</div>
                <div class="stat-value">{{ weekFocus }}分钟</div>
              </div>
              <div class="stat-item">
                <div class="stat-label">本月专注</div>
                <div class="stat-value">{{ monthFocus }}分钟</div>
              </div>
            </div>
          </div>
          
          <!-- 专注目标设置 -->
          <div class="goal-section">
            <h3>每日专注目标</h3>
            <div class="goal-setting">
              <el-input-number 
                v-model="dailyGoal" 
                :min="1" 
                :max="480" 
                :step="30"
                label="分钟"
                size="large"
              />
              <el-button type="success" @click="saveGoal" size="large">
                保存目标
              </el-button>
            </div>
            <div class="goal-progress" v-if="dailyGoal > 0">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  :style="{ width: `${Math.min((todayFocus / dailyGoal) * 100, 100)}%` }"
                ></div>
              </div>
            </div>
          </div>
          
          <!-- 最近专注记录 -->
          <div class="history-section">
            <h3>最近专注记录</h3>
            <div class="history-list">
              <div 
                v-for="(session, index) in recentSessions" 
                :key="index"
                class="history-item"
              >
                <div class="history-date">{{ formatDate(session.date) }}</div>
                <div class="history-duration">{{ session.duration }}分钟</div>
              </div>
              <div v-if="recentSessions.length === 0" class="no-history">
                暂无专注记录
              </div>
            </div>
          </div>
          
          <!-- 专注模式选择 -->
          <div class="mode-section">
            <h3>专注模式</h3>
            <div class="mode-selector">
              <el-radio-group v-model="selectedMode" size="large">
                <el-radio-button label="free">自由模式</el-radio-button>
                <el-radio-button label="pomodoro">番茄钟模式</el-radio-button>
              </el-radio-group>
            </div>
            <div v-if="selectedMode === 'pomodoro'" class="pomodoro-settings">
              <div class="setting-item">
                <span>专注时长：</span>
                <el-input-number 
                  v-model="pomodoroWorkTime" 
                  :min="5" 
                  :max="60" 
                  :step="5"
                  label="分钟"
                  size="medium"
                />
              </div>
              <div class="setting-item">
                <span>休息时长：</span>
                <el-input-number 
                  v-model="pomodoroBreakTime" 
                  :min="1" 
                  :max="30" 
                  :step="1"
                  label="分钟"
                  size="medium"
                />
              </div>
            </div>
          </div>
          
          <!-- 背景图片选择 -->
          <div class="background-section">
            <h3>背景选择</h3>
            <div class="background-options">
              <div 
                v-for="(bg, index) in backgroundOptions" 
                :key="index"
                class="background-item"
                :class="{ active: selectedBackground === index }"
                @click="selectBackground(index)"
              >
                <div class="background-preview" :style="{ background: bg }"></div>
              </div>
            </div>
          </div>
          
          <p>点击开始按钮，进入自律模式</p>
          <el-button type="primary" @click="startDiscipline" size="large">
            开始自律
          </el-button>
        </div>
      </el-card>
    </div>
    
    <!-- 自律模式界面 -->
    <div v-else class="discipline-active">
      <el-card class="discipline-card">
        <div class="discipline-content">
          <div v-if="focusTodo" class="focus-todo-display">
            <p class="focus-text">{{ focusTodo.text }}</p>
          </div>
          <div class="poetry-section">
            <p class="poetry">{{ currentPoetry }}</p>
          </div>
          
          <!-- 环形进度条 -->
          <div class="progress-section">
            <div class="progress-ring">
              <svg width="200" height="200" class="progress-svg">
                <circle
                  class="progress-bg"
                  cx="100"
                  cy="100"
                  r="80"
                  stroke-width="10"
                />
                <circle
                  class="progress-bar"
                  cx="100"
                  cy="100"
                  r="80"
                  stroke-width="10"
                  :stroke-dasharray="circumference"
                  :stroke-dashoffset="progressOffset"
                  transform="rotate(-90 100 100)"
                />
              </svg>
              <div class="progress-text">
                <div class="timer">{{ formattedTime }}</div>
                <div class="mode-status">{{ isPomodoroBreak ? '休息中' : '专注中' }}</div>
              </div>
            </div>
          </div>
          
          <!-- 鼓励语句 -->
          <div class="encouragement-section">
            <p class="encouragement">{{ currentEncouragement }}</p>
          </div>
          
          <div class="controls-section">
            <el-button 
              :type="isPaused ? 'primary' : 'info'" 
              @click="togglePause" 
              circle
              size="large"
            >
              {{ isPaused ? '▶' : '⏸' }}
            </el-button>
            <el-button 
              type="danger" 
              @click="stopDiscipline" 
              circle
              size="large"
            >
              ✕
            </el-button>
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script>
import { ref, computed, onUnmounted, onMounted } from 'vue'
import { createFocusSession, updateTodo, getFocusSessions } from '../utils/api'

export default {
  name: 'SelfDiscipline',
  components: {
  },
  props: {
    focusTodo: {
      type: Object,
      default: null
    }
  },
  emits: ['update:todo'],

  setup(props, { emit }) {
    const isActive = ref(false)
    const isPaused = ref(false)
    const startTime = ref(null)
    const pausedTime = ref(0)
    const timer = ref(null)
    const elapsedTime = ref(0)
    
    // 专注记录数据
    const focusSessions = ref([])
    
    // 加载专注记录
    const loadFocusSessions = async () => {
      try {
        const sessions = await getFocusSessions()
        // 按日期分组，计算每天的总专注时长
        const sessionsByDate = {}
        sessions.forEach(session => {
          const date = session.date
          if (!sessionsByDate[date]) {
            sessionsByDate[date] = 0
          }
          sessionsByDate[date] += session.duration
        })
        
        // 转换为数组格式
        const formattedSessions = Object.entries(sessionsByDate).map(([date, duration]) => ({
          date,
          duration
        }))
        
        focusSessions.value = formattedSessions
      } catch (error) {
        console.error('Error loading focus sessions:', error)
        // 如果加载失败，使用默认数据
        focusSessions.value = [
          { date: '2026-04-02', duration: 120 }, // 今日 2小时
          { date: '2026-04-01', duration: 90 },  // 昨日 1.5小时
          { date: '2026-03-31', duration: 150 }, // 前天 2.5小时
          { date: '2026-03-30', duration: 60 },  // 上周
          { date: '2026-03-29', duration: 180 }, // 上周
          { date: '2026-03-28', duration: 120 }, // 上周
          { date: '2026-03-27', duration: 90 },  // 上周
          { date: '2026-03-26', duration: 150 }, // 上周
          { date: '2026-03-15', duration: 180 }, // 本月
          { date: '2026-03-10', duration: 240 }, // 本月
        ]
      }
    }
    
    // 每日专注目标（默认180分钟，3小时）
    const dailyGoal = ref(parseInt(localStorage.getItem('dailyFocusGoal')) || 180)
    
    // 专注模式设置
    const selectedMode = ref('free') // 'free' 或 'pomodoro'
    const pomodoroWorkTime = ref(25) // 番茄钟工作时长（分钟）
    const pomodoroBreakTime = ref(5) // 番茄钟休息时长（分钟）
    const isPomodoroBreak = ref(false) // 是否处于番茄钟休息状态
    const pomodoroCycle = ref(0) // 番茄钟周期数
    const pomodoroTimer = ref(null) // 番茄钟计时器
    
    // 背景图片选项
    const backgroundOptions = [
      'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      'linear-gradient(135deg, #96fbc4 0%, #f9f586 100%)',
      'linear-gradient(135deg, #fad0c4 0%, #ffd1ff 100%)'
    ]
    const selectedBackground = ref(0) // 当前选择的背景索引
    

    
    // 诗句列表
    const poetryList = [
      "山不在高，有仙则名。水不在深，有龙则灵。",
      "海内存知己，天涯若比邻。",
      "长风破浪会有时，直挂云帆济沧海。",
      "会当凌绝顶，一览众山小。",
      "天行健，君子以自强不息。",
      "地势坤，君子以厚德载物。",
      "宁静致远，淡泊明志。",
      "非淡泊无以明志，非宁静无以致远。"
    ]
    
    // 鼓励语句列表（根据专注时长）
    const encouragementList = {
      0: ["开始你的专注之旅吧！", "专注是成功的关键。", "每一次专注都是成长。"],
      10: ["不错！已经专注了10分钟。", "继续保持，你做得很好。", "专注的感觉很棒，对吧？"],
      25: ["太棒了！完成了一个番茄钟。", "你的专注能力令人印象深刻。", "休息一下，准备下一轮专注。"],
      45: ["哇！已经专注了45分钟。", "你正在创造高效的一天。", "坚持就是胜利！"],
      60: ["惊人！已经专注了1小时。", "你是专注的典范。", "继续保持这种状态！"],
      90: ["太厉害了！已经专注了1.5小时。", "你的专注能力超乎想象。", "你正在走向成功的道路。"],
      120: ["超级棒！已经专注了2小时。", "你是真正的专注大师。", "今天的你非常出色！"]
    }
    
    const currentBackground = ref(backgroundOptions[selectedBackground.value])
    const currentPoetry = ref(poetryList[Math.floor(Math.random() * poetryList.length)])
    
    // 选择背景
    const selectBackground = (index) => {
      selectedBackground.value = index
      currentBackground.value = backgroundOptions[index]
    }
    
    // 根据专注时长获取鼓励语句
    const currentEncouragement = computed(() => {
      const minutes = Math.floor(elapsedTime.value / 60000)
      
      // 确定当前时长对应的鼓励语句级别
      let level = 0
      if (minutes >= 120) level = 120
      else if (minutes >= 90) level = 90
      else if (minutes >= 60) level = 60
      else if (minutes >= 45) level = 45
      else if (minutes >= 25) level = 25
      else if (minutes >= 10) level = 10
      
      // 从对应级别中随机选择一条鼓励语句
      const encouragements = encouragementList[level]
      return encouragements[Math.floor(Math.random() * encouragements.length)]
    })
    
    const formattedTime = computed(() => {
      const totalSeconds = Math.floor(elapsedTime.value / 1000)
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      const seconds = totalSeconds % 60
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    })
    
    // 计算今日专注时长
    const todayFocus = computed(() => {
      const today = new Date().toISOString().split('T')[0]
      return focusSessions.value
        .filter(session => session.date === today)
        .reduce((total, session) => total + session.duration, 0)
    })
    
    // 计算本周专注时长
    const weekFocus = computed(() => {
      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay() + 1) // 本周一
      weekStart.setHours(0, 0, 0, 0)
      
      return focusSessions.value
        .filter(session => {
          const sessionDate = new Date(session.date)
          return sessionDate >= weekStart
        })
        .reduce((total, session) => total + session.duration, 0)
    })
    
    // 计算本月专注时长
    const monthFocus = computed(() => {
      const now = new Date()
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
      
      return focusSessions.value
        .filter(session => {
          const sessionDate = new Date(session.date)
          return sessionDate >= monthStart
        })
        .reduce((total, session) => total + session.duration, 0)
    })
    
    // 最近的专注记录（最多显示5条）
    const recentSessions = computed(() => {
      return [...focusSessions.value]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5)
    })
    
    // 格式化日期显示
    const formatDate = (dateString) => {
      const date = new Date(dateString)
      return `${date.getMonth() + 1}月${date.getDate()}日`
    }
    
    // 环形进度条相关计算
    const radius = 80
    const circumference = 2 * Math.PI * radius
    
    // 计算进度偏移量
    const progressOffset = computed(() => {
      if (selectedMode.value === 'free') {
        // 自由模式，进度条持续增长（这里简化处理，实际可以根据目标时间计算）
        return circumference
      } else {
        // 番茄钟模式，根据当前是工作还是休息状态计算进度
        const totalTime = isPomodoroBreak.value 
          ? pomodoroBreakTime.value * 60 * 1000 
          : pomodoroWorkTime.value * 60 * 1000
        const progress = Math.min(elapsedTime.value / totalTime, 1)
        return circumference * (1 - progress)
      }
    })
    
    const startDiscipline = () => {
      isActive.value = true
      isPaused.value = false
      isPomodoroBreak.value = false
      pomodoroCycle.value = 0
      
      if (selectedMode.value === 'free') {
        // 自由模式
        startTime.value = Date.now() - pausedTime.value
        startTimer()
      } else {
        // 番茄钟模式
        startPomodoro()
      }
      
      // 使用用户选择的背景，随机选择诗句
      currentPoetry.value = poetryList[Math.floor(Math.random() * poetryList.length)]
    }
    
    // 记录番茄钟工作时间
    const pomodoroWorkTimeAccumulated = ref(0)
    
    // 开始番茄钟
    const startPomodoro = () => {
      isPomodoroBreak.value = false
      const workDuration = pomodoroWorkTime.value * 60 * 1000
      
      startTime.value = Date.now()
      elapsedTime.value = 0
      
      if (pomodoroTimer.value) clearTimeout(pomodoroTimer.value)
      
      pomodoroTimer.value = setTimeout(() => {
        // 工作时间结束，进入休息时间
        pomodoroCycle.value++
        // 累加工作时间
        pomodoroWorkTimeAccumulated.value += pomodoroWorkTime.value
        isPomodoroBreak.value = true
        
        // 可以添加提示音或通知
        console.log('番茄钟工作时间结束，开始休息')
        
        // 开始休息计时
        const breakDuration = pomodoroBreakTime.value * 60 * 1000
        startTime.value = Date.now()
        elapsedTime.value = 0
        
        pomodoroTimer.value = setTimeout(() => {
          // 休息时间结束，开始下一个番茄钟
          isPomodoroBreak.value = false
          console.log('番茄钟休息时间结束，开始下一个周期')
          startPomodoro()
        }, breakDuration)
      }, workDuration)
      
      startTimer()
    }
    
    const startTimer = () => {
      if (timer.value) clearInterval(timer.value)
      timer.value = setInterval(() => {
        if (!isPaused.value) {
          elapsedTime.value = Date.now() - startTime.value
        }
      }, 1000)
    }
    
    const togglePause = () => {
      isPaused.value = !isPaused.value
      if (isPaused.value) {
        pausedTime.value = Date.now() - startTime.value
        if (timer.value) clearInterval(timer.value)
      } else {
        startTime.value = Date.now() - pausedTime.value
        startTimer()
      }
    }
    
    const stopDiscipline = async () => {
      if (isActive.value && startTime.value) {
        // 计算专注时长（分钟）
        let duration = 0
        if (selectedMode.value === 'pomodoro') {
          // 番茄钟模式，只计算工作时间
          // 累加当前正在进行的工作时间
          if (!isPomodoroBreak.value) {
            const currentWorkDuration = Math.round((Date.now() - startTime.value) / 60000)
            duration = pomodoroWorkTimeAccumulated.value + currentWorkDuration
          } else {
            duration = pomodoroWorkTimeAccumulated.value
          }
        } else {
          // 自由模式，计算所有时间
          duration = Math.round((Date.now() - startTime.value) / 60000)
        }
        
        // 保存专注时间记录到数据库
        if (duration > 0) {
          const now = new Date()
          const date = now.toISOString().split('T')[0]
          const startTimeStr = new Date(startTime.value).toISOString()
          const endTimeStr = now.toISOString()
          
          try {
            await createFocusSession({
              todoId: props.focusTodo?.id || null,
              duration,
              date,
              startTime: startTimeStr,
              endTime: endTimeStr
            })
            console.log('Focus session saved successfully')
          } catch (error) {
            console.error('Error saving focus session:', error)
          }
          
          // 更新本地的 focusSessions 数组
          const existingSessionIndex = focusSessions.value.findIndex(session => session.date === date)
          if (existingSessionIndex !== -1) {
            // 如果今天已经有专注记录，更新它
            focusSessions.value[existingSessionIndex].duration += duration
          } else {
            // 如果今天没有专注记录，添加一个新的
            focusSessions.value.push({
              date,
              duration
            })
          }
          
          // 更新待办事项的专注时间和进度
          if (props.focusTodo) {
            try {
              const updatedCurrentMinutes = (props.focusTodo.currentMinutes || 0) + duration
              const targetMinutes = props.focusTodo.targetMinutes || 60
              const progress = Math.min(Math.round((updatedCurrentMinutes / targetMinutes) * 100), 100)
              
              const updatedTodo = await updateTodo(props.focusTodo.id, {
                currentMinutes: updatedCurrentMinutes,
                progress: progress,
                timeInfo: `${updatedCurrentMinutes}/${targetMinutes} 分钟`
              })
              console.log('Todo updated successfully')
              
              // 发送事件通知父组件更新待办事项
              emit('update:todo', {
                ...props.focusTodo,
                currentMinutes: updatedCurrentMinutes,
                progress: progress,
                timeInfo: `${updatedCurrentMinutes}/${targetMinutes} 分钟`
              })
            } catch (error) {
              console.error('Error updating todo:', error)
              // 即使发生错误，也要更新本地状态
              const updatedCurrentMinutes = (props.focusTodo.currentMinutes || 0) + duration
              const targetMinutes = props.focusTodo.targetMinutes || 60
              const progress = Math.min(Math.round((updatedCurrentMinutes / targetMinutes) * 100), 100)
              
              // 发送事件通知父组件更新待办事项
              emit('update:todo', {
                ...props.focusTodo,
                currentMinutes: updatedCurrentMinutes,
                progress: progress,
                timeInfo: `${updatedCurrentMinutes}/${targetMinutes} 分钟`
              })
            }
          }
        }
      }
      
      // 清除番茄钟计时器
      if (pomodoroTimer.value) {
        clearTimeout(pomodoroTimer.value)
        pomodoroTimer.value = null
      }
      
      isActive.value = false
      isPaused.value = false
      isPomodoroBreak.value = false
      pomodoroCycle.value = 0
      pomodoroWorkTimeAccumulated.value = 0
      if (timer.value) clearInterval(timer.value)
      elapsedTime.value = 0
      pausedTime.value = 0
      startTime.value = null
    }
    
    // 保存每日专注目标
    const saveGoal = () => {
      localStorage.setItem('dailyFocusGoal', dailyGoal.value.toString())
      // 可以添加一个提示信息
      console.log('每日专注目标已保存:', dailyGoal.value, '分钟')
    }
    
    onMounted(() => {
      loadFocusSessions()
    })
    
    onUnmounted(() => {
      if (timer.value) clearInterval(timer.value)
      if (pomodoroTimer.value) clearTimeout(pomodoroTimer.value)
    })
    
    return {
      isActive,
      isPaused,
      currentBackground,
      currentPoetry,
      formattedTime,
      todayFocus,
      weekFocus,
      monthFocus,
      dailyGoal,
      saveGoal,
      recentSessions,
      formatDate,
      selectedMode,
      pomodoroWorkTime,
      pomodoroBreakTime,
      isPomodoroBreak,
      pomodoroCycle,
      circumference,
      progressOffset,
      backgroundOptions,
      selectedBackground,
      selectBackground,
      currentEncouragement,
      startDiscipline,
      togglePause,
      stopDiscipline
    }
  }
}
</script>

<style scoped>
.self-discipline-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

/* 开始界面样式 */
.discipline-start {
  margin-bottom: 20px;
}

.start-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.start-content {
  text-align: center;
  padding: 40px;
}

.focus-todo-info {
  background-color: #e6f7ff;
  border: 1px solid #91d5ff;
  border-radius: 8px;
  padding: 15px 20px;
  margin-bottom: 20px;
}

.focus-label {
  font-size: 14px;
  color: #1890ff;
  margin: 0 0 8px;
}

.focus-text {
  font-size: 18px;
  font-weight: bold;
  color: #303133;
  margin: 0;
  word-wrap: break-word;
}

.start-content h2 {
  font-size: 28px;
  margin-bottom: 20px;
  color: #303133;
}

.start-content p {
  font-size: 16px;
  margin-bottom: 30px;
  color: #606266;
}

/* 统计信息样式 */
.stats-section {
  margin: 30px 0;
}

.stats-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  text-align: center;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  margin-bottom: 30px;
}

.stat-item {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.stat-label {
  font-size: 14px;
  color: #606266;
  margin-bottom: 5px;
}

.stat-value {
  font-size: 20px;
  font-weight: bold;
  color: #1890ff;
}

/* 目标设置样式 */
.goal-section {
  margin: 30px 0;
}

.goal-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  text-align: center;
}

.goal-setting {
  display: flex;
  gap: 15px;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
}

.goal-progress {
  margin-top: 20px;
}

.progress-bar {
  width: 100%;
  height: 20px;
  background-color: #e6f7ff;
  border-radius: 10px;
  overflow: hidden;
  margin-bottom: 10px;
}

.progress-fill {
  height: 100%;
  background-color: #52c41a;
  border-radius: 10px;
  transition: width 0.3s ease;
}



/* 历史记录样式 */
.history-section {
  margin: 30px 0;
}

.history-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  text-align: center;
}

.history-list {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 15px;
  max-height: 200px;
  overflow-y: auto;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px;
  border-bottom: 1px solid #e8e8e8;
}

.history-item:last-child {
  border-bottom: none;
}

.history-date {
  font-size: 14px;
  color: #606266;
}

.history-duration {
  font-size: 14px;
  font-weight: bold;
  color: #1890ff;
}

.no-history {
  text-align: center;
  padding: 20px;
  color: #909399;
  font-size: 14px;
}

/* 专注模式样式 */
.mode-section {
  margin: 30px 0;
}

.mode-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  text-align: center;
}

.mode-selector {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.pomodoro-settings {
  background-color: #f5f7fa;
  border-radius: 8px;
  padding: 20px;
  margin-top: 10px;
  margin-bottom: 20px;
}

.setting-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.setting-item:last-child {
  margin-bottom: 0;
}

.setting-item span {
  font-size: 14px;
  color: #606266;
}

.setting-item .el-input-number {
  width: 120px;
}

/* 背景选择样式 */
.background-section {
  margin: 30px 0;
}

.background-section h3 {
  font-size: 18px;
  margin-bottom: 15px;
  color: #303133;
  text-align: center;
}

.background-options {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.background-item {
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.background-item:hover {
  transform: scale(1.05);
}

.background-item.active {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.2);
}

.background-preview {
  width: 100%;
  height: 60px;
  border-radius: 6px;
}




/* 自律模式样式 */
.discipline-active {
  margin-bottom: 20px;
}

.discipline-card {
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.discipline-content {
  min-height: 500px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
  background: v-bind(currentBackground);
}

.focus-todo-display {
  width: 100%;
  margin-bottom: 10px;
}

.focus-todo-display .focus-text {
  color: white;
  font-size: 24px;
  font-weight: bold;
  text-align: center;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background-color: rgba(0, 0, 0, 0.2);
  padding: 15px 20px;
  border-radius: 12px;
  word-wrap: break-word;
}

.poetry-section {
  text-align: center;
  max-width: 100%;
}

.poetry {
  font-size: 24px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  line-height: 1.8;
  word-wrap: break-word;
  white-space: normal;
}

/* 环形进度条样式 */
.progress-section {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 30px 0;
}

.progress-ring {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.progress-svg {
  transform: rotate(-90deg);
}

.progress-bg {
  fill: none;
  stroke: rgba(255, 255, 255, 0.3);
  stroke-linecap: round;
}

.progress-bar {
  fill: none;
  stroke: white;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.3s ease;
  stroke-width: 12;
}

.progress-text {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
}

.timer {
  font-size: 48px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background-color: transparent;
  padding: 0;
  border-radius: 0;
}

.mode-status {
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  margin-top: 10px;
}

/* 鼓励语句样式 */
.encouragement-section {
  margin: 20px 0;
  text-align: center;
}

.encouragement {
  font-size: 20px;
  font-weight: bold;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  background-color: rgba(255, 255, 255, 0.2);
  padding: 15px 20px;
  border-radius: 20px;
  animation: fadeIn 0.5s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.controls-section {
  display: flex;
  gap: 20px;
}

.controls-section .el-button {
  width: 60px;
  height: 60px;
  font-size: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* PC端样式 */
@media (min-width: 1024px) {
  .self-discipline-container {
    max-width: 1000px;
  }
  
  .discipline-content {
    min-height: 600px;
    padding: 60px;
  }
  
  .poetry {
    font-size: 32px;
  }
  
  .progress-svg {
    width: 250px;
    height: 250px;
  }
  
  .timer {
    font-size: 64px;
  }
  
  .mode-status {
    font-size: 24px;
  }
  
  .encouragement {
    font-size: 24px;
    padding: 20px 25px;
  }
  
  .controls-section .el-button {
    width: 70px;
    height: 70px;
    font-size: 28px;
  }
}

/* 平板端样式 */
@media (min-width: 769px) and (max-width: 1023px) {
  .self-discipline-container {
    max-width: 100%;
  }
  
  .discipline-content {
    min-height: 550px;
    padding: 50px;
  }
  
  .poetry {
    font-size: 28px;
  }
  
  .progress-svg {
    width: 220px;
    height: 220px;
  }
  
  .timer {
    font-size: 56px;
  }
  
  .mode-status {
    font-size: 20px;
  }
  
  .encouragement {
    font-size: 22px;
    padding: 18px 22px;
  }
  
  .controls-section .el-button {
    width: 65px;
    height: 65px;
    font-size: 26px;
  }
}

/* 移动端样式 */
@media (max-width: 768px) {
  .self-discipline-container {
    max-width: 100%;
    padding: 10px;
  }
  
  .start-content {
    padding: 30px;
  }
  
  .focus-todo-info {
    padding: 12px 16px;
  }
  
  .focus-text {
    font-size: 16px;
  }
  
  .start-content h2 {
    font-size: 24px;
  }
  
  .start-content p {
    font-size: 14px;
  }
  
  /* 统计信息响应式 */
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
  
  .stat-item {
    padding: 12px;
  }
  
  .stat-value {
    font-size: 18px;
  }
  
  /* 目标设置响应式 */
  .goal-setting {
    flex-direction: column;
    align-items: stretch;
  }
  
  .goal-setting .el-input-number {
    width: 100%;
  }
  
  .goal-setting .el-button {
    width: 100%;
  }
  
  /* 历史记录响应式 */
  .history-list {
    max-height: 150px;
    padding: 12px;
  }
  
  .history-item {
    padding: 8px;
  }
  
  .history-date,
  .history-duration {
    font-size: 13px;
  }
  
  /* 专注模式响应式 */
  .mode-selector {
    flex-direction: column;
    align-items: stretch;
  }
  
  .pomodoro-settings {
    padding: 15px;
  }
  
  .setting-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .setting-item .el-input-number {
    width: 100%;
  }
  
  /* 背景选择响应式 */
  .background-options {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .background-preview {
    height: 50px;
  }
  
  .discipline-content {
    min-height: 400px;
    padding: 30px 20px;
  }
  
  .focus-todo-display .focus-text {
    font-size: 18px;
    padding: 12px 16px;
  }
  
  .poetry {
    font-size: 18px;
    line-height: 1.6;
  }
  
  .progress-svg {
    width: 160px;
    height: 160px;
  }
  
  .timer {
    font-size: 36px;
  }
  
  .mode-status {
    font-size: 14px;
  }
  
  .encouragement {
    font-size: 16px;
    padding: 12px 16px;
  }
  
  .controls-section {
    gap: 15px;
  }
  
  .controls-section .el-button {
    width: 50px;
    height: 50px;
    font-size: 20px;
  }
}
</style>