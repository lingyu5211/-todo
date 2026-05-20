<template>
  <div class="overview-grid">
    <div class="glass-card">
      <div class="card-icon icon-time">⏱</div>
      <div class="card-meta">
        <span class="card-label">累计专注</span>
        <div class="card-value">{{ formatDuration(overview.totalMinutes) }}</div>
      </div>
    </div>
    <div class="glass-card">
      <div class="card-icon icon-sessions">🎯</div>
      <div class="card-meta">
        <span class="card-label">专注次数</span>
        <div class="card-value">{{ overview.totalSessions }}<span class="unit">次</span></div>
      </div>
    </div>
    <div class="glass-card">
      <div class="card-icon icon-today">📅</div>
      <div class="card-meta">
        <span class="card-label">今日专注</span>
        <div class="card-value">{{ overview.todayMinutes }}<span class="unit">分钟</span></div>
      </div>
    </div>
    <div class="glass-card">
      <div class="card-icon icon-avg">📊</div>
      <div class="card-meta">
        <span class="card-label">日均时长</span>
        <div class="card-value">{{ overview.avgMinutes }}<span class="unit">分钟</span></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { OverviewData } from '../../composables/useStats'

defineProps<{
  overview: OverviewData
}>()

function formatDuration(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours > 0) return `${hours}h${minutes > 0 ? ' ' + minutes + 'm' : ''}`
  return `${minutes}m`
}
</script>

<style scoped>
.overview-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.glass-card {
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.card-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  flex-shrink: 0;
}

.icon-time  { background: linear-gradient(135deg, #667eea, #764ba2); }
.icon-sessions { background: linear-gradient(135deg, #f093fb, #f5576c); }
.icon-today { background: linear-gradient(135deg, #4facfe, #00f2fe); }
.icon-avg  { background: linear-gradient(135deg, #a8edea, #fed6e3); }

.card-meta {
  flex: 1;
  min-width: 0;
}

.card-label {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  display: block;
  margin-bottom: 4px;
}

.card-value {
  font-size: 22px;
  font-weight: 700;
  color: #ffffff;
}

.unit {
  font-size: 13px;
  font-weight: 400;
  opacity: 0.5;
  margin-left: 2px;
}

@media (min-width: 1024px) {
  .overview-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}
</style>
