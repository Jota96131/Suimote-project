## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
フロントエンドのデプロイ先を選ぶとき、VercelとNetlifyとFirebase Hostingで迷いました。

この記事では **「なぜFirebase Hostingにしたのか」** を整理します。

---

## 決めた理由

このアプリはMVP後にサーバーサイドの処理（通知・バッチ処理など）を追加する可能性があります。

**Firebase FunctionsはFirebase Hostingと同じプロジェクトで管理するのが最も設定が少なく済みます。**

たとえば `/api/*` をFunctionsに向けるリライト設定は、Hosting側の `firebase.json` に書くことが前提です。

```json
{
  "hosting": {
    "rewrites": [{ "source": "/api/**", "function": "api" }]
  }
}
```

この設定はFirebase Hosting上でしか機能しません。VercelやNetlifyにした場合、同等のことを自前で実装する必要があります。

「今は使わないけど、後から追加するコストを最小にしたい」という判断でFirebase Hostingにしました。

---

## 比較

|                                   | Vercel | Netlify | Firebase Hosting |
| --------------------------------- | ------ | ------- | ---------------- |
| 無料枠                            | 広い   | 広い    | 広い             |
| GitHubとのGUI連携だけで完結するか | ◎      | ◎       | △（CLIが必要）   |
| Next.jsとの相性                   | ◎      | ○       | ○                |
| React + Viteとの相性              | ○      | ○       | ○                |
| Firebaseエコシステム連携          | —      | —       | ◎                |

**Vercelが一番簡単**ですが、Firebase Functionsとの統合を見越すとFirebase Hostingが最もコストが低いという結論になりました。

---

## 結論

| 判断                                    | 理由                                                             |
| --------------------------------------- | ---------------------------------------------------------------- |
| VercelやNetlifyではなくFirebase Hosting | Firebase Functionsとの統合を将来追加するコストを最小にしたかった |
| GitHub Actionsで自動デプロイ            | テストが通らないとデプロイされない安全な仕組み                   |
| 環境変数はGitHub Secretsで管理          | `.env`はリポジトリに含めないため                                 |

デプロイ先は「一番簡単なもの」が正解とは限りません。
**「将来どこに向かうか」を考えて選ぶと、後で後悔が少なくなります。**
