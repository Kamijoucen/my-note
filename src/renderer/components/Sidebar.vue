<script setup lang="ts">
import { ref, h } from 'vue'
import {
  NLayoutSider,
  NInput,
  NMenu,
  NSpace,
  NTag,
  NDivider,
  NText,
} from 'naive-ui'
import type { MenuOption } from 'naive-ui'
import type { Project } from '../types'

// Mock 项目数据
const mockProjects: Project[] = [
  {
    id: '1',
    title: 'Vue 3 学习笔记',
    description: '记录 Vue 3 Composition API 学习过程',
    createdAt: new Date('2026-01-15'),
    updatedAt: new Date('2026-02-01'),
    summaryId: null,
  },
  {
    id: '2',
    title: 'TypeScript 进阶',
    description: '类型体操与高级类型',
    createdAt: new Date('2026-01-20'),
    updatedAt: new Date('2026-01-28'),
    summaryId: 'summary-1',
  },
  {
    id: '3',
    title: 'Electron 开发实践',
    description: '桌面应用开发经验总结',
    createdAt: new Date('2026-02-01'),
    updatedAt: new Date('2026-02-03'),
    summaryId: null,
  },
]

// Mock 标签数据
const mockTags = ['Vue', 'TypeScript', 'Electron', '学习', '实践', 'API', '组件']

// 状态
const collapsed = ref(false)
const searchValue = ref('')
const selectedProjectId = ref('1')

// 菜单选项
const menuOptions: MenuOption[] = mockProjects.map((project) => ({
  label: project.title,
  key: project.id,
}))

// 事件处理
const handleProjectSelect = (key: string) => {
  selectedProjectId.value = key
}
</script>

<template>
  <NLayoutSider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    :width="240"
    :collapsed="collapsed"
    show-trigger
    @collapse="collapsed = true"
    @expand="collapsed = false"
  >
    <div class="sidebar-content">
      <!-- 搜索框 -->
      <div v-if="!collapsed" class="sidebar-search">
        <NInput
          v-model:value="searchValue"
          placeholder="搜索笔记..."
          clearable
        >
          <template #prefix>
            <span>🔍</span>
          </template>
        </NInput>
      </div>

      <!-- 项目列表 -->
      <div class="sidebar-section">
        <NText v-if="!collapsed" depth="3" class="section-title">项目列表</NText>
        <NMenu
          :value="selectedProjectId"
          :options="menuOptions"
          :collapsed="collapsed"
          :collapsed-width="64"
          :collapsed-icon-size="22"
          @update:value="handleProjectSelect"
        />
      </div>

      <!-- 标签云 -->
      <div v-if="!collapsed" class="sidebar-section">
        <NDivider />
        <NText depth="3" class="section-title">标签云</NText>
        <NSpace class="tag-cloud">
          <NTag
            v-for="tag in mockTags"
            :key="tag"
            size="small"
            :bordered="false"
            type="info"
          >
            {{ tag }}
          </NTag>
        </NSpace>
      </div>
    </div>
  </NLayoutSider>
</template>

<style scoped>
.sidebar-content {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px 0;
}

.sidebar-search {
  padding: 0 16px;
  margin-bottom: 12px;
}

.sidebar-section {
  padding: 0 8px;
}

.section-title {
  display: block;
  padding: 8px 8px 4px;
  font-size: 12px;
}

.tag-cloud {
  padding: 8px;
}
</style>
