# "Key columns are of incompatible types: bigint and uuid" の解決方法

## はじめに

個人開発で水泳の練習記録アプリを作っています。
プロフィールに「所属エリア」を追加する際、外部キー制約が張れないエラーにハマったので共有します。

## 事象

プロフィール画面を開くと、以下のエラーが出ました。

```
Could not find a relationship between 'profiles' and 'areas' in the schema cache
```

FK制約を張ろうとしても、型の不一致で弾かれます。

```
ERROR: foreign key constraint "profiles_area_id_fkey" cannot be implemented
DETAIL: Key columns "area_id" and "id" are of incompatible types: bigint and uuid.
```

## 原因

`profiles.area_id` が `bigint` 型、`areas.id` が `uuid` 型になっていました。

```sql
-- areas テーブル
id UUID DEFAULT gen_random_uuid() PRIMARY KEY

-- profiles テーブル
area_id BIGINT  -- ここが間違い。UUID であるべき
```

私の場合は、マイグレーションで `IF NOT EXISTS` を使ってカラムを追加していたのですが、事前にダッシュボードから手動で `area_id` を追加してしまっていました。手動追加時に型を指定し忘れたため `bigint` になり、マイグレーション側は「もうあるからスキップ」されていたのが原因でした。

## 解決方法

`bigint → uuid` の直接キャストはできません。

```sql
-- これはエラーになる
ALTER TABLE profiles ALTER COLUMN area_id TYPE uuid USING area_id::uuid;
-- ERROR: cannot cast type bigint to uuid
```

カラムを一度削除して、正しい型で再作成しました。

```sql
ALTER TABLE profiles DROP COLUMN area_id;
ALTER TABLE profiles ADD COLUMN area_id UUID REFERENCES areas(id);
```

## 終わりに

カラムを手動で追加するときは、参照先の型を必ず確認するべきでした。マイグレーションの `IF NOT EXISTS` は便利ですが、間違った定義で既に存在する場合はスキップされてしまうので注意が必要です。
