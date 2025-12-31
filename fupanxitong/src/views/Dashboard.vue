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
        <h2 class="text-3xl font-bold text-gray-800">数据统计</h2>
        <p class="text-gray-500 mt-2">查看你的学习与成长轨迹</p>
      </div>

      <!-- 统计卡片 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">总复盘数</p>
              <p class="text-3xl font-bold text-primary-600">{{ stats.totalReviews }}</p>
            </div>
            <div class="text-4xl">📝</div>
          </div>
        </div>

        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">本月复盘</p>
              <p class="text-3xl font-bold text-blue-600">{{ stats.monthReviews }}</p>
            </div>
            <div class="text-4xl">📊</div>
          </div>
        </div>

        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">连续打卡</p>
              <p class="text-3xl font-bold text-green-600">{{ stats.streakDays }}</p>
              <p class="text-xs text-gray-400 mt-1">天</p>
            </div>
            <div class="text-4xl">🔥</div>
          </div>
        </div>

        <div class="card hover:shadow-md transition-shadow">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm text-gray-500 mb-1">打卡率</p>
              <p class="text-3xl font-bold text-orange-600">{{ stats.checkinRate }}%</p>
            </div>
            <div class="text-4xl">✅</div>
          </div>
        </div>
      </div>

      <!-- 复盘类型分布 -->
      <div class="card mb-8">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">复盘类型分布</h3>
        <div class="space-y-3">
          <div v-for="type in reviewTypes" :key="type.name" class="flex items-center">
            <div class="w-24 text-sm text-gray-600">{{ type.label }}</div>
            <div class="flex-1 mx-4">
              <div class="h-6 bg-gray-100 rounded-full overflow-hidden">
                <div
                  class="h-full transition-all duration-500"
                  :class="type.color"
                  :style="{ width: type.percentage + '%' }"
                ></div>
              </div>
            </div>
            <div class="w-16 text-right text-sm font-medium text-gray-700">
              {{ type.count }} 篇
            </div>
          </div>
        </div>
      </div>

      <!-- 最近活动 -->
      <div class="card">
        <h3 class="text-lg font-semibold text-gray-800 mb-4">最近活动</h3>
        <div class="space-y-4">
          <div
            v-for="activity in recentActivities"
            :key="activity.id"
            class="flex items-start gap-4 pb-4 border-b border-gray-100 last:border-0 last:pb-0"
          >
            <div class="text-2xl">{{ activity.icon }}</div>
            <div class="flex-1">
              <p class="font-medium text-gray-800">{{ activity.title }}</p>
              <p class="text-sm text-gray-500 mt-1">{{ activity.time }}</p>
            </div>
            <span
              class="px-3 py-1 text-xs rounded-full"
              :class="{
                'bg-blue-100 text-blue-700': activity.type === 'daily',
                'bg-green-100 text-green-700': activity.type === 'weekly',
                'bg-purple-100 text-purple-700': activity.type === 'monthly',
                'bg-orange-100 text-orange-700': activity.type === 'checkin'
              }"
            >
              {{ activity.typeLabel }}
            </span>
          </div>

          <div v-if="recentActivities.length === 0" class="text-center py-8 text-gray-400">
            暂无活动记录
          </div>
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
          <p class="font-medium mb-1">加载失败</p>
          <p class="text-sm">{{ error }}</p>
        </div>
        <button @click="error = ''" class="text-red-400 hover:text-red-600">✕</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { reviewsService, checkinsService } from '../lib/dataService'

const stats = ref({
  totalReviews: 0,
  monthReviews: 0,
  streakDays: 0,
  checkinRate: 0
})

const reviews = ref([])
const checkins = ref([])
const loading = ref(true)
const error = ref('')

const reviewTypes = computed(() => {
  const types = {
    daily: { name: 'daily', label: '日复盘', count: 0, color: 'bg-blue-500', percentage: 0 },
    weekly: { name: 'weekly', label: '周复盘', count: 0, color: 'bg-green-500', percentage: 0 },
    monthly: { name: 'monthly', label: '月复盘', count: 0, color: 'bg-purple-500', percentage: 0 }
  }

  reviews.value.forEach(review => {
    if (types[review.type]) {
      types[review.type].count++
    }
  })

  const total = reviews.value.length || 1
  Object.values(types).forEach(type => {
    type.percentage = Math.round((type.count / total) * 100)
  })

  return Object.values(types)
})

const recentActivities = computed(() => {
  const activities = []

  // 添加最近的复盘
  reviews.value.slice(0, 5).forEach(review => {
    activities.push({
      id: review.id,
      icon: '📝',
      title: review.title,
      time: formatDate(review.created_at),
      type: review.type,
      typeLabel: review.type === 'daily' ? '日复盘' : review.type === 'weekly' ? '周复盘' : '月复盘',
      timestamp: new Date(review.created_at).getTime()
    })
  })

  // 添加最近的打卡
  checkins.value.slice(0, 3).forEach(checkin => {
    activities.push({
      id: checkin.id,
      icon: '✅',
      title: checkin.note || '完成打卡',
      time: formatDate(checkin.created_at),
      type: 'checkin',
      typeLabel: '打卡',
      timestamp: new Date(checkin.created_at).getTime()
    })
  })

  // 按时间排序
  return activities.sort((a, b) => b.timestamp - a.timestamp).slice(0, 8)
})

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`

  return date.toLocaleDateString('zh-CN')
}

async function loadData() {
  loading.value = true
  error.value = ''

  try {
    // 并行加载数据
    const [reviewsData, checkinsData, streakDays] = await Promise.all([
      reviewsService.getAll(),
      checkinsService.getAll(),
      checkinsService.getStreakDays()
    ])

    reviews.value = reviewsData
    checkins.value = checkinsData

    // 计算统计数据
    stats.value.totalReviews = reviews.value.length

    // 本月复盘数
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    stats.value.monthReviews = reviews.value.filter(r => {
      const date = new Date(r.created_at)
      return date.getMonth() === currentMonth && date.getFullYear() === currentYear
    }).length

    // 连续打卡天数
    stats.value.streakDays = streakDays

    // 打卡率（最近30天）
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const recentCheckins = checkins.value.filter(c => new Date(c.check_date) >= thirtyDaysAgo)
    stats.value.checkinRate = Math.round((recentCheckins.length / 30) * 100)
  } catch (err) {
    console.error('加载数据失败:', err)
    error.value = '加载数据失败，请刷新页面重试'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
