---
status: posted
tags: クリーンアーキテクチャ, TypeScript, 設計, 初心者, 個人開発
twitter: |
  つよつよエンジニアに教わったクリーンアーキテクチャをコード付きで整理した話を書きました。
  ユースケース→Port←Gatewayの依存の向きとDTOの型変換がポイント。
  #クリーンアーキテクチャ #TypeScript #個人開発
  [ここにQiitaのURLを貼る]
---

# 知り合いに教わったクリーンアーキテクチャを、自分なりに整理してみた

## はじめに

先日、いつもお世話になっている
**つよつよエンジニア**の方に
クリーンアーキテクチャの考え方を教えてもらいました。

紙とホワイトボードに書きながら説明してもらった内容がすごく分かりやすかったので、自分の理解を整理するためにまとめます。

---

## クリーンアーキテクチャの登場人物

まず、教わった内容を図にするとこうなります。

```
ハンドラー → ユースケース → Port ← Gateway ← Driver
                                          └── 外部API・DB
```

登場人物は大きく5つです。

| 名前 | 役割 | 例 |
|------|------|----|
| ドメイン | アプリの核となるデータ・ルール | `User`（アクティブかどうか等）、`Post`（投稿） |
| ユースケース | ビジネスロジックの流れ | ユーザー一覧取得、投稿一覧取得、アクティブユーザー一覧取得 |
| Port | ユースケースが外部とやりとりするための窓口（インターフェース） | `UserRepository`、`PostRepository` |
| Gateway | Portの実装。外部との橋渡し。**型変換もここ** | `SupabaseUserRepository` |
| Driver | 実際の外部サービス・DB | Supabase、外部API |

---

## ドメインには何を置くのか

ドメインはアプリの核になるデータとルールを定義する場所です。

```ts
// domain/User.ts
type User = {
  id: string;
  name: string;
  isActive: boolean;
};

// domain/Post.ts
type Post = {
  id: string;
  userId: string;
  title: string;
  body: string;
};
```

「ユーザーにはアクティブかどうかの状態がある」「投稿にはタイトルと本文がある」——こういった**ビジネス上の概念**をコードで表現します。DBのテーブル設計とは独立です。

---

## ユースケースは1つのビジネス操作に対して1つ

教わった例では、ユースケースはこんな粒度で分かれていました。

| ユースケース | やること |
|-------------|---------|
| ユーザー一覧取得 | 全ユーザーを返す |
| アクティブユーザー一覧取得 | アクティブなユーザーだけ返す |
| 投稿一覧取得 | 投稿の一覧を返す |

それぞれが独立したクラス（または関数）になります。

---

## データの流れ：「ユーザー一覧の取得」で追いかける

具体例で流れを見てみます。**「ユーザーの一覧を取得する」** という処理です。

### 1. ハンドラー（入口）

ユーザーのリクエストを受け取って、ユースケースを呼ぶだけ。

```ts
// handler/getUsers.ts
const getUsersHandler = (getUsersUseCase: GetUsersUseCase) => {
  return async (req, res) => {
    const users = await getUsersUseCase.execute();
    res.json(users);
  };
};
```

### 2. ユースケース（ビジネスロジック）

「何をするか」を書く場所。**どうやってDBから取るかは知らない。**

```ts
// usecase/GetUsersUseCase.ts
class GetUsersUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(): Promise<User[]> {
    return this.userRepository.findAll();
  }
}
```

### 3. Port（インターフェース）

ユースケースが「こういう機能がほしい」と宣言する窓口。

```ts
// port/UserRepository.ts
interface UserRepository {
  findAll(): Promise<User[]>;
}
```

### 4. Gateway（Portの実装 + 型変換）

Portで宣言された契約を、実際の技術で実装する。
**ここで重要なのが「型変換」です。** DBから返ってくるデータ（DTO）は、ドメインの型とは形が違うことがあります。Gatewayがその変換を担当します。

```ts
// driver が返す生データの型（DTO）
type UserRow = {
  id: string;
  name: string;
  is_active: boolean;  // DB側はスネークケース
  created_at: string;
};

// domain/User.ts（ドメインの型）
type User = {
  id: string;
  name: string;
  isActive: boolean;   // ドメイン側はキャメルケース
};

// gateway/SupabaseUserRepository.ts
class SupabaseUserRepository implements UserRepository {
  async findAll(): Promise<User[]> {
    const { data } = await supabase.from("users").select("*");

    // DTO → ドメイン型に変換する（Gatewayの責務）
    return data.map((row: UserRow) => ({
      id: row.id,
      name: row.name,
      isActive: row.is_active,
    }));
  }
}
```

ユースケースは `User` 型しか知りません。DBのカラム名が `is_active` だろうが `isActive` だろうが関係ない。**この変換をGatewayに閉じ込めるのがポイントです。**

### 5. Driver（外部サービス）

Gateway が使う実際のサービス。ここでは Supabase（PostgreSQL）です。
Driverから返ってくる生データ（DTO）を、Gatewayがドメイン型に変換して上に渡します。

---

## ポイント：矢印の向きと「依存性注入（DI）」

教わったときに一番「なるほど」と思ったのが、**矢印の向き**です。

```
ハンドラー → ユースケース → Port ← Gateway ← Driver
```

ユースケースは Port（インターフェース）だけに依存しています。
Gateway や Driver には **依存していません。**

つまり、ユースケースは「データを取ってくる方法」を知らない。
「`findAll()` を呼べば一覧が返ってくる」というルールだけ知っている。

これを実現するのが **DI（依存性注入）** です。

```ts
// アプリの起動時に「どの実装を使うか」を注入する
const userRepository = new SupabaseUserRepository();
const getUsersUseCase = new GetUsersUseCase(userRepository);
const handler = getUsersHandler(getUsersUseCase);
```

こうすることで、将来 Supabase をやめて別のDBにしたくなっても、Gateway を差し替えるだけで済みます。ユースケースのコードは一切変わりません。

---

## なぜこの構造がうれしいのか

| メリット | 説明 |
|----------|------|
| テストしやすい | ユースケースのテスト時、DBに接続せずモックを渡せる |
| 差し替えが楽 | DB変更はGatewayだけ。ユースケースに影響なし |
| ビジネスロジックが読みやすい | ユースケースにはビジネスの流れだけが書かれている |
| 責務が明確 | 「誰が何を担当するか」が層ごとに決まっている |

---

## まとめ

教わった内容を一言でまとめると：

> **ビジネスロジック（ユースケース）は外部技術に依存しない。間にPort（インターフェース）を挟んで、DIで実装を注入する。**

個人開発の小さなアプリでは「ここまで分けなくても動く」のが正直なところです。
でも、この考え方を知っているだけで「なぜこう書くのか」の判断軸ができます。

教えてくれた方に感謝しつつ、自分のプロジェクトでも意識していきたいと思います。
