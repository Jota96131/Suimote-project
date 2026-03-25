-- =============================================
-- 今月の練習回数を返すRPC関数
-- MVP6 通し確認で関数が存在しないことが判明し作成
-- 2026-03-25 実施済み（SQL Editor から実行）
-- =============================================

CREATE OR REPLACE FUNCTION get_monthly_practice_count(target_user_id UUID)
RETURNS INTEGER
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COUNT(*)::INTEGER
  FROM practice_records
  WHERE user_id = target_user_id
    AND date::text >= to_char(NOW(), 'YYYY-MM-01');
$$;
