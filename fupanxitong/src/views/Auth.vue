<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4">
    <div class="max-w-md w-full">
      <!-- Logo 和标题 -->
      <div class="text-center mb-8">
        <h1 class="text-4xl font-bold text-primary-700 mb-2">复盘系统</h1>
        <p class="text-gray-500">持续成长，记录每一天</p>
      </div>

      <!-- 认证卡片 -->
      <div class="card">
        <!-- 切换标签 -->
        <div class="flex border-b border-gray-200 mb-6">
          <button
            @click="mode = 'login'"
            class="flex-1 pb-3 text-center font-medium transition-colors"
            :class="
              mode === 'login'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            "
          >
            登录
          </button>
          <button
            @click="mode = 'register'"
            class="flex-1 pb-3 text-center font-medium transition-colors"
            :class="
              mode === 'register'
                ? 'text-primary-600 border-b-2 border-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            "
          >
            注册
          </button>
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ error }}
        </div>

        <!-- 成功提示 -->
        <div v-if="success" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {{ success }}
        </div>

        <!-- 表单 -->
        <form @submit.prevent="handleSubmit">
          <!-- 邮箱 -->
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              v-model="email"
              type="email"
              required
              placeholder="your@email.com"
              class="input"
              :disabled="loading"
            />
          </div>

          <!-- 密码 -->
          <div class="mb-6">
            <label class="block text-sm font-medium text-gray-700 mb-2">密码</label>
            <input
              v-model="password"
              type="password"
              required
              :placeholder="mode === 'register' ? '至少6个字符' : '输入密码'"
              class="input"
              :disabled="loading"
              :minlength="mode === 'register' ? 6 : undefined"
            />
            <p v-if="mode === 'register'" class="text-xs text-gray-500 mt-1">
              密码至少需要6个字符
            </p>
          </div>

          <!-- 提交按钮 -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :disabled="loading"
          >
            <span v-if="loading">处理中...</span>
            <span v-else>{{ mode === 'login' ? '登录' : '注册' }}</span>
          </button>
        </form>

        <!-- 忘记密码 -->
        <div v-if="mode === 'login'" class="mt-4 text-center">
          <button
            @click="showResetPassword = true"
            class="text-sm text-primary-600 hover:text-primary-700"
          >
            忘记密码？
          </button>
        </div>
      </div>

      <!-- 底部提示 -->
      <p class="text-center text-sm text-gray-500 mt-6">
        {{ mode === 'login' ? '还没有账户？' : '已有账户？' }}
        <button
          @click="mode = mode === 'login' ? 'register' : 'login'"
          class="text-primary-600 hover:text-primary-700 font-medium"
        >
          {{ mode === 'login' ? '立即注册' : '立即登录' }}
        </button>
      </p>
    </div>

    <!-- 重置密码弹窗 -->
    <div
      v-if="showResetPassword"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      @click.self="closeResetPassword"
    >
      <div class="bg-white rounded-2xl w-full max-w-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">重置密码</h3>

        <div v-if="resetSuccess" class="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
          {{ resetSuccess }}
        </div>

        <div v-if="resetError" class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {{ resetError }}
        </div>

        <form @submit.prevent="handleResetPassword">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">邮箱</label>
            <input
              v-model="resetEmail"
              type="email"
              required
              placeholder="输入你的邮箱"
              class="input"
              :disabled="resetLoading"
            />
            <p class="text-xs text-gray-500 mt-1">
              我们将发送重置密码的链接到你的邮箱
            </p>
          </div>

          <div class="flex gap-3">
            <button
              type="button"
              @click="closeResetPassword"
              class="btn btn-secondary flex-1"
              :disabled="resetLoading"
            >
              取消
            </button>
            <button
              type="submit"
              class="btn btn-primary flex-1"
              :disabled="resetLoading"
            >
              {{ resetLoading ? '发送中...' : '发送链接' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()

const mode = ref('login')
const email = ref('')
const password = ref('')
const loading = ref(false)
const error = ref('')
const success = ref('')

const showResetPassword = ref(false)
const resetEmail = ref('')
const resetLoading = ref(false)
const resetError = ref('')
const resetSuccess = ref('')

async function handleSubmit() {
  error.value = ''
  success.value = ''
  loading.value = true

  try {
    if (mode.value === 'login') {
      // 登录
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.value,
        password: password.value
      })

      if (loginError) throw loginError

      // 登录成功，跳转到主页
      router.push('/dashboard')
    } else {
      // 注册
      const { data, error: signupError } = await supabase.auth.signUp({
        email: email.value,
        password: password.value
      })

      if (signupError) throw signupError

      // 检查是否需要邮箱验证
      if (data.user && !data.session) {
        success.value = '注册成功！请检查你的邮箱并点击验证链接。'
      } else {
        success.value = '注册成功！正在跳转...'
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    }
  } catch (err) {
    console.error('认证错误:', err)
    error.value = err.message || '操作失败，请重试'
  } finally {
    loading.value = false
  }
}

async function handleResetPassword() {
  resetError.value = ''
  resetSuccess.value = ''
  resetLoading.value = true

  try {
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(resetEmail.value, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    if (resetError) throw resetError

    resetSuccess.value = '密码重置邮件已发送！请检查你的邮箱。'
    setTimeout(() => {
      closeResetPassword()
    }, 2000)
  } catch (err) {
    console.error('重置密码错误:', err)
    resetError.value = err.message || '发送失败，请重试'
  } finally {
    resetLoading.value = false
  }
}

function closeResetPassword() {
  showResetPassword.value = false
  resetEmail.value = ''
  resetError.value = ''
  resetSuccess.value = ''
}
</script>
