# "new row violates row-level security policy for table" の解決方法

## はじめに

個人開発で水泳の練習記録アプリを作っています。
プロフィール編集画面で「保存する」を押したらRLSエラーで保存できず、原因を調べたので共有します。

## 事象

プロフィールを初めて保存しようとすると、以下のエラーが出ました。

```
new row violates row-level security policy for table "profiles"
```

2回目以降の保存（更新）では発生せず、初回のみ発生します。

## 原因

RLSポリシーの設定が不完全でした。

私の場合は、SELECT と UPDATE のポリシーは設定していましたが、INSERT のポリシーを設定していませんでした。

プロフィール保存には `upsert` を使っています。

```typescript
await supabase
  .from("profiles")
  .upsert({
    user_id: user.id,
    nickname,
    area_id: areaId,
  });
```

`upsert` は「レコードがあれば UPDATE、なければ INSERT」です。初回保存時はレコードが存在しないため INSERT が実行されますが、INSERT ポリシーがないため RLS に拒否されていました。

## 解決方法

SQL Editor で INSERT ポリシーを追加しました。

```sql
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

`WITH CHECK (auth.uid() = user_id)` により、自分の `user_id` でしか INSERT できません。

最終的な profiles のポリシー一覧は以下のとおりです。

| 操作 | ポリシー名 | 条件 |
|---|---|---|
| SELECT | Users can view own or opt-in profiles | `auth.uid() = user_id OR matching_opt_in = true` |
| INSERT | Users can insert own profile | `auth.uid() = user_id` |
| UPDATE | Users can update own profile | `auth.uid() = user_id` |

## 終わりに

`upsert` を使う場合は UPDATE だけでなく INSERT のポリシーも必要です。RLS を有効にすると、ポリシーのない操作はすべて拒否されるので、SELECT・INSERT・UPDATE・DELETE のどれが必要かを事前に洗い出しておくのが大事だと感じました。
