---
status: draft
tags: React, Jest, テスト, 個人開発, TypeScript
twitter: |
  ページとユーティリティのテストを全部埋めた話を書きました。
  142→173テスト、カバレッジ100%にするまでに学んだ判断基準とは。
  #React #Jest #個人開発
  [ここにQiitaのURLを貼る]
---

# 【React×Jest】テストカバレッジを埋める判断基準 — 全部書く？必要なところだけ？

## はじめに

個人開発で水泳記録アプリ「Suimote」を作っています。
テストは以前から書いていましたが、ページやユーティリティに**テストがないファイル**がいくつかありました。

「全部にテスト書いた方がいい？TDDに沿うならそうなる？」と考えた結果、**コスパで判断する**方針に落ち着きました。

---

## Before / After

| | Before | After |
|---|---|---|
| Test Suites | 21 | **27** |
| Tests | 142 | **173** |
| ページカバー率 | 7/11 (64%) | **11/11 (100%)** |
| ユーティリティ | 1/3 (33%) | **3/3 (100%)** |

追加したのは6ファイル・31テストです。

---

## テストの「書く/書かない」判断基準

全てにテストを書くのがベストとは限りません。大事なのは**コスパ**です。

### テストが効くところ（書く）

| 対象 | 理由 |
|---|---|
| カスタムhooks | ビジネスロジック（API呼び出し、バリデーション）がある |
| ページコンポーネント | 表示分岐・遷移・エラーハンドリングがある |
| ユーティリティ関数 | 純粋関数でテストが書きやすく、壊れたら影響が大きい |

### テストのコスパが悪いところ（書かない）

| 対象 | 理由 |
|---|---|
| 小さいUIコンポーネント | 見た目メイン。UIは頻繁に変わるからテストのメンテコストが高い |
| スタイル・レイアウト | CSSの変更でテストが壊れても意味がない |

実際、今回の開発で泳法セレクターのUIを**6回作り直しました**（select → ボトムシート → ホイールピッカー → セグメントコントロール → チップ → ドロップダウン）。もしUIコンポーネントにテストを書いていたら、6回とも書き直しでした。

---

## 追加したテストの例

### ユーティリティ：formatTime

秒数を `mm:ss.cc` 形式に変換する純粋関数。入力と出力が明確なのでTDDに最適。

```ts
describe("formatTime", () => {
  it("0秒を00:00.00に変換する", () => {
    expect(formatTime(0)).toBe("00:00.00");
  });

  it("大きな値（1230秒）を正しく変換する", () => {
    expect(formatTime(1230)).toBe("20:30.00");
  });

  it("小数点付きの秒数を正しくフォーマットする", () => {
    expect(formatTime(90.5)).toBe("01:30.50");
  });
});
```

### ページ：AuthPage

ログイン/登録のフォーム表示、認証の成功/失敗、モード切替をテスト。

```tsx
it("ログイン成功時に/recordsに遷移する", async () => {
  mockSignIn.mockResolvedValue(null);
  renderAuthPage();

  await userEvent.type(screen.getByLabelText("メールアドレス"), "test@example.com");
  await userEvent.type(screen.getByLabelText("パスワード"), "password123");
  await userEvent.click(screen.getByRole("button", { name: "ログイン" }));

  await waitFor(() => {
    expect(screen.getByText("記録ページ")).toBeInTheDocument();
  });
});
```

### ページ：EditRecordPage

既存データのフォームセット、更新後の遷移、エラー表示をテスト。

```tsx
it("記録取得成功後にフォームに値がセットされる", async () => {
  mockSupabase.from.mockReturnValue({
    select: jest.fn().mockReturnValue({
      eq: jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: mockRecord, error: null }),
      }),
    }),
  } as any);

  renderEditPage();

  await waitFor(() => {
    expect(screen.getByLabelText("距離 (m)")).toHaveValue(1000);
  });
});
```

---

## UIを変えるとテストも壊れる問題

今回、カレンダーモーダルを導入した際にAddRecordPageのテストが壊れました。

```
// Before: HTMLのinput[type="date"]
screen.getByLabelText("日付")  // → input要素が見つかる

// After: カスタムボタン + CalendarModal
screen.getByLabelText("日付")  // → inputがないのでエラー！
```

修正は`getByLabelText` → `getByText`に変えるだけでしたが、**UIが変わるたびにテストを直す必要がある**という教訓になりました。

だからこそ、頻繁に変わるUIコンポーネント単体にはテストを書かず、**ページ単位で「表示されるか・動くか」をテストする**のが現実的です。

---

## まとめ

| ルール | 内容 |
|---|---|
| ロジックがある | テストを書く（hooks, utils） |
| 表示分岐・遷移がある | テストを書く（pages） |
| 見た目だけ | 書かない（UIコンポーネント） |
| よく変わる | 書かない（試行錯誤フェーズのUI） |

「全部書く」ではなく「**壊れたら困るところに書く**」。これが個人開発でテストと上手く付き合うコツだと感じました。

---

この記事が参考になれば幸いです！
