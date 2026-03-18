import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useMyProfile } from "../hooks/useMyProfile";
import { useMyStats } from "../hooks/useMyStats";

export default function ProfilePage() {
  const { profile, loading, error } = useMyProfile();
  const { stats, loading: statsLoading } = useMyStats();

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
        <Link to="/records" className="mt-4 text-sm underline">
          記録一覧に戻る
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">プロフィールが見つかりません</p>
        <Link to="/records" className="mt-4 text-sm underline">
          記録一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/records" className="text-sm underline">
        ← 記録一覧に戻る
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
            {statsLoading ? "..." : `${((stats?.total_distance ?? 0) / 1000).toFixed(1)} km`}
          </p>
        </div>
        <div className="rounded-lg border p-4 text-center">
          <p className="text-sm text-muted-foreground">累計回数</p>
          <p className="text-2xl font-bold">
            {statsLoading ? "..." : `${stats?.total_count ?? 0} 回`}
          </p>
        </div>
      </div>

      {/* プロフィール詳細 */}
      <div className="mt-6 space-y-3">
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
        <Link
          to="/profile/edit"
          className="mt-2 inline-block rounded border px-4 py-2 text-sm hover:bg-gray-50"
        >
          編集する
        </Link>
      </div>
    </div>
  );
}
