# 【初心者向け】REST APIを「レストランの注文」で理解する【Supabase実例付き】

## はじめに

REST APIって最初に聞くと「何それ怖い」ってなりますよね。

僕も個人開発で水泳×マッチングアプリ「スイモテ」を作るまで、ちゃんと理解できていませんでした。でも「レストランの注文」に置き換えたら一気に腹落ちしたので、同じように悩んでいる方に向けて書きます。

---

## REST APIとは

**クライアント（アプリ）とサーバー間でデータをやり取りするためのルール**です。

URL（エンドポイント）とHTTPメソッド（GET・POST・PATCH・DELETEなど）の組み合わせで「何を・どうするか」を表現します。

---

## レストランで理解するREST API

レストランに行ったとき、注文の仕方って決まってますよね。REST APIもそれと同じです。

| HTTPメソッド | レストランで言うと | やること |
|---|---|---|
| **GET** | 「メニューを<br>見せてください」 | 料理の一覧を見る<br>（データ取得） |
| **POST** | 「カレーを1つ<br>注文します」 | 新しい注文が入る<br>（データ作成） |
| **PATCH** | 「やっぱりソース<br>少なめにしてください」 | 注文の一部だけ変える<br>（データ更新） |
| **DELETE** | 「注文を<br>キャンセルします」 | 注文がなくなる<br>（データ削除） |

店員さん（サーバー）は決まった注文の受け方で対応するので、**誰が来ても同じ手順でスムーズに注文できる**。これがREST APIの本質です。

---

## Supabaseでの実例（スイモテの場合）

SupabaseではREST APIが自動生成されます。`supabase-js`はこのREST APIを内部で呼んでいます。

### ① データ取得（GET）＝「メニュー見せて」

```ts
// プロフィール一覧を取得
const { data } = await supabase
  .from("profiles")
  .select("*")
// 内部的には GET /rest/v1/profiles が呼ばれている
```

### ② データ作成（POST）＝「注文します」

```ts
// 新しい練習記録を追加
const { data } = await supabase
  .from("practices")
  .insert({ user_id: userId, instrument: "guitar", duration: 30 })
// 内部的には POST /rest/v1/practices が呼ばれている
```

### ③ データ更新（PATCH）＝「注文を変更して」

```ts
// プロフィールを編集
const { data } = await supabase
  .from("profiles")
  .update({ display_name: "新しい名前" })
  .eq("id", userId)
// 内部的には PATCH /rest/v1/profiles?id=eq.xxx が呼ばれている
```

### ④ データ削除（DELETE）＝「キャンセルで」

```ts
// いいねを取り消す
const { data } = await supabase
  .from("likes")
  .delete()
  .eq("id", likeId)
// 内部的には DELETE /rest/v1/likes?id=eq.xxx が呼ばれている
```

---

## REST APIとRPC関数の使い分け

| やりたいこと | 使うもの | 例 |
|---|---|---|
| テーブルのCRUD（作成・取得・更新・削除） | REST API（`.from().select()` など） | プロフィール取得、いいね追加 |
| DB側で計算・集計してから返す | RPC関数（`.rpc()`） | 月間練習回数、相互いいね判定 |

レストランで言うと：
- **REST API** → 「カレーください」（メニューにあるものをそのまま注文）
- **RPC関数** → 「おまかせコースで」（シェフに調理をお任せして完成品をもらう）

---

## なぜREST APIを使うのか

| 使わない場合 | 使う場合 |
|---|---|
| サーバーとの通信方法がバラバラ | URL + HTTPメソッドで統一されたルール |
| 「何をするAPI？」がわかりにくい | `GET /profiles` → 見ただけで「プロフィール取得」とわかる |
| 独自プロトコルの学習コストが高い | HTTPの知識があれば誰でも使える |
| ツール（Postmanなど）で試しにくい | URLを叩くだけでテストできる |

---

## まとめ

REST APIは **「URL + HTTPメソッド（GET/POST/PATCH/DELETE）」でデータ操作を表現するルール** です。

レストランの注文と同じで、決まった頼み方があるから誰でもスムーズに使える。Supabaseでは `.from().select()` などが内部でREST APIを呼んでいるので、意識しなくても使えますが、仕組みを知っておくとデバッグや設計で役立ちます。

---

この記事が参考になったらLGTMお願いします！
