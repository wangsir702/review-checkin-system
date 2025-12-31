import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import './style.css'
import App from './App.vue'
import Dashboard from './views/Dashboard.vue'
import Reviews from './views/Reviews.vue'
import Checkin from './views/Checkin.vue'
import Auth from './views/Auth.vue'
import { initAuth, isAuthenticated, loading as authLoading } from './lib/auth'

const routes = [
  {
    path: '/auth',
    name: 'Auth',
    component: Auth,
    meta: { requiresGuest: true }
  },
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/reviews',
    name: 'Reviews',
    component: Reviews,
    meta: { requiresAuth: true }
  },
  {
    path: '/checkin',
    name: 'Checkin',
    component: Checkin,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach(async (to, from, next) => {
  // 等待认证状态初始化完成
  while (authLoading.value) {
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  const authenticated = isAuthenticated()

  // 需要认证的路由
  if (to.meta.requiresAuth && !authenticated) {
    next('/auth')
    return
  }

  // 只允许未登录用户访问的路由（如登录页）
  if (to.meta.requiresGuest && authenticated) {
    next('/dashboard')
    return
  }

  next()
})

const app = createApp(App)

// 初始化认证状态
initAuth().then(() => {
  app.use(router)
  app.mount('#app')
})
