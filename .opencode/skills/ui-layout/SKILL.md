---
name: ui-layout
description: UI 开发：界面布局结构、App.vue 条件渲染、MainContent 布局、Naive UI 用法、主题配置、启动流程
---

## App.vue 条件渲染（无 vue-router）

```
isConfigured === null  → 加载中（NSpin 全屏）
isConfigured === false → <InitConfig />（全屏配置页，隐藏导航栏）
isConfigured === true  → 导航栏 + <MainContent />
```

状态由 `config:check` IPC 返回值决定。

## MainContent 布局

```
┌─────────────────────────────────────────────────────────┐
│ NLayout (has-sider, height: 100vh)                      │
│ ├─ Sidebar (width: 240px, 可折叠)                       │
│ └─ NLayout (position: absolute, left: 240px)            │
│     └─ NSplit (左右双栏)                                │
│         ├─ 左栏：CardInput                              │
│         └─ 右栏：CardTimeline                           │
└─────────────────────────────────────────────────────────┘
```

- 使用 Naive UI **绝对定位模式**（`position="absolute"`）
- Sidebar 固定宽度 240px，通过 `v-model` 控制折叠状态

## 组件通信

```
App.vue
  └─ MainContent.vue
       ├─ Sidebar.vue            ← v-model:selectedProjectId（双向绑定）
       ├─ CardTimeline.vue       ← :projectId + ref expose refresh()
       └─ CardInput.vue          ← :projectId + @card-created（事件）
```

- 父子通信：Props（向下）+ Emits（向上）+ `v-model` 语法糖
- 无 Vuex/Pinia，状态通过 `ref()` 在组件内管理
- 数据获取统一通过 `protocol` 单例

## 启动流程

```
app.on('ready')
  → loadConfig()（读 ~/.airnote/config.json）
  → 有配置 → initFormaClient() → registerAllHandlers() → createWindow()
  → 无配置 → registerAllHandlers() → createWindow()
      → 渲染进程 App.vue 检测 configured=false → 显示 InitConfig
      → 用户输入 Forma URL + Token → config:initialize
      → 验证连接 + 创建 Schema + saveConfig → 切换到 MainContent
```

## Naive UI 使用约定

- 按需引入组件，无全局注册
- 在 `App.vue` 中通过 `<NConfigProvider>` 配置主题
- 亮色/暗色主题切换：`isDark` ref + `darkTheme` / `null`
- 自定义主题通过 `themeOverrides` 对象覆盖（Notion 风格：黑白灰主色调）
- 常用组件：NLayout / NLayoutSider / NLayoutHeader / NLayoutFooter / NSpin / NButton / NInput / NCollapse

## 设计语言

- 视觉风格模仿 **Notion**：黑白灰主色调，简洁克制
- 全局样式在 `src/index.css` 中定义
- 组件样式使用 `<style scoped>`，避免全局污染
- 优先使用 Naive UI 内置样式，避免深层 CSS 穿透（`:deep()`）

## CSS 注意事项

- 优先用 Naive UI 的 `position="absolute"` 布局属性，而非手写 CSS
- 需要自定义样式时，优先使用组件的 `style` 属性或 `themeOverrides`
- 使用原生 CSS 类，避免 CSS-in-JS
