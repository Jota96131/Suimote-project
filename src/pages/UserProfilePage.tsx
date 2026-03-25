import { useParams, Link, Navigate } from "react-router-dom";
import { User, ArrowLeft } from "lucide-react";
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
        <p className="text-[#8892A8]">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#FF3B8B]">エラーが発生しました</p>
        <p className="mt-1 text-sm text-[#8892A8]">{error}</p>
        <Link to="/users" className="mt-4 text-sm text-[#00D4FF]">
          ユーザー一覧に戻る
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#8892A8]">ユーザーが見つかりません</p>
        <Link to="/users" className="mt-4 text-sm text-[#00D4FF]">
          ユーザー一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link to="/users" className="flex items-center gap-1 text-sm text-[#8892A8] hover:text-[#00D4FF] transition">
        <ArrowLeft className="h-4 w-4" />
        ユーザー一覧に戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold text-[#F0F0F0]">プロフィール</h1>

      {/* アバター & ニックネーム */}
      <div className="mt-6 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00D4FF]/10">
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            <User className="h-8 w-8 text-[#00D4FF]" />
          )}
        </div>
        <div>
          <p className="text-xl font-semibold text-[#F0F0F0]">{profile.nickname ?? "未設定"}</p>
          {profile.areas && (
            <p className="text-sm text-[#8892A8]">{profile.areas.name}</p>
          )}
        </div>
      </div>

      {/* 累計記録 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4 text-center">
          <p className="text-xs text-[#8892A8]">累計距離</p>
          <p className="mt-1 text-2xl font-bold text-[#00D4FF]">
            {`${((stats?.total_distance ?? 0) / 1000).toFixed(1)} km`}
          </p>
        </div>
        <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4 text-center">
          <p className="text-xs text-[#8892A8]">累計回数</p>
          <p className="mt-1 text-2xl font-bold text-[#7B61FF]">
            {`${stats?.total_count ?? 0} 回`}
          </p>
        </div>
      </div>

      {/* プロフィール詳細 */}
      <div className="mt-6 rounded-2xl border border-[#1E2640] bg-[#131829] divide-y divide-[#1E2640]">
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm text-[#8892A8]">自己紹介</span>
          <span className="text-sm text-[#F0F0F0]">{profile.bio ?? "未設定"}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm text-[#8892A8]">ホームプール</span>
          <span className="text-sm text-[#F0F0F0]">{profile.home_pool ?? "未設定"}</span>
        </div>
        <div className="flex justify-between px-4 py-3">
          <span className="text-sm text-[#8892A8]">所属エリア</span>
          <span className="text-sm text-[#F0F0F0]">{profile.areas?.name ?? "未設定"}</span>
        </div>
      </div>
    </div>
  );
}
