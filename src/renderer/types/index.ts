/**
 * 数据模型类型定义
 */

/** 项目 */
export interface Project {
  id: string
  title: string
  description: string
  createdAt: Date
  updatedAt: Date
  summaryId: string | null
}

export interface Card {
  id: string
  projectId: string
  content: string
  createdAt: Date
  tags: string[]
  links: string[]
}

/** AI 总览 */
export interface Summary {
  id: string
  projectId: string
  generatedAt: Date
  content: string
  sourceCards: string[]
  isArchived: boolean
}

/** 视角分析文档 */
export interface AnalysisDoc {
  id: string
  projectId: string
  perspective: string
  content: string
  sourceCards: string[]
  updatedAt: Date
}
