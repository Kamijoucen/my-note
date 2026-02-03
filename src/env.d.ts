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
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}

export {};
