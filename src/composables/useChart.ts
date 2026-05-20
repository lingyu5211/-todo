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
