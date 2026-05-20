<template>
  <div class="dashboard">
    <div class="header">
      <h1>📊 数据统计</h1>
      <div class="header-actions">
        <el-button circle size="small" class="glass-btn" @click="refresh">
          <span>🔄</span>
        </el-button>
      </div>
    </div>

    <el-skeleton v-if="loading" :rows="8" animated class="skeleton" />

    <template v-else>
      <OverviewCards :overview="overviewData" />

      <div class="tab-bar">
        <button
          v-for="t in tabs"
          :key="t.key"
          :class="['tab', { active: activeTab === t.key }]"
          @click="activeTab = t.key"
        >{{ t.emoji }} {{ t.label }}</button>
      </div>

      <TrendChart
        v-if="activeTab === 'trend'"
        :data="trendData"
        :period="trendPeriod"
        @update:period="trendPeriod = $event"
      />
      <CategoryRing
        v-if="activeTab === 'category'"
        :data="categoryData"
      />
      <RankingList
        v-if="activeTab === 'rank'"
        :items="rankingData"
      />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import OverviewCards from './OverviewCards.vue'
import TrendChart from './TrendChart.vue'
import CategoryRing from './CategoryRing.vue'
import RankingList from './RankingList.vue'
import { useStats } from '../../composables/useStats'

const {
  loading,
  overviewData,
  trendData,
  categoryData,
  rankingData,
  refresh,
} = useStats()

type TabKey = 'trend' | 'category' | 'rank'

const tabs: Array<{ key: TabKey; label: string; emoji: string }> = [
  { key: 'trend', label: '趋势', emoji: '📈' },
  { key: 'category', label: '分类', emoji: '🍩' },
  { key: 'rank', label: '排行', emoji: '🏅' },
]

const activeTab = ref<TabKey>('trend')
const trendPeriod = ref<'day' | 'week' | 'month'>('week')
</script>

<style scoped>
.dashboard {
  padding: 0 16px 100px;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  min-height: 100vh;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 0 16px;
  position: sticky;
  top: 0;
  z-index: 10;
  background: transparent;
}

.header h1 {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.9);
  margin: 0;
}

.glass-btn {
  background: rgba(255, 255, 255, 0.1) !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
  color: white !important;
  backdrop-filter: blur(10px);
  width: 36px;
  height: 36px;
}

.tab-bar {
  display: flex;
  gap: 6px;
  margin: 16px 0;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 4px;
}

.tab {
  flex: 1;
  background: transparent;
  border: none;
  border-radius: 10px;
  padding: 10px 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s;
}

.tab.active {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  color: #fff;
  font-weight: 600;
}

.skeleton {
  margin-top: 16px;
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border-radius: 16px;
  padding: 16px;
}

@media (min-width: 1024px) {
  .dashboard {
    max-width: 800px;
    margin: 0 auto;
  }

  .header h1 {
    font-size: 28px;
  }
}
</style>
