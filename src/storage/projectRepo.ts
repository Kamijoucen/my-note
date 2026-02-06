import { getDb } from './database';
import { projects } from './schema';
import { eq } from 'drizzle-orm';
import type { Project } from '../renderer/types';

/**
 * 获取所有项目列表
 */
export function listProjects(): Project[] {
    const rows = getDb().select().from(projects).all();
    return rows.map((row) => ({
        id: row.id,
        title: row.title,
        description: row.description,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        summaryId: row.summaryId,
    }));
}

/**
 * 根据 ID 获取项目
 */
export function getProject(id: string): Project | null {
    const row = getDb().select().from(projects).where(eq(projects.id, id)).get();
    if (!row) return null;
    return {
        id: row.id,
        title: row.title,
        description: row.description,
        createdAt: new Date(row.createdAt),
        updatedAt: new Date(row.updatedAt),
        summaryId: row.summaryId,
    };
}

/**
 * 创建新项目
 */
export function createProject(data: Omit<Project, 'id'>): Project {
    const id = crypto.randomUUID();
    const now = new Date();
    getDb().insert(projects)
        .values({
            id,
            title: data.title,
            description: data.description,
            createdAt: (data.createdAt ?? now).toISOString(),
            updatedAt: (data.updatedAt ?? now).toISOString(),
            summaryId: data.summaryId,
        })
        .run();
    return {
        id,
        ...data,
        createdAt: data.createdAt ?? now,
        updatedAt: data.updatedAt ?? now,
    };
}

/**
 * 更新项目
 */
export function updateProject(id: string, data: Partial<Omit<Project, 'id'>>): Project | null {
    const existing = getProject(id);
    if (!existing) return null;

    const updateData: Record<string, string> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.summaryId !== undefined) updateData.summaryId = data.summaryId ?? '';
    updateData.updatedAt = new Date().toISOString();

    getDb().update(projects).set(updateData).where(eq(projects.id, id)).run();

    return getProject(id);
}

/**
 * 删除项目
 */
export function deleteProject(id: string): boolean {
    const result = getDb().delete(projects).where(eq(projects.id, id)).run();
    return result.changes > 0;
}
