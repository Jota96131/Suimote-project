　　　　# RPC関数（Remote Procedure Call）とは

データベース側にあらかじめ定義しておいた関数を、フロントエンドから名前を指定して呼び出す仕組み。Supabaseでは `supabase.rpc("関数名", { 引数 })` で使う。

## たとえ

レストランの「おまかせコース」。

- **RPC関数を使わない場合**：キッチン（DB）から食材を全部テーブルに運んでもらい、自分で料理する（フロントで集計）
- **RPC関数を使う場合**：「おまかせで！」と一言伝えるだけで、シェフ（DB）が調理して完成品を出してくれる

お客さん（フロント）は結果だけ受け取ればOK。

## 具体例

スイモテでは複数のRPC関数を使っている。

### ① 月間練習回数を取得する

```sql
-- マイグレーションファイルで関数を定義
CREATE FUNCTION get_monthly_practice_count(target_user_id UUID)
RETURNS INT AS $$
  SELECT COUNT(*) FROM practices
  WHERE user_id = target_user_id
    AND created_at >= date_trunc('month', NOW());
$$ LANGUAGE sql;
```

```ts
// フロントから呼び出し
const { data } = await supabase.rpc("get_monthly_practice_count", {
  target_user_id: userId,
});
```

### ② 相互いいね判定

```ts
const { data: isMutual } = await supabase.rpc("check_mutual_like", {
  target_user_id: toUserId,
});
```

### ③ ユーザーの統計情報取得

```ts
const { data } = await supabase.rpc("get_my_stats", {
  p_user_id: user.id,
});
```

## なぜ使うのか

| 使わない場合                              | 使う場合                                     |
| ----------------------------------------- | -------------------------------------------- |
| 全データを取得 → JSで集計（通信量が多い） | DB側で計算して結果だけ返す（通信量が少ない） |
| データが増えると遅くなる                  | データが増えてもDBが最適化してくれる         |
| `.from().select()` → JSで計算             | `.rpc("関数名", { 引数 })` の1行で完結       |
| ロジックがフロントに散らばる              | ロジックがDB側にまとまる                     |

## 一言まとめ

**データをそのまま取るなら `.select()`、計算してから取るなら `.rpc()`**。DB側で処理を完結させることで、フロントはシンプルに結果を受け取るだけで済む。
