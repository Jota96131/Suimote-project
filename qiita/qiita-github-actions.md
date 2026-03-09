# 【初心者向け】GitHub Actions × Firebase Hostingの自動デプロイを完全解説

## はじめに

GitHub Actionsを使ってFirebase Hostingに自動デプロイする仕組みを構築しました。
この記事では、ワークフローファイルの**1行1行を初心者にもわかるように**解説していきます。

## 全体像

mainブランチにpushすると、以下の流れで自動デプロイされます。

```
mainにpush → テスト → ビルド → Firebaseにデプロイ
```

途中で失敗したら、そこで止まります。安全！

## ワークフローファイルの全体

```yaml
name: CI/CD

on:
  push:
    branches:
      - main

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"
      - name: Install dependencies
        run: npm install
      - name: Run tests
        run: npm test

  build:
    runs-on: ubuntu-latest
    needs: test
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"
      - name: Install dependencies
        run: npm install
      - name: Run build
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - name: Archive Production Artifact
        uses: actions/upload-artifact@v4
        with:
          name: dist
          path: dist

  deploy:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Checkout code
        uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: "20"
      - name: Install dependencies
        run: npm install
      - name: Download Artifact
        uses: actions/download-artifact@v4
        with:
          name: dist
          path: dist
      - name: Deploy to Firebase
        uses: joinflux/firebase-tools@v9.16.0
        with:
          args: deploy --project=typescript-study-59fb1 --only hosting
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

## 1つずつ解説していく

### トリガー：いつ実行されるか

```yaml
on:
  push:
    branches:
      - main
```

`main`ブランチにpushされたときにワークフローが実行されます。
他のブランチへのpushでは動きません。

---

### `jobs` ：ワークフローの中身

ワークフローは**3つのジョブ**で構成されています。

| ジョブ | 役割 |
|--------|------|
| test | テストを実行 |
| build | ソースコードをビルド |
| deploy | Firebaseにデプロイ |

---

### `runs-on` ：どこで実行するか

```yaml
runs-on: ubuntu-latest
```

ジョブを**どのマシン（仮想環境）で実行するか**の指定です。
GitHubが用意してくれる最新のUbuntu Linux仮想マシン上で動きます。

他にも `windows-latest` や `macos-latest` が選べますが、`ubuntu-latest` が最も一般的です。

---

### `steps` ：ジョブの中で何をするか

```yaml
steps:
  - name: Checkout code
    uses: actions/checkout@v2
  - name: Setup Node.js
    uses: actions/setup-node@v2
  - name: Install dependencies
    run: npm install
  - name: Run tests
    run: npm test
```

`steps`は**ジョブの中で実行する処理を順番に定義するリスト**です。
上から順番に実行され、途中で失敗するとそこで止まります。

ステップには2種類あります：
- **`run:`** → シェルコマンドを直接実行（`npm install` など）
- **`uses:`** → 他の人が作った既製のアクション（プラグインのようなもの）を使う

---

### `with` ：アクションに渡すパラメータ

```yaml
- uses: actions/upload-artifact@v4
  with:
    name: dist
    path: dist
```

`with`は**アクションへの設定値**です。

- **`name: dist`** → アーティファクト（成果物）の識別名。ラベルのようなもの
- **`path: dist`** → 実際にアップロードするフォルダのパス

---

### `needs` ：ジョブの実行順序

```yaml
build:
  needs: test

deploy:
  needs: build
```

`needs`を使うと、**前のジョブが成功してから次のジョブを実行**できます。

```
test（成功）→ build（成功）→ deploy
test（失敗）→ ここで停止！
```

テストが通らないとデプロイされない安全な仕組みです。

---

## ビルドとは？

```yaml
- name: Run build
  run: npm run build
```

**build（ビルド）= ソースコードを本番用のファイルに変換すること**です。

具体的には：
- TypeScript → JavaScript に変換
- JSXの構文 → ブラウザが読めるJavaScript に変換
- 複数のファイルを1つにまとめる（バンドル）
- コードを圧縮して軽量化

### `dist` フォルダとは？

`dist`は **distribution（配布）** の略で、ビルドで生成された**本番用ファイルの出力先**です。

```
dist/
  index.html
  assets/
    index-abc123.js    ← まとめて圧縮されたJS
    index-def456.css   ← まとめて圧縮されたCSS
```

この中身がそのままFirebase Hostingにアップロードされ、ユーザーがブラウザでアクセスするサイトになります。

---

## 環境変数（env）の仕組み

```yaml
- name: Run build
  run: npm run build
  env:
    VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
    VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
```

### なぜ `env` が必要なのか？

ローカル開発では`.env`ファイルから環境変数を読み込みます。

```
# .env（ローカル）
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

しかし、GitHub Actionsの仮想マシンには**`.env`ファイルが存在しません**。
（`.gitignore`で除外されているのでリポジトリに含まれないため）

そこで`env:`を使って、**GitHub Secretsから環境変数を渡して**います。

| | ローカル | GitHub Actions |
|---|---|---|
| 環境変数の元 | `.env` ファイル | `env:` + Secrets |
| 結果 | 同じ | 同じ |

どちらもViteが`import.meta.env.VITE_SUPABASE_URL`として使えるようになります。

---

## デプロイの設定

```yaml
- name: Deploy to Firebase
  uses: joinflux/firebase-tools@v9.16.0
  with:
    args: deploy --project=typescript-study-59fb1 --only hosting
  env:
    FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
```

### `args` の意味

```
deploy --project=typescript-study-59fb1 --only hosting
```

- **`deploy`** → Firebaseにデプロイする
- **`--project=typescript-study-59fb1`** → 対象のFirebaseプロジェクトID
- **`--only hosting`** → Hosting（Webサイト公開）だけをデプロイ

ローカルで `firebase deploy --project=typescript-study-59fb1 --only hosting` と打つのと同じことです。

### FIREBASE_TOKEN

Firebase CLIの認証に必要なトークンです。
`firebase login:ci` で取得し、GitHubのRepository Secretsに登録します。

---

## ハマったポイント：FIREBASE_TOKENの設定

デプロイ時にこんなエラーが出ました。

```
Either FIREBASE_TOKEN or GCP_SA_KEY is required to run commands with the firebase cli
```

**原因：** GitHubのRepository Secretsに `FIREBASE_TOKEN` が登録されていなかった。

**解決方法：**
1. ローカルで `firebase login:ci` を実行してトークンを取得
2. GitHubリポジトリの **Settings → Secrets and variables → Actions → New repository secret** で `FIREBASE_TOKEN` として登録

コードに問題はなく、**GitHub側の設定が原因**でした。

---

## まとめ

GitHub Actionsのワークフローで覚えておくべきキーワード：

| キーワード | 意味 |
|-----------|------|
| `on` | いつ実行するか（トリガー） |
| `jobs` | 実行するジョブの定義 |
| `runs-on` | どのマシンで実行するか |
| `steps` | ジョブ内の処理を順番に定義 |
| `run` | シェルコマンドを実行 |
| `uses` | 既製のアクション（プラグイン）を使う |
| `with` | アクションに渡すパラメータ |
| `env` | 環境変数の設定 |
| `needs` | ジョブの依存関係（実行順序） |
| `secrets` | GitHubに安全に保存した秘密の値 |

ワークフローファイルは一見難しそうですが、1つ1つ分解すればシンプルです。
この記事が参考になれば幸いです！
