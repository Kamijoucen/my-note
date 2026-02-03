---
applyTo: '**/storage/**'
---

# 数据库迁移指令 - 开发阶段

## 适用场景
项目处于开发阶段，数据库 schema 频繁变动，无需保留历史迁移记录。

## 文件位置
- 实体定义：`src/storage/schema.ts`（Drizzle ORM schema）
- 迁移执行：`src/storage/database.ts`（migrations 数组）
- 类型定义：`src/renderer/types/index.ts`（前端使用的 TypeScript 类型）

## 修改流程

### 1. 修改 schema.ts
```typescript
// src/storage/schema.ts
export const cards = sqliteTable('cards', {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    content: text('content').notNull(),
    createdAt: text('created_at').notNull(),
    tags: text('tags').notNull().default('[]'),
    links: text('links').notNull().default('[]'),
    // 新增字段
    priority: integer('priority').notNull().default(0),
});
```

### 2. 直接覆盖 migrations[0]
将 `database.ts` 中 `migrations` 数组的第一个元素替换为最新的完整 DDL：
```typescript
const migrations: string[] = [
    // version 1: 最新完整表结构（开发阶段直接覆盖）
    `
    CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        links TEXT NOT NULL DEFAULT '[]',
        priority INTEGER NOT NULL DEFAULT 0  -- 新增
    );
    -- 其他表...
    `,
];
```

### 3. 同步更新 types/index.ts
```typescript
export interface Card {
    id: string
    projectId: string
    content: string
    createdAt: Date
    tags: string[]
    links: string[]
    priority: number  // 新增
}
```

### 4. 删除本地数据库重建
```powershell
Remove-Item "$env:APPDATA\my-note\my-note.db" -Force
npm start
```

## 注意事项
- 开发阶段可随时删库重建，不需要保留数据
- migrations 数组只保留一个元素（最新完整 DDL）
- schema.ts、migrations、types/index.ts 三处需同步修改
