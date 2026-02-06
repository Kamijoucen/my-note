import { ipcMain, dialog } from 'electron';
import path from 'node:path';
import { loadConfig, saveConfig } from '../config';
import { initDatabase } from '../storage';

export function registerConfigHandlers() {
    // 检查配置是否已完成
    ipcMain.handle('config:check', () => {
        const config = loadConfig();
        if (config) {
            return { configured: true, repoPath: config.repoPath };
        }
        return { configured: false };
    });

    // 选择仓库目录
    ipcMain.handle('config:selectRepoPath', async () => {
        const result = await dialog.showOpenDialog({
            title: '选择笔记仓库目录',
            properties: ['openDirectory', 'createDirectory'],
        });
        if (result.canceled || result.filePaths.length === 0) {
            return null;
        }
        return result.filePaths[0];
    });

    // 初始化仓库：保存配置 + 创建数据库
    ipcMain.handle('config:initialize', (_event, repoPath: string) => {
        try {
            const dbPath = path.join(repoPath, 'airnote.db');
            initDatabase(dbPath);
            saveConfig({ repoPath });
            return true;
        } catch (e) {
            console.error('初始化仓库失败:', e);
            return false;
        }
    });
}
