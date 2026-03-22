import { getFormaClient, dateToForma, formaToDate, type EntityRecord, type EntityField } from './formaClient';
import type { AnalysisDoc } from '../renderer/types';

const SCHEMA_NAME = 'analysis_doc';

/** Forma Entity → AnalysisDoc 类型转换 */
function entityToAnalysisDoc(entity: EntityRecord): AnalysisDoc {
    const fieldMap = new Map(entity.fields.map(f => [f.name, f.value]));
    return {
        id: entity.id,
        projectId: fieldMap.get('project_id') ?? '',
        perspective: fieldMap.get('perspective') ?? '',
        content: fieldMap.get('content') ?? '',
        sourceCards: safeParseArray(fieldMap.get('source_cards')),
        updatedAt: formaToDate(fieldMap.get('updated_at') ?? entity.createdAt),
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
 * 获取指定项目和视角的分析文档（客户端筛选）
 */
export async function getAnalysisDoc(projectId: string, perspective: string): Promise<AnalysisDoc | null> {
    const result = await getFormaClient().listEntities(SCHEMA_NAME, 1, 10000);
    const matched = result.list
        .map(entityToAnalysisDoc)
        .filter(d => d.projectId === projectId && d.perspective === perspective);
    if (matched.length === 0) return null;
    // 返回最新更新的
    matched.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
    return matched[0];
}

/**
 * 保存分析文档（存在则更新，不存在则创建）
 */
export async function saveAnalysisDoc(data: {
    projectId: string;
    perspective: string;
    content: string;
    sourceCards: string[];
}): Promise<AnalysisDoc> {
    const client = getFormaClient();
    const now = new Date();

    const fields: EntityField[] = [
        { name: 'project_id', value: data.projectId },
        { name: 'perspective', value: data.perspective },
        { name: 'content', value: data.content },
        { name: 'source_cards', value: JSON.stringify(data.sourceCards) },
        { name: 'updated_at', value: dateToForma(now) },
    ];

    const existing = await getAnalysisDoc(data.projectId, data.perspective);
    let id: string;
    if (existing) {
        await client.updateEntity(SCHEMA_NAME, existing.id, fields);
        id = existing.id;
    } else {
        id = await client.createEntity(SCHEMA_NAME, fields);
    }

    const entity = await client.getEntity(SCHEMA_NAME, id);
    if (!entity) throw new Error('保存分析文档后无法获取实体');
    return entityToAnalysisDoc(entity);
}
