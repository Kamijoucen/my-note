<script setup lang="ts">
import { computed } from 'vue'
import {
  NTimeline,
  NTimelineItem,
  NCard,
  NText,
  NSpace,
  NTag,
} from 'naive-ui'
import type { Card } from '../types'

// Mock 卡片数据（已按时间倒序排列）
const mockCards: Card[] = [
  {
    id: 'card-5',
    projectId: '1',
    content: 'watchEffect 会自动收集依赖，而 watch 需要显式指定监听源。watchEffect 适合副作用逻辑，watch 适合需要访问新旧值的场景。',
    createdAt: new Date('2026-02-03T14:30:00'),
    tags: ['Vue', 'watchEffect'],
    links: ['card-3'],
  },
  {
    id: 'card-4',
    projectId: '1',
    content: 'computed 返回的是一个 ref，访问时需要 .value（在模板中自动解包）。它具有缓存特性，只有依赖变化时才会重新计算。',
    createdAt: new Date('2026-02-02T10:15:00'),
    tags: ['Vue', 'computed'],
    links: [],
  },
  {
    id: 'card-3',
    projectId: '1',
    content: 'ref 用于基本类型，reactive 用于对象。reactive 解构会丢失响应性，需要用 toRefs 转换。',
    createdAt: new Date('2026-02-01T16:45:00'),
    tags: ['Vue', 'ref', 'reactive'],
    links: [],
  },
  {
    id: 'card-2',
    projectId: '1',
    content: 'Composition API 的核心优势是逻辑复用。可以将相关的状态和方法封装到 composable 函数中，比 mixins 更清晰。',
    createdAt: new Date('2026-01-28T09:20:00'),
    tags: ['Vue', 'Composition API'],
    links: [],
  },
  {
    id: 'card-1',
    projectId: '1',
    content: 'Vue 3 的 setup() 函数是 Composition API 的入口点。<script setup> 是更简洁的语法糖，自动暴露顶层变量给模板。',
    createdAt: new Date('2026-01-15T11:00:00'),
    tags: ['Vue', 'setup'],
    links: [],
  },
]

// 格式化时间
const formatTime = (date: Date): string => {
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return `今天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (days === 1) {
    return `昨天 ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return `${date.getMonth() + 1}/${date.getDate()}`
  }
}
</script>

<template>
  <div class="timeline-container">
    <NTimeline>
      <NTimelineItem
        v-for="card in mockCards"
        :key="card.id"
        :time="formatTime(card.createdAt)"
        type="info"
      >
        <NCard size="small" hoverable class="card-item">
          <NText class="card-content">{{ card.content }}</NText>
          <template #footer>
            <NSpace v-if="card.tags.length > 0" size="small">
              <NTag
                v-for="tag in card.tags"
                :key="tag"
                size="tiny"
                :bordered="false"
                type="success"
              >
                {{ tag }}
              </NTag>
            </NSpace>
          </template>
        </NCard>
      </NTimelineItem>
    </NTimeline>
  </div>
</template>

<style scoped>
.timeline-container {
  padding: 16px 24px;
}

.card-item {
  max-width: 100%;
}

.card-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
