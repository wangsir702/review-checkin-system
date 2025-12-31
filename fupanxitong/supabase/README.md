# Supabase 数据库设置指南

## 步骤 1：创建 Supabase 项目

1. 访问 [Supabase Dashboard](https://supabase.com/dashboard)
2. 点击 "New Project" 创建新项目
3. 填写项目信息：
   - **Name**: 复盘系统（或任意名称）
   - **Database Password**: 设置一个强密码（请记住）
   - **Region**: 选择离你最近的区域（如 Southeast Asia (Singapore)）
4. 点击 "Create new project"，等待项目创建完成（约2分钟）

## 步骤 2：获取 API 密钥

1. 在项目页面，点击左侧菜单的 **Settings**（齿轮图标）
2. 选择 **API** 标签
3. 找到以下信息：
   - **Project URL** → 复制此值
   - **Project API keys** → 找到 `anon` `public` 密钥 → 复制此值

4. 打开项目根目录的 `.env` 文件，填入这两个值：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

## 步骤 3：创建数据库表

1. 在 Supabase 项目页面，点击左侧菜单的 **SQL Editor**
2. 点击 **New query** 创建新查询
3. 打开项目中的 `supabase/create-tables.sql` 文件
4. 复制全部内容，粘贴到 SQL Editor 中
5. 点击 **Run** 按钮执行 SQL
6. 确认执行成功（应该看到 "Success. No rows returned"）

## 步骤 4：配置 RLS 策略

1. 在 SQL Editor 中，点击 **New query** 再次创建新查询
2. 打开项目中的 `supabase/rls-policies.sql` 文件
3. 复制全部内容，粘贴到 SQL Editor 中
4. 点击 **Run** 按钮执行 SQL
5. 确认执行成功

## 步骤 5：验证表创建

1. 点击左侧菜单的 **Table Editor**
2. 你应该能看到两个表：
   - `reviews` - 复盘记录表
   - `check_ins` - 打卡记录表
3. 点击每个表，查看列结构是否正确

## 步骤 6：配置邮箱认证（可选）

默认情况下，Supabase 使用邮箱验证注册。如果你想调整认证设置：

1. 点击左侧菜单的 **Authentication**
2. 选择 **Providers** 标签
3. 确保 **Email** provider 已启用
4. 可以在 **Email Templates** 中自定义邮件模板

### 开发环境快速测试（关闭邮箱验证）

如果你只想快速测试，不想每次都验证邮箱：

1. 进入 **Authentication** → **Providers** → **Email**
2. 关闭 **Confirm email**（确认邮箱）选项
3. 保存设置

⚠️ **注意**：生产环境请务必开启邮箱验证！

## 步骤 7：测试数据库连接

1. 回到项目代码，启动开发服务器：
```bash
npm run dev
```

2. 打开浏览器访问 `http://localhost:3000`
3. 尝试注册一个新账户
4. 在 Supabase Dashboard 的 **Authentication** → **Users** 中查看是否有新用户

## 常见问题

### Q: 看到 "Missing Supabase environment variables" 错误
**A**: 检查 `.env` 文件是否存在，并且包含正确的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY`。注意：修改 `.env` 后需要重启开发服务器。

### Q: 无法创建数据
**A**: 检查：
1. RLS 策略是否正确配置
2. 用户是否已登录
3. 浏览器控制台是否有错误信息

### Q: 数据库表创建失败
**A**:
1. 确保按顺序执行 SQL 文件（先 create-tables.sql，再 rls-policies.sql）
2. 如果需要重新创建，先删除表：
```sql
DROP TABLE IF EXISTS public.check_ins;
DROP TABLE IF EXISTS public.reviews;
```

## 下一步

配置完成后，你可以：
1. 运行项目并注册账户
2. 开始使用复盘和打卡功能
3. 在 Supabase Table Editor 中查看实时数据

---

✅ 设置完成后，你的应用就连接到了 Supabase 云数据库！
