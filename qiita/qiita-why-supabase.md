# 【個人開発】DBにFirestoreではなくSupabaseを選んだ理由

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
バックエンドを選ぶとき、真っ先に候補に上がったのはFirebase（Firestore）でした。

でも最終的にSupabaseを選びました。
この記事では **「なぜFirestoreではなくSupabaseにしたのか」** を整理します。

---

## FirestoreとSupabaseの一番の違い

結論から言うと、**データベースの種類が根本的に違います。**

| | Firebase (Firestore) | Supabase |
|---|---|---|
| データベース | NoSQL（ドキュメント型） | PostgreSQL（RDB） |
| データの持ち方 | JSONを木構造で管理 | テーブル・カラムで管理 |
| クエリ | 柔軟な集計・JOINは苦手 | SQLで自由に書ける |
| 向いてる構造 | 階層が深いデータ | リレーションがあるデータ |

---

## 自分のアプリのデータがRDB向きだった

練習記録アプリのデータはこういう形です。

```
練習記録（practice_records）
  id, date, distance, time, stroke, facility, memo, user_id
```

テーブル1枚、カラムが7つ。**完全にRDBの得意分野です。**

さらに将来（MVP4以降）こういうクエリを書く予定があります。

```sql
-- エリアごとの累計距離ランキング（MVP4で実装予定）
SELECT
  users.area,
  SUM(practice_records.distance) AS total_distance
FROM practice_records
JOIN users ON practice_records.user_id = users.id
GROUP BY users.area
ORDER BY total_distance DESC;
```

Firestoreでこれをやろうとすると、アプリ側のコードでループしながら集計することになります。データが増えるほど辛くなる。

**SQLが書けるSupabaseなら1クエリで済む。** これが決め手でした。

---

## Supabase Authも一体で使える

認証はSupabase Authを使いました。

```ts
// ログイン
await supabase.auth.signInWithPassword({ email, password });

// セッション取得
const { data: { session } } = await supabase.auth.getSession();

// ログアウト
await supabase.auth.signOut();
```

Firebase SDK v9以降はモジュラー設計になっているので、バンドルサイズの差は以前ほど大きくありません。

ただ、Supabaseを選んで感じた体験上のメリットがあります。**認証とDBが同じ`supabase`クライアント1つで完結するので、コードの見通しが良い**のです。

```ts
// 認証もDBも同じクライアント
const user = supabase.auth.getUser();
const records = supabase.from("practice_records").select("*");
```

Firebase AuthとFirestoreを組み合わせる場合、それぞれ別のモジュールから呼び出します。どちらが優れているかではなく、**統一された書き方が好みだった**という話です。

---

## RLSで「自分の記録しか見えない」をDBレベルで保証

SupabaseにはRLS（Row Level Security）という仕組みがあります。

```sql
-- ログインユーザーは自分のレコードだけ参照できる
CREATE POLICY "自分の記録のみ参照可能" ON practice_records
  FOR SELECT USING (auth.uid() = user_id);
```

「ログインしているユーザーのIDと、レコードの`user_id`が一致する行だけ返す」というルールをDB側に書けます。

アプリのコードでフィルタリングするのとは違い、**DBレベルで制御するので「うっかり他人のデータを返すバグ」が原理的に起きません。**

ただし注意点があります。**RLSを有効化してもポリシーを1つも設定していない状態だと、全データがブロックされて0件になります。** 筒抜けではなく逆で、何も返ってこなくなります。

```
RLS有効 + ポリシーなし  → 全データがブロックされる（0件）
RLS有効 + ポリシーあり  → ポリシーに合う行だけ返ってくる
RLS無効               → 全データが返ってくる（危険）
```

有効化したあとは必ずポリシーをセットで設定しましょう。

---

## まとめ

| 判断 | 理由 |
|------|------|
| FirestoreではなくPostgreSQL | データが表形式でRDB向き。JOINと集計が将来必要になる |
| Supabase Authを採用 | 認証とDBが同じクライアントで統一される開発体験が好みだった |
| RLSをDBレベルで設定 | アプリコードに依存しない安全なデータ制御。ただしポリシー設定必須 |

「NoSQLかRDBか」は「どちらが優れているか」ではなく、**「自分のデータ構造に合っているか」** で選ぶのが正解だと思います。

この記事が参考になれば幸いです！
