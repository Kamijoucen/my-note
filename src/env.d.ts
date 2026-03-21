/// <reference types="vite/client" />

import type { Project, Card, Summary } from './renderer/types';

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
  checkConfig: () => Promise<{ configured: boolean; baseUrl?: string }>;
  initializeForma: (baseUrl: string, token: string) => Promise<boolean>;
  listCards: (projectId: string) => Promise<Card[]>;
  createCard: (data: { projectId: string; content: string; tags?: string[]; links?: string[] }) => Promise<Card>;
  updateCard: (id: string, data: { content?: string; tags?: string[]; links?: string[] }) => Promise<Card | null>;
  deleteCard: (id: string) => Promise<boolean>;
  getSummary: (projectId: string) => Promise<Summary | null>;
  saveSummary: (data: { projectId: string; content: string; sourceCards: string[]; isArchived: boolean }) => Promise<Summary>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
