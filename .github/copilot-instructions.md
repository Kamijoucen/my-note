# My Note - Copilot Instructions

## 项目概述
融合费曼学习法与卢曼卡片笔记法的轻量级智能笔记应用。
- 技术栈：Electron + Vue 3 + TypeScript + Naive UI + Vite
- 数据层：Forma 云端存储（REST API）
- 核心理念：原子化卡片输入 → 时间线展示 → AI 只读分析（不修改原始内容）

## 架构

### 进程模型
```
Main Process (src/main.ts)          ← 窗口管理、文件系统、数据持久化
    ↓ IPC (ipcMain.handle)
Preload (src/preload.ts)            ← contextBridge 暴露安全 API
    ↓ window.electronAPI
Renderer (src/renderer/)            ← Vue 3 应用
```

### 目录结构
- `src/main.ts` - 主进程入口，启动流程：读配置 → 条件初始化 FormaClient → 注册 IPC → 创建窗口
- `src/config.ts` - 应用配置管理（读写 `~/.airnote/config.json`，存储 Forma 连接信息）
- `src/preload.ts` - 定义 `window.electronAPI` 接口
- `src/ipc/` - IPC handlers 按模块拆分
- `src/storage/` - 数据存储层（Forma HTTP 客户端 + Repo 层，延迟初始化）
- `src/renderer/` - Vue 渲染进程
- `src/renderer/protocol/` - Protocol 抽象层（渲染进程访问主进程的唯一通道）
- `src/env.d.ts` - 全局类型定义（含 `ElectronAPI`）

## 数据模型

### Project（项目）
```typescript
{ id: string, title: string, description: string, createdAt: Date, updatedAt: Date, summaryId: string | null }
```

### Card（原子卡片）⚠️ AI 禁止修改 content 字段
```typescript
{ id: string, projectId: string, content: string, createdAt: Date, tags: string[], links: string[] }
```

### Summary（AI 总览）
```typescript
{ id: string, projectId: string, generatedAt: Date, content: string, sourceCards: string[], isArchived: boolean }
```

## IPC 通信模式

### 添加新功能（五步）
1. `src/ipc/xxx.ts` - 创建 handler：`ipcMain.handle('module:action', ...)`
2. `src/ipc/index.ts` - 注册到 `registerAllHandlers()`
3. `src/preload.ts` + `src/env.d.ts` - 暴露接口并更新 `ElectronAPI` 类型
4. `src/renderer/protocol/types.ts` - 在 `Protocol` 接口中声明方法
5. `src/renderer/protocol/electronProtocol.ts` - 在 `ElectronProtocol` 中实现，委托给 `window.electronAPI`

### Channel 命名
格式：`模块:动作`，如 `card:create`、`project:list`、`config:check`

## 界面布局

### App.vue 条件渲染（无 vue-router）
```
isConfigured === null  → 加载中（NSpin）
isConfigured === false → <InitConfig />（全屏，隐藏导航栏）
isConfigured === true  → 导航栏 + <MainContent />
```

### MainContent 布局
```
┌─────────────────────────────────────────────────────────┐
│ NLayout (has-sider, height: 100vh)                      │
│ ├─ Sidebar (width: 240px)                               │
│ └─ NLayout (position: absolute, left: 240px)            │
│     ├─ NLayoutHeader (height: 56px)                     │
│     ├─ NLayout (position: absolute,                     │
│     │           top: 56px, bottom: 168px)  ← 可滚动区   │
│     │   ├─ ProjectHeader                                │
│     │   └─ CardTimeline                                 │
│     └─ NLayoutFooter (position: absolute,               │
│                       height: 168px)       ← 固定底部   │
│         └─ CardInput                                    │
└─────────────────────────────────────────────────────────┘
```
- 使用 Naive UI 绝对定位模式实现固定头尾、中间滚动
- 侧边栏固定宽度 240px，可折叠

## 启动流程
```
app.on('ready')
  → loadConfig()（读 ~/.airnote/config.json）
  → 有 formaBaseUrl/formaToken → initFormaClient(baseUrl, token) → registerAllHandlers → createWindow
  → 无配置 → registerAllHandlers → createWindow
      → 渲染进程 App.vue 检测 configured=false → 显示 InitConfig 全屏页
      → 用户输入 Forma 地址和 Token → config:initialize → 验证连接 + 创建 Schema + saveConfig → 切换 MainContent
```

