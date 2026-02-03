<template>
  <NLayout class="main-layout" has-sider>
    <!-- 侧边栏 -->
    <Sidebar />

    <!-- 主内容区 -->
    <NLayout position="absolute" style="left: 240px;">
      <!-- 顶部栏 -->
      <NLayoutHeader style="height: 56px;" bordered>
        <NSpace justify="space-between" align="center" style="height: 100%; padding: 0 24px;">
          <NText strong style="font-size: 18px;">
            📝 My Note
          </NText>
          <NSpace align="center">
            <NText>{{ isDark ? '🌙 暗色' : '☀️ 亮色' }}</NText>
            <NSwitch :value="isDark" @update:value="$emit('toggle-theme')" />
          </NSpace>
        </NSpace>
      </NLayoutHeader>

      <!-- 内容区：项目头部 + 时间线（可滚动） -->
      <NLayout
        position="absolute"
        style="top: 56px; bottom: 168px;"
        :native-scrollbar="false"
        content-style="padding: 0;"
      >
        <ProjectHeader />
        <CardTimeline />
      </NLayout>

      <!-- 底部固定输入栏 -->
      <NLayoutFooter position="absolute" style="height: 168px;" bordered>
        <CardInput />
      </NLayoutFooter>
    </NLayout>
  </NLayout>
</template>

<script setup lang="ts">
import {
  NLayout,
  NLayoutHeader,
  NLayoutFooter,
  NSpace,
  NText,
  NSwitch,
} from 'naive-ui'

import Sidebar from '../components/Sidebar.vue'
import ProjectHeader from '../components/ProjectHeader.vue'
import CardTimeline from '../components/CardTimeline.vue'
import CardInput from '../components/CardInput.vue'

defineProps<{
  isDark: boolean
}>()

defineEmits<{
  'toggle-theme': []
}>()
</script>

<style scoped>
.main-layout {
  height: 100vh;
}
</style>
