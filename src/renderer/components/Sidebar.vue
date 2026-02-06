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
    NButton,
    NModal,
} from 'naive-ui'

import type { MenuOption } from 'naive-ui'
import type { Project } from '../types'
import { protocol } from '../protocol'

// Mock 标签数据
const mockTags = ['Vue', 'TypeScript', 'Electron', '学习', '实践', 'API', '组件']

// 折叠状态由父组件通过 v-model 控制
const props = defineProps<{ modelValue?: boolean }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()
const collapsed = computed(() => props.modelValue ?? false)

// 状态
const searchValue = ref('')
const selectedProjectId = ref('')
const projects = ref<Project[]>([])
const showCreateProjectModal = ref(false)

const newProjectTitle = ref('')
const newProjectDescription = ref('')

const creating = ref(false)
const titleTouched = ref(false)
const isTitleEmpty = computed(() => newProjectTitle.value.trim() === '')

// 加载项目列表
onMounted(async () => {
    projects.value = await protocol.listProjects()
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

const openCreateProjectModal = () => {
    showCreateProjectModal.value = true
}

const createProject = async (title: string, description: string) => {
    titleTouched.value = true
    if (title.trim() === '') return
    try {
        creating.value = true
        const newProject = await protocol.createProject(title.trim(), description.trim())
        projects.value.push(newProject)
        showCreateProjectModal.value = false
        newProjectTitle.value = ''
        newProjectDescription.value = ''
        titleTouched.value = false
    } catch (error) {
        console.error('创建项目失败:', error)
    } finally {
        creating.value = false
    }
}

</script>

<template>
    <NLayoutSider bordered collapse-mode="width" :collapsed-width="64" :width="240" :collapsed="collapsed" show-trigger
        @collapse="emit('update:modelValue', true)" @expand="emit('update:modelValue', false)">
        <div class="sidebar-content">
            <!-- 搜索框 -->
            <div v-if="!collapsed" class="create-project-button">
                <NInput v-model:value="searchValue" placeholder="搜索笔记..." clearable>
                    <template #prefix>
                        <span>🔍</span>
                    </template>
                </NInput>
            </div>

            <!-- 新建项目 -->
            <div v-if="!collapsed" class="sidebar-search">
                <NButton class="create-project-button" type="primary" block @click="openCreateProjectModal">
                    新建项目
                </NButton>
            </div>

            <!-- 项目列表 -->
            <div class="sidebar-section">
                <NText v-if="!collapsed" depth="3" class="section-title">项目列表</NText>
                <NMenu :value="selectedProjectId" :options="menuOptions" :collapsed="collapsed" :collapsed-width="64"
                    :collapsed-icon-size="22" @update:value="handleProjectSelect" />
            </div>

            <!-- 标签云 -->
            <div v-if="!collapsed" class="sidebar-section">
                <NDivider />
                <NText depth="3" class="section-title">标签云</NText>
                <NSpace class="tag-cloud">
                    <NTag v-for="tag in mockTags" :key="tag" size="small" :bordered="false" type="info">
                        {{ tag }}
                    </NTag>
                </NSpace>
            </div>
        </div>
    </NLayoutSider>

    <NModal v-model:show="showCreateProjectModal" preset="card" title="新建项目" closable
        style="width: 500px; max-width: 90vw;" @after-leave="titleTouched = false">
        <NInput v-model:value="newProjectTitle" placeholder="项目标题"
            :status="titleTouched && isTitleEmpty ? 'error' : undefined"
            style="margin-bottom: 4px;" @input="titleTouched = true" />
        <NText v-if="titleTouched && isTitleEmpty" type="error" style="font-size: 12px; margin-bottom: 12px; display: block;">
            项目标题不能为空
        </NText>
        <div v-else style="margin-bottom: 16px;" />
        <NInput v-model:value="newProjectDescription" type="textarea" placeholder="项目描述" rows="4" />
        <div style="text-align: right; margin-top: 16px;">
            <NButton type="primary" :loading="creating" :disabled="isTitleEmpty"
                @click="createProject(newProjectTitle, newProjectDescription)">
                创建
            </NButton>
        </div>
    </NModal>

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

.create-project-button {
    padding: 0 16px;
    margin-bottom: 12px;
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
