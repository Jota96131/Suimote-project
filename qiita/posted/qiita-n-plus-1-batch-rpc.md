---
status: posted
tags: Supabase, PostgreSQL, TypeScript, 個人開発, N+1問題
twitter: |
  SupabaseでN+1クエリ問題を踏んで、バッチRPC関数で解決した話を書きました。
  Promise.allで並列化しても、リクエスト数自体が問題だった。DB側で集計を完結させるのが最速。
  #Supabase #個人開発 #PostgreSQL
  [ここにQiitaのURLを貼る]
---

# 【Supabase】N+1クエリ問題をバッチRPC関数で解決した話

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
公開後にレビューをもらい、エリア内のユーザー一覧で**N+1クエリ問題がある**ことを指摘されました。
`Promise.all` で並列化しているから大丈夫だと思っていましたが、リクエスト数自体が問題でした。

---

## 問題

各ユーザーの統計を個別にRPC呼び出ししていました。

```ts
const withStats = await Promise.all(
  profiles.map(async (p) => {
    const [statsRes, monthlyRes] = await Promise.all([
      supabase.rpc("get_user_stats", { target_user_id: p.user_id }),
      supabase.rpc("get_monthly_practice_count", { target_user_id: p.user_id }),
    ]);
    return { ...p, stats: statsRes.data, monthlyCount: monthlyRes.data };
  })
);
```

| ユーザー数 | API呼び出し回数 |
|-----------|----------------|
| 10人 | 21回 |
| 50人 | 101回 |
| 100人 | 201回 |

---

## 解決方法

DB側にバッチRPC関数を作り、**1回の呼び出しで全ユーザーの統計をまとめて返す**ようにしました。

```sql
CREATE OR REPLACE FUNCTION get_area_users_with_stats(
  p_area_id UUID,
  p_exclude_user_id UUID
)
RETURNS JSON
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
  FROM (
    SELECT
      p.user_id, p.nickname, p.avatar_url,
      COALESCE(
        (SELECT json_build_object(
          'total_distance', COALESCE(SUM(pr.distance), 0),
          'total_count', COUNT(*)
        ) FROM practice_records pr WHERE pr.user_id = p.user_id),
        json_build_object('total_distance', 0, 'total_count', 0)
      ) AS stats,
      COALESCE(
        (SELECT COUNT(*)::integer
         FROM practice_records pr
         WHERE pr.user_id = p.user_id
           AND pr.date::text >= to_char(NOW(), 'YYYY-MM-01')),
        0
      ) AS "monthlyCount"
    FROM profiles p
    WHERE p.area_id = p_area_id
      AND p.matching_opt_in = true
      AND p.user_id != p_exclude_user_id
  ) t;
$$;
```

```ts
// フロントは1行で完了
const { data } = await supabase.rpc("get_area_users_with_stats", {
  p_area_id: profile.area_id,
  p_exclude_user_id: user.id,
});
```

何人いても**常に1回**のAPI呼び出しで済みます。

### なぜこの方法を選んだか

他にも選択肢はありました。

| 選択肢 | 採用 | 理由 |
|--------|------|------|
| バッチRPC関数 | ✅ | 1回の呼び出しで完結。集計もDB内で完了するので最速 |
| View | ❌ | 集計（SUM, COUNT）が入るので重い。パラメータ（`area_id`等）も渡せない |
| フロント側で結合 | ❌ | リクエストは2回に減るが、全ユーザーの練習記録を取得することになりデータ量が膨大 |
| Edge Function | ❌ | DB内で完結する処理をJSに持っていく必要がない。デプロイの手間も増える |

**「DBで完結する集計処理は、DBにやらせるのが一番効率的」** という判断です。

---

## 学んだこと

- 「ループの中でAPI呼び出し」を見たらN+1を疑う
- `Promise.all` で並列化しても、リクエスト数が多いこと自体が問題
- N+1問題はバックエンドだけでなくフロントエンドでも起きる
- DB側で集計を完結させるとリクエスト数もデータ量も減る
