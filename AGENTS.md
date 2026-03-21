# My Note — AI Agent 指引

## 项目概述

融合费曼学习法与卢曼卡片笔记法的轻量级智能笔记桌面应用。
- **技术栈：** Electron 40 + Vue 3 (`<script setup>`) + TypeScript (strict) + Naive UI + Vite
- **数据层：** Forma 云端 REST API（App code: `airnote`）
- **包管理器：** npm（lockfile: `package-lock.json`）
- **核心理念：** 原子化卡片输入 → 时间线展示 → AI 只读分析（不修改原始内容）

## 开发命令

```bash
npm start          # Electron Forge 开发服务器（Vite 热重载）
npm run lint       # ESLint 检查（.ts/.tsx），注意：未包含 .vue
npm run package    # 打包应用（不生成安装包）
npm run make       # 构建平台安装包
npm run publish    # 发布到更新服务器
```

> **测试：** 项目当前无测试框架，无 test 脚本，无测试文件。

## 架构概览

```
Main Process  (src/main.ts)       ← 窗口管理、配置、数据持久化
    ↓  IPC (ipcMain.handle)
Preload       (src/preload.ts)    ← contextBridge 暴露安全 API
    ↓  window.electronAPI
Renderer      (src/renderer/)     ← Vue 3 SPA
```

### 目录结构

| 目录 | 职责 |
|------|------|
| `src/main.ts` | 主进程入口：读配置 → 初始化 FormaClient → 注册 IPC → 创建窗口 |
| `src/config.ts` | 应用配置管理（`~/.airnote/config.json`） |
| `src/preload.ts` | contextBridge，定义 `window.electronAPI` |
| `src/ipc/` | IPC handlers，按模块拆分（card/project/summary/config/dialog） |
| `src/storage/` | 数据层：FormaClient HTTP 客户端 + cardRepo/projectRepo/summaryRepo |
| `src/renderer/protocol/` | Protocol 抽象层（渲染进程访问主进程的唯一通道） |
| `src/renderer/windows/` | 页面级组件（App.vue / MainContent.vue / InitConfig.vue） |
| `src/renderer/components/` | 可复用 UI 组件（Sidebar / CardTimeline / CardInput） |
| `src/renderer/types/` | 领域模型接口（Project / Card / Summary） |
| `src/logic/` | 业务逻辑层（预留目录，当前为空） |

## 代码规范

### 导入

- 统一使用 ES Modules（`import`/`export`），禁止 `require()`
- 类型导入使用 `import type`：`import type { Card } from '../renderer/types'`
- 无路径别名，全部使用相对路径
- 导入顺序：Node 内置（`node:` 前缀）→ 框架/第三方 → 本地模块
- 桶文件（barrel `index.ts`）用于 `ipc/`、`storage/`、`protocol/`、`types/`

### TypeScript

- `strict: true` + `noImplicitAny: true`，target `ESNext`，模块解析 `bundler`
- 数据结构优先使用 `interface`（非 `type`），命名 PascalCase 无 `I` 前缀
- 所有导出函数和类方法必须标注显式返回类型
- 泛型用于 HTTP 客户端的类型安全响应：`request<T>(...): Promise<T>`

### 命名

| 类别 | 规则 | 示例 |
|------|------|------|
| 变量/函数 | camelCase | `selectedProjectId`, `handleSend` |
| 接口/类 | PascalCase | `FormaClient`, `Protocol` |
| 模块级常量 | UPPER_SNAKE_CASE | `APP_CODE`, `SCHEMA_NAME` |
| Vue 组件文件 | PascalCase.vue | `CardInput.vue`, `Sidebar.vue` |
| TypeScript 文件 | camelCase.ts | `cardRepo.ts`, `formaClient.ts` |
| IPC 通道 | `模块:动作` | `card:create`, `project:list` |
| 事件处理器 | `handle` 前缀 | `handleSend`, `handleProjectSelect` |
| 未用参数 | 下划线前缀 | `_event` |

### 格式

