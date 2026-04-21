<template>
  <div class="schedule-container">
    <div class="schedule-header">
      <div class="header-card">
        <div class="calendar-nav">
          <el-button type="primary" @click="prevMonth" size="small" class="nav-btn">
            ← 上个月
          </el-button>
          <h3 class="current-month">{{ currentYear }}年{{ currentMonth + 1 }}月</h3>
          <el-button type="primary" @click="nextMonth" size="small" class="nav-btn">
            下个月 →
          </el-button>
        </div>
        <div class="header-actions">
          <el-button circle size="small" class="header-btn">
            <span>🔔</span>
          </el-button>
          <el-button circle size="small" class="header-btn">
            <span>➕</span>
          </el-button>
          <el-button circle size="small" class="header-btn">
            <span>⋮</span>
          </el-button>
        </div>
      </div>
    </div>
    
    <el-card class="calendar-card">
      <div class="calendar">
        <div class="calendar-weekdays">
          <div v-for="day in weekdays" :key="day" class="weekday">
            <el-tag size="small" :type="day === '日' || day === '六' ? 'danger' : 'info'">
              {{ day }}
            </el-tag>
          </div>
        </div>
        <div class="calendar-days">
          <div 
            v-for="(day, index) in calendarDays" 
            :key="index"
            :class="{
              'day': true,
              'other-month': day.month !== currentMonth,
              'today': day.date === todayDate && day.date !== selectedDateStr,
              'has-event': hasEventOnDay(day.date),
              'selected': day.date === selectedDateStr
            }"
            @click="selectDay(day.date)"
          >
            <el-badge 
              :value="getEventsOnDay(day.date).length" 
              :hidden="getEventsOnDay(day.date).length === 0"
              type="success"
              class="day-badge"
            >
              <span class="day-number">{{ day.day }}</span>
            </el-badge>
          </div>
        </div>
      </div>
    </el-card>
    
    <el-card class="events-card" v-if="selectedDateStr">
      <template #header>
        <div class="events-header">
          <el-icon class="header-icon"><Calendar /></el-icon>
          <h3>{{ selectedDateFormatted }}的日程</h3>
        </div>
      </template>
      
      <div class="add-event">
        <el-input
          v-model="newEvent.title"
          placeholder="添加新的日程..."
          class="event-input"
          prefix-icon="Message"
        />
        <el-time-select
          v-model="newEvent.time"
          start="00:00"
          step="00:30"
          end="23:30"
          class="time-input"
        />
        <el-color-picker
          v-model="newEvent.color"
          class="color-picker"
          show-alpha
        />
        <el-button type="primary" @click="addEvent" icon="Plus">
          添加
        </el-button>
      </div>
      
      <el-empty 
        v-if="selectedDayEvents.length === 0"
        description="暂无日程安排"
      />
      
      <div v-else class="event-list">
        <el-card 
          v-for="event in selectedDayEvents" 
          :key="event.id"
          class="event-item-card"
          :body-style="{ padding: '10px' }"
        >
          <div class="event-item">
            <div class="event-color" :style="{ backgroundColor: event.color }"></div>
            <div class="event-content">
              <el-tag size="small" type="info" class="event-time-tag">
                {{ event.time }}
              </el-tag>
              <span class="event-title">{{ event.title }}</span>
            </div>
            <el-button 
              type="danger" 
              size="small" 
              @click="deleteEvent(event.id)"
              icon="Delete"
            >
              删除
            </el-button>
          </div>
        </el-card>
      </div>
    </el-card>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { Calendar, Message } from '@element-plus/icons-vue'
import { getEvents, createEvent, deleteEvent as deleteEventApi } from '../utils/api'

export default {
  name: 'Schedule',
  components: {
    Calendar,
    Message
  },
  setup() {
    const currentDate = ref(new Date())
    const selectedDate = ref(new Date())
    const weekdays = ref(['日', '一', '二', '三', '四', '五', '六'])
    const events = ref([])
    const newEvent = ref({
      title: '',
      time: '09:00',
      color: '#409EFF'
    })

    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0')
      const day = String(date.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }

    const currentYear = computed(() => currentDate.value.getFullYear())
    const currentMonth = computed(() => currentDate.value.getMonth())
    const todayDate = computed(() => formatDate(new Date()))
    const selectedDateStr = computed(() => formatDate(selectedDate.value))

    const calendarDays = computed(() => {
      const days = []
      const firstDay = new Date(currentYear.value, currentMonth.value, 1)
      const startDate = new Date(firstDay)
      startDate.setDate(startDate.getDate() - firstDay.getDay())
      
      for (let i = 0; i < 42; i++) {
        const date = new Date(startDate)
        date.setDate(startDate.getDate() + i)
        days.push({
          day: date.getDate(),
          month: date.getMonth(),
          date: formatDate(date)
        })
      }
      
      return days
    })

    const selectedDateFormatted = computed(() => {
      const date = new Date(selectedDate.value)
      return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
    })

    const selectedDayEvents = computed(() => {
      return events.value
        .filter(event => event.date === selectedDateStr.value)
        .sort((a, b) => a.time.localeCompare(b.time))
    })

    // 加载事件
    const loadEvents = async () => {
      const data = await getEvents()
      events.value = data
    }

    const prevMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value - 1, 1)
    }

    const nextMonth = () => {
      currentDate.value = new Date(currentYear.value, currentMonth.value + 1, 1)
    }

    const selectDay = (date) => {
      const [year, month, day] = date.split('-').map(Number)
      selectedDate.value = new Date(year, month - 1, day)
    }

    const hasEventOnDay = (date) => {
      return events.value.some(event => event.date === date)
    }

    const getEventsOnDay = (date) => {
      return events.value.filter(event => event.date === date)
    }

    const addEvent = async () => {
      if (newEvent.value.title.trim()) {
        try {
          const eventData = {
            title: newEvent.value.title.trim(),
            date: selectedDateStr.value,
            time: newEvent.value.time,
            color: newEvent.value.color
          }
          const newEventItem = await createEvent(eventData)
          events.value.push(newEventItem)
          newEvent.value.title = ''
          newEvent.value.time = '09:00'
          newEvent.value.color = '#409EFF'
        } catch (error) {
          console.error('Error adding event:', error)
        }
      }
    }

    const deleteEvent = async (id) => {
      try {
        await deleteEventApi(id)
        events.value = events.value.filter(event => event.id !== id)
      } catch (error) {
        console.error('Error deleting event:', error)
      }
    }

    onMounted(() => {
      loadEvents()
    })

    return {
      currentDate,
      selectedDate,
      weekdays,
      events,
      newEvent,
      currentYear,
      currentMonth,
      todayDate,
      selectedDateStr,
      calendarDays,
      selectedDateFormatted,
      selectedDayEvents,
      prevMonth,
      nextMonth,
      selectDay,
      hasEventOnDay,
      getEventsOnDay,
      addEvent,
      deleteEvent,
      formatDate
    }
  }
}
</script>

