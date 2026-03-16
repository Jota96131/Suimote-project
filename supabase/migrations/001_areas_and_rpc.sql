-- =============================================
-- areas マスタテーブル作成 & データ投入
-- =============================================
CREATE TABLE IF NOT EXISTS areas (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE
);

ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
CREATE POLICY "areas_read_all" ON areas FOR SELECT USING (true);

INSERT INTO areas (name) VALUES
  ('渋谷・新宿'),
  ('池袋・板橋'),
  ('品川・大田'),
  ('世田谷・目黒'),
  ('中央・千代田・港'),
  ('江東・墨田・台東'),
  ('杉並・中野・練馬'),
  ('足立・葛飾・江戸川'),
  ('北・荒川・豊島'),
  ('多摩北部'),
  ('多摩南部'),
  ('多摩西部');

-- =============================================
-- profiles テーブルに area_id FK追加（テーブル作成済みの前提）
-- 既に area_id カラムがあればスキップ
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'area_id'
  ) THEN
    ALTER TABLE profiles ADD COLUMN area_id UUID REFERENCES areas(id);
  END IF;
END $$;

-- =============================================
-- 累計記録を返す RPC関数
-- =============================================
CREATE OR REPLACE FUNCTION get_my_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT json_build_object(
    'total_distance', COALESCE(SUM(distance), 0),
    'total_count',    COUNT(*)
  )
  FROM practice_records
  WHERE user_id = p_user_id;
$$;
