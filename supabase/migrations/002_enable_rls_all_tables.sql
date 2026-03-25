-- =============================================
-- 全テーブルの RLS 有効化
-- MVP6 通し確認で RLS が無効だったテーブルを修正
-- 2026-03-25 実施済み（Dashboard から Enable RLS 実行）
-- =============================================

-- practice_records: もともと RLS が無効だった
ALTER TABLE practice_records ENABLE ROW LEVEL SECURITY;

-- likes: RLS を有効化
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- profiles: RLS を有効化（念のため）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- areas: RLS を有効化（念のため）
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
