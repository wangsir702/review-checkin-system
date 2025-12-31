<template>
  <div class="p-8 max-w-7xl mx-auto">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="text-center">
        <div class="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        <p class="mt-4 text-gray-500">加载中...</p>
      </div>
    </div>

    <!-- 主要内容 -->
    <div v-else>
      <!-- 页面标题和操作栏 -->
      <div class="flex items-center justify-between mb-8">
        <div>
          <h2 class="text-3xl font-bold text-gray-800">复盘记录</h2>
          <p class="text-gray-500 mt-2">记录成长，反思进步</p>
        </div>
        <button @click="openEditor()" class="btn btn-primary flex items-center gap-2">
          <span>➕</span>
          <span>新建复盘</span>
        </button>
      </div>

      <!-- 搜索和筛选栏 -->
      <div class="card mb-6">
        <div class="flex flex-col md:flex-row gap-4">
          <!-- 搜索框 -->
          <div class="flex-1">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索标题、内容..."
              class="input"
              @input="handleSearch"
            />
          </div>

          <!-- 类型筛选 -->
          <select v-model="filterType" class="input md:w-40" @change="handleFilter">
            <option value="all">所有类型</option>
            <option value="daily">日复盘</option>
            <option value="weekly">周复盘</option>
            <option value="monthly">月复盘</option>
          </select>
        </div>

        <!-- 标签筛选 -->
        <div v-if="allTags.length > 0" class="mt-4 flex flex-wrap gap-2">
          <button
            v-for="tag in allTags"
            :key="tag"
            @click="toggleTag(tag)"
            class="px-3 py-1 rounded-full text-sm transition-colors"
            :class="
              selectedTags.includes(tag)
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            "
          >
            {{ tag }}
          </button>
        </div>
      </div>

      <!-- 复盘列表 -->
      <div class="space-y-4">
        <div
          v-for="review in filteredReviews"
          :key="review.id"
          class="card hover:shadow-md transition-shadow cursor-pointer"
          @click="viewReview(review)"
        >
          <div class="flex items-start justify-between mb-3">
            <h3 class="text-xl font-semibold text-gray-800">{{ review.title || '无标题' }}</h3>
            <span
              class="px-3 py-1 text-xs rounded-full flex-shrink-0"
              :class="{
                'bg-blue-100 text-blue-700': review.type === 'daily',
                'bg-green-100 text-green-700': review.type === 'weekly',
                'bg-purple-100 text-purple-700': review.type === 'monthly'
              }"
            >
              {{ review.type === 'daily' ? '日复盘' : review.type === 'weekly' ? '周复盘' : '月复盘' }}
            </span>
          </div>

          <p class="text-gray-600 mb-3 line-clamp-2">
            {{ getContentPreview(review.content) }}
          </p>

          <div class="flex items-center justify-between text-sm">
            <div class="flex gap-2">
              <span
                v-for="tag in review.tags"
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-600 rounded"
              >
                #{{ tag }}
              </span>
            </div>
            <span class="text-gray-400">{{ formatDate(review.created_at) }}</span>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-if="filteredReviews.length === 0" class="card text-center py-12">
          <div class="text-6xl mb-4">📝</div>
          <p class="text-gray-500 mb-4">{{ searchQuery ? '没有找到匹配的复盘' : '还没有复盘记录' }}</p>
          <button v-if="!searchQuery" @click="openEditor()" class="btn btn-primary">
            创建第一条复盘
          </button>
        </div>
      </div>
    </div>

    <!-- 复盘编辑器弹窗 -->
    <div
      v-if="showEditor"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeEditor"
    >
      <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 弹窗头部 -->
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <h3 class="text-2xl font-bold text-gray-800">
            {{ editingReview ? '编辑复盘' : '新建复盘' }}
          </h3>
          <button @click="closeEditor" class="text-gray-400 hover:text-gray-600 text-2xl" :disabled="saving">
            ✕
          </button>
        </div>

        <!-- 弹窗内容 -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 标题 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">标题</label>
            <input
              v-model="formData.title"
              type="text"
              placeholder="输入复盘标题..."
              class="input"
              :disabled="saving"
            />
          </div>

          <!-- 类型和标签 -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">类型</label>
              <select v-model="formData.type" class="input" :disabled="saving">
                <option value="daily">日复盘</option>
                <option value="weekly">周复盘</option>
                <option value="monthly">月复盘</option>
              </select>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 mb-2">标签</label>
              <input
                v-model="tagInput"
                type="text"
                placeholder="输入标签后按回车"
                class="input"
                @keyup.enter="addTag"
                :disabled="saving"
              />
            </div>
          </div>

          <!-- 已选标签 -->
          <div v-if="formData.tags.length > 0" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="(tag, index) in formData.tags"
              :key="index"
              class="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm flex items-center gap-2"
            >
              {{ tag }}
              <button @click="removeTag(index)" class="hover:text-primary-900" :disabled="saving">✕</button>
            </span>
          </div>

          <!-- Markdown编辑器 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">内容（支持Markdown）</label>
            <MarkdownEditor v-model="formData.content" />
          </div>
        </div>

        <!-- 弹窗底部 -->
        <div class="p-6 border-t border-gray-200 flex justify-between">
          <button
            v-if="editingReview"
            @click="deleteReview"
            class="btn bg-red-100 text-red-700 hover:bg-red-200"
            :disabled="saving || deleting"
          >
            {{ deleting ? '删除中...' : '删除' }}
          </button>
          <div class="flex gap-3" :class="{ 'ml-auto': !editingReview }">
            <button @click="closeEditor" class="btn btn-secondary" :disabled="saving">取消</button>
            <button @click="saveReview" class="btn btn-primary" :disabled="saving">
              {{ saving ? '保存中...' : '保存' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 查看复盘详情弹窗 -->
    <div
      v-if="viewingReview"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeViewer"
    >
      <div class="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div class="p-6 border-b border-gray-200 flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-gray-800">{{ viewingReview.title }}</h3>
            <div class="flex items-center gap-3 mt-2">
              <span
                class="px-3 py-1 text-xs rounded-full"
                :class="{
                  'bg-blue-100 text-blue-700': viewingReview.type === 'daily',
                  'bg-green-100 text-green-700': viewingReview.type === 'weekly',
                  'bg-purple-100 text-purple-700': viewingReview.type === 'monthly'
                }"
              >
                {{
                  viewingReview.type === 'daily'
                    ? '日复盘'
                    : viewingReview.type === 'weekly'
                    ? '周复盘'
                    : '月复盘'
                }}
              </span>
              <span class="text-sm text-gray-500">{{ formatDate(viewingReview.created_at) }}</span>
            </div>
          </div>
          <div class="flex gap-2">
            <button @click="editReview(viewingReview)" class="btn btn-secondary">编辑</button>
            <button @click="closeViewer" class="text-gray-400 hover:text-gray-600 text-2xl px-2">
              ✕
            </button>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6">
          <!-- 标签 -->
          <div v-if="viewingReview.tags.length > 0" class="flex flex-wrap gap-2 mb-6">
            <span
              v-for="tag in viewingReview.tags"
              :key="tag"
              class="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
            >
              #{{ tag }}
            </span>
          </div>

          <!-- 内容 -->
          <div class="prose max-w-none" v-html="renderMarkdown(viewingReview.content)"></div>
        </div>
      </div>
    </div>

    <!-- 错误提示弹窗 -->
    <div
      v-if="error"
      class="fixed bottom-4 right-4 bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow-lg max-w-md z-50"
    >
      <div class="flex items-start gap-3">
        <span class="text-xl">⚠️</span>
        <div class="flex-1">
          <p class="font-medium mb-1">操作失败</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <button @click="error = ''" class="text-red-400 hover:text-red-600">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reviewsService } from '../lib/dataService'
