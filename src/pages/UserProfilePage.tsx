import { useParams, Link, Navigate } from "react-router-dom";
import { User } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { useUserProfile } from "../hooks/useUserProfile";

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { profile, stats, loading, error } = useUserProfile(id);

  if (user && id === user.id) {
    return <Navigate to="/profile" replace />;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-destructive">エラーが発生しました</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Link to="/users" className="mt-4 text-sm underline">
          ユーザー一覧に戻る
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">ユーザーが見つかりません</p>
        <Link to="/users" className="mt-4 text-sm underline">
          ユーザー一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/users" className="text-sm underline">
        ← ユーザー一覧に戻る
      </Link>

      <h1 className="mt-4 text-2xl font-bold">プロフィール</h1>

      {/* アイコン & ニックネーム */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8" />
          )}
        </div>
        <div>
          <p className="text-xl font-semibold">{profile.nickname ?? "未設定"}</p>
          {profile.areas && (
            <p className="text-sm text-muted-foreground">{profile.areas.name}</p>
          )}
        </div>
      </div>

      {/* 累計記録 */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">累計距離</p>
          <p className="text-2xl font-bold">
            {`${((stats?.total_distance ?? 0) / 1000).toFixed(1)} km`}
          </p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">累計回数</p>
          <p className="text-2xl font-bold">
            {`${stats?.total_count ?? 0} 回`}
          </p>
        </div>
      </div>

      {/* プロフィール詳細 */}
      <div className="mt-6">
        <dl>
          <div className="flex justify-between border-b py-2">
            <dt className="text-sm text-muted-foreground">自己紹介</dt>
            <dd className="text-sm">{profile.bio ?? "未設定"}</dd>
          </div>
          <div className="flex justify-between border-b py-2">
            <dt className="text-sm text-muted-foreground">ホームプール</dt>
            <dd className="text-sm">{profile.home_pool ?? "未設定"}</dd>
          </div>
          <div className="flex justify-between border-b py-2">
            <dt className="text-sm text-muted-foreground">所属エリア</dt>
            <dd className="text-sm">{profile.areas?.name ?? "未設定"}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
