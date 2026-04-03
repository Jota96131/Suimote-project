# スイモテ（Suimote）🏊

> **泳げば泳ぐほどモテる** — 水泳練習記録 × マッチングアプリ

<p>
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?logo=typescript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3FCF8E?logo=supabase" />
  <img src="https://img.shields.io/badge/Firebase-Hosting-FFCA28?logo=firebase" />
  <img src="https://img.shields.io/badge/Tests-173%20passed-brightgreen" />
  <img src="https://img.shields.io/badge/開発期間-1ヶ月-blue" />
</p>

**泳いだ距離がそのままモテる理由になる。** プロフィールを盛る必要なし。練習記録が「本気度の証明」になるマッチングアプリです。

🔗 [アプリを見る](https://suimote-project.web.app) ｜ 📝 [技術記事（設計判断・学びの詳細）](https://qiita.com/jota9613/private/73b1a59a513a5eee98c8)

---

## デモ

<table>
  <tr>
    <td align="center"><b>練習記録 CRUD</b></td>
    <td align="center"><b>プロフィール編集 → マッチングON</b></td>
  </tr>
  <tr>
    <td><img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/9478c10f-3867-4e85-8a5e-1b7830a28446.gif" width="280" /></td>
    <td><img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/f7542830-3bc6-49b7-af87-6d98e419148f.gif" width="280" /></td>
  </tr>
  <tr>
    <td align="center"><b>いいね → マッチ成立</b></td>
    <td align="center"><b>マッチ一覧 → プロフィール</b></td>
  </tr>
  <tr>
    <td><img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/85de4000-9367-4078-b091-e1f7e6fd0b6f.gif" width="280" /></td>
    <td><img src="https://qiita-image-store.s3.ap-northeast-1.amazonaws.com/0/3950045/3aa07516-3f0a-4a86-b313-c8cc37e1d7e5.gif" width="280" /></td>
  </tr>
</table>

---

## 技術スタック

| カテゴリ | 技術 |
|---|---|
| フロントエンド | React 19 / TypeScript / Vite / Tailwind CSS / shadcn/ui |
| バックエンド・DB | Supabase（PostgreSQL / Auth / Storage / RPC / RLS） |
| ホスティング | Firebase Hosting |
| CI/CD | GitHub Actions（lint → test → build → deploy） |
| テスト | Jest / React Testing Library — **173テスト / 4秒で全パス** |

---

## アーキテクチャ

<img src="docs/architecture.png" width="700" />

---

## 設計判断のハイライト

> 詳細は [Qiita技術記事](https://qiita.com/jota9613/private/73b1a59a513a5eee98c8) に書いています

- **エリアベースのマッチング** — 施設単位だと母数が少なすぎる → 首都圏12エリアに分割
- **マッチング機能はオプトイン** — デフォルトOFF。記録アプリとしてまず価値提供し、自然な導線でマッチングへ
- **RLSをDB層で実装** — API層だけでなくDB層で「自分のデータは自分だけ」を保証
- **MVP7段階のリリース戦略** — どのフェーズで止まっても動くプロダクトが残る設計

