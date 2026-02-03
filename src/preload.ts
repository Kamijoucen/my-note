// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

import { contextBridge, ipcRenderer } from 'electron';
import type { Project } from './renderer/types';

contextBridge.exposeInMainWorld('electronAPI', {
    selectFile: (): Promise<string | null> => ipcRenderer.invoke('dialog:selectFile'),
    listProjects: (): Promise<Project[]> => ipcRenderer.invoke('project:list'),
});
