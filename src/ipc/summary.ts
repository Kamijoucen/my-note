import { ipcMain } from 'electron';
import { summaryRepo } from '../storage';
import type { Summary } from '../renderer/types';

export function registerSummaryHandlers() {
    ipcMain.handle('summary:get', async (_event, projectId: string): Promise<Summary | null> => {
        return summaryRepo.getSummary(projectId);
    });

    ipcMain.handle('summary:save', async (_event, data: { projectId: string; content: string; sourceCards: string[]; isArchived: boolean }): Promise<Summary> => {
        return summaryRepo.saveSummary(data);
    });
}
