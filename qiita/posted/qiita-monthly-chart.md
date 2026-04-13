---
status: posted
tags: React, recharts, Supabase, 個人開発, TypeScript
twitter: |
  練習記録の日数を月別の棒グラフで可視化した話を書きました。
  rechartsを使えば30行でグラフが描けます。
  #React #recharts #個人開発
  [ここにQiitaのURLを貼る]
---

# 【React×recharts】練習日数を月別グラフで可視化した話

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」をリリースしました。
リリース後に「こんな機能があったらユーザーは喜ぶんじゃないか」と感じたのが、練習日数の可視化です。練習記録は一覧で確認できますが、「先月何日泳いだ？最近サボってない？」が一覧だとわかりにくい。

**月別の練習日数を棒グラフで可視化** することにしました。

---

## Before / After

| Before（一覧のみ） | After（月別グラフ追加） |
|---|---|
| <img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/3da6df25-cfa1-44c3-ac69-f07bf1ce5b6f.png" width="300" /> | <img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/4a06faf6-9e4b-4b94-b5f6-74337543d215.png" width="300" /> |

---

## 実装

### 1. Supabaseから日付データを取得するhook

```ts
// useMonthlyHistory.ts
const { data } = await supabase
  .from("practice_records")
  .select("date")
  .gte("date", fromDate)       // 6ヶ月前から
  .order("date", { ascending: true });
```

ポイント：取得するのは `date` カラムだけ。グラフを描くために必要な情報は「いつ泳いだか」だけなので、距離やタイムは不要です。

### 2. 月ごとにユニーク日数を集計

```ts
const monthMap = new Map<string, Set<string>>();

for (const row of data) {
  const month = row.date.slice(0, 7); // "2024-03" のような形式
  monthMap.get(month)?.add(row.date);
}
```

同じ日に2回泳いでも「1日」とカウントしたいので、`Set` を使ってユニーク日数を数えています。

### 3. rechartsで棒グラフを描画

```tsx
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

<ResponsiveContainer width="100%" height={180}>
  <BarChart data={data}>
    <XAxis dataKey="month" />
    <YAxis allowDecimals={false} />
    <Tooltip />
    <Bar dataKey="days" fill="#00D4FF" radius={[6, 6, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

rechartsを選んだ理由：

| ライブラリ | 特徴 | 採用 |
|---|---|---|
| recharts | React向け。宣言的に書ける。軽い | ✅ |
| Chart.js | canvas描画。Reactとの相性がイマイチ | ❌ |
| D3.js | 自由度が高いが学習コストも高い | ❌ |

個人開発で「棒グラフ1つ描きたい」程度なら、rechartsが最もシンプルです。

---

## データがない月も表示する

6ヶ月分の枠を先に作っておくことで、練習しなかった月も「0日」として表示されます。

```ts
for (let i = 0; i < 6; i++) {
  const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
  const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  monthMap.set(key, new Set());
}
```

これがないと「泳いだ月だけグラフに出る」ことになり、サボった月が見えなくなります。**サボりを可視化するのがグラフの価値**なので、0日の月も含めるのが大事です。

---

## まとめ

| やったこと | 方法 |
|---|---|
| 日付データだけ取得 | `.select("date")` でカラム絞り込み |
| ユニーク日数の集計 | `Set` で同じ日の重複を除去 |
| グラフ描画 | rechartsの `BarChart` |
| 0日の月も表示 | 6ヶ月分の枠を先に作る |

「記録を続けるモチベーション」を作るには、**データの見せ方を変えるだけで十分**。グラフ1つで「今月もっと泳ごう」と思えます。
この記事が参考になれば幸いです！