- **引号：** 单引号（JS/TS），HTML 属性双引号
- **尾逗号：** 多行结构使用尾逗号
- **缩进：** 主进程 `.ts` 文件 4 空格；渲染进程 `.vue` 和 `protocol/`/`types/` 的 `.ts` 文件 2 空格
- **分号：** 主进程 `.ts` 文件使用分号；渲染进程 `.vue`/`.ts` 文件不使用分号
- **无 Prettier/Biome**，仅 ESLint（`@typescript-eslint` + `eslint-plugin-import`）

### Vue 组件

- 统一 `<script setup lang="ts">`，禁止 Options API
- Props/Emits 使用泛型定义：`defineProps<{ projectId: string }>()`
- 组件库：Naive UI（按需引入）
- **渲染进程禁止直接使用 `window.electronAPI`**，必须通过 `protocol` 单例

### 错误处理

- 可失败操作：try/catch 返回 `null`（查询）或 `false`（删除/更新）
- 不可恢复错误：`throw new Error('描述')`
- 吞掉错误时使用 bare `catch`（无错误变量）：`} catch { return null; }`
- Vue 组件中：try/catch + `console.error('中文描述:', e)`

### 注释

- 导出函数使用 JSDoc `/** ... */`，中文描述，无 `@param`/`@returns` 标签
- 分节用 `// ── 标题 ──────` 分隔符
- 行内注释 `//`，重点说明"为什么"而非"做什么"
- 文件级多行注释说明模块职责和设计决策

## 关键约束

### 数据主权（最高优先级）
- `Card.content` 是黄金数据源，**AI 仅读取，严禁修改/重写/替换**
- AI 建议（标签、关联）需用户确认后才写入

### Protocol 抽象层
- `.vue` 组件统一通过 `import { protocol } from '../protocol'` 调用
- 仅 `electronProtocol.ts` 允许引用 `window.electronAPI`
- 迁移 Web 时只需新增实现类，业务代码无需改动

### Forma 存储约束
- Entity 更新为全量替换（GET → merge → PUT）
- 所有字段值以字符串传递，Repo 层负责类型转换
- 日期格式：`YYYY-MM-DD HH:mm:ss`
- Schema 创建后字段不可增删、不可改名/改类型
- Token 仅在主进程使用，不传递到渲染进程

### 安全
- 渲染进程禁用 Node.js，系统交互通过 IPC
- API Key / Token 仅在主进程中使用，禁止传递到渲染进程
- LLM 请求在主进程发起，结果通过 IPC 返回

## AI 行为规范

> 来源：`.github/instructions/global.instructions.md` + `.github/copilot-instructions.md`

- **最小修改：** 仅修改必要代码，不扩大范围，不主动重构，不添加未要求的功能
- **保持一致：** 遵循现有代码风格和项目结构
- **优先简单：** 使用框架/库原生能力，选择最简单直接的实现方式
- **复杂实现先沟通：** render 函数、hack、深层 CSS 穿透等需先告知复杂性和替代方案
- **先沟通再行动：** 发现 bug、安全问题、跨模块影响时，列出文件 → 说明修改 → 评估影响 → 等待确认
- **使用中文交流**
- IPC handler 返回 `null` 表示取消/失败

## Skill（按需加载）

技术实现细节拆分为 skill，在执行具体任务时按需加载：

| Skill | 适用场景 |
|-------|----------|
| `ipc-workflow` | 新增 IPC 功能时：五步流程、Channel 命名、文件修改清单 |
| `forma-storage` | 存储层开发：Forma API、Schema 约束、Repo 模式、字段变更 |
| `ui-layout` | UI 开发：界面布局、条件渲染、Naive UI 用法、主题配置 |

> 详见 `.opencode/skills/` 目录下的 `SKILL.md` 文件。

## 参考文档

- `.github/copilot-instructions.md` — 项目架构与约定详情
- `.github/instructions/global.instructions.md` — AI 通用行为规范
- `AI_INTEGRATION_PROMPT.md` — Forma REST API 完整文档
