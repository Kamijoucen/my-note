---
name: forma-storage
description: 存储层开发：Forma REST API 架构、FormaClient 单例、Repo 模式、Schema 约束、字段变更流程
---

## Forma 云端存储架构

```
FormaClient (src/storage/formaClient.ts)    ← HTTP 客户端单例
    ↑ 调用
Repo 层 (cardRepo / projectRepo / summaryRepo)  ← Entity ↔ TS 类型转换
    ↑ 调用
IPC handlers (src/ipc/*.ts)                  ← 主进程入口
```

- App code 硬编码为 `airnote`
- 完整 API 文档：`AI_INTEGRATION_PROMPT.md`

## FormaClient 单例模式

```typescript
// src/storage/formaClient.ts
let client: FormaClient | null = null;

export function initFormaClient(baseUrl: string, token: string): FormaClient {
    client = new FormaClient(baseUrl, token);
    return client;
}

export function getFormaClient(): FormaClient {
    if (!client) throw new Error('FormaClient 未初始化');
    return client;
}
```

关键方法：
- `verifyConnection(): Promise<boolean>` — 验证连接
- `createSchema(name, fields): Promise<void>` — 创建 Schema
- `getSchema(name): Promise<SchemaDetail | null>` — 获取 Schema
- `listEntities(schema): Promise<EntityRecord[]>` — 列出实体
- `getEntity(schema, id): Promise<EntityRecord | null>` — 获取单个实体
- `createEntity(schema, fields): Promise<EntityRecord>` — 创建实体
- `updateEntity(schema, id, fields): Promise<EntityRecord>` — 更新实体（全量替换）
- `deleteEntity(schema, id): Promise<void>` — 删除实体

HTTP 请求使用泛型：`private async request<T>(method, path, body?): Promise<T>`

## Repo 模式

每个领域模型对应一个 Repo 文件（`src/storage/<model>Repo.ts`），职责：

1. **Entity → TS 类型转换**：`entityToCard(entity: EntityRecord): Card`
2. **TS 类型 → Entity 字段转换**：`cardToFields(card): EntityField[]`
3. **CRUD 函数导出**：`listCards()`, `createCard()`, `updateCard()`, `deleteCard()`

### 类型转换要点

- Forma 所有字段值均为 **字符串**，Repo 层负责转换
- `Date` ↔ `string`：使用 `dateToForma(d)` / `formaToDate(s)` 工具函数
- 日期格式：`YYYY-MM-DD HH:mm:ss`
- `string[]` ↔ `string`：JSON.stringify / JSON.parse
- `boolean` ↔ `string`：`'true'` / `'false'`

### 更新操作（全量替换）

Forma Entity 更新为全量替换，需先 GET 当前值再 merge：

```typescript
export async function updateCard(id: string, data: Partial<Card>): Promise<Card | null> {
    try {
        const existing = await getFormaClient().getEntity(SCHEMA_NAME, id);
        if (!existing) return null;
        const current = entityToCard(existing);
        const merged = { ...current, ...data };
        const updated = await getFormaClient().updateEntity(SCHEMA_NAME, id, cardToFields(merged));
        return entityToCard(updated);
    } catch {
        return null;
    }
}
```

## Schema 约束

Schema 定义位置：`src/ipc/config.ts` 的 `SCHEMAS` 常量

### 已有 Schema

- `project`：title, description, createdAt, updatedAt, summaryId
- `card`：projectId, content, createdAt, tags, links
- `summary`：projectId, generatedAt, content, sourceCards, isArchived

### 不可变约束

Schema 创建后：
- **不可** 新增/删除字段
- **不可** 修改字段的 name 和 type
- **可以** 修改 `required`、`maxLength`、`minLength`、`enumValues`、`description`

### 新增字段流程

需要新字段时：
1. 删除该 Schema 下所有 Entity
2. 删除 Schema
3. 修改 `src/ipc/config.ts` 中的 `SCHEMAS` 定义
4. 更新对应 Repo 的转换函数
5. 更新 `src/renderer/types/index.ts` 前端类型
6. 重新初始化应用（自动重建 Schema）

或创建新版本 Schema（如 `card_v2`）并迁移数据。

## Forma 不支持的功能

- **无服务端过滤**：需客户端获取全量数据后筛选
- **无排序**：客户端排序
- **无分页**：一次性返回所有 Entity
