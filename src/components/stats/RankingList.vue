<template>
  <div class="ranking-list">
    <div v-if="items.length === 0" class="empty-state">
      <p>暂无排行数据</p>
    </div>
    <div v-else class="list">
      <div v-for="(item, idx) in items" :key="item.name" class="rank-item">
        <div class="rank-badge" :class="rankClass(idx)">{{ rankEmoji(idx) }}</div>
        <div class="rank-name">{{ item.name }}</div>
        <div class="rank-bar-track">
          <div
            class="rank-bar-fill"
            :style="{ width: barPercent(item.minutes) + '%', background: item.color }"
          ></div>
        </div>
        <div class="rank-value">{{ formatMinutes(item.minutes) }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RankingItem } from '../../composables/useStats'

const props = defineProps<{
  items: RankingItem[]
}>()

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0) return `${h}h${min > 0 ? min + 'm' : ''}`
  return `${min}m`
}

const maxMinutes = computed(() => Math.max(1, ...props.items.map(i => i.minutes)))

function barPercent(minutes: number): number {
  return Math.round((minutes / maxMinutes.value) * 60)
}

function rankClass(idx: number): string {
  if (idx === 0) return 'gold'
  if (idx === 1) return 'silver'
  if (idx === 2) return 'bronze'
  return ''
}

function rankEmoji(idx: number): string {
  if (idx === 0) return '🥇'
  if (idx === 1) return '🥈'
  if (idx === 2) return '🥉'
  return `${idx + 1}`
}
</script>

<style scoped>
.ranking-list {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.rank-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rank-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  flex-shrink: 0;
}

.rank-badge.gold   { background: rgba(255, 215, 0, 0.2); }
.rank-badge.silver { background: rgba(192, 192, 192, 0.2); }
.rank-badge.bronze { background: rgba(205, 127, 50, 0.2); }

.rank-name {
  width: 60px;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-bar-track {
  flex: 1;
  height: 16px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 8px;
  overflow: hidden;
}

.rank-bar-fill {
  height: 100%;
  border-radius: 8px;
  min-width: 4px;
  transition: width 0.5s ease;
}

.rank-value {
  width: 48px;
  text-align: right;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
  flex-shrink: 0;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: rgba(255, 255, 255, 0.4);
  font-size: 14px;
}
</style>
