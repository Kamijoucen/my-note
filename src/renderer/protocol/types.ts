import type { Project } from '../types'

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
  checkConfig(): Promise<{ configured: boolean; repoPath?: string }>
  selectFolder(): Promise<string | null>
  initializeRepo(repoPath: string): Promise<boolean>
}
