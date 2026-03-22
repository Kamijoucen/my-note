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
  NIcon,
  useDialog,
} from 'naive-ui'
import type { Card } from '../types'
import { protocol } from '../protocol'

const props = defineProps<{ projectId: string }>()

const dialog = useDialog()
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

// 删除卡片
const handleDeleteCard = (card: Card) => {
  dialog.warning({
    title: '删除卡片',
    content: '确定要删除这张卡片吗？此操作不可撤销。',
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const success = await protocol.deleteCard(card.id)
      if (success) {
        cards.value = cards.value.filter(c => c.id !== card.id)
      }
    },
  })
}

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
          <NIcon class="card-delete" :size="14" @click.stop="handleDeleteCard(card)">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor">
              <path d="M400 145.49L366.51 112 256 222.51 145.49 112 112 145.49 222.51 256 112 366.51 145.49 400 256 289.49 366.51 400 400 366.51 289.49 256 400 145.49z" />
            </svg>
          </NIcon>
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
  position: relative;
}

.card-delete {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0;
  cursor: pointer;
  transition: opacity 0.2s, color 0.2s;
  color: var(--n-text-color);
}

.card-item:hover .card-delete {
  opacity: 0.45;
}

.card-delete:hover {
  opacity: 1 !important;
  color: #e06c75;
}

.card-content {
  white-space: pre-wrap;
  line-height: 1.6;
}
</style>
