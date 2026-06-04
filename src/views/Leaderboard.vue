<template>
  <div class="leaderboard-page">
    <div class="page-header">
      <h2>学习排行榜</h2>
    </div>

    <div class="period-tabs">
      <el-radio-group v-model="period" @change="loadData">
        <el-radio-button value="day">今日</el-radio-button>
        <el-radio-button value="week">本周</el-radio-button>
        <el-radio-button value="month">本月</el-radio-button>
      </el-radio-group>
    </div>

    <div v-if="loading" class="loading-text">加载中...</div>

    <div v-else-if="leaderboard.length === 0" class="empty-text">
      暂无数据，快去自习室开始学习吧
    </div>

    <div v-else class="rank-list">
      <div
        v-for="entry in leaderboard"
        :key="entry.userId"
        class="rank-item"
        :class="{ 'top-three': entry.rank <= 3 }"
      >
        <span class="rank-number" :class="rankClass(entry.rank)">
          {{ entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank - 1] : entry.rank }}
        </span>
        <span class="rank-avatar">{{ entry.avatar || '👤' }}</span>
        <span class="rank-name">{{ entry.name || entry.username }}</span>
        <span class="rank-minutes">{{ formatMinutes(entry.totalMinutes) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getLeaderboard } from '@/utils/api'
import type { LeaderboardEntry } from '@/types'

const period = ref<'day' | 'week' | 'month'>('week')
const leaderboard = ref<LeaderboardEntry[]>([])
const loading = ref(false)

const loadData = async () => {
  loading.value = true
  try {
    const data = await getLeaderboard(period.value)
    leaderboard.value = data.leaderboard
  } catch {
    leaderboard.value = []
  } finally {
    loading.value = false
  }
}

const rankClass = (rank: number) => {
  if (rank === 1) return 'rank-gold'
  if (rank === 2) return 'rank-silver'
  if (rank === 3) return 'rank-bronze'
  return ''
}

const formatMinutes = (mins: number) => {
  const h = Math.floor(mins / 60)
  const m = mins % 60
  return h > 0 ? `${h}小时${m}分钟` : `${m}分钟`
}

onMounted(() => { loadData() })
</script>

<style scoped>
.leaderboard-page {
  padding: 16px;
}
.page-header h2 {
  font-size: 20px;
  color: #303133;
  margin-bottom: 16px;
}
.period-tabs {
  margin-bottom: 16px;
  display: flex;
  justify-content: center;
}
.rank-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.rank-item {
  display: flex;
  align-items: center;
  gap: 12px;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.rank-item.top-three {
  background: linear-gradient(135deg, #fff9e6, #fff);
}
.rank-number {
  font-size: 20px;
  width: 32px;
  text-align: center;
  font-weight: 700;
  color: #909399;
}
.rank-gold { color: #E6A23C; }
.rank-silver { color: #909399; }
.rank-bronze { color: #CD853F; }
.rank-avatar { font-size: 24px; }
.rank-name {
  flex: 1;
  font-size: 14px;
  color: #303133;
  font-weight: 500;
}
.rank-minutes {
  font-size: 13px;
  color: #409EFF;
  font-weight: 600;
}
.loading-text, .empty-text {
  text-align: center;
  color: #909399;
  margin-top: 40px;
}
</style>
