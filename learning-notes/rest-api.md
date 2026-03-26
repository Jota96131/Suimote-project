# REST APIとは

クライアント（アプリ）とサーバー間でデータをやり取りするためのルール。URL（エンドポイント）とHTTPメソッド（GET・POST・PATCH・DELETEなど）の組み合わせで「何を・どうするか」を表現する。

## たとえ

図書館の窓口。

- **GET**：「この本を見せてください」→ 本を見せてもらう（データ取得）
- **POST**：「この本を新しく寄贈します」→ 本が増える（データ作成）
- **PATCH**：「この本のタイトルを修正してください」→ 一部だけ直す（データ更新）
- **DELETE**：「この本を処分してください」→ 本がなくなる（データ削除）

窓口の人（サーバー）は決まったルールで受け付けるので、誰が来ても同じ手順で対応できる。

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
