-- ============================================
-- 复盘系统数据库表结构
-- 在 Supabase SQL Editor 中执行此文件
-- ============================================

-- 1. 创建 reviews 表（复盘记录）
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  content TEXT NOT NULL DEFAULT '',
  type TEXT NOT NULL CHECK (type IN ('daily', 'weekly', 'monthly')),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 为 reviews 表创建索引
CREATE INDEX IF NOT EXISTS reviews_user_id_idx ON public.reviews(user_id);
CREATE INDEX IF NOT EXISTS reviews_created_at_idx ON public.reviews(created_at DESC);
CREATE INDEX IF NOT EXISTS reviews_type_idx ON public.reviews(type);

-- 为 reviews 表添加自动更新 updated_at 的触发器
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reviews_updated_at
  BEFORE UPDATE ON public.reviews
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 2. 创建 check_ins 表（打卡记录）
CREATE TABLE IF NOT EXISTS public.check_ins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  note TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- 确保每个用户每天只能有一条打卡记录
  UNIQUE(user_id, check_date)
);

-- 为 check_ins 表创建索引
CREATE INDEX IF NOT EXISTS check_ins_user_id_idx ON public.check_ins(user_id);
CREATE INDEX IF NOT EXISTS check_ins_check_date_idx ON public.check_ins(check_date DESC);
CREATE INDEX IF NOT EXISTS check_ins_user_date_idx ON public.check_ins(user_id, check_date);

-- ============================================
-- 执行完成后，请继续执行 rls-policies.sql
-- ============================================