import { marked } from 'marked'
import MarkdownEditor from '../components/MarkdownEditor.vue'

const reviews = ref([])
const searchQuery = ref('')
const filterType = ref('all')
const selectedTags = ref([])
const showEditor = ref(false)
const editingReview = ref(null)
const viewingReview = ref(null)
const tagInput = ref('')
const loading = ref(true)
const saving = ref(false)
const deleting = ref(false)
const error = ref('')

const formData = ref({
  title: '',
  content: '',
  type: 'daily',
  tags: []
})

const allTags = computed(() => {
  const tags = new Set()
  reviews.value.forEach(review => {
    if (review.tags && Array.isArray(review.tags)) {
      review.tags.forEach(tag => tags.add(tag))
    }
  })
  return Array.from(tags)
})

const filteredReviews = computed(() => {
  let result = reviews.value

  // 搜索过滤（前端过滤）
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(r =>
      r.title.toLowerCase().includes(query) ||
      r.content.toLowerCase().includes(query)
    )
  }

  // 类型过滤
  if (filterType.value !== 'all') {
    result = result.filter(r => r.type === filterType.value)
  }

  // 标签过滤
  if (selectedTags.value.length > 0) {
    result = result.filter(r =>
      r.tags && selectedTags.value.some(tag => r.tags.includes(tag))
    )
  }

  return result
})

