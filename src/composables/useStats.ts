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
