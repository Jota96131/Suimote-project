import { useState } from "react";
import { Link } from "react-router-dom";
import { User, Heart, X } from "lucide-react";
import { useAreaUsers, type ProfileWithStats } from "../hooks/useAreaUsers";
import { useMyProfile } from "../hooks/useMyProfile";
import { useLike } from "../hooks/useLike";
import SwimBadge from "../components/SwimBadge";

export default function UserListPage() {
  const { profile } = useMyProfile();
  const { users, loading, error } = useAreaUsers();
  const { isLiked, isMatched, sendLike, removeLike } = useLike();
  const [matchedUser, setMatchedUser] = useState<ProfileWithStats | null>(null);

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
      </div>
    );
  }

  if (!profile?.matching_opt_in) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-[#F0F0F0]">マッチング機能がOFFです</p>
          <p className="mt-1 text-sm text-[#8892A8]">
            マッチング機能をONにすると表示されます
          </p>
          <Link to="/profile" className="mt-4 inline-block text-sm text-[#00D4FF]">
            プロフィールで設定する
          </Link>
        </div>
      </div>
    );
  }

  if (!profile?.area_id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-6">
        <div className="mt-8 text-center">
          <p className="text-lg font-medium text-[#F0F0F0]">エリアが設定されていません</p>
          <p className="mt-1 text-sm text-[#8892A8]">
            プロフィールでエリアを設定すると、同じエリアのユーザーが表示されます
          </p>
          <Link to="/profile/edit" className="mt-4 inline-block text-sm text-[#00D4FF]">
            プロフィールを編集する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#F0F0F0]">同じエリアのユーザー</h1>
        <Link to="/matches" className="text-sm text-[#FF3B8B]">
          マッチ一覧
        </Link>
      </div>
      <p className="mt-1 text-sm text-[#8892A8]">
        {profile.areas?.name}
      </p>

      {/* マッチダイアログ */}
      {matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative mx-4 w-full max-w-sm rounded-2xl border border-[#1E2640] bg-[#131829] p-6 text-center">
            <button
              onClick={() => setMatchedUser(null)}
              className="absolute right-3 top-3 rounded-full p-1 text-[#8892A8] hover:text-[#F0F0F0]"
            >
              <X className="h-5 w-5" />
            </button>

            <Heart className="mx-auto h-12 w-12 fill-[#FF3B8B] text-[#FF3B8B]" />

            <p className="mt-3 text-xl font-bold text-[#FF3B8B]">
              マッチしました！
            </p>

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#00D4FF]/10">
                {matchedUser.avatar_url ? (
                  <img
                    src={matchedUser.avatar_url}
                    alt="avatar"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8 text-[#00D4FF]" />
                )}
              </div>
              <p className="text-lg font-bold text-[#F0F0F0]">{matchedUser.nickname}</p>
              {matchedUser.home_pool && (
                <p className="text-sm text-[#8892A8]">{matchedUser.home_pool}</p>
              )}
            </div>

            <p className="mt-4 text-sm text-[#FF3B8B]">
              同じエリアのプールで会ってみよう
            </p>

            <button
              onClick={() => setMatchedUser(null)}
              className="mt-5 w-full rounded-xl bg-gradient-to-r from-[#FF3B8B] to-[#7B61FF] py-3 text-sm font-bold text-white"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[#8892A8]">
          同じエリアにマッチング中のユーザーはいません
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {users.map((u) => (
            <li key={u.user_id} className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4">
              <Link to={`/users/${u.user_id}`}>
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00D4FF]/10">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt="avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6 text-[#00D4FF]" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#F0F0F0]">{u.nickname}</p>
                    <p className="text-xs text-[#8892A8]">
                      {u.areas?.name}{u.home_pool && ` / ${u.home_pool}`}
                    </p>
                    <SwimBadge monthlyCount={u.monthlyCount} size="sm" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-[#0A0E1A] px-3 py-2 text-center">
                    <p className="text-xs text-[#8892A8]">累計距離</p>
                    <p className="text-sm font-bold text-[#00D4FF]">
                      {((u.stats.total_distance ?? 0) / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <div className="rounded-xl bg-[#0A0E1A] px-3 py-2 text-center">
                    <p className="text-xs text-[#8892A8]">累計回数</p>
                    <p className="text-sm font-bold text-[#7B61FF]">
                      {u.stats.total_count ?? 0} 回
                    </p>
                  </div>
                </div>
              </Link>
              {isMatched(u.user_id) ? (
                <div className="mt-3 flex w-full items-center justify-center gap-1 rounded-xl bg-[#FF3B8B]/10 border border-[#FF3B8B]/30 py-2 text-sm font-medium text-[#FF3B8B]">
                  <Heart className="h-4 w-4 fill-[#FF3B8B] text-[#FF3B8B]" />
                  マッチ中
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    if (isLiked(u.user_id)) {
                      removeLike(u.user_id);
                    } else {
                      sendLike(u.user_id).then((matched) => {
                        if (matched) {
                          setMatchedUser(u);
                        }
                      });
                    }
                  }}
                  className={`mt-3 flex w-full items-center justify-center gap-1 rounded-xl border py-2 text-sm font-medium transition ${
                    isLiked(u.user_id)
                      ? "border-[#FF3B8B]/30 text-[#FF3B8B]"
                      : "border-[#1E2640] text-[#8892A8] hover:border-[#FF3B8B]/50 hover:text-[#FF3B8B]"
                  }`}
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked(u.user_id) ? "fill-[#FF3B8B] text-[#FF3B8B]" : ""}`}
                  />
                  {isLiked(u.user_id) ? "いいね済み" : "いいね"}
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
