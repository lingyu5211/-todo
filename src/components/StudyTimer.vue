<template>
  <div class="study-timer">
    <div class="timer-display">
      <span class="timer-label">{{ isStudying ? '专注中' : '准备开始' }}</span>
    </div>
    <el-button
      :type="isStudying ? 'warning' : 'success'"
      size="large"
      round
      @click="toggleStudy"
      style="width: 100%"
    >
      {{ isStudying ? '结束学习' : '开始学习' }}
    </el-button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { createFocusSession } from '@/utils/api'

const emit = defineEmits<{
  (e: 'studyStart'): void
  (e: 'studyStop'): void
}>()

const isStudying = ref(false)
let sessionId: number | null = null

const toggleStudy = async () => {
  if (isStudying.value) {
    isStudying.value = false
    emit('studyStop')
    ElMessage.success('学习结束')
  } else {
    const now = new Date()
    const startTimeStr = now.toTimeString().slice(0, 8)
    const dateStr = now.toISOString().slice(0, 10)
    try {
      const session = await createFocusSession({
        duration: 0,
        date: dateStr,
        startTime: startTimeStr,
        endTime: startTimeStr,
        todoId: undefined,
      })
      sessionId = session.id
    } catch {
      // Non-critical: status broadcast still works
    }
    isStudying.value = true
    emit('studyStart')
    ElMessage.success('开始学习')
  }
}
</script>

<style scoped>
.study-timer {
  padding: 16px 0;
  text-align: center;
}
.timer-display {
  margin-bottom: 16px;
}
.timer-label {
  font-size: 24px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.8);
}
</style>
