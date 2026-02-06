import { drizzle, BetterSQLite3Database } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as schema from './schema';

// 延迟初始化：在 initDatabase() 调用前为 null
let sqlite: Database.Database | null = null;
let db: BetterSQLite3Database<typeof schema> | null = null;

/**
 * 获取已初始化的数据库实例
 * 必须在 initDatabase() 之后调用，否则抛出异常
 */
export function getDb(): BetterSQLite3Database<typeof schema> {
    if (!db) {
        throw new Error('数据库尚未初始化，请先调用 initDatabase()');
    }
    return db;
}

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
 * @param dbPath 数据库文件完整路径（如 /path/to/repo/airnote.db）
 * 根据 user_version 执行增量迁移
 */
export function initDatabase(dbPath: string) {
    sqlite = new Database(dbPath);
    db = drizzle(sqlite, { schema });

    const currentVersion = sqlite.pragma('user_version', { simple: true }) as number;

    // 从当前版本开始，执行所有未执行的迁移
    for (let i = currentVersion; i < migrations.length; i++) {
        sqlite.exec(migrations[i]);
        sqlite.pragma(`user_version = ${i + 1}`);
    }
}
