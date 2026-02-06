<template>
    <div class="init-config">
        <div class="init-card">
            <div class="init-icon">📝</div>
            <h1 class="init-title">欢迎使用 AirNote</h1>
            <p class="init-desc">选择一个文件夹作为你的笔记仓库，所有数据将存储在该目录中。</p>

            <div v-if="selectedPath" class="path-display">
                <n-text depth="3" style="font-size: 13px;">已选择路径</n-text>
                <n-text code style="word-break: break-all;">{{ selectedPath }}</n-text>
            </div>

            <n-space vertical :size="12" style="width: 100%;">
                <n-button block :type="selectedPath ? 'default' : 'primary'" size="large" @click="handleSelectFolder"
                    :disabled="initializing">
                    {{ selectedPath ? '重新选择' : '选择文件夹' }}
                </n-button>
                <n-button v-if="selectedPath" block type="primary" size="large" :loading="initializing"
                    @click="handleInitialize">
                    开始使用
                </n-button>
            </n-space>

            <n-text v-if="errorMsg" type="error" style="margin-top: 8px; font-size: 13px;">
                {{ errorMsg }}
            </n-text>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { NButton, NSpace, NText } from 'naive-ui';
import { protocol } from '../protocol';

const emit = defineEmits<{
    (e: 'initialized'): void;
}>();

const selectedPath = ref<string | null>(null);
const initializing = ref(false);
const errorMsg = ref('');

async function handleSelectFolder() {
    errorMsg.value = '';
    const path = await protocol.selectFolder();
    if (path) {
        selectedPath.value = path;
    }
}

async function handleInitialize() {
    if (!selectedPath.value) return;
    initializing.value = true;
    errorMsg.value = '';
    try {
        const success = await protocol.initializeRepo(selectedPath.value);
        if (success) {
            emit('initialized');
        } else {
            errorMsg.value = '初始化失败，请检查目录权限后重试。';
        }
    } catch (e) {
        errorMsg.value = '初始化失败：' + (e instanceof Error ? e.message : String(e));
    } finally {
        initializing.value = false;
    }
}
</script>

<style scoped>
.init-config {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
    background: var(--body-color, #ffffff);
}

.init-card {
    display: flex;
    flex-direction: column;
    align-items: center;
    max-width: 420px;
    width: 100%;
    padding: 48px 40px;
}

.init-icon {
    font-size: 48px;
    margin-bottom: 16px;
}

.init-title {
    font-size: 24px;
    font-weight: 600;
    margin: 0 0 8px 0;
    color: var(--text-color-base, #37352f);
}

.init-desc {
    font-size: 14px;
    color: var(--text-color-3, #787774);
    text-align: center;
    margin: 0 0 32px 0;
    line-height: 1.6;
}

.path-display {
    display: flex;
    flex-direction: column;
    gap: 4px;
    width: 100%;
    padding: 12px 16px;
    margin-bottom: 20px;
    border-radius: 6px;
    background: var(--action-color, #f7f6f3);
}
</style>
