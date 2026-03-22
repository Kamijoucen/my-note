import { ipcMain } from 'electron';
import { loadConfig, saveConfig } from '../config';
import { initFormaClient } from '../storage';
import type { SchemaFieldDef } from '../storage/formaClient';

// Forma Schema 定义
export const SCHEMAS: { name: string; description: string; fields: SchemaFieldDef[] }[] = [
    {
        name: 'project',
        description: '笔记项目',
        fields: [
            { name: 'title', type: 'string', required: true, maxLength: 200, minLength: 1, description: '项目标题' },
            { name: 'description', type: 'text', required: false, maxLength: 5000, description: '项目描述' },
            { name: 'summary_id', type: 'string', required: false, description: '关联 summary ID' },
        ],
    },
    {
        name: 'card',
        description: '原子笔记卡片',
        fields: [
            { name: 'project_id', type: 'string', required: true, description: '所属项目 ID' },
            { name: 'content', type: 'text', required: true, maxLength: 50000, description: '卡片内容' },
            { name: 'tags', type: 'array', required: false, description: '标签数组' },
            { name: 'links', type: 'array', required: false, description: '关联卡片 ID 数组' },
        ],
    },
    {
        name: 'summary',
        description: 'AI 总览',
        fields: [
            { name: 'project_id', type: 'string', required: true, description: '所属项目 ID' },
            { name: 'generated_at', type: 'date', required: true, description: '生成时间' },
            { name: 'content', type: 'text', required: true, maxLength: 50000, description: '总览内容' },
            { name: 'source_cards', type: 'array', required: true, description: '来源卡片 ID 列表' },
            { name: 'is_archived', type: 'boolean', required: true, description: '是否已归档' },
        ],
    },
    {
        name: 'analysis_doc',
        description: '视角分析文档',
        fields: [
            { name: 'project_id', type: 'string', required: true, description: '所属项目 ID' },
            { name: 'perspective', type: 'string', required: true, description: '视角标识（如 by-relevance, by-difficulty）' },
            { name: 'content', type: 'text', required: true, maxLength: 50000, description: '文档内容' },
            { name: 'source_cards', type: 'array', required: true, description: '来源卡片 ID 列表' },
            { name: 'updated_at', type: 'date', required: true, description: '更新时间' },
        ],
    },
];

export function registerConfigHandlers() {
    // 检查配置是否已完成
    ipcMain.handle('config:check', () => {
        const config = loadConfig();
        if (config) {
            return { configured: true, baseUrl: config.formaBaseUrl };
        }
        return { configured: false };
    });

    // 初始化 Forma 连接：验证 → 创建 Schema → 保存配置
    ipcMain.handle('config:initialize', async (_event, baseUrl: string, token: string) => {
        try {
            const client = initFormaClient(baseUrl, token);
            // 验证连接
            const connected = await client.verifyConnection();
            if (!connected) {
                return false;
            }
            // 确保所有 Schema 存在
            for (const schema of SCHEMAS) {
                await client.ensureSchema(schema.name, schema.description, schema.fields);
            }
            // 保存配置
            saveConfig({ formaBaseUrl: baseUrl, formaToken: token });
            return true;
        } catch (e) {
            console.error('初始化 Forma 失败:', e);
            return false;
        }
    });
}