async function loadReviews() {
  loading.value = true
  error.value = ''
  try {
    reviews.value = await reviewsService.getAll()
  } catch (err) {
    console.error('加载复盘记录失败:', err)
    error.value = '加载数据失败，请刷新页面重试'
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  // 搜索通过 computed 自动触发
}

function handleFilter() {
  // 筛选通过 computed 自动触发
}

function toggleTag(tag) {
  const index = selectedTags.value.indexOf(tag)
  if (index > -1) {
    selectedTags.value.splice(index, 1)
  } else {
    selectedTags.value.push(tag)
  }
}

function openEditor(review = null) {
  editingReview.value = review
  if (review) {
    formData.value = {
      title: review.title,
      content: review.content,
      type: review.type,
      tags: review.tags ? [...review.tags] : []
    }
  } else {
    formData.value = {
      title: '',
      content: '',
      type: 'daily',
      tags: []
    }
  }
  showEditor.value = true
}

function closeEditor() {
  if (saving.value) return
  showEditor.value = false
  editingReview.value = null
}

function addTag() {
  const tag = tagInput.value.trim()
  if (tag && !formData.value.tags.includes(tag)) {
    formData.value.tags.push(tag)
  }
  tagInput.value = ''
}

function removeTag(index) {
  formData.value.tags.splice(index, 1)
}

async function saveReview() {
  if (!formData.value.title.trim()) {
    error.value = '请输入标题'
    return
  }

  saving.value = true
  error.value = ''

  try {
    if (editingReview.value) {
      await reviewsService.update(editingReview.value.id, formData.value)
    } else {
      await reviewsService.create(formData.value)
    }

    await loadReviews()
    closeEditor()
  } catch (err) {
    console.error('保存失败:', err)
    error.value = err.message || '保存失败，请重试'
  } finally {
    saving.value = false
  }
}

async function deleteReview() {
  if (!confirm('确定要删除这条复盘吗？此操作不可撤销。')) {
    return
  }

  deleting.value = true
  error.value = ''

  try {
    await reviewsService.delete(editingReview.value.id)
    await loadReviews()
    closeEditor()
  } catch (err) {
    console.error('删除失败:', err)
    error.value = err.message || '删除失败，请重试'
  } finally {
    deleting.value = false
  }
}

function viewReview(review) {
  viewingReview.value = review
}

function closeViewer() {
  viewingReview.value = null
}

function editReview(review) {
  closeViewer()
  openEditor(review)
}

function getContentPreview(content) {
  return content.replace(/[#*`\n]/g, '').substring(0, 150) + (content.length > 150 ? '...' : '')
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

function renderMarkdown(content) {
  return marked(content)
}

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.prose {
  @apply text-gray-700;
}

.prose h1,
.prose h2,
.prose h3 {
  @apply font-bold text-gray-800 mt-6 mb-3;
}

.prose h1 {
  @apply text-2xl;
}

.prose h2 {
  @apply text-xl;
}

.prose h3 {
  @apply text-lg;
}

.prose p {
  @apply mb-4;
}

.prose ul,
.prose ol {
  @apply ml-6 mb-4;
}

.prose li {
  @apply mb-2;
}

.prose code {
  @apply bg-gray-100 px-2 py-1 rounded text-sm;
}
</style>
