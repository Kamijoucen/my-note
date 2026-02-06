import { app } from 'electron';
import path from 'node:path';
import fs from 'node:fs';

export interface AppConfig {
    repoPath: string;
}

// 配置文件路径：~/.airnote/config.json
const configDir = path.join(app.getPath('home'), '.airnote');
const configPath = path.join(configDir, 'config.json');

/**
 * 读取应用配置
 * 文件不存在或解析失败返回 null
 */
export function loadConfig(): AppConfig | null {
    try {
        if (!fs.existsSync(configPath)) return null;
        const raw = fs.readFileSync(configPath, 'utf-8');
        const config = JSON.parse(raw) as AppConfig;
        // 校验必要字段
        if (!config.repoPath || typeof config.repoPath !== 'string') return null;
        return config;
    } catch {
        return null;
    }
}

/**
 * 保存应用配置
 * 自动创建 ~/.airnote/ 目录
 */
export function saveConfig(config: AppConfig): void {
    if (!fs.existsSync(configDir)) {
        fs.mkdirSync(configDir, { recursive: true });
    }
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}
