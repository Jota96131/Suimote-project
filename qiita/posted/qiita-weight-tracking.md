---
status: posted
tags: Supabase, React, TypeScript, 個人開発, PostgreSQL
twitter: |
  水泳記録アプリに体重記録機能を追加した話を書きました。
  upsertで「同じ日は上書き」を実現、RLSで他人のデータを見せない設計です。
  #Supabase #React #個人開発
  [ここにQiitaのURLを貼る]
---

# 【Supabase】体重記録機能をupsert+RLSで実装した話

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」をリリースしました。
リリース後に体重を記録することができれば**モチベーション**が上がるなと感じ、体重記録機能を追加しました。

---

## デモ
![2026-04-159.49.04-ezgif.com-video-to-gif-converter.gif](https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/1a0c655e-2a1e-45e2-95a5-aa9abe702f44.gif)

## 設計方針

### やりたいこと

1. 日付と体重を記録する
2. 同じ日に再入力したら上書きする（1日1レコード）
3. 体重の推移を折れ線グラフで見る
4. 他のユーザーの体重は見えない

### テーブル設計

```sql
CREATE TABLE weight_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  date TEXT NOT NULL,
  weight NUMERIC(5,1) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, date)
);
```

ポイントは `UNIQUE(user_id, date)` です。同じユーザーが同じ日に2つの記録を作れないようにしています。これが後述する `upsert` の前提になります。

### RLS（行レベルセキュリティ）

```sql
ALTER TABLE weight_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own weight records"
  ON weight_records FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

`auth.uid() = user_id` — ログイン中のユーザーのIDと、レコードの `user_id` が一致する場合だけ読み書きできます。体重は個人情報なので、他人には一切見えません。

---

## upsert: 同じ日なら上書き

```ts
const { error } = await supabase
  .from("weight_records")
  .upsert(
    { user_id: user.id, date, weight },
    { onConflict: "user_id,date" }
  );
```

`upsert` は **insert + update** の造語です。

| 状況 | 動作 |
|---|---|
| その日の記録がない | 新しいレコードを作成（INSERT） |
| その日の記録がある | 既存のレコードを上書き（UPDATE） |

判定基準は `onConflict: "user_id,date"` で指定したユニーク制約です。この組み合わせが既に存在するかどうかで INSERT/UPDATE が自動で切り替わります。

### なぜupsertを選んだか

| 方法 | メリット | デメリット |
|---|---|---|
| INSERT + 重複チェック | シンプル | 2回クエリが必要 |
| upsert | 1回で完結 | ユニーク制約が必要 |
| フロント側で分岐 | DB依存なし | ロジックが分散する |

「1日1レコード」は明確なルールなので、DB側のユニーク制約 + upsertが最適でした。

---

## 編集機能の実装

体重の記録一覧から、鉛筆アイコンをタップすると編集モードになります。

```tsx
function handleEdit(record: WeightRecord) {
  setDate(record.date);
  setWeight(String(record.weight));
  setEditingId(record.id);
  window.scrollTo({ top: 0, behavior: "smooth" });
}
```

やっていることはシンプルで、**フォームに既存の値をセットしているだけ**です。保存時は同じ `addWeight`（upsert）を呼ぶので、日付が同じなら上書き、別の日付なら新規作成になります。

新規作成と編集で処理を分ける必要がないのは、upsertのおかげです。

---

## 体重グラフ

rechartsの `LineChart` で体重の推移を折れ線グラフで表示しています。

```tsx
<LineChart data={data}>
  <XAxis dataKey="date" />
  <YAxis domain={[minW, maxW]} unit="kg" />
  <Line type="monotone" dataKey="weight" stroke="#7B61FF" />
</LineChart>
```

Y軸の範囲は、記録された体重の最小値-2 〜 最大値+2 に設定しています。固定値（0〜100kg）にすると変化が見えなくなるためです。

---

## まとめ

| やったこと | 方法 |
|---|---|
| 1日1レコード | `UNIQUE(user_id, date)` + `upsert` |
| 他人に見せない | RLS: `auth.uid() = user_id` |
| 新規/更新の切り替え | upsertが自動判定 |
| グラフ表示 | rechartsの `LineChart` |

upsertを使えば「あるなら上書き、なければ作成」が1行で済みます。同じパターンは体重以外にも、日記・食事記録・歩数など「1日1レコード」系の機能で使えるはずです。
この記事が参考になったと思ったらいいね！ください🔥
励みになります✨

---
