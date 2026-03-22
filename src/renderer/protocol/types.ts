import type { Project, Card, Summary, AnalysisDoc } from '../types'

/**
 * Protocol 抽象层接口
 *
 * 渲染进程通过此接口访问所有系统能力，不直接依赖具体运行环境（Electron / Web）。
 * 迁移到 Web 时只需新增一套实现，业务代码无需改动。
 */
export interface Protocol {
  selectFile(): Promise<string | null>
  listProjects(): Promise<Project[]>
  createProject(title: string, description: string): Promise<Project>
  deleteProject(id: string): Promise<boolean>
  checkConfig(): Promise<{ configured: boolean; baseUrl?: string }>
  initializeForma(baseUrl: string, token: string): Promise<boolean>
  listCards(projectId: string): Promise<Card[]>
  createCard(projectId: string, content: string, tags?: string[], links?: string[]): Promise<Card>
  updateCard(id: string, data: { content?: string; tags?: string[]; links?: string[] }): Promise<Card | null>
  deleteCard(id: string): Promise<boolean>
  getSummary(projectId: string): Promise<Summary | null>
  saveSummary(data: { projectId: string; content: string; sourceCards: string[]; isArchived: boolean }): Promise<Summary>
  getAnalysisDoc(projectId: string, perspective: string): Promise<AnalysisDoc | null>
  saveAnalysisDoc(data: { projectId: string; perspective: string; content: string; sourceCards: string[] }): Promise<AnalysisDoc>
}
