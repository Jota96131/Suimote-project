---
status: posted
tags: Supabase, RLS, PostgreSQL, セキュリティ, 個人開発
twitter: |
  SupabaseのRLSでSELECTポリシーの設定漏れに気づけなかった理由と修正方法を書きました
  フロントが正常でもAPIレベルでは穴がある、という教訓
  #Supabase #個人開発 #セキュリティ
  [ここにQiitaのURLを貼る]
---

# 【Supabase】RLSのSELECTポリシーだけ抜けてて全データ丸見えだった話

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
公開後にレビューをもらい、**SELECTだけRLSポリシーが抜けている**ことを指摘されました。
「ちゃんと設定した」つもりだったので、かなり焦りました。

---

## 問題

DELETE・UPDATEには `auth.uid() = user_id` のポリシーを設定していたのに、SELECTだけ未設定でした。

```
DELETE ポリシー: auth.uid() = user_id ✅
UPDATE ポリシー: auth.uid() = user_id ✅
SELECT ポリシー: なし ❌
```

Supabaseの `anon key` はブラウザから見えるので、DevToolsから全ユーザーの練習記録を取得できてしまう状態でした。

フロントエンドでは自分のデータしか表示しない作りだったので、アプリは正常に動いており気づけませんでした。

---

## 解決方法

SELECTポリシーを追加しました。

```sql
CREATE POLICY "Users can select own practice records"
  ON practice_records
  FOR SELECT
  USING (auth.uid() = user_id);
```

---

## 学んだこと

- RLSは SELECT / INSERT / UPDATE / DELETE の**4つ全部**にポリシーが必要
- 「フロントが正常に動いている」と「APIレベルで安全」は別の話
- セキュリティ周りは特に、自分だけでは見落とす。人に見てもらうのが一番早い
