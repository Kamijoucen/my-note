<template>
  <!-- 侧边栏 -->
  <Sidebar v-model="sidebarCollapsed" />

  <!-- 主内容区：左右双栏 -->
  <NLayout position="absolute" class="main-content" :style="{ left: sidebarCollapsed ? '64px' : '240px' }">
    <NSplit :default-size="0.45" class="content-split">
      <!-- 左栏：输入区 -->
      <template #1>
        <div class="input-panel">
          <ProjectHeader />
          <CardInput />
        </div>
      </template>

      <!-- 右栏：时间线区 -->
      <template #2>
        <div class="timeline-panel">
          <div class="timeline-scroll">
            <CardTimeline />
          </div>
        </div>
      </template>
    </NSplit>
  </NLayout>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { NLayout, NSplit } from 'naive-ui'

import Sidebar from '../components/Sidebar.vue'

const sidebarCollapsed = ref(false)
import ProjectHeader from '../components/ProjectHeader.vue'
import CardTimeline from '../components/CardTimeline.vue'
import CardInput from '../components/CardInput.vue'
</script>

<style scoped>
.main-content {
  right: 0;
  height: 100%;
  transition: left 0.3s var(--n-bezier, ease-in-out);
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
