<script setup lang="ts">
import { ref } from 'vue'
import { NInput, NButton, NSpace } from 'naive-ui'
import { protocol } from '../protocol'

const props = defineProps<{ projectId: string }>()
const emit = defineEmits<{ 'card-created': [] }>()

const inputValue = ref('')
const sending = ref(false)

const handleSend = async () => {
  if (!inputValue.value.trim() || !props.projectId) return
  sending.value = true
  try {
    await protocol.createCard(props.projectId, inputValue.value.trim())
    inputValue.value = ''
    emit('card-created')
  } catch (e) {
    console.error('创建卡片失败:', e)
  } finally {
    sending.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  // Ctrl/Cmd + Enter 发送
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    e.preventDefault()
    handleSend()
  }
}
</script>

<template>
  <div class="card-input-container">
    <div class="input-wrapper">
      <NInput
        v-model:value="inputValue"
        type="textarea"
        placeholder="记录一条原子笔记... (Ctrl+Enter 发送)"
        class="full-height-input"
        :disabled="!projectId || sending"
        @keydown="handleKeydown"
      />
      <div class="input-actions">
        <NButton
          type="primary"
          :disabled="!inputValue.trim() || !projectId"
          :loading="sending"
          @click="handleSend"
        >
          发送
        </NButton>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-input-container {
  padding: 24px;
  height: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.input-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
}

.full-height-input {
  flex: 1;
  min-height: 0;
}

.full-height-input :deep(.n-input-wrapper) {
  height: 100%;
}

.full-height-input :deep(textarea) {
  height: 100% !important;
  resize: none;
}

.input-actions {
  display: flex;
  justify-content: flex-end;
  flex-shrink: 0;
}
</style>
