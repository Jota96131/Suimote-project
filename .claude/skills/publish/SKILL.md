---
name: publish
description: Qiita記事のタグ提案・Twitter投稿文を自動生成してfrontmatterに埋め込む
disable-model-invocation: true
argument-hint: "[filename]"
---

# /publish — 記事の公開準備を自動化

指定されたmarkdownファイルを読み込んで、Qiita投稿用の情報とTwitter投稿文をfrontmatterに埋め込んでください。

## 手順

1. `$ARGUMENTS` のファイルを読み込む
2. 記事の内容を分析する
3. frontmatterがなければ追加、あれば更新する
4. 結果を画面にも表示する

## frontmatterフォーマット

記事ファイルの先頭に以下を埋め込む（既存のfrontmatterがあればマージ）：

```yaml
---
status: draft
tags: タグ1, タグ2, タグ3, タグ4, タグ5
twitter: |
  （140字以内の投稿文）
  [ここにQiitaのURLを貼る]
---
```

## タイトルルール

- 記事にエラー文がある場合はエラー文そのまま。「の解決方法」等は付けない
- なければH1タイトルをそのまま使う

## タグ選定ルール

- 技術名を優先（Supabase, React, TypeScript, PostgreSQL など）
- 「初心者」「個人開発」は内容に合えば含める
- 最大5つまで

## Twitter文面ルール

- 140字以内
- 1行目: 何をしたか（〜した話を書きました）
- 2行目: 要点を1文で
- 3行目: ハッシュタグ2〜3個
- 最終行: [ここにQiitaのURLを貼る]
