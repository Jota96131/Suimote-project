-- =============================================
-- practice_records: SELECT ポリシー追加
-- 自分の記録のみ取得可能にし、全件取得を防止
-- =============================================

CREATE POLICY "Users can select own practice records"
  ON practice_records
  FOR SELECT
  USING (auth.uid() = user_id);
