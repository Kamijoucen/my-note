import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { app } from 'electron';
import path from 'node:path';
import * as schema from './schema';

// 数据库文件存放在用户数据目录
const dbPath = path.join(app.getPath('userData'), 'my-note.db');
const sqlite = new Database(dbPath);

// 创建 Drizzle 实例
export const db = drizzle(sqlite, { schema });

/**
 * 迁移定义
 * 每个元素对应一个版本的迁移 SQL
 * 索引 0 → version 1，索引 1 → version 2，以此类推
 */
const migrations: string[] = [
    // version 1: 初始表结构
    `
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        summary_id TEXT
    );

    CREATE TABLE IF NOT EXISTS cards (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        content TEXT NOT NULL,
        created_at TEXT NOT NULL,
        tags TEXT NOT NULL DEFAULT '[]',
        links TEXT NOT NULL DEFAULT '[]'
    );

    CREATE TABLE IF NOT EXISTS summaries (
        id TEXT PRIMARY KEY,
        project_id TEXT NOT NULL,
        generated_at TEXT NOT NULL,
        content TEXT NOT NULL,
        source_cards TEXT NOT NULL DEFAULT '[]',
        is_archived TEXT NOT NULL DEFAULT 'false'
    );
    `,

    // version 2: 示例 - 添加新字段
    // `ALTER TABLE cards ADD COLUMN priority INTEGER DEFAULT 0;`,
];

/**
 * 初始化数据库
 * 根据 user_version 执行增量迁移
 */
export function initDatabase() {
    const currentVersion = sqlite.pragma('user_version', { simple: true }) as number;

    // 从当前版本开始，执行所有未执行的迁移
    for (let i = currentVersion; i < migrations.length; i++) {
        sqlite.exec(migrations[i]);
        sqlite.pragma(`user_version = ${i + 1}`);
    }

    // 插入测试数据
    seedTestData();
}

/**
 * 插入测试数据（仅当数据库为空时）
 */
function seedTestData() {
    const count = db.select().from(schema.projects).all().length;
    if (count === 0) {
        const now = new Date().toISOString();
        db.insert(schema.projects)
            .values({
                id: crypto.randomUUID(),
                title: '示例项目',
                description: '这是一个示例项目，你可以在这里记录你的学习笔记。',
                createdAt: now,
                updatedAt: now,
                summaryId: null,
            })
            .run();
    }
}

export default db;
