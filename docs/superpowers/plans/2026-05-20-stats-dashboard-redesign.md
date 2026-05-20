# Stats Dashboard Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace `Stats.vue` with a glassmorphism-styled dashboard (`StatsDashboard.vue`) built from 4 sub-components with proper ECharts lifecycle management and fixed data flow.

**Architecture:** `StatsDashboard.vue` is the single data entry point, calling `useStats()` composable for API data and distributing via props to `OverviewCards`, `TrendChart`, `CategoryRing`, and `RankingList`. Each chart component owns its ECharts instance via `useChart()` composable. Tab navigation switches between chart views.

**Tech Stack:** Vue 3 `<script setup lang="ts">`, ECharts 6, Element Plus, native CSS glassmorphism (no new dependencies).

---

### Task 1: Fix Type Definitions

**Files:**
- Modify: `src/types/index.ts:65-77`

- [ ] **Step 1: Update `FocusStats` and add `SessionByDate`**

Replace the existing `FocusStats` interface (lines 65-77) and add `SessionByDate`:

```ts
export interface FocusStats {
  totalSessions: number;
  totalMinutes: number;
  avgMinutes: number;
  todaySessions: number;
  todayMinutes: number;
  sessionsByDate: SessionByDate[];
  focusByCategory: Record<string, number>;
}

export interface SessionByDate {
  date: string;
  sessions: number;
  minutes: number;
}
```

- [ ] **Step 2: Verify types compile**

Run: `npx tsc --noEmit`
Expected: No new type errors from `types/index.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/types/index.ts
git commit -m "fix: add SessionByDate and update FocusStats type for chart data"
```

---

### Task 2: Fix API Fallback

**Files:**
- Modify: `src/utils/api.ts:198-219`

- [ ] **Step 1: Replace `getFocusStats` fallback to return empty arrays/objects**

Replace the catch block (lines 206-218):

```ts
export const getFocusStats = async (): Promise<FocusStats> => {
  try {
    const response = await fetch(`${API_BASE_URL}/focus-sessions/stats`, {
      headers: { ...getAuthHeader() },
    });
    return await handleResponse<FocusStats>(response);
  } catch (error) {
    console.error('Error fetching focus stats:', error);
    return {
      totalSessions: 0,
      totalMinutes: 0,
      avgMinutes: 0,
      todaySessions: 0,
      todayMinutes: 0,
      sessionsByDate: [],
      focusByCategory: {},
    };
  }
};
```

- [ ] **Step 2: Commit**

```bash
git add src/utils/api.ts
git commit -m "fix: getFocusStats fallback now returns sessionsByDate and focusByCategory"
```

---

### Task 3: Create `useChart` Composable

**Files:**
- Create: `src/composables/useChart.ts`

- [ ] **Step 1: Write the composable**

```ts
import { ref, onUnmounted } from 'vue'
import * as echarts from 'echarts'

export function useChart() {
  const chartRef = ref<HTMLElement>()
  const chartInstance = ref<echarts.ECharts>()

  function initChart(container: HTMLElement) {
    chartInstance.value = echarts.init(container)
  }

  function setChartOption(option: echarts.EChartsOption) {
    if (!chartInstance.value) return
    chartInstance.value.setOption(option, { notMerge: true })
  }

  function dispose() {
    if (chartInstance.value) {
      chartInstance.value.dispose()
      chartInstance.value = undefined
    }
  }

  return { chartRef, chartInstance, initChart, setChartOption, dispose }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors in `useChart.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useChart.ts
git commit -m "feat: add useChart composable for ECharts lifecycle management"
```

---

### Task 4: Create `useStats` Composable

**Files:**
- Create: `src/composables/useStats.ts`

- [ ] **Step 1: Write the composable**

```ts
import { ref, computed, onMounted } from 'vue'
import { getFocusStats } from '../utils/api'
import type { FocusStats, SessionByDate } from '../types'

export interface OverviewData {
  totalMinutes: number
  totalSessions: number
  todayMinutes: number
  avgMinutes: number
}

export interface RankingItem {
  name: string
  minutes: number
  color: string
}

const CATEGORY_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#fee140', '#a18cd1', '#f5576c',
]

