---
status: posted
tags: Supabase, Jest, テスト, TypeScript, 初心者
twitter: |
  SupabaseのメソッドチェーンをmockImplementationで上書きしたら "select is not a function" になった話を書きました。
  mockReturnThis()を壊さず末端だけ上書きするのがコツ。
  #Supabase #Jest #個人開発
  [ここにQiitaのURLを貼る]
---

# select is not a function

## はじめに

個人開発で水泳の練習記録アプリを作っています。
いいね機能のテストで、Supabaseのメソッドチェーンのモックにハマったので共有します。

## 事象

`useLike` フックは内部でこのようなチェーンを呼んでいます。

```typescript
const { data } = await supabase.from("likes").select("to_user_id").eq("from_user_id", user.id);
```

auto-mock では `mockReturnThis()` でチェーンを繋いでいました。

```typescript
// src/__mocks__/supabase.ts
export const supabase = {
  from: jest.fn().mockReturnThis(),   // supabase自身を返す
  select: jest.fn().mockReturnThis(), // supabase自身を返す
  eq: jest.fn(),
};
```

テスト側で `from` を `mockImplementation` で上書きしたところ、エラーになりました。

```
TypeError: supabase.from(...).select is not a function
```

## 原因

`mockImplementation` すると `mockReturnThis()` が無効化されます。`from()` が `supabase` 自身を返さなくなるため、次の `.select()` が見つからずエラーになります。

| 状態 | `from()` の返り値 | `.select()` 呼べる？ |
|------|-------------------|---------------------|
| auto-mock（初期） | `supabase` 自身 | ✅ |
| `mockImplementation` 後 | 新しいオブジェクト | ❌ |

## 解決方法

`from` や `select` は触らず、チェーン末端の `eq` だけ上書きします。

```typescript
beforeEach(() => {
  mockSupabase.from.mockReturnThis();
  mockSupabase.select.mockReturnThis();
  mockSupabase.eq.mockResolvedValue({ data: [], error: null });
});
```

`delete` のように別チェーンが必要な場合は `mockReturnValueOnce` で1回だけ差し替えます。

```typescript
mockSupabase.from.mockReturnValueOnce({ delete: mockDelete });
// → 1回だけ上書き。次の呼び出しからは元の mockReturnThis() に戻る
```

## 終わりに

`mockReturnThis()` ベースのモックは、`mockImplementation` するとチェーン全体が壊れます。上書きは末端だけ、全体を差し替えるなら `mockReturnValueOnce` で影響範囲を限定するのがコツです。
