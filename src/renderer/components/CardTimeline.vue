<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  NTimeline,
  NTimelineItem,
  NCard,
  NText,
  NSpace,
  NTag,
  NSpin,
} from 'naive-ui'
import type { Card } from '../types'
import { protocol } from '../protocol'

const props = defineProps<{ projectId: string }>()

const cards = ref<Card[]>([])
const loading = ref(false)

async function loadCards() {
  if (!props.projectId) {
    cards.value = []
    return
  }
  loading.value = true
  try {
    const list = await protocol.listCards(props.projectId)
    // 按时间倒序
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    cards.value = list
  } catch (e) {
    console.error('加载卡片失败:', e)
    cards.value = []
  } finally {
    loading.value = false
  }
}

// 监听项目切换，重新加载
watch(() => props.projectId, loadCards, { immediate: true })

// 暴露刷新方法供父组件调用
function refresh() {
  loadCards()
}
defineExpose({ refresh })

// 格式化时间
const formatTime = (date: Date): string => {
  const d = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) {
    return `今天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } else if (days === 1) {
    return `昨天 ${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`
  } else if (days < 7) {
    return `${days} 天前`
  } else {
    return `${d.getMonth() + 1}/${d.getDate()}`
  }
}
</script>

<template>
  <div class="timeline-container">
    <NSpin v-if="loading" size="medium" style="margin: 40px auto; display: block;" />
    <NText v-else-if="cards.length === 0" depth="3" style="display: block; text-align: center; margin-top: 40px;">
      {{ projectId ? '暂无卡片，开始记录吧' : '请先选择一个项目' }}
    </NText>
    <NTimeline v-else>
      <NTimelineItem
        v-for="card in cards"
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
