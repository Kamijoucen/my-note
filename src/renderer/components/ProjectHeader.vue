<script setup lang="ts">
import { ref } from 'vue'
import {
  NCollapse,
  NCollapseItem,
  NText,
  NH2,
  NSpace,
  NTag,
  NCard,
} from 'naive-ui'
import type { Project, Summary } from '../types'

// Mock 当前项目
const currentProject: Project = {
  id: '1',
  title: 'Vue 3 学习笔记',
  description: '记录 Vue 3 Composition API 学习过程',
  createdAt: new Date('2026-01-15'),
  updatedAt: new Date('2026-02-01'),
  summaryId: 'summary-1',
}

// Mock AI 总览
const mockSummary: Summary = {
  id: 'summary-1',
  projectId: '1',
  generatedAt: new Date('2026-02-02'),
  content: `## 核心概念总结

### Composition API
- setup() 是入口点，<script setup> 是语法糖
- 逻辑复用优于 mixins，封装为 composable 函数

### 响应式系统
- ref 用于基本类型，reactive 用于对象
- reactive 解构需用 toRefs 保持响应性
- computed 具有缓存特性，返回 ref

### 侦听器
- watchEffect 自动收集依赖，适合副作用
- watch 需显式指定监听源，可访问新旧值`,
  sourceCards: ['card-1', 'card-2', 'card-3', 'card-4', 'card-5'],
  isArchived: false,
}

const expandedNames = ref<string[]>([])
</script>

<template>
  <div class="project-header">
    <!-- 项目标题 -->
    <div class="project-title-section">
      <NSpace align="center">
        <NH2 class="project-title">{{ currentProject.title }}</NH2>
        <NTag size="small" type="info">{{ mockSummary.sourceCards.length }} 条卡片</NTag>
      </NSpace>
      <NText depth="3" class="project-description">
        {{ currentProject.description }}
      </NText>
    </div>

    <!-- AI 总览折叠面板 -->
    <NCollapse v-model:expanded-names="expandedNames" class="summary-collapse">
      <NCollapseItem title="AI 总览" name="summary">
        <template #header-extra>
          <NText depth="3" style="font-size: 12px">
            生成于 {{ mockSummary.generatedAt.toLocaleDateString() }}
          </NText>
        </template>
        <NCard size="small" :bordered="false" class="summary-card">
          <NText class="summary-content">{{ mockSummary.content }}</NText>
        </NCard>
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<style scoped>
.project-header {
  padding: 16px 24px;
  border-bottom: 1px solid var(--n-border-color);
}

.project-title-section {
  margin-bottom: 12px;
}

.project-title {
  margin: 0;
  font-size: 20px;
}

.project-description {
  display: block;
  margin-top: 4px;
  font-size: 13px;
}

.summary-collapse {
  margin-top: 8px;
}

.summary-card {
  background-color: var(--n-color-embedded);
}

.summary-content {
  white-space: pre-wrap;
  line-height: 1.6;
  font-size: 13px;
}
</style>
