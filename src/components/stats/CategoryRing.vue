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
