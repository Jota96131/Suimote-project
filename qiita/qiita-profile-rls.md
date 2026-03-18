# Supabaseで「自分のプロフィールだけ編集可能」にするRLS設定

## はじめに

個人開発で水泳の練習記録アプリを作っています。
プロフィール編集機能を実装したので、他人のプロフィールを書き換えられないようにRLS（Row Level Security）を設定しました。

## なぜRLSが必要か

Supabaseはクライアントから直接DBを操作します。
anon key はブラウザのソースコードから誰でも見えるので、RLSがないと**誰でも他人のデータを書き換えられてしまいます**。

```
RLSなし → anon keyさえあれば全行UPDATE可能 ❌
RLSあり → ポリシーに合致する行だけUPDATE可能 ✅
```

## 設定方法

SupabaseダッシュボードのSQL Editorで以下を実行しました。

```sql
-- RLSを有効化（ダッシュボードで既にONなら不要）
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 自分のプロフィールだけUPDATEできるポリシー
CREATE POLICY "Users can update own profile"
  ON profiles
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

## USINGとWITH CHECKの違い

ここが最初わかりにくかったポイントです。

| 句 | チェックするタイミング | 役割 |
|---|---|---|
| `USING` | UPDATE対象の行を選ぶとき | 「どの行を更新できるか」を制限する |
| `WITH CHECK` | UPDATE後の値を検証するとき | 「更新後の値が条件を満たすか」を確認する |

両方 `auth.uid() = user_id` にすることで：

- 自分の行だけ更新できる（USING）
- `user_id`を他人のIDに書き換えることもできない（WITH CHECK）

## 動作確認

設定済みのポリシーはSQL Editorで確認できます。

```sql
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

## まとめ

- Supabaseはクライアントから直接DB操作するので、RLSは必須
- `USING`で対象行を絞り、`WITH CHECK`で更新後の値も検証する
- ダッシュボードでRLSをONにしただけではポリシーがないと全ブロックされるので注意