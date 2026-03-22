# "Cannot coerce the result to a single JSON object" の解決方法

## はじめに

個人開発で水泳の練習記録アプリを作っています。
プロフィール画面を開くとエラーでページが表示されない問題があり、原因を調べたので共有します。

## 事象

プロフィール画面にアクセスすると、以下のエラーが出ました。

```
Cannot coerce the result to a single JSON object
```

エラーが出ていたコードはこちらです。

```typescript
const { data, error } = await supabase
  .from("profiles")
  .select("*, areas(id, name)")
  .eq("user_id", user.id)
  .single();
```

## 原因

`.single()` は結果がちょうど1件のときだけ成功します。0件でもエラーになります。

| 結果の件数 | .single() の挙動 |
|---|---|
| 1件 | 成功 |
| 0件 | エラー |
| 2件以上 | エラー |

私の場合は、新規ユーザーがプロフィール画面を開いたとき、profiles にレコードがまだ存在しない（0件）ため `.single()` がエラーを投げていました。

## 解決方法

`.single()` を `.maybeSingle()` に変更しました。

```typescript
const { data, error } = await supabase
  .from("profiles")
  .select("*, areas(id, name)")
  .eq("user_id", user.id)
  .maybeSingle();
```

`.maybeSingle()` は0件の場合にエラーではなく `null` を返します。

| 結果の件数 | .maybeSingle() の挙動 |
|---|---|
| 1件 | 成功。オブジェクトを返す |
| 0件 | 成功。data が null |
| 2件以上 | エラー |

あとは `data` が `null` かどうかで「プロフィール未作成」を判定できます。

## 終わりに

`.single()` は「必ず1件ある」と確信できるときに使い、「0件の可能性がある」なら `.maybeSingle()` を使うのが安全です。新規ユーザーのフローを考えると、プロフィール取得のように「まだレコードがないかもしれない」クエリでは `.maybeSingle()` を選ぶべきでした。
