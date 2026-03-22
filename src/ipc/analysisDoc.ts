import { ipcMain } from 'electron';
import { analysisDocRepo } from '../storage';
import type { AnalysisDoc } from '../renderer/types';

export function registerAnalysisDocHandlers() {
    ipcMain.handle('analysis-doc:get', async (_event, projectId: string, perspective: string): Promise<AnalysisDoc | null> => {
        return analysisDocRepo.getAnalysisDoc(projectId, perspective);
    });

    ipcMain.handle('analysis-doc:save', async (_event, data: { projectId: string; perspective: string; content: string; sourceCards: string[] }): Promise<AnalysisDoc> => {
        return analysisDocRepo.saveAnalysisDoc(data);
    });
}
