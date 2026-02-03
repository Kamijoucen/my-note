import { sqliteTable, text } from 'drizzle-orm/sqlite-core';

/** 项目表 */
export const projects = sqliteTable('projects', {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    summaryId: text('summary_id'),
});

/** 卡片表 */
export const cards = sqliteTable('cards', {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    content: text('content').notNull(),
    createdAt: text('created_at').notNull(),
    tags: text('tags').notNull().default('[]'), // JSON string
    links: text('links').notNull().default('[]'), // JSON string
});

/** AI 总览表 */
export const summaries = sqliteTable('summaries', {
    id: text('id').primaryKey(),
    projectId: text('project_id').notNull(),
    generatedAt: text('generated_at').notNull(),
    content: text('content').notNull(),
    sourceCards: text('source_cards').notNull().default('[]'), // JSON string
    isArchived: text('is_archived').notNull().default('false'), // 'true' | 'false'
});
