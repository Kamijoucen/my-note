import { ipcMain } from 'electron';
import { projectRepo } from '../storage';
import type { Project } from '../renderer/types';

export function registerProjectHandlers() {
    // 获取项目列表
    ipcMain.handle('project:list', async (): Promise<Project[]> => {
        return projectRepo.listProjects();
    });

    // 创建项目
    ipcMain.handle('project:create', async (_event, data: { title: string; description: string }): Promise<Project> => {
        return projectRepo.createProject({
            title: data.title,
            description: data.description,
            createdAt: new Date(),
            updatedAt: new Date(),
            summaryId: null,
        });
    });

    // 删除项目
    ipcMain.handle('project:delete', async (_event, id: string): Promise<boolean> => {
        return projectRepo.deleteProject(id);
    });
}
