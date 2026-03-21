import { getFormaClient, formaToDate, type EntityRecord, type EntityField } from './formaClient';
import type { Project } from '../renderer/types';

const SCHEMA_NAME = 'project';

/** Forma Entity → Project 类型转换 */
function entityToProject(entity: EntityRecord): Project {
    const fieldMap = new Map(entity.fields.map(f => [f.name, f.value]));
    return {
        id: entity.id,
        title: fieldMap.get('title') ?? '',
        description: fieldMap.get('description') ?? '',
        createdAt: formaToDate(entity.createdAt),
        updatedAt: formaToDate(entity.updatedAt),
        summaryId: fieldMap.get('summary_id') || null,
    };
}

/** Project 数据 → Forma Entity fields */
function projectToFields(data: { title: string; description: string; summaryId?: string | null }): EntityField[] {
    return [
        { name: 'title', value: data.title },
        { name: 'description', value: data.description ?? '' },
        { name: 'summary_id', value: data.summaryId ?? '' },
    ];
}

/**
 * 获取所有项目列表
 */
export async function listProjects(): Promise<Project[]> {
    const result = await getFormaClient().listEntities(SCHEMA_NAME, 1, 1000);
    return result.list.map(entityToProject);
}

/**
 * 根据 ID 获取项目
 */
export async function getProject(id: string): Promise<Project | null> {
    const entity = await getFormaClient().getEntity(SCHEMA_NAME, id);
    if (!entity) return null;
    return entityToProject(entity);
}

/**
 * 创建新项目
 */
export async function createProject(data: { title: string; description: string; summaryId?: string | null }): Promise<Project> {
    const client = getFormaClient();
    const fields = projectToFields(data);
    const id = await client.createEntity(SCHEMA_NAME, fields);
    // 创建后获取完整实体（含 createdAt/updatedAt）
    const entity = await client.getEntity(SCHEMA_NAME, id);
    if (!entity) throw new Error('创建项目后无法获取实体');
    return entityToProject(entity);
}

/**
 * 更新项目（先获取再全量替换）
 */
export async function updateProject(id: string, data: Partial<Omit<Project, 'id'>>): Promise<Project | null> {
    const client = getFormaClient();
    const existing = await client.getEntity(SCHEMA_NAME, id);
    if (!existing) return null;

    const fieldMap = new Map(existing.fields.map(f => [f.name, f.value]));
    if (data.title !== undefined) fieldMap.set('title', data.title);
    if (data.description !== undefined) fieldMap.set('description', data.description);
    if (data.summaryId !== undefined) fieldMap.set('summary_id', data.summaryId ?? '');

    const fields: EntityField[] = Array.from(fieldMap.entries()).map(([name, value]) => ({ name, value }));
    await client.updateEntity(SCHEMA_NAME, id, fields);

    const updated = await client.getEntity(SCHEMA_NAME, id);
    if (!updated) return null;
    return entityToProject(updated);
}

/**
 * 删除项目
 */
export async function deleteProject(id: string): Promise<boolean> {
    try {
        await getFormaClient().deleteEntity(SCHEMA_NAME, id);
        return true;
    } catch {
        return false;
    }
}
