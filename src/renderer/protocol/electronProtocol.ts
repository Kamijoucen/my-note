import type { Protocol } from './types'
import type { Project, Card, Summary, AnalysisDoc } from '../types'

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

  async checkConfig(): Promise<{ configured: boolean; baseUrl?: string }> {
    return window.electronAPI.checkConfig()
  }

  async initializeForma(baseUrl: string, token: string): Promise<boolean> {
    return window.electronAPI.initializeForma(baseUrl, token)
  }

  async listCards(projectId: string): Promise<Card[]> {
    return window.electronAPI.listCards(projectId)
  }

  async createCard(projectId: string, content: string, tags?: string[], links?: string[]): Promise<Card> {
    return window.electronAPI.createCard({ projectId, content, tags, links })
  }

  async updateCard(id: string, data: { content?: string; tags?: string[]; links?: string[] }): Promise<Card | null> {
    return window.electronAPI.updateCard(id, data)
  }

  async deleteCard(id: string): Promise<boolean> {
    return window.electronAPI.deleteCard(id)
  }

  async getSummary(projectId: string): Promise<Summary | null> {
    return window.electronAPI.getSummary(projectId)
  }

  async saveSummary(data: { projectId: string; content: string; sourceCards: string[]; isArchived: boolean }): Promise<Summary> {
    return window.electronAPI.saveSummary(data)
  }

  async getAnalysisDoc(projectId: string, perspective: string): Promise<AnalysisDoc | null> {
    return window.electronAPI.getAnalysisDoc(projectId, perspective)
  }

  async saveAnalysisDoc(data: { projectId: string; perspective: string; content: string; sourceCards: string[] }): Promise<AnalysisDoc> {
    return window.electronAPI.saveAnalysisDoc(data)
  }
}
