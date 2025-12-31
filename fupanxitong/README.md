# 个人复盘与打卡系统

一个极简风格的个人成长复盘与打卡系统，帮助你记录每日进步，培养良好习惯。

## ✨ 功能特性

### 📝 复盘记录
- **多种复盘类型**：支持日复盘、周复盘、月复盘
- **Markdown 编辑**：强大的 Markdown 编辑器，支持实时预览
- **标签管理**：通过标签对复盘进行分类（工作、学习、生活等）
- **搜索与筛选**：快速查找历史复盘记录
- **复盘模板**：内置结构化模板，引导深度思考

### 📅 打卡功能
- **日历视图**：直观的月度日历展示
- **连续打卡统计**：自动计算连续打卡天数
- **年度热力图**：GitHub 风格的打卡热力图可视化
- **打卡备注**：记录每日心情和收获

### 📊 数据统计
- **总览面板**：总复盘数、本月复盘数、连续打卡等关键指标
- **类型分布**：复盘类型占比可视化
- **最近活动**：时间线展示最近的复盘和打卡记录
- **打卡率统计**：本月打卡完成率

## 🎨 设计特点

- **极简美学**：大量留白，清晰的视觉层次
- **柔和配色**：舒适的中性色调，减少视觉疲劳
- **响应式设计**：完美适配桌面和移动设备
- **流畅动画**：细腻的过渡效果和交互反馈

## 🚀 快速开始

### 环境要求
- Node.js 16+
- npm 或 yarn

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

访问 `http://localhost:3000` 查看应用

### 构建生产版本

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 📁 项目结构

```
fupanxitong/
├── src/
│   ├── components/          # 可复用组件
│   │   └── MarkdownEditor.vue
│   ├── views/               # 页面组件
│   │   ├── Dashboard.vue    # 数据统计面板
│   │   ├── Reviews.vue      # 复盘记录页面
│   │   └── Checkin.vue      # 打卡日历页面
│   ├── utils/               # 工具函数
│   │   └── storage.js       # localStorage 数据管理
│   ├── App.vue              # 根组件
│   ├── main.js              # 应用入口
│   └── style.css            # 全局样式
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── README.md
```

## 🛠️ 技术栈

- **前端框架**：Vue 3 (Composition API)
- **路由管理**：Vue Router 4
- **样式方案**：TailwindCSS 3
- **构建工具**：Vite 5
- **Markdown 解析**：marked
- **数据存储**：localStorage（前端原型阶段）

## 💾 数据存储

当前版本使用 `localStorage` 存储数据，所有数据保存在浏览器本地。

### 示例数据
首次打开应用会自动初始化示例数据，包括：
- 2 条示例复盘记录
- 最近 7 天的打卡记录

### 数据清除
如需清除所有数据：
```javascript
localStorage.removeItem('review_system_reviews')
localStorage.removeItem('review_system_checkins')
```

## 🎯 使用指南

### 创建复盘
1. 进入「复盘记录」页面
2. 点击「新建复盘」按钮
3. 填写标题、选择类型、添加标签
4. 使用 Markdown 编辑器记录内容
5. 点击「保存」完成创建

### 每日打卡
1. 进入「打卡日历」页面
2. 点击「立即打卡」按钮
3. 可选填写当日备注
4. 点击「打卡」完成

### 查看统计
- 进入「数据统计」页面查看整体数据
- 复盘类型分布、最近活动一目了然
- 追踪个人成长轨迹

## 🔮 未来规划

Phase 2 计划：
- [ ] 后端 API 开发（Node.js/Python/Go）
- [ ] 用户认证系统
- [ ] 数据库集成（PostgreSQL/MySQL/MongoDB）
- [ ] 数据导出功能（PDF/Markdown）
- [ ] 目标管理功能
- [ ] 数据可视化增强
- [ ] 移动端 App

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

---

**开始记录，持续成长** 🌱
