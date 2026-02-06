# My Note - Copilot Instructions

## 项目概述
融合费曼学习法与卢曼卡片笔记法的轻量级智能笔记应用。
- 技术栈：Electron + Vue 3 + TypeScript + Naive UI + Vite
- 数据层：SQLite + Drizzle ORM + better-sqlite3
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
- `src/main.ts` - 主进程入口，启动流程：读配置 → 条件初始化 DB → 注册 IPC → 创建窗口
- `src/config.ts` - 应用配置管理（读写 `~/.airnote/config.json`）
- `src/preload.ts` - 定义 `window.electronAPI` 接口
- `src/ipc/` - IPC handlers 按模块拆分
- `src/storage/` - 数据存储层（Drizzle ORM，延迟初始化）
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
  → 有 repoPath → initDatabase(repoPath/airnote.db) → registerAllHandlers → createWindow
  → 无 repoPath → registerAllHandlers → createWindow
      → 渲染进程 App.vue 检测 configured=false → 显示 InitConfig 全屏页
      → 用户选目录 → config:initialize → saveConfig + initDatabase → 切换 MainContent
```

## 配置管理
- 配置文件：`~/.airnote/config.json`（`app.getPath('home')/.airnote/`）
- 结构：`{ repoPath: string }`
- 数据库文件：`<repoPath>/airnote.db`
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

### 数据库延迟初始化
- `src/storage/database.ts` 中 `db` 为延迟初始化变量，不在模块加载时创建
- `initDatabase(dbPath: string)` 接收完整数据库路径，创建实例并执行迁移
- 通过 `getDb()` 获取已初始化的 db 实例（未初始化时抛异常）
- Repo 层（如 `projectRepo.ts`）使用 `getDb()` 而非直接引用 `db`

### 存储适配器模式
定义统一接口协议，支持本地/云端双模式切换：
```typescript
interface StorageAdapter {
  // Project
  listProjects(): Promise<Project[]>
  getProject(id: string): Promise<Project | null>
  createProject(data: Omit<Project, 'id'>): Promise<Project>
  updateProject(id: string, data: Partial<Project>): Promise<Project>
  deleteProject(id: string): Promise<void>

  // Card
  listCards(projectId: string): Promise<Card[]>
  createCard(data: Omit<Card, 'id'>): Promise<Card>
  updateCard(id: string, data: Partial<Card>): Promise<Card>
  deleteCard(id: string): Promise<void>

  // Summary
  getSummary(projectId: string): Promise<Summary | null>
  saveSummary(data: Summary): Promise<Summary>
}
```

### 适配器实现
- `LocalStorageAdapter` - 本地存储（SQLite/JSON 文件）
- `RemoteStorageAdapter` - 远程服务端（实现相同协议的 REST API）

### 云同步协议（REST API 规范）
| 方法 | 端点 | 说明 |
|------|------|------|
| GET | `/api/projects` | 获取项目列表 |
| POST | `/api/projects` | 创建项目 |
| GET | `/api/projects/:id/cards` | 获取卡片列表 |
| POST | `/api/cards` | 创建卡片 |
| ... | ... | 其他 CRUD 操作 |

用户自行实现此协议即可接入任意云存储后端。

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
