---
status: draft
tags: React, PWA, CSS, 個人開発, 初心者
twitter: |
  Webアプリをスマホ対応させるためにやった5つのことを書きました。
  100dvh、safe-area-inset、theme-colorなど、知らないとハマるポイントをまとめています。
  #React #PWA #個人開発
  [ここにQiitaのURLを貼る]
---

# 【React】Webアプリをスマホ対応させるためにやった5つのこと

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」をリリースしました。
PCのブラウザでは問題なく動いていましたが、スマホで開くと**下ナビがiPhoneのホームバーに被る**、**Safariのアドレスバーで画面が足りない**などの問題がありました。ユーザーはスマホで使うことが多いので、リリース後に改善しました。

Webアプリをスマホでも快適に使えるようにするために対応した5つのことをまとめます。

---

## 1. 100vhの罠 → 100dvhで解決

### 問題

CSSで `min-height: 100vh` を指定すると、PCでは画面全体を占有します。しかし、iPhoneのSafariではアドレスバーの高さを含めた値になるため、**画面の下が見切れる**ことがあります。

### 解決

```css
body {
  min-height: 100vh;      /* フォールバック */
  min-height: 100dvh;     /* Dynamic Viewport Height */
}
```

`dvh`（Dynamic Viewport Height）は、アドレスバーの表示/非表示に応じて動的に変わる単位です。`vh` はアドレスバーを無視した固定値なので、Safariでずれます。

| 単位 | 意味 | Safariアドレスバー |
|---|---|---|
| `vh` | 固定のビューポート高さ | 考慮しない（はみ出る） |
| `svh` | 最小のビューポート高さ | アドレスバーが出ている前提 |
| `dvh` | 動的なビューポート高さ | 出し入れに追従する |

`100dvh` を使い、`100vh` はフォールバックとして残しておくのが安全です。

---

## 2. iPhoneのホームバーに被る → safe-area-inset

### 問題

iPhone X以降は画面下に**ホームインジケーター（横棒）**があります。固定ナビゲーションを `bottom: 0` に配置すると、このバーと被って**タップしにくい**。

### 解決

```css
nav {
  padding-bottom: env(safe-area-inset-bottom);
}
```

`env(safe-area-inset-bottom)` は、iPhoneが「この領域はUIが被るので空けてね」と教えてくれる値です。ホームバーがない端末では `0` になるので、Android・PCには影響しません。

これを使うには、HTMLのviewportに `viewport-fit=cover` を追加する必要があります。

```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
```

---

## 3. タップ時の青いハイライトを消す

### 問題

Androidのブラウザでリンクやボタンをタップすると、**青い四角のハイライト**が表示されます。アプリっぽくない見た目になります。

### 解決

```css
body {
  -webkit-tap-highlight-color: transparent;
}
```

1行で消えます。

---

## 4. 引っ張って更新（overscroll）を無効化

### 問題

スマホでページの上端・下端を超えてスクロールすると、**ゴムのように跳ね返る**動き（バウンス）が起きます。SPAではページリロードを期待しないので、意図しない動作に感じます。

### 解決

```css
body {
  overscroll-behavior-y: none;
}
```

---

## 5. ステータスバーの色を合わせる

### 問題

スマホのブラウザで開くと、ステータスバー（時計やバッテリーの表示領域）が白のままで、ダークテーマのアプリと浮いてしまう。

### 解決

```html
<meta name="theme-color" content="#0A0E1A" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
```

| メタタグ | 効果 |
|---|---|
| `theme-color` | Android Chrome のステータスバー色 |
| `apple-mobile-web-app-capable` | iPhoneでホーム画面追加時にフルスクリーン |
| `apple-mobile-web-app-status-bar-style` | iPhoneのステータスバーを半透明に |

これでステータスバーがアプリの背景色と同化し、アプリっぽい見た目になります。

---

## まとめ

| 対応 | やったこと | 影響範囲 |
|---|---|---|
| 画面高さ | `100dvh` | iOS Safari |
| ホームバー | `safe-area-inset-bottom` | iPhone X以降 |
| タップハイライト | `-webkit-tap-highlight-color` | Android |
| バウンス無効 | `overscroll-behavior-y: none` | 全スマホ |
| ステータスバー | `theme-color` + Apple メタタグ | 全スマホ |

どれも数行の変更ですが、**知らないとハマるポイント**ばかりです。特に `100vh` と `safe-area-inset` はスマホ対応でほぼ必ず遭遇するので、最初から入れておくのがおすすめです。

---

この記事が参考になれば幸いです！