## 配置管理
- 配置文件：`~/.airnote/config.json`（`app.getPath('home')/.airnote/`）
- 结构：`{ formaBaseUrl: string, formaToken: string }`
- 读写模块：`src/config.ts`（`loadConfig()` / `saveConfig()`）

## Protocol 抽象层
渲染进程通过 `src/renderer/protocol/` 的 Protocol 接口访问主进程能力。
- **禁止**在 `.vue` 组件中直接使用 `window.electronAPI`
- 接口定义：`src/renderer/protocol/types.ts`（`Protocol` 接口）
- Electron 实现：`src/renderer/protocol/electronProtocol.ts`（唯一允许引用 `window.electronAPI` 的文件）
- 全局单例：`src/renderer/protocol/index.ts` 导出 `protocol`
- 组件中统一通过 `import { protocol } from '../protocol'` 调用
- 迁移 Web 时只需新增实现类，业务代码无需改动

## 设计语言
- 视觉风格模仿 Notion：黑白灰主色调，简洁克制
- 在 `App.vue` 中通过 `themeOverrides` 配置亮色/暗色主题
- 全局样式在 `src/index.css` 中定义

## 开发命令
```bash
npm start      # 开发服务器（热重载）
npm run make   # 构建安装包
npm run lint   # ESLint 检查
```

## 存储层架构

### Forma 云端存储
- App code：`airnote`（硬编码）
- Forma API 说明：`AI_INTEGRATION_PROMPT.md`
- HTTP 客户端：`src/storage/formaClient.ts`（延迟初始化单例 `initFormaClient()` / `getFormaClient()`）
- Repo 层：`projectRepo.ts`、`cardRepo.ts`、`summaryRepo.ts`（负责 Entity ↔ TypeScript 类型转换）
- Schema 定义在 `src/ipc/config.ts` 的 `SCHEMAS` 常量中，初始化时自动检查创建

### 关键约束
- Forma Entity 更新为全量替换，update 方法需先 GET 再 merge 后 PUT
- 所有字段值以字符串传递，Repo 层负责类型转换
- 日期格式：`YYYY-MM-DD HH:mm:ss`
- Forma 不支持服务端过滤，客户端侧筛选
- Token 仅在主进程使用，不传递到渲染进程

### 新增字段流程
1. 在 `src/ipc/config.ts` 的 `SCHEMAS` 中添加字段定义
2. 更新对应 Repo 的转换函数（entityToXxx / xxxToFields）
3. 更新 `src/renderer/types/index.ts` 前端类型
4. **注意**：Forma Schema 创建后字段不可新增/删除，需删除 Schema 重建

### Schema 变更限制
Forma Schema 创建后：
- **不可**新增/删除字段，**不可**修改字段 name 和 type
- **可**修改字段的 `required`、`maxLength`、`minLength`、`enumValues`、`description`
- 需要新增字段时：删除 Schema 下所有 Entity → 删除 Schema → 重建；或创建新版本 Schema（如 `card_v2`）并迁移数据
- 修改 `src/ipc/config.ts` 中的 SCHEMAS 只影响新建 Schema，已存在的不会被更新

## LLM 集成

### 配置
- 使用云端 LLM API（OpenAI / Claude / 其他兼容接口）
- API Key 存储在用户配置中（通过 `~/.airnote/config.json` 存储）
- 支持自定义 API Base URL（兼容私有部署）

### 调用规范
```typescript
interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom'
  apiKey: string          // 加密存储
  baseUrl?: string        // 自定义端点
  model: string           // 如 'gpt-4o', 'claude-3-sonnet'
}
```

### 安全约束
- API Key 仅在主进程中使用，禁止传递到渲染进程
- LLM 请求在主进程发起，结果通过 IPC 返回
- 离线状态禁用 LLM 功能，核心笔记功能不依赖网络

## 关键约定

### 数据主权（最高优先级）
- Card.content 是黄金数据源，**AI 仅读取，严禁修改/重写/替换**
- AI 建议（标签、关联）需用户确认后才写入
- 数据格式开放：Markdown + YAML Frontmatter 可导出

### 代码规范
- 渲染进程禁用 Node.js，系统交互通过 IPC
- IPC handler 返回 `null` 表示取消/失败
- Vue 组件使用 `<script setup lang="ts">`
- 组件库：Naive UI（auto-import 已配置）

### AI 集成规则
- 触发：手动点击或卡片数 ≥10
- 输入：Card.content（只读）
- 输出：Summary（结构化总结）
- 语法优化以 Diff 展示，用户选择性接受
