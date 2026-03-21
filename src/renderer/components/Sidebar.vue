<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
    NLayoutSider,
    NInput,
    NSpace,
    NTag,
    NDivider,
    NText,
    NButton,
    NModal,
    NIcon,
    useDialog,
} from 'naive-ui'
import type { Project } from '../types'
import { protocol } from '../protocol'

// Mock 标签数据
const mockTags = ['Vue', 'TypeScript', 'Electron', '学习', '实践', 'API', '组件']

// 折叠状态由父组件通过 v-model 控制
const props = defineProps<{ modelValue?: boolean; selectedProjectId?: string }>()
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; 'update:selectedProjectId': [value: string] }>()
const collapsed = computed(() => props.modelValue ?? false)

const dialog = useDialog()

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
        emit('update:selectedProjectId', projects.value[0].id)
    }
})

// 事件处理
const handleProjectSelect = (id: string) => {
    selectedProjectId.value = id
    emit('update:selectedProjectId', id)
}

// 删除项目确认
const confirmDeleteProject = (project: Project) => {
    dialog.warning({
        title: '删除项目',
        content: `确定要删除项目「${project.title}」吗？此操作不可撤销。`,
        positiveText: '删除',
        negativeText: '取消',
        onPositiveClick: async () => {
            const success = await protocol.deleteProject(project.id)
            if (success) {
                projects.value = projects.value.filter((p) => p.id !== project.id)
                // 如果删除的是当前选中项目，切换到第一个
                if (selectedProjectId.value === project.id) {
                    selectedProjectId.value = projects.value.length > 0 ? projects.value[0].id : ''
                }
            }
        },
    })
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
        selectedProjectId.value = newProject.id
        emit('update:selectedProjectId', newProject.id)
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
            <div v-if="!collapsed" class="sidebar-item">
                <NInput v-model:value="searchValue" placeholder="搜索笔记..." clearable size="small">
                    <template #prefix>
                        <span>🔍</span>
                    </template>
                </NInput>
            </div>

            <!-- 新建项目 -->
            <div v-if="!collapsed" class="sidebar-item">
                <NButton type="primary" block size="small" @click="openCreateProjectModal">
                    新建项目
                </NButton>
            </div>

            <NDivider v-if="!collapsed" style="margin: 4px 0" />

            <!-- 项目列表 -->
            <div class="project-list">
                <div
                    v-for="project in projects"
                    :key="project.id"
                    class="project-item"
                    :class="{ 'project-item--active': selectedProjectId === project.id }"
                    @click="handleProjectSelect(project.id)"
                >
                    <span class="project-item-title">{{ project.title }}</span>
                    <NIcon class="project-item-delete" :size="14" @click.stop="confirmDeleteProject(project)">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
                            <path d="M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z" />
                        </svg>
                    </NIcon>
                </div>
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
    padding: 8px 0;
}

.sidebar-item {
    padding: 0 12px;
    margin-bottom: 6px;
}

.section-title {
    display: block;
    padding: 8px 8px 4px;
    font-size: 12px;
}

.tag-cloud {
    padding: 8px;
}

/* 项目列表 */
.project-list {
    padding: 0 12px;
}

.project-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 8px;
    height: 28px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 13px;
    margin-top: 2px;
    transition: background-color 0.2s;
}

.project-item:hover {
    background-color: rgba(0, 0, 0, 0.04);
}

.project-item--active {
    background-color: rgba(24, 160, 88, 0.1);
    color: rgb(24, 160, 88);
}

.project-item--active:hover {
    background-color: rgba(24, 160, 88, 0.15);
}

.project-item-title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    flex: 1;
    min-width: 0;
}

.project-item-delete {
    flex-shrink: 0;
    margin-left: 4px;
    padding: 2px;
    color: #999;
    cursor: pointer;
    transition: color 0.2s;
}

.project-item-delete:hover {
    color: #e06c75;
}

.sidebar-section {
    padding: 0 4px;
}
</style>
