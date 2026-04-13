---
status: draft
tags: React, TypeScript, recharts, 個人開発, 初心者
twitter: |
  rechartsのTooltipでformatterを指定したらTypeScriptのビルドが通らなくなった話を書きました。
  原因はValueType | undefinedの型不一致です。
  #React #TypeScript #recharts
  [ここにQiitaのURLを貼る]
---

# Type '(value: number) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType>'

## はじめに

個人開発で水泳の練習記録アプリ「Suimote」を作っています。
rechartsの `Tooltip` コンポーネントで `formatter` を指定したら、TypeScriptのビルドが通らなくなりました。

---

## 問題

```tsx
<Tooltip
  formatter={(value: number) => [`${value} 日`, "練習日数"]}
/>
```

以下のエラーが出ます。

```
Type '(value: number) => [string, string]' is not assignable to type 'Formatter<ValueType, NameType>'
  Types of parameters 'value' and 'value' are incompatible.
    Type 'ValueType | undefined' is not assignable to type 'number'.
      Type 'undefined' is not assignable to type 'number'.
```

---

## 原因

rechartsの `Formatter` 型の定義を見ると、`value` の型は `TValue | undefined` です。

```ts
// recharts/types/component/DefaultTooltipContent.d.ts
export type Formatter<TValue, TName> = (
  value: TValue | undefined,
  name: TName | undefined,
  ...
) => [React.ReactNode, TName] | React.ReactNode;
```

`value: number` と書くと、`ValueType | undefined` を `number` に渡そうとして型が合いません。`undefined` が来る可能性があるためです。

---

## 解決方法

型アノテーションを外して推論に任せ、`??` で `undefined` に対応します。

```tsx
<Tooltip
  formatter={(value) => [`${value ?? 0} 日`, "練習日数"]}
/>
```

| 修正前 | 修正後 |
|---|---|
| `(value: number)` | `(value)` |
| `${value}` | `${value ?? 0}` |

`value` の型を明示しないことで、rechartsが定義した `ValueType | undefined` がそのまま推論されます。`?? 0` で `undefined` の場合のフォールバックを入れておけば安全です。

---

## おわりに

ライブラリのコールバック関数で型エラーが出たときは、**自分で型を書くより推論に任せた方がうまくいく**ことが多いです。エラーメッセージの `Type 'X' is not assignable to type 'Y'` が出たら、まず型アノテーションを外してみるのが近道です。

---

この記事が参考になれば幸いです！
