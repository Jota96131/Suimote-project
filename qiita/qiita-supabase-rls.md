# SupabaseでデータをINSERTしたのに取得できなかった話

## はじめに

個人開発で水泳の練習記録アプリを作っています。
Supabaseのテーブルにデータを入れたのに、画面には「練習記録がありません」と表示されました。
原因はRLS（Row Level Security）でした。

## 問題

### その1：JOINするテーブルが存在しなかった

コードに `facilities` テーブルをJOINする処理を書いていましたが、実際のDBには `facilities` テーブルがありませんでした。

```
Could not find a relationship between 'practice_records' and 'facilities' in the schema cache
```

実際のDBには `facility`（テキスト列）があるだけだったので、JOINをやめてシンプルに取得するように修正しました。

```ts
// ❌ 修正前
.select("*, facilities(*)")

// ✅ 修正後
.select("*")
```

### その2：RLSがデータを全ブロックしていた

JOINのエラーを直しても、データが0件のまま。
Supabaseのポリシー画面を見るとこう書いてありました。

> no RLS policies exist so no data will be returned.

**RLS（Row Level Security）が有効なのに、ポリシーが1つもない状態でした。**

SupabaseはデフォルトでRLSが有効です。
RLSが有効でポリシーが0件の場合、全データがブロックされて何も返ってきません。

```
RLS有効 + ポリシーなし → データが全部ブロック（0件）✅ 今回これ
RLS有効 + ポリシーあり → ポリシーに合う行だけ返ってくる
RLS無効             → 全データが返ってくる
```

## 解決方法

開発中なので **Disable RLS** を押して無効化しました。
これだけでデータが表示されました。

本番環境でポリシーを設定する場合は、ダッシュボードの **Create policy** から設定できます。

## 終わりに

「データを入れたのに0件」という症状はエラーメッセージが出ないので気づきにくいです。
Supabaseでデータが取れないときはRLSを確認してみてください。
