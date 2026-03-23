# Supabaseの update と upsert の違いをわかりやすく解説

## はじめに

個人開発でプロフィール保存機能を作っているとき、`update` と `upsert` のどちらを使うべきか迷いました。
実際に使い分けた経験をもとに、違いをまとめます。

## update とは

既存のレコードを書き換えます。レコードがなければ何も起きません。

```typescript
const { error } = await supabase
  .from("profiles")
  .update({ nickname: "たろう" })
  .eq("user_id", userId);
```

- レコードがある → 更新される
- レコードがない → 何も起きない（エラーにもならない）

## upsert とは

レコードがあれば更新、なければ新規作成します。
**up**date + in**sert** = **upsert** です。

```typescript
const { error } = await supabase
  .from("profiles")
  .upsert({
    user_id: userId,
    nickname: "たろう",
  });
```

- レコードがある → 更新される
- レコードがない → 新しく作られる

## 比較表

| | update | upsert |
|---|---|---|
| レコードがある場合 | 更新 | 更新 |
| レコードがない場合 | 何もしない | 新規作成 |
| 主キーの指定 | `.eq()` で条件指定 | データに主キーを含める |
| 用途 | 確実にレコードがある場合 | あるかわからない場合 |

## どっちを使うべき？

**迷ったら `upsert` が安全です。**

例えばプロフィール編集画面で、ユーザー登録直後にプロフィールがまだ作られていないケースがあると、`update` では保存に失敗します。
`upsert` なら「あれば更新、なければ作成」してくれるので、どちらのケースでも動きます。

## 注意点

`upsert` を使うときは、主キーまたはユニーク制約のあるカラムをデータに含める必要があります。
Supabaseはこのカラムを見て「既存レコードがあるか」を判断します。

```typescript
// user_id にユニーク制約がある前提
await supabase.from("profiles").upsert({
  user_id: userId,  // ← これが判定に使われる
  nickname: "たろう",
});
```

## 終わりに

`update` と `upsert` は一文字違いですが、レコードがないときの挙動がまったく異なります。
プロフィールのように「あるかないかわからない」データを扱うときは `upsert` を選んでおくと安心です。
