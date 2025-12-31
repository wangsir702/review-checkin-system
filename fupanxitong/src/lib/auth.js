import { ref } from 'vue'
import { supabase } from '../lib/supabaseClient'

// 全局认证状态
export const user = ref(null)
export const session = ref(null)
export const loading = ref(true)

// 初始化认证状态
export async function initAuth() {
  loading.value = true

  try {
    // 获取当前会话
    const { data: { session: currentSession } } = await supabase.auth.getSession()
    session.value = currentSession
    user.value = currentSession?.user ?? null

    // 监听认证状态变化
    supabase.auth.onAuthStateChange((_event, newSession) => {
      session.value = newSession
      user.value = newSession?.user ?? null
    })
  } catch (error) {
    console.error('初始化认证状态失败:', error)
  } finally {
    loading.value = false
  }
}

// 登出
export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    user.value = null
    session.value = null
  } catch (error) {
    console.error('登出失败:', error)
    throw error
  }
}

// 检查是否已登录
export function isAuthenticated() {
  return !!user.value
}
