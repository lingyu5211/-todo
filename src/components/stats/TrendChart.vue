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
  if (!Array.isArray(props.data) || props.data.length === 0) return []
  const sorted = [...props.data].sort((a, b) => b.date.localeCompare(a.date))
  const latestDate = sorted[0].date
  if (props.period === 'day') {
    const today = new Date().toISOString().split('T')[0]
    return props.data.filter(d => d.date === today)
  }
  if (props.period === 'week') {
    const endDate = new Date(latestDate)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - 6)
    return props.data.filter(
      d => d.date >= startDate.toISOString().split('T')[0] &&
           d.date <= endDate.toISOString().split('T')[0]
    )
  }
  if (props.period === 'month') {
    const prefix = latestDate.substring(0, 7)
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
