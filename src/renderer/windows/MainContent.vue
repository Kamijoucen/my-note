<template>
  <!-- 侧边栏 -->
  <Sidebar v-model="sidebarCollapsed" v-model:selectedProjectId="selectedProjectId" />

  <!-- 主内容区 -->
  <div class="main-content" :style="{ left: sidebarCollapsed ? '64px' : '240px' }">
    <!-- 模式切换栏 -->
    <div class="mode-bar">
      <div class="mode-switcher">
        <button
          class="mode-btn"
          :class="{ active: activeMode === 'edit' }"
          @click="activeMode = 'edit'"
        >
          ✏️ 编辑
        </button>
        <button
          class="mode-btn"
          :class="{ active: activeMode === 'think' }"
          @click="activeMode = 'think'"
        >
          💡 思考
        </button>
      </div>
    </div>

    <!-- 编辑模式 -->
    <div v-if="activeMode === 'edit'" class="mode-content">
      <NSplit :default-size="0.45" class="content-split">
        <template #1>
          <div class="input-panel">
            <CardInput :project-id="selectedProjectId" @card-created="handleCardCreated" />
          </div>
        </template>
        <template #2>
          <div class="timeline-panel">
            <div class="timeline-scroll">
              <CardTimeline :project-id="selectedProjectId" ref="timelineRef" />
            </div>
          </div>
        </template>
      </NSplit>
    </div>

    <!-- 思考模式 -->
    <ThinkMode v-if="activeMode === 'think'" :project-id="selectedProjectId" class="mode-content" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NSplit } from 'naive-ui'

import Sidebar from '../components/Sidebar.vue'
import CardTimeline from '../components/CardTimeline.vue'
import CardInput from '../components/CardInput.vue'
import ThinkMode from '../components/ThinkMode.vue'

const sidebarCollapsed = ref(false)
const selectedProjectId = ref('')
const activeMode = ref<'edit' | 'think'>('edit')
const timelineRef = ref<InstanceType<typeof CardTimeline> | null>(null)

function handleCardCreated() {
  timelineRef.value?.refresh()
}
</script>

<style scoped>
.main-content {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  transition: left 0.3s ease-in-out;
}

.mode-bar {
  padding: 6px 16px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
}

.mode-switcher {
  display: inline-flex;
  gap: 2px;
  background: var(--n-action-color, #f5f5f5);
  border-radius: 6px;
  padding: 2px;
}

.mode-btn {
  border: none;
  background: transparent;
  padding: 4px 14px;
  border-radius: 5px;
  font-size: 13px;
  cursor: pointer;
  color: var(--n-text-color-3, #999);
  transition: all 0.2s ease;
  line-height: 1.4;
}

.mode-btn:hover {
  color: var(--n-text-color-1, #333);
}

.mode-btn.active {
  background: var(--n-card-color, #fff);
  color: var(--n-text-color-1, #333);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.mode-content {
  flex: 1;
  overflow: hidden;
}

.content-split {
  height: 100%;
}

.input-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.timeline-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.timeline-scroll {
  flex: 1;
  overflow-y: auto;
}
</style>
