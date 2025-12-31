<template>
  <div class="min-h-screen flex">
    <!-- 左侧导航栏（只在已登录时显示） -->
    <aside v-if="user" class="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div class="p-6">
        <h1 class="text-2xl font-bold text-primary-700">复盘系统</h1>
        <p class="text-sm text-gray-500 mt-1">持续成长，记录每一天</p>
      </div>

      <nav class="flex-1 px-3">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3 mb-1 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          active-class="bg-primary-50 text-primary-700 font-medium"
        >
          <span class="text-xl">{{ item.icon }}</span>
          <span>{{ item.name }}</span>
        </router-link>
      </nav>

      <div class="p-4 border-t border-gray-200">
        <!-- 用户信息 -->
        <div class="mb-3">
          <div class="flex items-center gap-2 mb-2">
            <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
              <span class="text-primary-700 font-medium">{{ userInitial }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-700 truncate">{{ userEmail }}</p>
            </div>
          </div>
          <button
            @click="handleSignOut"
            class="w-full btn btn-secondary text-sm"
            :disabled="signingOut"
          >
            {{ signingOut ? '退出中...' : '退出登录' }}
          </button>
        </div>

        <div class="text-xs text-gray-400 text-center">
          © 2025 个人复盘系统
        </div>
      </div>
    </aside>

    <!-- 主内容区 -->
    <main class="flex-1 overflow-auto">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { user, signOut } from './lib/auth'

const router = useRouter()
const signingOut = ref(false)

const navItems = [
  { path: '/dashboard', name: '数据统计', icon: '📊' },
  { path: '/reviews', name: '复盘记录', icon: '📝' },
  { path: '/checkin', name: '打卡日历', icon: '📅' }
]

const userEmail = computed(() => {
  return user.value?.email || ''
})

const userInitial = computed(() => {
  return userEmail.value.charAt(0).toUpperCase()
})

async function handleSignOut() {
  signingOut.value = true
  try {
    await signOut()
    router.push('/auth')
  } catch (error) {
    console.error('登出失败:', error)
    alert('登出失败，请重试')
  } finally {
    signingOut.value = false
  }
}
</script>
