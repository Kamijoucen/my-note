import { ipcMain } from 'electron';
import { projectRepo } from '../storage';
import type { Project } from '../renderer/types';

export function registerProjectHandlers() {
    // 获取项目列表
    ipcMain.handle('project:list', async (): Promise<Project[]> => {
        return projectRepo.listProjects();
    });
}
