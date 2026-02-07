import type { Protocol } from './types'
import type { Project } from '../types'

/**
 * Electron 环境下的 Protocol 实现
 *
 * 内部通过 window.electronAPI（由 preload 注入）与主进程通信。
 * 这是渲染进程中唯一允许直接引用 window.electronAPI 的文件。
 */
export class ElectronProtocol implements Protocol {
  async selectFile(): Promise<string | null> {
    return window.electronAPI.selectFile()
  }

  async listProjects(): Promise<Project[]> {
    return window.electronAPI.listProjects()
  }

  async createProject(title: string, description: string): Promise<Project> {
    return window.electronAPI.createProject({ title, description })
  }

  async deleteProject(id: string): Promise<boolean> {
    return window.electronAPI.deleteProject(id)
  }

  async checkConfig(): Promise<{ configured: boolean; repoPath?: string }> {
    return window.electronAPI.checkConfig()
  }

  async selectFolder(): Promise<string | null> {
    return window.electronAPI.selectFolder()
  }

  async initializeRepo(repoPath: string): Promise<boolean> {
    return window.electronAPI.initializeRepo(repoPath)
  }
}
