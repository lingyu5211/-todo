# Stats Dashboard Redesign

## Summary

将 `Stats.vue` 从 Options API 单文件重写为玻璃拟态（Glassmorphism）风格的现代化统计仪表盘，修复 ECharts 无法从数据库数据渲染的 bug，拆分为独立组件，统一数据流和图表生命周期管理。

## Root Cause

1. `FocusStats` 类型缺少 `sessionsByDate` 字段，但组件依赖它渲染图表
2. `getFocusStats` API fallback 不返回 `sessionsByDate`，API 失败时图表无数据
3. ECharts 初始化用 100ms `setTimeout` 猜测 DOM 就绪，不可靠
4. `timeTabs`（日/周/月/自定义）UI 存在但未接线到图表逻辑
5. 手动管理 resize listener，缺少统一的 dispose 清理

## Architecture

```
StatsDashboard.vue          ← 主容器，替代原 Stats.vue
├── OverviewCards.vue        ← 概览数字卡片行（固定显示）
├── Tab 导航                  ← 趋势 | 分类 | 排行
└── <component :is> 动态切换:
    ├── TrendChart.vue       ← 趋势折线/柱状图（含日/周/月子标签）
    ├── CategoryRing.vue     ← 环形分类图 + 图例列表
    └── RankingList.vue      ← 横向排行条
```

### Composables

- `useStats.ts` — 数据获取 + 转换为子组件 props 格式，管理 loading/error
- `useChart.ts` — ECharts 生命周期复用：init → setOption → resize → dispose

## Data Flow

```
getFocusStats() API → useStats() composable → StatsDashboard
                                                ├── overviewData → OverviewCards
                                                ├── trendData    → TrendChart
                                                ├── categoryData → CategoryRing
                                                └── rankingData  → RankingList
```

### Type Fix (`src/types/index.ts`)

```ts
interface FocusStats {
  // existing fields...
  sessionsByDate: SessionByDate[]   // NEW
  focusByCategory: Record<string, number>  // NEW (for ring chart)
}

interface SessionByDate {           // NEW
  date: string
  sessions: number
  minutes: number
}
```

### API Fix (`src/utils/api.ts`)

`getFocusStats` fallback returns empty arrays/objects instead of missing fields:
```ts
catch {
  return { totalSessions: 0, ..., sessionsByDate: [], focusByCategory: {} }
}
```

## Backend Changes

`backend/routes/focusSessions.js` `/stats` endpoint: add `focusByCategory` aggregation by joining focus_sessions with todos and todo_sets, grouping by todoSet name.

## UI Design

### Visual Style: Glassmorphism
- **Background**: `linear-gradient(135deg, #0f0c29, #302b63, #24243e)` deep purple gradient
- **Glass panels**: `rgba(255,255,255,0.08)` + `backdrop-filter: blur(16px)` + `1px solid rgba(255,255,255,0.12)`
- **Border radius**: 16px cards, 10-12px buttons
- **Accent gradients**: #667eea→#764ba2 (primary), #f093fb→#f5576c (accent), #4facfe→#00f2fe (info)
- **Spacing system**: 8/12/16/20/24px

### States
- **Loading**: Glass-styled skeleton (Element Plus `<el-skeleton>` + glass CSS)
- **Empty**: Illustration placeholder + CTA text "还没有专注数据，去计时吧 →"
- **Error**: ElMessage toast, preserve previous data

### Layout
- Overview cards: 2×2 grid (mobile) / 1×4 row (desktop)
- Tab bar: pill-style segmented control, active tab has highlighted glass background
- TrendChart has sub-tabs: 日 | 周 | 月
- Desktop max-width 800px centered

### Responsive
- Desktop (≥1024px): max-width 800px centered, larger typography
- Mobile (<768px): full-width, adequate bottom padding for BottomNav

## Component Responsibilities

### OverviewCards
- Props: `{ totalMinutes, totalSessions, todayMinutes, completionRate }`
- 4 glass-panel cards, each with gradient icon, value, label, trend indicator

### TrendChart
- Props: `{ data: SessionByDate[], period: 'day'|'week'|'month' }`
- ECharts bar chart with gradient fill, sub-tab switching filters data client-side
- Empty state when no data for selected period

### CategoryRing
- Props: `{ data: Record<string, number> }`
- ECharts ring/donut chart, center text = total hours, legend below

### RankingList
- Props: `{ items: Array<{ name: string, minutes: number, color: string }> }`
- Horizontal bar chart styled as ranking list with medal emojis for top 3

## Technical Details

### useChart composable
- `initChart(container)` — echarts.init + auto-resize binding
- `setChartOption(option)` — null-safe setOption with notMerge
- `dispose()` — dispose instance + remove resize listener
- Returns `{ chartRef, chartInstance, initChart, setChartOption, dispose }`

### Data transformation (useStats)
- Call `getFocusStats()` on mount
- Compute `overviewData`: extract totals, today, completion from raw stats
- Compute `trendData`: filter `sessionsByDate` by selected period
- Compute `categoryData`: pass `focusByCategory` through
- Compute `rankingData`: sort `focusByCategory` entries by value descending
- Expose `{ loading, error, overviewData, trendData, categoryData, rankingData, refresh }`

## Files Changed

| File | Action |
|------|--------|
| `src/types/index.ts` | Add `SessionByDate`, update `FocusStats` |
| `src/utils/api.ts` | Fix `getFocusStats` fallback |
| `src/composables/useChart.ts` | New composable |
| `src/composables/useStats.ts` | New composable |
| `src/components/stats/StatsDashboard.vue` | New — main container |
| `src/components/stats/OverviewCards.vue` | New |
| `src/components/stats/TrendChart.vue` | New |
| `src/components/stats/CategoryRing.vue` | New |
| `src/components/stats/RankingList.vue` | New |
| `src/components/Stats.vue` | Remove (replaced) |
| `src/App.vue` | Update import path (stats → stats/StatsDashboard) |
| `backend/routes/focusSessions.js` | Add `focusByCategory` aggregation |

No new npm dependencies.
