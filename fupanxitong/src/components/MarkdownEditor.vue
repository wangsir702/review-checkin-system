<template>
  <div class="markdown-editor">
    <!-- 工具栏 -->
    <div class="flex items-center gap-2 mb-3 pb-3 border-b border-gray-200">
      <button
        v-for="tool in tools"
        :key="tool.name"
        @click="insertMarkdown(tool.syntax)"
        class="px-3 py-1 text-sm rounded hover:bg-gray-100 transition-colors"
        :title="tool.name"
      >
        {{ tool.icon }}
      </button>

      <div class="flex-1"></div>

      <button
        @click="showPreview = !showPreview"
        class="px-3 py-1 text-sm rounded transition-colors"
        :class="showPreview ? 'bg-primary-100 text-primary-700' : 'hover:bg-gray-100'"
      >
        {{ showPreview ? '👁️ 预览' : '✏️ 编辑' }}
      </button>
    </div>

    <!-- 编辑器区域 -->
    <div class="grid" :class="showPreview ? 'grid-cols-2 gap-4' : 'grid-cols-1'">
      <!-- 输入区 -->
      <div>
        <textarea
          ref="textarea"
          v-model="content"
          @input="handleInput"
          class="w-full h-96 p-4 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm"
          placeholder="在此输入内容，支持 Markdown 语法...&#10;&#10;## 示例模板&#10;&#10;### 做了什么&#10;- 完成了...&#10;&#10;### 遇到的问题&#10;- 问题描述&#10;&#10;### 解决方案&#10;- 如何解决&#10;&#10;### 收获与反思&#10;- 学到了什么&#10;&#10;### 下一步计划&#10;- 下一步要做什么"
        ></textarea>
      </div>

      <!-- 预览区 -->
      <div v-if="showPreview" class="border border-gray-200 rounded-lg p-4 h-96 overflow-y-auto bg-gray-50">
        <div v-if="content" class="prose max-w-none" v-html="preview"></div>
        <div v-else class="text-gray-400 text-center mt-20">在左侧输入内容，这里会实时预览</div>
      </div>
    </div>

    <!-- 提示 -->
    <div class="mt-3 text-xs text-gray-400">
      支持 Markdown 语法：标题、列表、粗体、斜体、代码等
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { marked } from 'marked'

const props = defineProps({
  modelValue: {
    type: String,
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

const textarea = ref(null)
const content = ref(props.modelValue)
const showPreview = ref(false)

const tools = [
  { name: '标题', icon: 'H', syntax: '## ' },
  { name: '粗体', icon: 'B', syntax: '**粗体**' },
  { name: '斜体', icon: 'I', syntax: '*斜体*' },
  { name: '列表', icon: '•', syntax: '- ' },
  { name: '代码', icon: '<>', syntax: '`code`' },
  { name: '引用', icon: '""', syntax: '> ' }
]

const preview = computed(() => {
  return marked(content.value)
})

watch(
  () => props.modelValue,
  newValue => {
    content.value = newValue
  }
)

function handleInput() {
  emit('update:modelValue', content.value)
}

function insertMarkdown(syntax) {
  const ta = textarea.value
  const start = ta.selectionStart
  const end = ta.selectionEnd
  const selectedText = content.value.substring(start, end)

  let newText
  let cursorPos

  if (syntax.includes('**') || syntax.includes('*') || syntax.includes('`')) {
    // 包裹类语法
    const [before, after] = syntax.split(selectedText.length > 0 ? selectedText : syntax.match(/\*+|`/)[0])
    newText = content.value.substring(0, start) + before + (selectedText || '') + after + content.value.substring(end)
    cursorPos = start + before.length + selectedText.length
  } else {
    // 前缀类语法
    const lineStart = content.value.lastIndexOf('\n', start - 1) + 1
    newText = content.value.substring(0, lineStart) + syntax + content.value.substring(lineStart)
    cursorPos = lineStart + syntax.length
  }

  content.value = newText
  emit('update:modelValue', content.value)

  // 恢复焦点和光标位置
  setTimeout(() => {
    ta.focus()
    ta.setSelectionRange(cursorPos, cursorPos)
  }, 0)
}
</script>

<style scoped>
.prose {
  @apply text-gray-700 text-sm;
}

.prose h1,
.prose h2,
.prose h3 {
  @apply font-bold text-gray-800 mt-4 mb-2;
}

.prose h1 {
  @apply text-xl;
}

.prose h2 {
  @apply text-lg;
}

.prose h3 {
  @apply text-base;
}

.prose p {
  @apply mb-3;
}

.prose ul,
.prose ol {
  @apply ml-5 mb-3;
}

.prose li {
  @apply mb-1;
}

.prose code {
  @apply bg-gray-200 px-1.5 py-0.5 rounded text-xs;
}

.prose blockquote {
  @apply border-l-4 border-gray-300 pl-4 italic text-gray-600;
}
</style>
