import { createClient } from '@supabase/supabase-js'

// 从环境变量获取 Supabase 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 验证环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('错误：缺少 Supabase 环境变量！')
  console.error('请检查 .env 文件是否正确配置了 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY')
}

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // 持久化认证状态到 localStorage
    persistSession: true,
    // 自动刷新 token
    autoRefreshToken: true,
    // 检测会话变化
    detectSessionInUrl: true
  }
})

// 导出便捷的认证方法
export const auth = supabase.auth
