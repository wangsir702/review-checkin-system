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
      <!-- 页面标题 -->
      <div class="mb-8">
        <h2 class="text-3xl font-bold text-gray-800">打卡日历</h2>
        <p class="text-gray-500 mt-2">每天进步一点点</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="card text-center">
          <div class="text-5xl mb-3">🔥</div>
          <p class="text-3xl font-bold text-primary-600 mb-1">{{ streakDays }}</p>
          <p class="text-sm text-gray-500">连续打卡天数</p>
        </div>

        <div class="card text-center">
          <div class="text-5xl mb-3">✅</div>
          <p class="text-3xl font-bold text-green-600 mb-1">{{ totalCheckins }}</p>
          <p class="text-sm text-gray-500">累计打卡天数</p>
        </div>

        <div class="card text-center">
          <div class="text-5xl mb-3">📊</div>
          <p class="text-3xl font-bold text-blue-600 mb-1">{{ checkinRate }}%</p>
          <p class="text-sm text-gray-500">本月打卡率</p>
        </div>
      </div>

      <!-- 今日打卡 -->
      <div class="card mb-8">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-800">今日打卡</h3>
          <span class="text-sm text-gray-500">{{ today }}</span>
        </div>

        <div v-if="todayCheckin" class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-2xl">✅</span>
            <span class="font-medium text-green-700">今天已打卡</span>
          </div>
          <p v-if="todayCheckin.note" class="text-gray-600 ml-11">{{ todayCheckin.note }}</p>
          <button @click="editTodayCheckin" class="mt-3 text-sm text-primary-600 hover:text-primary-700">
            编辑备注
          </button>
        </div>

        <div v-else class="text-center py-6">
          <button @click="checkInToday" class="btn btn-primary text-lg px-8 py-3" :disabled="checking">
            {{ checking ? '打卡中...' : '立即打卡' }}
          </button>
        </div>
      </div>

      <!-- 日历视图 -->
      <div class="card mb-8">
        <div class="flex items-center justify-between mb-6">
          <h3 class="text-lg font-semibold text-gray-800">月度日历</h3>
          <div class="flex items-center gap-4">
            <button @click="previousMonth" class="text-gray-600 hover:text-gray-800">
              ← 上月
            </button>
            <span class="font-medium">{{ currentMonthText }}</span>
            <button @click="nextMonth" class="text-gray-600 hover:text-gray-800" :disabled="isCurrentMonth">
              下月 →
            </button>
          </div>
        </div>

        <!-- 星期标题 -->
        <div class="grid grid-cols-7 gap-2 mb-2">
          <div
            v-for="day in weekDays"
            :key="day"
            class="text-center text-sm font-medium text-gray-500 py-2"
          >
            {{ day }}
          </div>
        </div>

        <!-- 日期格子 -->
        <div class="grid grid-cols-7 gap-2">
          <div
            v-for="(day, index) in calendarDays"
            :key="index"
            @click="day.date && selectDate(day.date)"
            class="aspect-square flex flex-col items-center justify-center rounded-lg transition-all cursor-pointer"
            :class="getDayClass(day)"
          >
            <span v-if="day.date" class="text-sm font-medium">{{ day.day }}</span>
            <span v-if="day.date && day.checked" class="text-lg mt-1">✓</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 打卡弹窗 -->
    <div
      v-if="showCheckinModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">
          {{ selectedDate === today ? '今日打卡' : '编辑打卡' }}
        </h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 mb-2">日期</label>
          <input type="text" :value="selectedDate" disabled class="input bg-gray-50" />
        </div>

        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 mb-2">备注（可选）</label>
          <textarea
            v-model="checkinNote"
            placeholder="记录今天的心情或收获..."
            class="input h-24 resize-none"
            :disabled="saving"
          ></textarea>
        </div>

        <div class="flex gap-3">
          <button @click="closeModal" class="btn btn-secondary flex-1" :disabled="saving">取消</button>
          <button @click="saveCheckin" class="btn btn-primary flex-1" :disabled="saving">
            {{ saving ? (editingCheckin ? '保存中...' : '打卡中...') : (editingCheckin ? '保存' : '打卡') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 错误提示 -->
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
import { checkinsService } from '../lib/dataService'

const checkins = ref([])
const currentDate = ref(new Date())
const selectedDate = ref('')
const showCheckinModal = ref(false)
const checkinNote = ref('')
const editingCheckin = ref(null)
const loading = ref(true)
const saving = ref(false)
const checking = ref(false)
const error = ref('')
const streakDays = ref(0)

const weekDays = ['日', '一', '二', '三', '四', '五', '六']

const today = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const todayCheckin = computed(() => {
  return checkins.value.find(c => c.check_date === today.value)
})

const totalCheckins = computed(() => {
  return checkins.value.length
})

const checkinRate = computed(() => {
  const now = new Date()
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
  const currentDay = now.getDate()
  const monthCheckins = checkins.value.filter(c => {
    const date = new Date(c.check_date)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }).length
  return Math.round((monthCheckins / currentDay) * 100)
})

const currentMonthText = computed(() => {
  return currentDate.value.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
})

const isCurrentMonth = computed(() => {
  const now = new Date()
  return (
    currentDate.value.getMonth() === now.getMonth() &&
    currentDate.value.getFullYear() === now.getFullYear()
  )
})

const calendarDays = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const daysInMonth = lastDay.getDate()
  const startDayOfWeek = firstDay.getDay()

  const days = []

  // 填充前面的空白
  for (let i = 0; i < startDayOfWeek; i++) {
    days.push({ date: null, day: null, checked: false })
  }

  // 填充月份的天数
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = new Date(year, month, i).toISOString().split('T')[0]
    const checked = checkins.value.some(c => c.check_date === dateStr)
    days.push({ date: dateStr, day: i, checked })
  }

  return days
})

