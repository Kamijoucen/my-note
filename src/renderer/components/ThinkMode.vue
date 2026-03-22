<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  NSelect,
  NButton,
  NInput,
  NDrawer,
  NDrawerContent,
  NSpace,
  NText,
  NSpin,
} from 'naive-ui'
import type { Card } from '../types'
import { protocol } from '../protocol'
import CardTimeline from './CardTimeline.vue'

const props = defineProps<{ projectId: string }>()

// ── 视角配置 ──────
const perspectives = [
  { key: 'by-relevance', label: '按相关' },
  { key: 'by-difficulty', label: '按难易' },
]
const perspectiveOptions = perspectives.map(p => ({ label: p.label, value: p.key }))
const activePerspective = ref(perspectives[0].key)

// ── 文档状态 ──────
const docContent = ref('')
const loading = ref(false)
const saving = ref(false)
const hasUnsavedChanges = ref(false)

// ── 时间线抽屉 ──────
const showDrawer = ref(false)

// ── 当前卡片缓存（用于拼接初始文档）──────
const cards = ref<Card[]>([])

const currentPerspectiveLabel = computed(() => {
  return perspectives.find(p => p.key === activePerspective.value)?.label ?? ''
})

// ── 加载文档：先查已保存 → 无则从卡片拼接 ──────
async function loadDoc() {
  if (!props.projectId) {
    docContent.value = ''
    return
  }

  loading.value = true
  hasUnsavedChanges.value = false
  try {
    // 尝试加载已保存的文档
    const saved = await protocol.getAnalysisDoc(props.projectId, activePerspective.value)
    if (saved) {
      docContent.value = saved.content
      return
    }

    // 无已保存文档，从卡片拼接
    cards.value = await protocol.listCards(props.projectId)
    docContent.value = generateDoc(cards.value, activePerspective.value)
  } catch (e) {
    console.error('加载分析文档失败:', e)
    docContent.value = ''
  } finally {
    loading.value = false
  }
}

// ── 文档拼接逻辑（前端简单实现，后续替换为 AI）──────
function generateDoc(cardList: Card[], perspective: string): string {
  if (cardList.length === 0) return '暂无卡片数据'

  // 按时间倒序排列
  const sorted = [...cardList].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  )

  if (perspective === 'by-relevance') {
    return generateByRelevance(sorted)
  } else if (perspective === 'by-difficulty') {
    return generateByDifficulty(sorted)
  }
  return sorted.map(c => c.content).join('\n\n')
}

/** 按标签分组拼接 */
function generateByRelevance(cardList: Card[]): string {
  const groups = new Map<string, Card[]>()

  for (const card of cardList) {
    if (card.tags.length === 0) {
      const list = groups.get('未分类') ?? []
      list.push(card)
      groups.set('未分类', list)
    } else {
      for (const tag of card.tags) {
        const list = groups.get(tag) ?? []
        list.push(card)
        groups.set(tag, list)
      }
    }
  }

  const sections: string[] = []
  for (const [tag, tagCards] of groups) {
    sections.push(`## ${tag}\n\n${tagCards.map(c => c.content).join('\n\n---\n\n')}`)
  }
  return sections.join('\n\n\n')
}

/** 按创建时间三等分模拟难度 */
function generateByDifficulty(cardList: Card[]): string {
  // 按创建时间正序（最早 → 最近）
  const sorted = [...cardList].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const third = Math.ceil(sorted.length / 3)
  const groups = [
    { title: '入门', cards: sorted.slice(0, third) },
    { title: '进阶', cards: sorted.slice(third, third * 2) },
    { title: '深入', cards: sorted.slice(third * 2) },
  ].filter(g => g.cards.length > 0)

  return groups
    .map(g => `## ${g.title}\n\n${g.cards.map(c => c.content).join('\n\n---\n\n')}`)
    .join('\n\n\n')
}

// ── 保存 ──────
async function handleSave() {
  if (!props.projectId) return
  saving.value = true
  try {
    const cardIds = cards.value.map(c => c.id)
    await protocol.saveAnalysisDoc({
      projectId: props.projectId,
      perspective: activePerspective.value,
      content: docContent.value,
      sourceCards: cardIds,
    })
    hasUnsavedChanges.value = false
  } catch (e) {
    console.error('保存分析文档失败:', e)
  } finally {
    saving.value = false
  }
}

function handleContentChange(val: string) {
  docContent.value = val
  hasUnsavedChanges.value = true
}

// ── 监听项目/视角变化 ──────
watch(() => props.projectId, loadDoc, { immediate: true })
watch(activePerspective, loadDoc)
</script>

<template>
  <div class="think-mode">
    <!-- 顶部工具栏 -->
    <div class="think-toolbar">
      <NSpace align="center" :size="12">
        <NSelect
          v-model:value="activePerspective"
          :options="perspectiveOptions"
          size="small"
          style="width: 140px"
        />
        <NText v-if="hasUnsavedChanges" depth="3" style="font-size: 12px">● 未保存</NText>
      </NSpace>
      <NSpace align="center" :size="8">
        <NButton size="small" quaternary @click="showDrawer = true">📋 时间线</NButton>
        <NButton
          size="small"
          type="primary"
          :loading="saving"
          :disabled="!projectId"
          @click="handleSave"
        >
          💾 保存
        </NButton>
      </NSpace>
    </div>

    <!-- 文档主体 -->
    <div class="think-body">
      <NSpin v-if="loading" size="medium" style="margin: 40px auto; display: block;" />
      <NText v-else-if="!projectId" depth="3" style="display: block; text-align: center; margin-top: 40px;">
        请先选择一个项目
      </NText>
      <NInput
        v-else
        type="textarea"
        :value="docContent"
        @update:value="handleContentChange"
        :placeholder="`${currentPerspectiveLabel}视角文档`"
        class="think-textarea"
        :autosize="false"
      />
    </div>

    <!-- 时间线抽屉 -->
    <NDrawer v-model:show="showDrawer" placement="right" :width="400">
      <NDrawerContent title="卡片时间线">
        <CardTimeline :project-id="projectId" />
      </NDrawerContent>
    </NDrawer>
  </div>
</template>

<style scoped>
.think-mode {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.think-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  flex-shrink: 0;
}

.think-body {
  flex: 1;
  min-height: 0;
  padding: 0 16px 16px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.think-textarea {
  flex: 1;
  min-height: 0;
}

.think-textarea :deep(.n-input) {
  height: 100%;
}

.think-textarea :deep(.n-input-wrapper) {
  height: 100%;
}

.think-textarea :deep(textarea) {
  height: 100% !important;
  resize: none;
}

.think-textarea :deep(.n-input-wrapper) {
  height: 100%;
}

.think-textarea :deep(textarea) {
  height: 100% !important;
  resize: none;
}
</style>
