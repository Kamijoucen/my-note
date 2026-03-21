// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { Project, Card, Summary } from './renderer/types';

contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectFile'),
    listProjects: (): Promise<Project[]> => ipcRenderer.invoke('project:list'),
    createProject: (data: { title: string; description: string }): Promise<Project> => ipcRenderer.invoke('project:create', data),
    deleteProject: (id: string): Promise<boolean> => ipcRenderer.invoke('project:delete', id),
    checkConfig: (): Promise<{ configured: boolean; baseUrl?: string }> => ipcRenderer.invoke('config:check'),
    initializeForma: (baseUrl: string, token: string): Promise<boolean> => ipcRenderer.invoke('config:initialize', baseUrl, token),
    listCards: (projectId: string): Promise<Card[]> => ipcRenderer.invoke('card:list', projectId),
    createCard: (data: { projectId: string; content: string; tags?: string[]; links?: string[] }): Promise<Card> => ipcRenderer.invoke('card:create', data),
    updateCard: (id: string, data: { content?: string; tags?: string[]; links?: string[] }): Promise<Card | null> => ipcRenderer.invoke('card:update', id, data),
    deleteCard: (id: string): Promise<boolean> => ipcRenderer.invoke('card:delete', id),
    getSummary: (projectId: string): Promise<Summary | null> => ipcRenderer.invoke('summary:get', projectId),
    saveSummary: (data: { projectId: string; content: string; sourceCards: string[]; isArchived: boolean }): Promise<Summary> => ipcRenderer.invoke('summary:save', data),
});
