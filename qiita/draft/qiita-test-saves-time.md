# 【React×Jest】テストがあると4秒で133項目を確認できた話

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
全画面の動作確認フェーズで、手動確認しようとしたら7項目×2アカウントで30分以上かかる見込みでした。

しかし `npm test` を実行したら、**4秒で133項目がすべてPASS**。

---

## 手動テスト vs 自動テスト

| | 手動 | 自動 |
|---|---|---|
| 確認時間 | 30分以上 | **4秒** |
| 確認項目数 | 漏れが出やすい | **133項目を網羅** |
| コード変更のたび | またやり直し | コマンド1つ |
| 深夜の疲れた状態 | 見落とす | **ロボットは疲れない** |

---

## テストの種類

大きく分けて2つ。

### 1. hooks のテスト（ロジック）

Supabaseとのやりとりをモックして、データの取得・登録が正しく動くかを確認。

```ts
it("練習記録を追加できる", async () => {
  mockInsert.mockResolvedValue({ data: mockRecord, error: null });
  const { result } = renderHook(() => useAddRecord());
  await act(() => result.current.addRecord(mockRecord));
  expect(mockInsert).toHaveBeenCalled();
});
```

### 2. コンポーネントのテスト（UI）

画面が正しく表示されるか、ボタンを押したら正しく動くかを確認。

```tsx
it("フォーム入力して送信できる", async () => {
  render(<AddRecordPage />);
  fireEvent.change(screen.getByLabelText("距離"), {
    target: { value: "1000" },
  });
  fireEvent.click(screen.getByText("記録する"));
  expect(mockAddRecord).toHaveBeenCalled();
});
```

---

## おわりに

テストは書くのが面倒に感じるけど、一度書けば **何度でも4秒で全項目を確認できる最強の味方** です。

この記事が参考になれば幸いです！
