# Supabaseでアバター画像の保存先がなくて困った話

## はじめに

個人開発で水泳の練習記録アプリを作っています。
プロフィールにアイコン画像を設定しようとしたら、画像ファイルの置き場所がなくて詰まりました。

## 問題

DBの `profiles` テーブルには `avatar_url` 列がありますが、これはURLを保存するだけです。
画像ファイル本体を置く場所がありませんでした。

## 解決方法

Supabase Storageにアバター専用のバケットを作成しました。

**ダッシュボードの Storage → New bucket で以下を設定：**

| 項目 | 設定値 |
|---|---|
| Bucket name | `avatars` |
| Public bucket | ON |
| File size limit | 1MB |
| Allowed MIME types | `image/png, image/jpeg, image/webp` |

**RLSポリシーも設定：**

他人のアバターを勝手に差し替えられないように、SQL Editorで以下を実行しました。
ファイルは `avatars/{user_id}/avatar.png` のパスで保存する想定です。

```sql
CREATE POLICY "Users can upload own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view avatars"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
```

## 終わりに

画像ファイル本体はSupabase Storage、URLだけDBに保存する構成にしました。
Public bucketにするとURLで直接 `<img>` 表示できるので便利です。
