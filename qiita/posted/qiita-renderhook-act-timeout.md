---
status: posted
tags: React, Jest, テスト, renderHook, 個人開発
twitter: |
  useEffect+非同期+setStateのフックをrenderHookでテストしたらact警告&タイムアウトで全滅した話を書きました。
  ロジックは関数テスト、UIはコンポーネントテストに分けたら安定。
  #React #Jest #個人開発
  [ここにQiitaのURLを貼る]
---

# An update to TestComponent inside a test was not wrapped in act(...)

## はじめに

個人開発で水泳の練習記録アプリを作っています。
いいね機能のフック（`useLike`）を `renderHook` でテストしたら、`act()` 警告が大量発生し `waitFor` がタイムアウトで全滅しました。

## 事象

`useLike` は `useEffect` 内で非同期処理 → `setState` しています。

```typescript
useEffect(() => {
  async function fetchLikes() {
    setLoading(true);
    const { data } = await supabase.from("likes").select(...).eq(...);
    setLikedUserIds(sentIds);   // ← act() の外で走る
    setLoading(false);          // ← act() の外で走る
  }
  fetchLikes();
}, [user]);
```

`renderHook` でテストすると、`await` 後の `setState` が React の `act()` 境界外になり、警告が大量に出た上に `waitFor(() => loading === false)` が5秒タイムアウトしました。

`jest.useFakeTimers()` も試しましたが、Promise の解決自体がブロックされて逆効果でした。fakeTimers はタイマー（setTimeout等）を制御するもので、**Promise の解決タイミングは制御できません**。

## 解決方法

`renderHook` をやめて、テストを2種類に分けました。

**① Supabase呼び出しは関数レベルで直接テスト**

```typescript
const { error } = await supabase
  .from("likes")
  .insert({ from_user_id: "user-1", to_user_id: "user-2" });

expect(mockSupabase.insert).toHaveBeenCalledWith({ ... });
```

**② UIの振る舞いはコンポーネントテスト（フックをモック）**

```typescript
jest.mock("../hooks/useLike", () => ({
  useLike: () => ({ isLiked: () => true, sendLike: jest.fn() }),
}));
```

`renderHook` を使わないので `act()` 問題は一切起きません。

## 終わりに

`useEffect` + 非同期 + `setState` のフックは `renderHook` だと `act()` の制御が難しいです。「ロジックは関数テスト、UIはコンポーネントテスト」に分けるのが安定しました。