<style scoped>
.schedule-container {
  min-height: 100vh;
  background: linear-gradient(to bottom, #e0f7fa, #ffffff);
}

.schedule-header {
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.header-card {
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  padding: 15px 20px;
}

.calendar-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 15px;
}

.header-actions {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: flex-end;
}

.current-month {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: white;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.3);
}

.nav-btn {
  background-color: rgba(255, 255, 255, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 20px;
  color: white;
  transition: all 0.3s ease;
}

.nav-btn:hover {
  background-color: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.header-btn {
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

.header-btn:hover {
  background-color: rgba(255, 255, 255, 0.2);
  transform: scale(1.05);
}

.calendar-card {
  margin: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.calendar {
  width: 100%;
  padding: 20px;
}

.calendar-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
  margin-bottom: 10px;
}

.weekday {
  text-align: center;
}

.calendar-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 10px;
}

.day {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  background-color: #f8f9fa;
  border: 1px solid #e9ecef;
}

.day:hover {
  background-color: #ecf5ff;
  border-color: #d9ecff;
}

.other-month {
  color: #c0c4cc;
  background-color: #f0f0f0;
}

.has-event {
  background-color: #f0f9eb;
  border-color: #e6f7e0;
}

.selected {
  background-color: #e6f7ff;
  border: 2px solid #91d5ff;
}

.today {
  background-color: #e3f2fd;
  font-weight: bold;
  border: 2px solid #409EFF;
}

.day-badge {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.day-number {
  font-size: 16px;
}

.events-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.events-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.header-icon {
  font-size: 20px;
  color: #409EFF;
}

.events-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: #303133;
}

.add-event {
  display: flex;
  gap: 10px;
  margin: 20px;
  flex-wrap: wrap;
  align-items: center;
}

.event-input {
  flex: 1;
  min-width: 200px;
}

.time-input {
  min-width: 120px;
}

.color-picker {
  min-width: 100px;
}

.event-list {
  margin: 0 20px 20px;
}

.event-item-card {
  margin-bottom: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
}

.event-item-card:hover {
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-color: #d9ecff;
}

.event-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
}

.event-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  flex-shrink: 0;
}

.event-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.event-time-tag {
  align-self: flex-start;
}

.event-title {
  font-size: 14px;
  color: #303133;
}

/* PC端样式 */
@media (min-width: 1024px) {
  .schedule-container {
    max-width: 1000px;
  }
  
  .calendar {
    padding: 24px;
  }
  
  .calendar-days {
    gap: 12px;
  }
  
  .day {
    font-size: 18px;
  }
  
  .day-badge {
    font-size: 18px;
  }
  
  .day-number {
    font-size: 18px;
  }
  
  .add-event {
    margin: 24px;
    gap: 15px;
  }
  
  .event-list {
    margin: 0 24px 24px;
  }
  
  .event-item {
    padding: 16px;
  }
  
  .event-title {
    font-size: 16px;
  }
}

/* 平板端样式 */
@media (min-width: 769px) and (max-width: 1023px) {
  .schedule-container {
    max-width: 100%;
  }
  
  .calendar {
    padding: 16px;
  }
}

/* 移动端样式 */
@media (max-width: 768px) {
  .schedule-container {
    max-width: 100%;
  }
  
  .calendar-nav {
    padding: 12px;
  }
  
  .current-month {
    font-size: 16px;
  }
  
  .calendar {
    padding: 12px;
  }
  
  .calendar-weekdays {
    gap: 5px;
  }
  
  .calendar-days {
    gap: 5px;
  }
  
  .day {
    font-size: 14px;
  }
  
  .day-badge {
    font-size: 14px;
  }
  
  .day-number {
    font-size: 14px;
  }
  
  .events-header {
    padding: 12px 16px;
  }
  
  .events-header h3 {
    font-size: 16px;
  }
  
  .add-event {
    flex-direction: column;
    margin: 16px;
    gap: 8px;
  }
  
  .event-input,
  .time-input,
  .color-picker {
    width: 100%;
    min-width: unset;
  }
  
  .event-list {
    margin: 0 16px 16px;
  }
  
  .event-item {
    padding: 10px;
  }
}
</style>