import { Link } from "react-router-dom";
import { User, Pencil, LogOut } from "lucide-react";
import { useMyProfile } from "../hooks/useMyProfile";
import { useMyStats } from "../hooks/useMyStats";
import { useMonthlyCount } from "../hooks/useMonthlyCount";
import { useAuth } from "../hooks/useAuth";
import SwimBadge from "../components/SwimBadge";

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { profile, loading, error, updateProfile } = useMyProfile();
  const { stats, loading: statsLoading } = useMyStats();
  const { count: monthlyCount } = useMonthlyCount(user?.id);

  async function handleToggleMatching() {
    if (!profile) return;

    if (!profile.matching_opt_in) {
      const ok = window.confirm(
        "プロフィールが他のユーザーに表示されます。よろしいですか？"
      );
      if (!ok) return;
    }

    await updateProfile({ matching_opt_in: !profile.matching_opt_in });
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
        <Link to="/records" className="mt-4 text-sm text-[#00D4FF]">
          記録一覧に戻る
        </Link>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#8892A8]">プロフィールが見つかりません</p>
        <Link to="/records" className="mt-4 text-sm text-[#00D4FF]">
          記録一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold text-[#F0F0F0]">マイページ</h1>

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
          <SwimBadge monthlyCount={monthlyCount} />
        </div>
      </div>

      {/* 累計記録 */}
      <div className="mt-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4 text-center">
          <p className="text-xs text-[#8892A8]">累計距離</p>
          <p className="mt-1 text-2xl font-bold text-[#00D4FF]">
            {statsLoading ? "..." : `${((stats?.total_distance ?? 0) / 1000).toFixed(1)} km`}
          </p>
        </div>
        <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4 text-center">
          <p className="text-xs text-[#8892A8]">累計回数</p>
          <p className="mt-1 text-2xl font-bold text-[#7B61FF]">
            {statsLoading ? "..." : `${stats?.total_count ?? 0} 回`}
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
        <div className="flex items-center justify-between px-4 py-3">
          <span className="text-sm text-[#8892A8]">マッチング機能</span>
          <button
            type="button"
            role="switch"
            aria-checked={profile.matching_opt_in}
            onClick={handleToggleMatching}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors ${
              profile.matching_opt_in ? "bg-[#00D4FF]" : "bg-[#1E2640]"
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 translate-y-0.5 rounded-full bg-white shadow transition-transform ${
                profile.matching_opt_in ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      {profile.matching_opt_in ? (
        <p className="mt-3 rounded-xl bg-[#00D4FF]/10 px-4 py-2 text-sm text-[#00D4FF]">
          マッチング機能が有効です
        </p>
      ) : (
        <p className="mt-3 rounded-xl bg-[#1E2640] px-4 py-2 text-sm text-[#8892A8]">
          マッチング機能はOFFです。ONにすると同じエリアのユーザーと出会えます
        </p>
      )}

      {/* アクション */}
      <div className="mt-6 flex flex-col gap-3">
        <Link
          to="/profile/edit"
          className="flex items-center justify-center gap-2 rounded-xl border border-[#1E2640] bg-[#131829] px-4 py-3 text-sm font-medium text-[#F0F0F0] transition hover:border-[#00D4FF]/50"
        >
          <Pencil className="h-4 w-4" />
          編集する
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center justify-center gap-2 rounded-xl border border-[#1E2640] px-4 py-3 text-sm text-[#8892A8] transition hover:border-[#FF3B8B]/50 hover:text-[#FF3B8B]"
        >
          <LogOut className="h-4 w-4" />
          ログアウト
        </button>
      </div>
    </div>
  );
}
