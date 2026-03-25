-- =============================================
-- practice_records の UPDATE ポリシー追加
-- 自分の記録のみ更新可能
-- =============================================

CREATE POLICY "自分の記録のみ更新可能"
  ON practice_records
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
