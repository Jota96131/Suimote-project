# REST APIとは

クライアント（アプリ）とサーバー間でデータをやり取りするためのルール。URL（エンドポイント）とHTTPメソッド（GET・POST・PATCH・DELETEなど）の組み合わせで「何を・どうするか」を表現する。

## たとえ

レストランの注文。

- **GET**：「メニューを見せてください」→ 料理の一覧を見る（データ取得）
- **POST**：「カレーを1つ注文します」→ 新しい注文が入る（データ作成）
- **PATCH**：「やっぱりソース少なめにしてください」→ 注文の一部だけ変える（データ更新）
- **DELETE**：「注文をキャンセルします」→ 注文がなくなる（データ削除）

店員さん（サーバー）は決まった注文の受け方で対応するので、誰が来ても同じ手順でスムーズに注文できる。

## 具体例

SupabaseではREST APIが自動生成される。`supabase-js`はこのREST APIを内部で呼んでいる。

### ① データ取得（GET）

```ts
// スイモテ：プロフィール一覧を取得
const { data } = await supabase
  .from("profiles")
  .select("*")
// 内部的には GET /rest/v1/profiles が呼ばれている
```

### ② データ作成（POST）

```ts
// スイモテ：新しい練習記録を追加
const { data } = await supabase
  .from("practices")
  .insert({ user_id: userId, instrument: "guitar", duration: 30 })
// 内部的には POST /rest/v1/practices が呼ばれている
```

### ③ データ更新（PATCH）

```ts
// スイモテ：プロフィールを編集
const { data } = await supabase
  .from("profiles")
  .update({ display_name: "新しい名前" })
  .eq("id", userId)
// 内部的には PATCH /rest/v1/profiles?id=eq.xxx が呼ばれている
```

### ④ データ削除（DELETE）

```ts
// スイモテ：いいねを取り消す
const { data } = await supabase
  .from("likes")
  .delete()
  .eq("id", likeId)
// 内部的には DELETE /rest/v1/likes?id=eq.xxx が呼ばれている
```

## REST APIとRPC関数の使い分け

| やりたいこと | 使うもの | 例 |
|---|---|---|
| テーブルのCRUD（作成・取得・更新・削除） | REST API（`.from().select()` など） | プロフィール取得、いいね追加 |
| DB側で計算・集計してから返す | RPC関数（`.rpc()`） | 月間練習回数、相互いいね判定 |

## なぜ使うのか

| 使わない場合 | 使う場合 |
|---|---|
| サーバーとの通信方法がバラバラ | URL + HTTPメソッドで統一されたルール |
| 「何をするAPI？」がわかりにくい | `GET /profiles` → 見ただけで「プロフィール取得」とわかる |
| 独自プロトコルの学習コストが高い | HTTPの知識があれば誰でも使える |
| ツール（Postmanなど）で試しにくい | URLを叩くだけでテストできる |

## 一言まとめ

REST APIは「URL + HTTPメソッド（GET/POST/PATCH/DELETE）」でデータ操作を表現するルール。Supabaseでは `.from().select()` などが内部でREST APIを呼んでいる。