function getDayClass(day) {
  if (!day.date) return 'bg-transparent'

  const classes = ['border']
  const dateObj = new Date(day.date)
  const todayObj = new Date(today.value)

  if (day.date === today.value) {
    classes.push('border-primary-500 bg-primary-50')
  } else if (day.checked) {
    classes.push('border-green-300 bg-green-50 text-green-700')
  } else if (dateObj > todayObj) {
    classes.push('border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed')
  } else {
    classes.push('border-gray-200 hover:bg-gray-50')
  }

  return classes.join(' ')
}

function previousMonth() {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

function nextMonth() {
  if (!isCurrentMonth.value) {
    currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
  }
}

function checkInToday() {
  selectedDate.value = today.value
  checkinNote.value = ''
  editingCheckin.value = null
  showCheckinModal.value = true
}

function editTodayCheckin() {
  selectedDate.value = today.value
  checkinNote.value = todayCheckin.value.note || ''
  editingCheckin.value = todayCheckin.value
  showCheckinModal.value = true
}

function selectDate(date) {
  const dateObj = new Date(date)
  const todayObj = new Date(today.value)

  // 不能选择未来的日期
  if (dateObj > todayObj) return

  selectedDate.value = date
  const existing = checkins.value.find(c => c.check_date === date)
  if (existing) {
    checkinNote.value = existing.note || ''
    editingCheckin.value = existing
  } else {
    checkinNote.value = ''
    editingCheckin.value = null
  }
  showCheckinModal.value = true
}

async function saveCheckin() {
  saving.value = true
  error.value = ''

  try {
    await checkinsService.upsert({
      check_date: selectedDate.value,
      note: checkinNote.value
    })

    await loadCheckins()
    closeModal()
  } catch (err) {
    console.error('打卡失败:', err)
    error.value = err.message || '打卡失败，请重试'
  } finally {
    saving.value = false
  }
}

function closeModal() {
  if (saving.value) return
  showCheckinModal.value = false
  selectedDate.value = ''
  checkinNote.value = ''
  editingCheckin.value = null
}

async function loadCheckins() {
  loading.value = true
  error.value = ''

  try {
    checkins.value = await checkinsService.getAll()
    streakDays.value = await checkinsService.getStreakDays()
  } catch (err) {
    console.error('加载打卡记录失败:', err)
    error.value = '加载数据失败，请刷新页面重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadCheckins()
})
</script>
