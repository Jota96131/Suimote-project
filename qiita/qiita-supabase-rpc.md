# 【Supabase】RPCとは？サーバーに計算をお願いする仕組み

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
プロフィール画面に「累計距離」と「累計回数」を表示する必要がありました。

このとき使ったのがSupabaseの **RPC（Remote Procedure Call）** です。
ひとことで言うと、**サーバーに計算をお願いして、結果だけ受け取る仕組み** です。

---

## 問題：フロントで集計すると遅くなる

練習記録を全件取得して、JavaScript側で合計する方法もあります。

```ts
const { data } = await supabase.from("practice_records").select("*");
const totalDistance = data.reduce((sum, r) => sum + r.distance, 0);
const totalCount = data.length;
```

これでも動きますが、データが1000件、1万件に増えると **全件をダウンロードしてから計算する** ことになり、遅くなります。

欲しいのは合計の数字2つだけなのに、全データを通信するのは無駄です。

---

## 解決：RPCでサーバー側に計算させる

### 1. SQLの関数を作る

SupabaseのSQLエディタで関数を作成します。

```sql
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
```

サーバー側で `SUM` と `COUNT` を計算し、結果のJSONだけ返します。

### 2. フロントから呼ぶ

```ts
const { data } = await supabase.rpc("get_my_stats", {
  p_user_id: "ユーザーのID",
});
// → { total_distance: 50000, total_count: 30 }
```

通信量は数字2つだけ。全件取得と比べて圧倒的に速いです。

| | フロントで集計 | RPC |
|---|---|---|
| 通信量 | 全レコード分 | 結果の数字だけ |
| 速度 | データが増えると遅くなる | データが増えても速い |
| 書き方 | `.from().select()` → JS で集計 | `.rpc("関数名", { 引数 })` |

---

## おわりに

**データをそのまま取るなら `.select()`、計算してから取るなら `.rpc()`** と覚えておけばOKです。

この記事が参考になれば幸いです！
