# React + Supabaseでプロフィール編集とマッチング機能を実装した話

## はじめに

個人開発で水泳の練習記録アプリを作っています。
今回はプロフィール編集画面、マッチング機能のオプトイン、同じエリアのユーザー一覧、他ユーザーのプロフィール閲覧、認証ガードをまとめて実装しました。

## 技術スタック

- React 19 + TypeScript
- React Router v7
- Supabase（DB・Auth・Storage）
- Tailwind CSS v4

## 1. プロフィール編集画面（/profile/edit）

### やったこと

プロフィールを編集して保存するフォームを作りました。

- ニックネーム（1〜20文字バリデーション + 文字数カウンター）
- 自己紹介（0〜200文字バリデーション + 文字数カウンター）
- ホームプール（テキスト入力）
- エリア選択（areasマスタからセレクトボックス）
- アイコン画像（ファイル選択 → プレビュー → Supabase Storageにアップロード）

### アバター画像のアップロード

```typescript
// avatars/{user_id}/avatar にアップロード（上書きOK）
const { error } = await supabase.storage
  .from("avatars")
  .upload(filePath, avatarFile, { upsert: true });

// 公開URLを取得
const { data } = supabase.storage
  .from("avatars")
  .getPublicUrl(filePath);
```

### upsertでプロフィール保存

`update` ではなく `upsert` を使いました。
レコードがあれば更新、なければ新規作成してくれるので安全です。

```typescript
await supabase
  .from("profiles")
  .upsert({
    user_id: user.id,
    nickname,
    bio: bio || null,
    home_pool: homePool || null,
    area_id: areaId || null,
    avatar_url: avatarUrl,
    matching_opt_in: matchingOptIn,
  });
```

### バリデーションエラーのインライン表示

保存ボタン押下時にバリデーションを実行し、各フィールドの下にエラーを表示するようにしました。

```typescript
const errors: Record<string, string> = {};
if (nickname.trim().length === 0) {
  errors.nickname = "ニックネームを入力してください";
} else if (nickname.length > 20) {
  errors.nickname = "ニックネームは20文字以内で入力してください";
}
if (bio.length > 200) {
  errors.bio = "自己紹介は200文字以内で入力してください";
}
```

## 2. マッチング機能のオプトインON/OFF

### DBにカラム追加

```sql
ALTER TABLE profiles
ADD COLUMN matching_opt_in boolean NOT NULL DEFAULT false;
```

### プロフィール画面にトグルスイッチ

プロフィール画面（/profile）にトグルを設置。タップで即座にDBへ反映（楽観的UI更新）。

```typescript
async function handleToggleMatching() {
  if (!profile) return;

  // OFFからONにする場合のみ確認ダイアログ
  if (!profile.matching_opt_in) {
    const ok = window.confirm(
      "プロフィールが他のユーザーに表示されます。よろしいですか？"
    );
    if (!ok) return;
  }

  await updateProfile({ matching_opt_in: !profile.matching_opt_in });
}
```

### ON/OFFでメッセージを出し分け

- ON → 「マッチング機能が有効です」（青背景）
- OFF → 「マッチング機能はOFFです。ONにすると同じエリアのユーザーと出会えます」（グレー背景）

## 3. RLSでマッチングONのユーザーだけ見えるようにする

### 古いポリシーを削除して新しいポリシーを作成

```sql
-- 古いポリシーを削除
DROP POLICY "Users can read own profile" ON profiles;

-- 新しいポリシー：自分は常に見える + 他人はマッチングONのみ
CREATE POLICY "Users can view own or opt-in profiles"
  ON profiles FOR SELECT
  USING (
    auth.uid() = user_id
    OR matching_opt_in = true
  );
```

## 4. 他ユーザーの累計記録を返すRPC

他人の練習記録の詳細は見せず、合計だけ返すSQL関数を作りました。

```sql
CREATE OR REPLACE FUNCTION get_user_stats(target_user_id uuid)
RETURNS TABLE(total_distance bigint, total_count bigint) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(pr.distance), 0)::bigint AS total_distance,
    COUNT(*)::bigint AS total_count
  FROM practice_records pr
  WHERE pr.user_id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

`SECURITY DEFINER` にすることで、RLSに関係なく集計できます。詳細は見えず合計だけなので安全です。

## 5. 他ユーザーのプロフィール閲覧画面（/users/:id）

### useUserProfileフック

プロフィールを取得してから累計記録を取得する順番にしました。
プロフィールが取得できない（=マッチングOFF or 存在しない）場合はstatsのRPCも呼びません。

```typescript
// まずプロフィールを取得（RLSでmatching_opt_in=falseは取得不可）
const profileRes = await supabase
  .from("profiles")
  .select("*, areas(id, name)")
  .eq("user_id", userId)
  .single();

if (profileRes.error || !profileRes.data) {
  // 非公開 or 存在しない → 「ユーザーが見つかりません」
  setProfile(null);
  return;
}

// プロフィールが取得できた場合のみ累計記録を取得
const statsRes = await supabase.rpc("get_user_stats", {
  target_user_id: userId,
});
```

### 自分自身のIDでアクセスした場合

`/users/自分のID` にアクセスすると `/profile` にリダイレクトします。

```tsx
if (user && id === user.id) {
  return <Navigate to="/profile" replace />;
}
```

## 6. 同じエリアのユーザー一覧（/users）

### useAreaUsersフック

自分と同じエリアかつマッチングONのユーザーを取得。自分は除外。
各ユーザーの累計記録もRPCで取得してカード形式で表示します。

```typescript
const { data } = await supabase
  .from("profiles")
  .select("*, areas(id, name)")
  .eq("area_id", profile.area_id)
  .eq("matching_opt_in", true)
  .neq("user_id", user.id);
```

RPCを新たに作る必要はありませんでした。RLSで `matching_opt_in=true` しか返らないし、フィルタ条件はクエリで指定するだけなので。

### 状態に応じた案内表示

- マッチングOFFの場合 → 「マッチング機能をONにすると表示されます」
- エリア未設定の場合 → 「エリアを設定してください」
- ユーザーが0人の場合 → 「同じエリアにマッチング中のユーザーはいません」

## 7. 認証ガード（PrivateRoute）

ログインが必要なページを `PrivateRoute` で囲みました。
未ログインなら `/auth` にリダイレクトします。

```tsx
<Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
<Route path="/profile/edit" element={<PrivateRoute><ProfileEditPage /></PrivateRoute>} />
<Route path="/users" element={<PrivateRoute><UserListPage /></PrivateRoute>} />
<Route path="/users/:id" element={<PrivateRoute><UserProfilePage /></PrivateRoute>} />
```

## 最終的なルーティング

| パス | ページ | 認証 |
|---|---|---|
| `/` | HomePage | 不要 |
| `/records` | RecordsPage | 不要 |
| `/records/new` | AddRecordPage | 不要 |
| `/records/:id` | RecordDetailPage | 不要 |
| `/profile` | ProfilePage | 必要 |
| `/profile/edit` | ProfileEditPage | 必要 |
| `/users` | UserListPage | 必要 |
| `/users/:id` | UserProfilePage | 必要 |

## 終わりに

プロフィール編集、マッチング機能、ユーザー一覧、認証ガードを一気に実装しました。
SupabaseのRLSを活用することで、フロント側のコードはシンプルなクエリだけで済み、セキュリティはDB側で担保できました。
