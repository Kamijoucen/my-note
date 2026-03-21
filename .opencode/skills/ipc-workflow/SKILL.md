---
name: ipc-workflow
description: 新增 IPC 功能时的五步流程、Channel 命名规范、文件修改清单和数据模型定义
---

## 新增 IPC 功能（五步流程）

每次新增一个从渲染进程调用主进程的功能，需按顺序修改以下 5 个位置：

### 第 1 步：创建 IPC Handler

文件：`src/ipc/<module>.ts`（新模块则新建文件）

```typescript
import { ipcMain } from 'electron';

export function registerXxxHandlers(): void {
    ipcMain.handle('module:action', async (_event, arg: string) => {
        // 业务逻辑，调用 storage 层
        // 返回 null 表示取消/失败
    });
}
```

### 第 2 步：注册到统一入口

文件：`src/ipc/index.ts`

在 `registerAllHandlers()` 中调用新 handler 的注册函数。

### 第 3 步：暴露 Preload 接口

文件：`src/preload.ts` — 在 `contextBridge.exposeInMainWorld` 中添加方法
文件：`src/env.d.ts` — 更新 `ElectronAPI` 接口的类型声明

```typescript
// preload.ts
modulAction: (arg: string) => ipcRenderer.invoke('module:action', arg),

// env.d.ts
interface ElectronAPI {
    modulAction: (arg: string) => Promise<ReturnType | null>;
}
```

### 第 4 步：声明 Protocol 方法

文件：`src/renderer/protocol/types.ts`

在 `Protocol` 接口中添加方法签名。

### 第 5 步：实现 ElectronProtocol

文件：`src/renderer/protocol/electronProtocol.ts`

在 `ElectronProtocol` 类中实现新方法，委托给 `window.electronAPI`。

## Channel 命名规范

格式：`模块:动作`（英文小写，冒号分隔）

已有 Channel：
- `card:list` / `card:create` / `card:update` / `card:delete`
- `project:list` / `project:create` / `project:delete`
- `summary:get` / `summary:save`
- `config:check` / `config:initialize`
- `dialog:selectFile` / `dialog:selectFiles` / `dialog:selectFolder`

## 数据模型

定义位置：`src/renderer/types/index.ts`

```typescript
interface Project {
    id: string; title: string; description: string
    createdAt: Date; updatedAt: Date; summaryId: string | null
}

interface Card {    // ⚠️ content 字段 AI 只读
    id: string; projectId: string; content: string
    createdAt: Date; tags: string[]; links: string[]
}

interface Summary {
    id: string; projectId: string; generatedAt: Date
    content: string; sourceCards: string[]; isArchived: boolean
}
```

## Handler 编写约定

- 第一个参数 `_event` 加下划线前缀（未使用时）
- 返回 `null` 表示取消或失败
- 查询类：try/catch 返回 `null`
- 删除/更新类：try/catch 返回 `boolean`
- 在 handler 中调用 `src/storage/` 的 Repo 函数，不直接操作 FormaClient
