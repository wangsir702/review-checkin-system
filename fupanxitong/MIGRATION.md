# Supabase 迁移完成指南

## 🎉 已完成的工作

### 1. 基础配置 ✅
- ✅ 安装了 `@supabase/supabase-js` 依赖
- ✅ 创建了环境变量配置（`.env` 和 `.env.example`）
- ✅ 创建了 Supabase 客户端配置（`src/lib/supabaseClient.js`）
- ✅ 更新了 `.gitignore`，确保 `.env` 不会被提交

### 2. 数据库设计 ✅
- ✅ 创建了数据库表结构 SQL（`supabase/create-tables.sql`）
- ✅ 创建了 RLS 安全策略 SQL（`supabase/rls-policies.sql`）
- ✅ 提供了完整的 Supabase 设置指南（`supabase/README.md`）

### 3. 用户认证 ✅
- ✅ 创建了登录/注册页面（`src/views/Auth.vue`）
- ✅ 实现了认证状态管理（`src/lib/auth.js`）
- ✅ 添加了路由守卫，保护需要登录的页面
- ✅ 更新了主布局，添加用户信息和登出功能

### 4. 数据服务层 ✅
- ✅ 创建了 Supabase 数据服务（`src/lib/dataService.js`）
- ✅ 实现了复盘记录的所有 CRUD 操作
- ✅ 实现了打卡记录的所有 CRUD 操作

## 📋 下一步：在 Supabase 控制台配置数据库

### 步骤 1：创建 Supabase 项目并获取密钥

1. 访问 https://supabase.com/dashboard 并登录
2. 创建新项目
3. 获取 API 密钥（参考 `supabase/README.md` 详细步骤）
4. 更新 `.env` 文件：
   ```env
   VITE_SUPABASE_URL=https://你的项目ID.supabase.co
   VITE_SUPABASE_ANON_KEY=你的匿名密钥
   ```

### 步骤 2：创建数据库表

1. 在 Supabase Dashboard 打开 SQL Editor
2. 执行 `supabase/create-tables.sql` 中的 SQL
3. 执行 `supabase/rls-policies.sql` 中的 SQL

### 步骤 3：测试认证功能

1. 重启开发服务器：
   ```bash
   npm run dev
   ```

2. 访问 http://localhost:3000，你会被重定向到登录页面
3. 注册一个新账户
4. 登录后即可开始使用

## ⚠️ 当前状态

### 已实现的功能
- ✅ 用户注册、登录、登出
- ✅ 路由保护
- ✅ Supabase 数据服务层

### 待迁移的功能
- ⏳ 复盘记录页面需要从 localStorage 改为 Supabase
- ⏳ 打卡日历页面需要从 localStorage 改为 Supabase
- ⏳ 数据统计页面需要从 localStorage 改为 Supabase
- ⏳ 添加加载状态和错误提示

## 🔄 如何迁移现有页面

对于每个页面（Reviews.vue, Checkin.vue, Dashboard.vue），需要：

1. **移除** localStorage 导入：
   ```javascript
   // 删除这行
   import { reviewsStorage, checkinsStorage } from '../utils/storage'
   ```

2. **改用** Supabase 服务：
   ```javascript
   // 添加这行
   import { reviewsService, checkinsService } from '../lib/dataService'
   ```

3. **更新所有数据操作**：
   ```javascript
   // 旧代码（localStorage）
   const reviews = reviewsStorage.getAll()

   // 新代码（Supabase）
   const reviews = await reviewsService.getAll()
   ```

4. **添加 try-catch 错误处理**：
   ```javascript
   try {
     const reviews = await reviewsService.getAll()
   } catch (error) {
     console.error('加载失败:', error)
     // 显示错误提示
   }
   ```

5. **添加加载状态**：
   ```javascript
   const loading = ref(false)

   loading.value = true
   try {
     const reviews = await reviewsService.getAll()
   } catch (error) {
     // ...
   } finally {
     loading.value = false
   }
   ```

## 🚀 快速开始

1. 配置 Supabase 项目（参考 `supabase/README.md`）
2. 更新 `.env` 文件
3. 重启开发服务器
4. 注册并登录
5. 开始使用！

---

**需要帮助？** 查看 `supabase/README.md` 获取详细的配置指南。
