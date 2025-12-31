import { supabase } from './supabaseClient'
import { user } from './auth'

// ============================================
// 复盘记录服务
// ============================================

export const reviewsService = {
  // 获取所有复盘
  async getAll() {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据ID获取单个复盘
  async getById(id) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  },

  // 创建复盘
  async create(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: user.value.id,
          title: review.title || '',
          content: review.content || '',
          type: review.type || 'daily',
          tags: review.tags || []
        }
      ])
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新复盘
  async update(id, updates) {
    const { data, error} = await supabase
      .from('reviews')
      .update({
        title: updates.title,
        content: updates.content,
        type: updates.type,
        tags: updates.tags
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除复盘
  async delete(id) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // 搜索复盘
  async search(query) {
    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .or(`title.ilike.%${query}%,content.ilike.%${query}%`)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 按类型筛选
  async filterByType(type) {
    if (type === 'all') {
      return this.getAll()
    }

    const { data, error } = await supabase
      .from('reviews')
      .select('*')
      .eq('type', type)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  }
}

// ============================================
// 打卡记录服务
// ============================================

export const checkinsService = {
  // 获取所有打卡记录
  async getAll() {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .order('check_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 根据日期获取打卡
  async getByDate(date) {
    const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .eq('check_date', dateStr)
      .maybeSingle()

    if (error) throw error
    return data
  },

  // 创建或更新打卡（使用 upsert）
  async upsert(checkin) {
    const dateStr = checkin.check_date || new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('check_ins')
      .upsert({
        user_id: user.value.id,
        check_date: dateStr,
        note: checkin.note || ''
      }, {
        onConflict: 'user_id,check_date'
      })
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 更新打卡
  async update(id, updates) {
    const { data, error } = await supabase
      .from('check_ins')
      .update({
        note: updates.note
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data
  },

  // 删除打卡
  async delete(id) {
    const { error } = await supabase
      .from('check_ins')
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  },

  // 获取日期范围内的打卡
  async getByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('check_ins')
      .select('*')
      .gte('check_date', startDate)
      .lte('check_date', endDate)
      .order('check_date', { ascending: false })

    if (error) throw error
    return data || []
  },

  // 计算连续打卡天数
  async getStreakDays() {
    try {
      const checkins = await this.getAll()

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
    } catch (error) {
      console.error('计算连续打卡天数失败:', error)
      return 0
    }
  }
}
