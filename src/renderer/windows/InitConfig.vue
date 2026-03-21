<template>
    <div class="init-config">
        <div class="init-card">
            <div class="init-icon">📝</div>
            <h1 class="init-title">欢迎使用 AirNote</h1>
            <p class="init-desc">输入 Forma 服务地址和认证 Token 以连接云端存储。</p>

            <n-space vertical :size="16" style="width: 100%;">
                <n-input v-model:value="baseUrl" placeholder="Forma 服务地址，如 http://localhost:8888/api"
                    size="large" :disabled="initializing" />
                <n-input v-model:value="token" type="password" show-password-on="click"
                    placeholder="认证 Token" size="large" :disabled="initializing" />
                <n-button block type="primary" size="large" :loading="initializing"
                    :disabled="!canInitialize" @click="handleInitialize">
                    连接并初始化
                </n-button>
            </n-space>

            <n-text v-if="errorMsg" type="error" style="margin-top: 8px; font-size: 13px;">
                {{ errorMsg }}
            </n-text>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { NButton, NSpace, NText, NInput } from 'naive-ui';
import { protocol } from '../protocol';

const emit = defineEmits<{
    (e: 'initialized'): void;
}>();

const baseUrl = ref('');
const token = ref('');
const initializing = ref(false);
const errorMsg = ref('');

const canInitialize = computed(() => baseUrl.value.trim() !== '' && token.value.trim() !== '');

async function handleInitialize() {
    if (!canInitialize.value) return;
    initializing.value = true;
    errorMsg.value = '';
    try {
        const success = await protocol.initializeForma(baseUrl.value.trim(), token.value.trim());
        if (success) {
            emit('initialized');
        } else {
            errorMsg.value = '连接失败，请检查服务地址和 Token 是否正确。';
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
