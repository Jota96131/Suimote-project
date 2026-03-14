## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
フロントエンドのデプロイ先を選ぶとき、VercelとNetlifyとFirebase Hostingで迷いました。

この記事では **「なぜFirebase Hostingにしたのか」** を整理します。

---

## 候補を比較した

|                                   | Vercel | Netlify | Firebase Hosting |
| --------------------------------- | ------ | ------- | ---------------- |
| 無料枠                            | 広い   | 広い    | 広い             |
| GitHubとのGUI連携だけで完結するか | ◎      | ◎       | △（CLIが必要）   |
| Next.jsとの相性                   | ◎      | ○       | ○                |
| React + Viteとの相性              | ○      | ○       | ○                |
| Firebaseエコシステム連携          | —      | —       | ◎                |

> VercelもNetlifyもCLIは存在します。ここでの△は「GitHubと連携するだけでGUIから自動デプロイが完結するか」という基準です。Firebase HostingはCLIの設定が別途必要になります。

**Vercelが一番簡単**です。GitHubと連携するだけで自動デプロイが動きます。
ではなぜFirebase Hostingにしたのか。

## 決め手：Firebase Functionsとの統合を見越して

このアプリはMVP後にサーバーサイドの処理（通知・バッチ処理など）を追加する可能性があります。

**Firebase FunctionsはFirebase Hostingと同じプロジェクトで管理するのが最も設定が少なく済みます。**

VercelやNetlifyからでもFirebase SDKを呼び出すこと自体は技術的に可能ですが、Firebase Functionsのリライト設定（`/api/*` をFunctionsに向けるなど）はHosting側の`firebase.json`に書くことが前提になっています。

```json
// firebase.json
{
  "hosting": {
    "rewrites": [{ "source": "/api/**", "function": "api" }]
  }
}
```

この設定はFirebase Hosting上でしか機能しません。HostingをVercelにした場合、同等のことを自前で実装することになります。

「今は使わないけど、後から追加するコストを最小にしたい」という判断でFirebase Hostingにしました。

---

## 役割分担の整理

「前の記事でSupabaseに統一すると書いていたのにFirebaseも使うの？」と思われるかもしれないので整理します。

```
Firebase Hosting  → 静的ファイルの配信（HTMLやJSを届けるだけ）
Supabase          → 認証・DB（ユーザー管理・データの読み書き）
```

**Firebase HostingはSupabase SDKを一切使いません。** ただのファイル配信サーバーです。ブラウザにHTMLとJSを届けたあとは、アプリがSupabaseのAPIを直接呼び出します。「ホスティング先がどこか」と「どのバックエンドを使うか」は独立した話です。

---

## GitHub ActionsからFirebase Hostingへの自動デプロイ

`main`ブランチにpushすると、以下の流れで自動デプロイされます。

```
mainにpush → テスト → ビルド → Firebase Hostingにデプロイ
```

途中で失敗すると止まります。テストが通らないとデプロイされません。

### ビルド時にSupabaseの接続情報を渡す

ローカルでは`.env`ファイルから読み込んでいますが、GitHub Actionsの仮想マシンには`.env`がありません（`.gitignore`で管理対象外にしているため）。

そのためGitHub Secretsに登録した値を`env:`で渡しています。

```yaml
- name: Run build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

|                    | ローカル                                    | GitHub Actions          |
| ------------------ | ------------------------------------------- | ----------------------- |
| 環境変数の元       | `.env`ファイル                              | GitHub Secrets + `env:` |
| Viteでの読み込み方 | 同じ（`import.meta.env.VITE_SUPABASE_URL`） | 同じ                    |

---

## まとめ

| 判断                                    | 理由                                                             |
| --------------------------------------- | ---------------------------------------------------------------- |
| VercelやNetlifyではなくFirebase Hosting | Firebase Functionsとの統合を将来追加するコストを最小にしたかった |
| GitHub Actionsで自動デプロイ            | テストが通らないとデプロイされない安全な仕組み                   |
| 環境変数はGitHub Secretsで管理          | `.env`はリポジトリに含めないため                                 |

デプロイ先は「一番簡単なもの」が正解とは限りません。
**「将来どこに向かうか」を考えて選ぶと、後で後悔が少なくなります。**

この記事が参考になれば幸いです！
