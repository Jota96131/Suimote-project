# migrationファイルとは

DBに対して行った変更（テーブル作成、RLS有効化、関数追加など）をSQLファイルとして記録したもの。番号順に並べることで、DBの変更履歴を追える。

## たとえ

料理のレシピ帳。Supabase Dashboardでの操作が「実際に料理する」こと、migrationファイルは「レシピをメモに書いておく」こと。レシピがあれば同じ料理をもう一度作れるし、何を入れたかも後から確認できる。

## 具体例

スイモテでは `supabase/migrations/` に番号付きで管理している：

```
supabase/migrations/
├── 001_areas_and_rpc.sql            # エリアテーブル作成、RPC関数追加
└── 002_enable_rls_all_tables.sql    # 全テーブルのRLS有効化
```

`002_enable_rls_all_tables.sql` の中身：

```sql
-- 全テーブルの RLS 有効化
-- MVP6 通し確認で RLS が無効だったテーブルを修正
-- 2026-03-25 実施済み（Dashboard から Enable RLS 実行）

ALTER TABLE practice_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE areas ENABLE ROW LEVEL SECURITY;
```

### 作業の流れ

1. migrationファイルにSQLを書く
2. Supabase DashboardのSQL Editorで実行（またはボタン操作）
3. 動作確認
4. migrationファイルをgitにコミット

## なぜ使うのか

| 使わない場合 | 使う場合 |
|---|---|
| Dashboardで何を変えたか忘れる | SQLファイルで変更履歴が残る |
| チームメンバーが同じDB環境を作れない | migrationを順番に実行すれば再現できる |
| 「いつRLS有効にしたっけ？」がわからない | gitのコミット履歴と合わせて追える |

## 一言まとめ

migrationファイルは「DBの変更をgitで管理するためのレシピ帳」。
