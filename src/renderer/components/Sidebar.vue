<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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

// Mock 标签数据
const mockTags = ['Vue', 'TypeScript', 'Electron', '学习', '实践', 'API', '组件']

// 状态
const collapsed = ref(false)
const searchValue = ref('')
const selectedProjectId = ref('')
const projects = ref<Project[]>([])

// 加载项目列表
onMounted(async () => {
  projects.value = await window.electronAPI.listProjects()
  // 默认选中第一个项目
  if (projects.value.length > 0) {
    selectedProjectId.value = projects.value[0].id
  }
})

// 菜单选项（响应式计算）
const menuOptions = computed<MenuOption[]>(() =>
  projects.value.map((project) => ({
    label: project.title,
    key: project.id,
  }))
)

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
