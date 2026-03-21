import { getFormaClient, formaToDate, type EntityRecord, type EntityField } from './formaClient';
import type { Card } from '../renderer/types';

const SCHEMA_NAME = 'card';

/** Forma Entity → Card 类型转换 */
function entityToCard(entity: EntityRecord): Card {
    const fieldMap = new Map(entity.fields.map(f => [f.name, f.value]));
    return {
        id: entity.id,
        projectId: fieldMap.get('project_id') ?? '',
        content: fieldMap.get('content') ?? '',
        createdAt: formaToDate(entity.createdAt),
        tags: safeParseArray(fieldMap.get('tags')),
        links: safeParseArray(fieldMap.get('links')),
    };
}

function safeParseArray(val: string | undefined): string[] {
    if (!val) return [];
    try {
        const parsed = JSON.parse(val);
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

/**
 * 获取指定项目的卡片列表（Forma 不支持服务端过滤，客户端筛选）
 */
export async function listCards(projectId: string): Promise<Card[]> {
    const result = await getFormaClient().listEntities(SCHEMA_NAME, 1, 10000);
    return result.list
        .map(entityToCard)
        .filter(c => c.projectId === projectId);
}

/**
 * 根据 ID 获取卡片
 */
export async function getCard(id: string): Promise<Card | null> {
    const entity = await getFormaClient().getEntity(SCHEMA_NAME, id);
    if (!entity) return null;
    return entityToCard(entity);
}

/**
 * 创建卡片
 */
export async function createCard(data: { projectId: string; content: string; tags?: string[]; links?: string[] }): Promise<Card> {
    const client = getFormaClient();
    const fields: EntityField[] = [
        { name: 'project_id', value: data.projectId },
        { name: 'content', value: data.content },
        { name: 'tags', value: JSON.stringify(data.tags ?? []) },
        { name: 'links', value: JSON.stringify(data.links ?? []) },
    ];
    const id = await client.createEntity(SCHEMA_NAME, fields);
    const entity = await client.getEntity(SCHEMA_NAME, id);
    if (!entity) throw new Error('创建卡片后无法获取实体');
    return entityToCard(entity);
}

/**
 * 更新卡片（先获取再全量替换）
 */
export async function updateCard(id: string, data: { content?: string; tags?: string[]; links?: string[] }): Promise<Card | null> {
    const client = getFormaClient();
    const existing = await client.getEntity(SCHEMA_NAME, id);
    if (!existing) return null;

    const fieldMap = new Map(existing.fields.map(f => [f.name, f.value]));
    if (data.content !== undefined) fieldMap.set('content', data.content);
    if (data.tags !== undefined) fieldMap.set('tags', JSON.stringify(data.tags));
    if (data.links !== undefined) fieldMap.set('links', JSON.stringify(data.links));

    const fields: EntityField[] = Array.from(fieldMap.entries()).map(([name, value]) => ({ name, value }));
    await client.updateEntity(SCHEMA_NAME, id, fields);

    const updated = await client.getEntity(SCHEMA_NAME, id);
    if (!updated) throw new Error('更新卡片后无法获取实体');
    return entityToCard(updated);
}

/**
 * 删除卡片
 */
export async function deleteCard(id: string): Promise<boolean> {
    try {
        await getFormaClient().deleteEntity(SCHEMA_NAME, id);
        return true;
    } catch {
        return false;
    }
}
