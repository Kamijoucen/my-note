/**
 * Forma 云端存储 HTTP 客户端
 *
 * 封装 Forma REST API，提供 Entity / Schema 级别操作。
 * 采用延迟初始化单例模式（与原 database.ts 一致）：
 *   initFormaClient(baseUrl, token)  →  getFormaClient()
 */

const APP_CODE = 'airnote';

// ── 类型定义 ──────────────────────────────────────────────

interface FormaResponse<T = unknown> {
    code: string;
    message: string;
    data?: T;
}

export interface EntityField {
    name: string;
    value: string;
}

export interface EntityFieldWithType {
    name: string;
    type: string;
    value: string;
}

export interface EntityRecord {
    id: string;
    schemaName: string;
    fields: EntityFieldWithType[];
    createdAt: string;
    updatedAt: string;
}

export interface SchemaFieldDef {
    name: string;
    type: string;
    required: boolean;
    maxLength?: number;
    minLength?: number;
    enumValues?: string[];
    description?: string;
}

export interface SchemaDetail {
    appCode: string;
    name: string;
    description: string;
    fields: SchemaFieldDef[];
    createdAt: string;
    updatedAt: string;
}

// ── 日期工具 ──────────────────────────────────────────────

/** Date → Forma 日期字符串 "YYYY-MM-DD HH:mm:ss" */
export function dateToForma(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/** Forma 日期字符串 → Date */
export function formaToDate(s: string): Date {
    return new Date(s.replace(' ', 'T'));
}

// ── FormaClient 类 ───────────────────────────────────────

export class FormaClient {
    constructor(
        private baseUrl: string,
        private token: string,
    ) {
        // 移除结尾斜杠
        this.baseUrl = baseUrl.replace(/\/+$/, '');
    }

    // ── 通用请求 ─────────────────────────────────────────

    private async request<T>(method: 'GET' | 'POST', path: string, body?: unknown): Promise<T> {
        const url = `${this.baseUrl}${path}`;
        const headers: Record<string, string> = {
            'Authorization': this.token,
        };
        const init: RequestInit = { method, headers };
        if (body) {
            headers['Content-Type'] = 'application/json';
            init.body = JSON.stringify(body);
        }
        const res = await fetch(url, init);
        const json = (await res.json()) as FormaResponse<T>;
        if (json.code !== '200') {
            throw new Error(`Forma error [${json.code}]: ${json.message}`);
        }
        return json.data as T;
    }

    // ── 连接验证 ─────────────────────────────────────────

    /** 验证连接：获取 App 详情 */
    async verifyConnection(): Promise<boolean> {
        try {
            await this.request<unknown>('GET', `/api/app/detail?code=${APP_CODE}`);
            return true;
        } catch {
            return false;
        }
    }

    // ── Schema 操作 ──────────────────────────────────────

    /** 获取 Schema 详情，不存在返回 null */
    async getSchema(name: string): Promise<SchemaDetail | null> {
        try {
            return await this.request<SchemaDetail>(
                'GET',
                `/api/schema/detail?appCode=${APP_CODE}&name=${encodeURIComponent(name)}`,
            );
        } catch {
            return null;
        }
    }

    /** 创建 Schema */
    async createSchema(name: string, description: string, fields: SchemaFieldDef[]): Promise<void> {
        await this.request('POST', '/api/schema/create', {
            appCode: APP_CODE,
            name,
            description,
            fields,
        });
    }

    /** 确保 Schema 存在，不存在则创建 */
    async ensureSchema(name: string, description: string, fields: SchemaFieldDef[]): Promise<void> {
        const existing = await this.getSchema(name);
        if (!existing) {
            await this.createSchema(name, description, fields);
        }
    }

    // ── Entity 操作 ──────────────────────────────────────

    /** 创建 Entity，返回 id */
    async createEntity(schemaName: string, fields: EntityField[]): Promise<string> {
        const data = await this.request<{ id: string }>('POST', '/api/entity/create', {
            appCode: APP_CODE,
            schemaName,
            fields,
        });
        return data.id;
    }

    /** 更新 Entity（全量替换） */
    async updateEntity(schemaName: string, id: string, fields: EntityField[]): Promise<void> {
        await this.request('POST', '/api/entity/update', {
            appCode: APP_CODE,
            schemaName,
            id,
            fields,
        });
    }

    /** 删除 Entity */
    async deleteEntity(schemaName: string, id: string): Promise<void> {
        await this.request('POST', '/api/entity/delete', {
            appCode: APP_CODE,
            schemaName,
            id,
        });
    }

    /** 获取 Entity 详情 */
    async getEntity(schemaName: string, id: string): Promise<EntityRecord | null> {
        try {
            return await this.request<EntityRecord>(
                'GET',
                `/api/entity/detail?appCode=${APP_CODE}&schemaName=${encodeURIComponent(schemaName)}&id=${encodeURIComponent(id)}`,
            );
        } catch {
            return null;
        }
    }

    /** 获取 Entity 列表（分页），返回 { total, list } */
    async listEntities(
        schemaName: string,
        page = 1,
        pageSize = 200,
        field?: string,
        direction?: 'asc' | 'desc',
    ): Promise<{ total: number; list: EntityRecord[] }> {
        let path = `/api/entity/list?appCode=${APP_CODE}&schemaName=${encodeURIComponent(schemaName)}&page=${page}&pageSize=${pageSize}`;
        if (field) {
            path += `&field=${encodeURIComponent(field)}&direction=${direction ?? 'asc'}`;
        }
        return await this.request<{ total: number; list: EntityRecord[] }>('GET', path);
    }
}

// ── 单例管理 ──────────────────────────────────────────────

let client: FormaClient | null = null;

/** 初始化 FormaClient 单例 */
export function initFormaClient(baseUrl: string, token: string): FormaClient {
    client = new FormaClient(baseUrl, token);
    return client;
}

/** 获取已初始化的 FormaClient 单例 */
export function getFormaClient(): FormaClient {
    if (!client) {
        throw new Error('FormaClient 尚未初始化，请先调用 initFormaClient()');
    }
    return client;
}
