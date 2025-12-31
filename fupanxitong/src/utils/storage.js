// 数据管理工具 - 使用 localStorage 模拟数据存储

const STORAGE_KEYS = {
  REVIEWS: 'review_system_reviews',
  CHECKINS: 'review_system_checkins'
}

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2)
}

// 复盘记录管理
export const reviewsStorage = {
  // 获取所有复盘
  getAll() {
    const data = localStorage.getItem(STORAGE_KEYS.REVIEWS)
    return data ? JSON.parse(data) : []
  },

  // 根据ID获取单个复盘
  getById(id) {
    const reviews = this.getAll()
    return reviews.find(r => r.id === id)
  },

  // 创建复盘
  create(review) {
    const reviews = this.getAll()
    const newReview = {
      id: generateId(),
      title: review.title || '',
      content: review.content || '',
      type: review.type || 'daily',
      tags: review.tags || [],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    reviews.unshift(newReview)
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
    return newReview
  },

  // 更新复盘
  update(id, updates) {
    const reviews = this.getAll()
    const index = reviews.findIndex(r => r.id === id)
    if (index !== -1) {
      reviews[index] = {
        ...reviews[index],
        ...updates,
        updated_at: new Date().toISOString()
      }
      localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(reviews))
      return reviews[index]
    }
    return null
  },

  // 删除复盘
  delete(id) {
    const reviews = this.getAll()
    const filtered = reviews.filter(r => r.id !== id)
    localStorage.setItem(STORAGE_KEYS.REVIEWS, JSON.stringify(filtered))
    return true
  },

  // 搜索复盘
  search(query) {
    const reviews = this.getAll()
    const lowerQuery = query.toLowerCase()
    return reviews.filter(r =>
      r.title.toLowerCase().includes(lowerQuery) ||
      r.content.toLowerCase().includes(lowerQuery) ||
      r.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    )
  },

  // 按类型筛选
  filterByType(type) {
    const reviews = this.getAll()
    return type === 'all' ? reviews : reviews.filter(r => r.type === type)
  },

  // 按标签筛选
  filterByTags(tags) {
    const reviews = this.getAll()
    if (!tags || tags.length === 0) return reviews
    return reviews.filter(r =>
      tags.some(tag => r.tags.includes(tag))
    )
  }
}

// 打卡记录管理
export const checkinsStorage = {
  // 获取所有打卡记录
  getAll() {
    const data = localStorage.getItem(STORAGE_KEYS.CHECKINS)
    return data ? JSON.parse(data) : []
  },

  // 根据日期获取打卡
  getByDate(date) {
    const checkins = this.getAll()
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]
    return checkins.find(c => c.check_date === dateStr)
  },

  // 创建打卡
  create(checkin) {
    const checkins = this.getAll()
    const dateStr = checkin.check_date || new Date().toISOString().split('T')[0]

    // 检查是否已存在
    const existing = checkins.find(c => c.check_date === dateStr)
    if (existing) {
      return this.update(existing.id, checkin)
    }

    const newCheckin = {
      id: generateId(),
      check_date: dateStr,
      note: checkin.note || '',
      created_at: new Date().toISOString()
    }
    checkins.push(newCheckin)
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins))
    return newCheckin
  },

  // 更新打卡
  update(id, updates) {
    const checkins = this.getAll()
    const index = checkins.findIndex(c => c.id === id)
    if (index !== -1) {
      checkins[index] = {
        ...checkins[index],
        ...updates
      }
      localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(checkins))
      return checkins[index]
    }
    return null
  },

  // 删除打卡
  delete(id) {
    const checkins = this.getAll()
    const filtered = checkins.filter(c => c.id !== id)
    localStorage.setItem(STORAGE_KEYS.CHECKINS, JSON.stringify(filtered))
    return true
  },

  // 获取日期范围内的打卡
  getByDateRange(startDate, endDate) {
    const checkins = this.getAll()
    return checkins.filter(c => {
      const date = new Date(c.check_date)
      return date >= startDate && date <= endDate
    })
  },

  // 计算连续打卡天数
  getStreakDays() {
    const checkins = this.getAll()
    if (checkins.length === 0) return 0

    const dates = checkins
      .map(c => new Date(c.check_date))
      .sort((a, b) => b - a) // 降序排列

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let currentDate = new Date(today)

    for (const date of dates) {
      const checkDate = new Date(date)
      checkDate.setHours(0, 0, 0, 0)

      if (checkDate.getTime() === currentDate.getTime()) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (checkDate < currentDate) {
        break
      }
    }

    return streak
  }
}

// 初始化示例数据
export function initializeSampleData() {
  // 检查是否已有数据
  if (reviewsStorage.getAll().length > 0) return

  // 创建示例复盘
  const sampleReviews = [
    {
      title: '2025年1月第一周复盘',
      content: `## 本周完成的事情
- 完成了项目需求文档的编写
- 学习了Vue 3组合式API
- 进行了3次晨跑锻炼

## 遇到的问题
- 时间管理不够合理，经常工作到很晚
- 部分功能实现遇到技术难点

## 解决方案
- 使用番茄工作法提高专注度
- 查阅官方文档和技术社区寻求帮助

## 收获与反思
学会了更高效的学习方法，认识到持续学习的重要性。

## 下一步计划
- 完成系统核心功能开发
- 保持每周至少3次运动
- 阅读2本技术书籍`,
      type: 'weekly',
      tags: ['工作', '学习', '运动']
    },
    {
      title: '今日复盘 - 2025-01-15',
      content: `## 今日完成
- 完成了首页UI设计
- 修复了3个bug
- 学习了TailwindCSS

## 问题与反思
今天效率较高，但下午有些分心。明天需要更专注。

## 明日计划
- 实现数据可视化功能
- 代码review`,
      type: 'daily',
      tags: ['工作', '学习']
    }
  ]

  sampleReviews.forEach(review => reviewsStorage.create(review))

  // 创建示例打卡
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    checkinsStorage.create({
      check_date: date.toISOString().split('T')[0],
      note: i === 0 ? '今天状态很好！' : ''
    })
  }
}
