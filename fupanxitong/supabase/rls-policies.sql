-- ============================================
-- Row Level Security (RLS) 策略
-- 在 Supabase SQL Editor 中执行此文件
-- 请确保已先执行 create-tables.sql
-- ============================================

-- 1. 启用 RLS
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_ins ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Reviews 表的 RLS 策略
-- ============================================

-- 允许用户查看自己的复盘记录
CREATE POLICY "Users can view their own reviews"
  ON public.reviews
  FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户创建自己的复盘记录
CREATE POLICY "Users can create their own reviews"
  ON public.reviews
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的复盘记录
CREATE POLICY "Users can update their own reviews"
  ON public.reviews
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的复盘记录
CREATE POLICY "Users can delete their own reviews"
  ON public.reviews
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- Check-ins 表的 RLS 策略
-- ============================================

-- 允许用户查看自己的打卡记录
CREATE POLICY "Users can view their own check-ins"
  ON public.check_ins
  FOR SELECT
  USING (auth.uid() = user_id);

-- 允许用户创建自己的打卡记录
CREATE POLICY "Users can create their own check-ins"
  ON public.check_ins
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的打卡记录
CREATE POLICY "Users can update their own check-ins"
  ON public.check_ins
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 允许用户删除自己的打卡记录
CREATE POLICY "Users can delete their own check-ins"
  ON public.check_ins
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- RLS 策略配置完成！
-- 现在每个用户只能访问和操作自己的数据
-- ============================================
