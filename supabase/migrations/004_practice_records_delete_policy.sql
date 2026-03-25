-- =============================================
-- practice_records の DELETE ポリシー追加
-- 自分の練習記録のみ削除可能にする
-- 2026-03-25 実施済み（Dashboard から SQL Editor で実行）
-- =============================================

CREATE POLICY "Users can delete own practice records"
  ON practice_records
  FOR DELETE
  USING (auth.uid() = user_id);
