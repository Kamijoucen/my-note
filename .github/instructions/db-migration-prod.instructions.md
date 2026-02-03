---
applyTo: '**/storage/**'
---

# 数据库迁移指令 - 生产阶段

## 适用场景
项目已发布，用户本地有数据，需要保留数据并增量升级表结构。

## 文件位置
- 实体定义：`src/storage/schema.ts`（Drizzle ORM schema）
- 迁移执行：`src/storage/database.ts`（migrations 数组）
- 类型定义：`src/renderer/types/index.ts`（前端使用的 TypeScript 类型）

## 修改流程

### 1. 修改 schema.ts（新增字段）
```typescript
// src/storage/schema.ts
export const cards = sqliteTable('cards', {
    // ...existing fields...
    priority: integer('priority').notNull().default(0),  // 新增
});
```

### 2. 在 migrations 数组末尾追加 ALTER 语句
```typescript
// src/storage/database.ts
const migrations: string[] = [
    // version 1: 初始表结构（不要修改！）
    `CREATE TABLE IF NOT EXISTS cards (...);`,

    // version 2: 新增 priority 字段（追加到末尾）
    `ALTER TABLE cards ADD COLUMN priority INTEGER NOT NULL DEFAULT 0;`,
];
```

### 3. 同步更新 types/index.ts
```typescript
export interface Card {
    // ...existing fields...
    priority: number  // 新增
}
```

### 4. 更新 Repo 层（如需要）
如果新字段需要在查询中使用，更新对应的 `src/storage/*Repo.ts` 文件。

## 迁移规则

### 允许的操作
| 操作 | SQL 示例 |
|------|----------|
| 添加列 | `ALTER TABLE x ADD COLUMN y TEXT` |
| 添加表 | `CREATE TABLE IF NOT EXISTS ...` |
| 添加索引 | `CREATE INDEX IF NOT EXISTS ...` |

### 禁止的操作（SQLite 限制）
| 操作 | 原因 |
|------|------|
| 删除列 | SQLite 不支持 DROP COLUMN（旧版本） |
| 修改列类型 | SQLite 不支持 ALTER COLUMN |
| 重命名列 | 需要重建表，风险高 |

### 如需删除/修改列
需要重建表：
```sql
-- version N: 重建 cards 表
CREATE TABLE cards_new (...);  -- 新结构
INSERT INTO cards_new SELECT ... FROM cards;  -- 迁移数据
DROP TABLE cards;
ALTER TABLE cards_new RENAME TO cards;
```

## 版本号规则
- migrations 数组索引从 0 开始
- user_version = 数组索引 + 1
- 例：migrations[0] 执行后 user_version = 1

## 测试迁移
```powershell
# 模拟老用户升级：先用旧版本创建数据库，再用新版本启动
npm start  # 应自动执行新迁移
```

## 注意事项
- **绝不修改已发布的迁移**（migrations 数组中已有的元素）
- 只能在数组末尾追加新迁移
- schema.ts、migrations、types/index.ts 三处需同步修改
- 新字段必须有默认值或允许 NULL
