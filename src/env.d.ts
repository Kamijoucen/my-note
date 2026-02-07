/// <reference types="vite/client" />

import type { Project } from './renderer/types';

declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<
    Record<string, never>,
    Record<string, never>,
    unknown
  >;
  export default component;
}

export interface ElectronAPI {
  selectFile: () => Promise<string | null>;
  listProjects: () => Promise<Project[]>;
  createProject: (data: { title: string; description: string }) => Promise<Project>;
  deleteProject: (id: string) => Promise<boolean>;
  checkConfig: () => Promise<{ configured: boolean; repoPath?: string }>;
  selectFolder: () => Promise<string | null>;
  initializeRepo: (repoPath: string) => Promise<boolean>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
