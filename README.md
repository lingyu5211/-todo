# 个人待办与日程管理应用

一个响应式的个人待办与日程管理应用，使用Vue 3和Element Plus开发。

## 功能特性

### 待办事项
- 添加新的待办事项
- 标记待办事项为已完成/未完成
- 编辑待办事项
- 删除待办事项
- 按状态过滤待办事项（全部、未完成、已完成）
- 显示剩余待办事项数量
- 清除已完成事项
- 本地存储功能，刷新页面后数据不丢失

### 日程安排
- 日历视图，支持月份切换
- 显示当天日期和有日程的日期
- 选择日期添加新日程
- 为日程设置时间和颜色
- 按时间排序显示日程
- 删除日程
- 本地存储功能，刷新页面后数据不丢失

## 技术栈

- Vue 3
- Element Plus
- Vite
- LocalStorage

## 项目结构

```
todo-schedule-app/
├── README.md
├── package.json
├── index.html
├── public/
├── src/
│   ├── main.js
│   ├── App.vue
│   ├── components/
│   │   ├── TodoInput.vue
│   │   ├── TodoItem.vue
│   │   └── TodoFooter.vue
│   └── utils/
│       └── storage.js            # LocalStorage 读写封装
└── reports/
    ├── screenshots/              # 运行截图/关键日志
```

## 安装与运行

### 安装依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 响应式设计

应用采用响应式设计，适配不同屏幕尺寸，在移动设备上也能正常显示。