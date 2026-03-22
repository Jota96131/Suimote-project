# MVP4 完了チェックリスト

## 機能実装（✅ 完了済み）
- [x] プロフィール画面（/profile）
- [x] プロフィール編集（/profile/edit）
- [x] マッチングオプトインON/OFF
- [x] 同一エリア内ユーザー一覧（/users）
- [x] 他ユーザープロフィール閲覧（/users/:id）
- [x] 認証ガード（PrivateRoute）
- [x] RLSポリシー設定（profiles UPDATE / SELECT / INSERT / Storage）
- [x] テスト作成（ProfilePage / ProfileEditPage / UserListPage / UserProfilePage 等）
- [x] CI/CD通過確認

## RLS手動検証（✅ 完了済み）

### 準備
- [x] テスト用アカウントを2つ用意（ユーザーA・ユーザーB）
- [x] Authentication > Users で user_id を控える
  - ユーザーA：7b9b2080-74b8-48c1-b16d-756db1813d82（f259896@gmail.com）
  - ユーザーB：df444a3d-710e-4446-994e-e4149b8f34ef（j13119613@gmail.com）

### ① 他人のprofileをUPDATEできないこと
- [x] 結果：OK（data: null, error: null → SELECT確認で空配列、書き換わっていない）

### ② matching_opt_in=false のユーザーが一覧に出ないこと
- [x] 結果：OK（Bをmatching_opt_in=falseにしてAの/usersで「同じエリアにマッチング中のユーザーはいません」を確認）

### ③ 他人のアバターを上書きできないこと
- [x] 結果：OK（400 Bad Request — StorageApiError: mime type application/octet-stream is not supported）

### 検証完了
- [x] 全項目OK
- [x] 完了日：2026-03-22

## 検証中に発見・修正した問題
- profiles.area_id の型がbigintだったためareasテーブルとのFK制約が張れなかった → カラムをDROP＆再作成（UUID型）で修正
- profiles の INSERT ポリシーが未設定だった → `Users can insert own profile` ポリシーを追加
- useMyProfile の `.single()` がプロフィール未作成時にエラーになっていた → `.maybeSingle()` に修正

## MVP4 完了 🎉

## MVP5 以降の TODO
（MVP5: いいね・マッチング機能に着手する）
