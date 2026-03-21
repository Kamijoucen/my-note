import { getFormaClient, dateToForma, formaToDate, type EntityRecord, type EntityField } from './formaClient';
import type { Summary } from '../renderer/types';

const SCHEMA_NAME = 'summary';

/** Forma Entity → Summary 类型转换 */
function entityToSummary(entity: EntityRecord): Summary {
    const fieldMap = new Map(entity.fields.map(f => [f.name, f.value]));
    return {
        id: entity.id,
        projectId: fieldMap.get('project_id') ?? '',
        generatedAt: formaToDate(fieldMap.get('generated_at') ?? entity.createdAt),
        content: fieldMap.get('content') ?? '',
        sourceCards: safeParseArray(fieldMap.get('source_cards')),
        isArchived: fieldMap.get('is_archived') === 'true',
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
 * 获取项目的 Summary（Forma 不支持服务端过滤，客户端筛选取最新一条）
 */
export async function getSummary(projectId: string): Promise<Summary | null> {
    const result = await getFormaClient().listEntities(SCHEMA_NAME, 1, 10000);
    const matched = result.list
        .map(entityToSummary)
        .filter(s => s.projectId === projectId);
    if (matched.length === 0) return null;
    // 返回最新生产的 summary
    matched.sort((a, b) => b.generatedAt.getTime() - a.generatedAt.getTime());
    return matched[0];
}

/**
 * 保存 Summary（如果存在同项目的则更新，否则创建）
 */
export async function saveSummary(data: { projectId: string; content: string; sourceCards: string[]; isArchived: boolean }): Promise<Summary> {
    const client = getFormaClient();
    const now = new Date();

    const fields: EntityField[] = [
        { name: 'project_id', value: data.projectId },
        { name: 'generated_at', value: dateToForma(now) },
        { name: 'content', value: data.content },
        { name: 'source_cards', value: JSON.stringify(data.sourceCards) },
        { name: 'is_archived', value: data.isArchived ? 'true' : 'false' },
    ];

    // 查找该项目已有的 summary
    const existing = await getSummary(data.projectId);
    let id: string;
    if (existing) {
        await client.updateEntity(SCHEMA_NAME, existing.id, fields);
        id = existing.id;
    } else {
        id = await client.createEntity(SCHEMA_NAME, fields);
    }

    const entity = await client.getEntity(SCHEMA_NAME, id);
    if (!entity) throw new Error('保存 Summary 后无法获取实体');
    return entityToSummary(entity);
}