export function useStats() {
  const loading = ref(true)
  const error = ref<string | null>(null)
  const rawStats = ref<FocusStats>({
    totalSessions: 0,
    totalMinutes: 0,
    avgMinutes: 0,
    todaySessions: 0,
    todayMinutes: 0,
    sessionsByDate: [],
    focusByCategory: {},
  })

  const overviewData = computed<OverviewData>(() => ({
    totalMinutes: rawStats.value.totalMinutes,
    totalSessions: rawStats.value.totalSessions,
    todayMinutes: rawStats.value.todayMinutes,
    avgMinutes: rawStats.value.avgMinutes,
  }))

  const trendData = computed<SessionByDate[]>(() =>
    rawStats.value.sessionsByDate
  )

  const categoryData = computed<Record<string, number>>(() =>
    rawStats.value.focusByCategory
  )

  const rankingData = computed<RankingItem[]>(() => {
    const entries = Object.entries(rawStats.value.focusByCategory)
    entries.sort((a, b) => b[1] - a[1])
    return entries.map(([name, minutes], index) => ({
      name,
      minutes,
      color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
    }))
  })

  async function refresh() {
    loading.value = true
    error.value = null
    try {
      rawStats.value = await getFocusStats()
    } catch (e) {
      error.value = e instanceof Error ? e.message : '加载失败'
    } finally {
      loading.value = false
    }
  }

  onMounted(() => {
    refresh()
  })

  return {
    loading,
    error,
    overviewData,
    trendData,
    categoryData,
    rankingData,
    refresh,
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors in `useStats.ts`.

- [ ] **Step 3: Commit**

```bash
git add src/composables/useStats.ts
git commit -m "feat: add useStats composable for stats data fetching and transformation"
```

---

### Task 5: Create `OverviewCards` Component

**Files:**
- Create: `src/components/stats/OverviewCards.vue`

- [ ] **Step 1: Write the component**

```vue
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/OverviewCards.vue
git commit -m "feat: add OverviewCards glassmorphism component for stats dashboard"
```

---

### Task 6: Create `TrendChart` Component

**Files:**
- Create: `src/components/stats/TrendChart.vue`

- [ ] **Step 1: Write the component**

```vue
<template>
  <div class="trend-chart">
    <div class="sub-tabs">
      <button
        v-for="p in periods"
        :key="p"
        :class="['sub-tab', { active: period === p }]"
        @click="$emit('update:period', p)"
      >{{ periodLabels[p] }}</button>
    </div>
    <div v-if="filteredData.length === 0" class="empty-state">
      <p>暂无专注数据，去计时吧 →</p>
    </div>
    <div v-else ref="chartRef" class="chart-container"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useChart } from '../../composables/useChart'
import type { SessionByDate } from '../../types'

const props = defineProps<{
  data: SessionByDate[]
  period: 'day' | 'week' | 'month'
}>()

defineEmits<{
  'update:period': [value: 'day' | 'week' | 'month']
}>()

const periods = ['day', 'week', 'month'] as const
const periodLabels: Record<string, string> = { day: '日', week: '周', month: '月' }

const { chartRef, initChart, setChartOption, dispose } = useChart()

const filteredData = computed(() => {
  const now = new Date()
  if (props.period === 'day') {
    const today = now.toISOString().split('T')[0]
    return props.data.filter(d => d.date === today)
  }
  if (props.period === 'week') {
    const weekAgo = new Date(now)
    weekAgo.setDate(weekAgo.getDate() - 6)
    return props.data.filter(d => d.date >= weekAgo.toISOString().split('T')[0])
  }
  if (props.period === 'month') {
    const prefix = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    return props.data.filter(d => d.date.startsWith(prefix))
  }
  return props.data
})

function buildOption(): echarts.EChartsOption {
  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(15,12,41,0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
    },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '8%', containLabel: true },
    xAxis: {
      type: 'category',
      data: filteredData.value.map(d => d.date.slice(-5)),
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      axisLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } },
    },
    yAxis: {
      type: 'value',
      name: '分钟',
      nameTextStyle: { color: 'rgba(255,255,255,0.4)', fontSize: 11 },
      axisLabel: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
      splitLine: { lineStyle: { color: 'rgba(255,255,255,0.06)' } },
    },
    series: [{
      type: 'bar',
      data: filteredData.value.map(d => d.minutes),
      barWidth: '50%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' },
        ]),
      },
    }],
  }
}

watch(filteredData, () => {
  nextTick(() => setChartOption(buildOption()))
}, { immediate: false })

onMounted(() => {
  nextTick(() => {
    if (chartRef.value) {
      initChart(chartRef.value)
      setChartOption(buildOption())
    }
  })
})

onUnmounted(() => dispose())
</script>

<style scoped>
.trend-chart {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
}

.sub-tabs {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-bottom: 12px;
}

.sub-tab {
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.4);
  font-size: 13px;
  padding: 4px 16px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.sub-tab.active {
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-weight: 600;
}

.chart-container {
  width: 100%;
  height: 240px;
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/TrendChart.vue
git commit -m "feat: add TrendChart component with day/week/month period filtering"
```

---

### Task 7: Create `CategoryRing` Component

**Files:**
- Create: `src/components/stats/CategoryRing.vue`

- [ ] **Step 1: Write the component**

```vue
<template>
  <div class="category-ring">
    <div v-if="hasData" ref="chartRef" class="ring-container"></div>
    <div v-else class="empty-state">
      <p>暂无分类数据</p>
    </div>
    <div v-if="hasData" class="legend">
      <div v-for="(entry, idx) in legendItems" :key="entry.name" class="legend-item">
        <span class="dot" :style="{ background: entry.color }"></span>
        <span class="name">{{ entry.name }}</span>
        <span class="value">{{ formatMinutes(entry.minutes) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, nextTick } from 'vue'
import * as echarts from 'echarts'
import { useChart } from '../../composables/useChart'

const props = defineProps<{
  data: Record<string, number>
}>()

const CATEGORY_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#fee140', '#a18cd1', '#f5576c',
]

const { chartRef, initChart, setChartOption, dispose } = useChart()

const entries = computed(() => Object.entries(props.data).sort((a, b) => b[1] - a[1]))

const hasData = computed(() => entries.value.length > 0)

const legendItems = computed(() =>
  entries.value.map(([name, minutes], idx) => ({
    name,
    minutes,
    color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
  }))
)

const totalMinutes = computed(() =>
  entries.value.reduce((sum, [, m]) => sum + m, 0)
)

function buildOption(): echarts.EChartsOption {
  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(15,12,41,0.9)',
      borderColor: 'rgba(255,255,255,0.1)',
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: '{b}: {c}分钟 ({d}%)',
    },
    series: [{
      type: 'pie',
      radius: ['55%', '78%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 6, borderColor: 'transparent', borderWidth: 2 },
      label: { show: false },
      emphasis: { scale: true, scaleSize: 8 },
      data: entries.value.map(([name, value], idx) => ({
        name,
        value,
        itemStyle: { color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length] },
      })),
    }],
    graphic: [{
      type: 'text',
      left: 'center',
      top: 'center',
      style: {
        text: `${formatMinutes(totalMinutes.value)}`,
        textAlign: 'center',
        fill: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
      },
    }],
  }
}

function formatMinutes(m: number): string {
  const h = Math.floor(m / 60)
  const min = m % 60
  if (h > 0) return `${h}h${min > 0 ? min + 'm' : ''}`
  return `${min}m`
}

onMounted(() => {
  nextTick(() => {
    if (chartRef.value && hasData.value) {
      initChart(chartRef.value)
      setChartOption(buildOption())
    }
  })
})

onUnmounted(() => dispose())
</script>

<style scoped>
.category-ring {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 16px;
}

.ring-container {
  width: 100%;
  height: 240px;
}

.legend {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
}

.dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  flex-shrink: 0;
}

.name {
  flex: 1;
  color: rgba(255, 255, 255, 0.75);
}

.value {
  color: rgba(255, 255, 255, 0.4);
  font-size: 12px;
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/CategoryRing.vue
git commit -m "feat: add CategoryRing donut chart component with legend"
```

---

### Task 8: Create `RankingList` Component

**Files:**
- Create: `src/components/stats/RankingList.vue`

- [ ] **Step 1: Write the component**

```vue
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/RankingList.vue
git commit -m "feat: add RankingList component with medal badges and progress bars"
```

---

### Task 9: Create `StatsDashboard` Main Container

**Files:**
- Create: `src/components/stats/StatsDashboard.vue`

- [ ] **Step 1: Write the main container component**

```vue
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/stats/StatsDashboard.vue
git commit -m "feat: add StatsDashboard main container with glassmorphism and tab navigation"
```

---

### Task 10: Update App.vue Import

**Files:**
- Modify: `src/App.vue:29,15`

- [ ] **Step 1: Change the Stats import and usage in App.vue**

Change line 29:
```ts
// from:
import Stats from './components/Stats.vue'
// to:
import StatsDashboard from './components/stats/StatsDashboard.vue'
```

Change line 15:
```vue
<!-- from: -->
<Stats v-if="activeTab === 'stats'" />
<!-- to: -->
<StatsDashboard v-if="activeTab === 'stats'" />
```

- [ ] **Step 2: Verify TypeScript compiles and app builds**

Run: `npx vite build`
Expected: Build succeeds without errors.

- [ ] **Step 3: Commit**

```bash
git add src/App.vue
git commit -m "feat: wire StatsDashboard into App.vue replacing old Stats component"
```

---

### Task 11: Backend - Add `focusByCategory` Aggregation

**Files:**
- Modify: `backend/routes/focusSessions.js:37-96`

- [ ] **Step 1: Add `focusByCategory` to the `/stats` endpoint**

Replace the entire `/stats` route handler (lines 37-96) with:

```js
const Todo = require('../models/Todo');
const TodoSet = require('../models/TodoSet');

router.get('/stats', async (req, res) => {
  try {
    const allSessions = await FocusSession.findAll();

    const totalMinutes = allSessions.reduce((sum, s) => sum + s.duration, 0);
    const totalSessions = allSessions.length;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSessions = allSessions.filter(s =>
      new Date(s.startTime) >= thirtyDaysAgo
    );
    const recentMinutes = recentSessions.reduce((sum, s) => sum + s.duration, 0);
    const avgMinutes = Math.round(recentMinutes / 30);

    const today = new Date().toISOString().split('T')[0];
    const todaySessions = allSessions.filter(s => s.date === today);
    const todayMinutes = todaySessions.reduce((sum, s) => sum + s.duration, 0);

    // sessionsByDate aggregation
    const sessionsByDateMap = allSessions.reduce((acc, session) => {
      const date = session.date;
      if (!acc[date]) {
        acc[date] = { date, sessions: 0, minutes: 0 };
      }
      acc[date].sessions++;
      acc[date].minutes += session.duration;
      return acc;
    }, {});
    const sessionsByDate = Object.values(sessionsByDateMap);

    // focusByCategory: join focus_sessions → todos → todo_sets
    const focusByCategory = {};
    for (const session of allSessions) {
      if (session.todoId) {
        const todo = await Todo.findByPk(session.todoId);
        if (todo && todo.todoSetId) {
          const todoSet = await TodoSet.findByPk(todo.todoSetId);
          if (todoSet) {
            const name = todoSet.name;
            focusByCategory[name] = (focusByCategory[name] || 0) + session.duration;
          }
        }
      }
    }
    // Unassigned category for sessions without todoSet
    const unassignedMinutes = allSessions
      .filter(s => !s.todoId)
      .reduce((sum, s) => sum + s.duration, 0);
    if (unassignedMinutes > 0) {
      focusByCategory['未分类'] = (focusByCategory['未分类'] || 0) + unassignedMinutes;
    }

    res.json({
      totalSessions,
      totalMinutes,
      avgMinutes,
      todaySessions: todaySessions.length,
      todayMinutes,
      sessionsByDate,
      focusByCategory,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

- [ ] **Step 2: Restart backend and test**

Run: `curl http://localhost:5000/api/focus-sessions/stats`
Expected: JSON response includes `focusByCategory` object and `sessionsByDate` array.

- [ ] **Step 3: Commit**

```bash
git add backend/routes/focusSessions.js
git commit -m "feat: add focusByCategory aggregation in focus-sessions stats endpoint"
```

---

### Task 12: Remove Old `Stats.vue`

**Files:**
- Delete: `src/components/Stats.vue`

- [ ] **Step 1: Delete the old component**

```bash
rm src/components/Stats.vue
```

- [ ] **Step 2: Verify build still succeeds**

Run: `npx vite build`
Expected: Build succeeds. The old `Stats.vue` is no longer referenced.

- [ ] **Step 3: Commit**

```bash
git rm src/components/Stats.vue
git commit -m "chore: remove old Stats.vue, replaced by StatsDashboard"
```
