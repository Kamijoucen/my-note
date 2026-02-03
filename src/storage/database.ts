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
 * 初始化数据库表结构
 * 在 app ready 后调用
 */
export function initDatabase() {
    sqlite.exec(`
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
    `);

    // 如果没有项目，插入测试数据
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
