import { ipcMain } from 'electron';
import { cardRepo } from '../storage';
import type { Card } from '../renderer/types';

export function registerCardHandlers() {
    ipcMain.handle('card:list', async (_event, projectId: string): Promise<Card[]> => {
        return cardRepo.listCards(projectId);
    });

    ipcMain.handle('card:create', async (_event, data: { projectId: string; content: string; tags?: string[]; links?: string[] }): Promise<Card> => {
        return cardRepo.createCard(data);
    });

    ipcMain.handle('card:update', async (_event, id: string, data: { content?: string; tags?: string[]; links?: string[] }): Promise<Card | null> => {
        return cardRepo.updateCard(id, data);
    });

    ipcMain.handle('card:delete', async (_event, id: string): Promise<boolean> => {
        return cardRepo.deleteCard(id);
    });
}
