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

  if (!profile?.matching_opt_in) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link to="/records" className="text-sm underline">
          ← 記録一覧に戻る
        </Link>
        <div className="mt-8 text-center">
          <p className="text-lg font-medium">マッチング機能がOFFです</p>
          <p className="mt-1 text-sm text-muted-foreground">
            マッチング機能をONにすると表示されます
          </p>
          <Link to="/profile" className="mt-4 inline-block text-sm text-blue-600 underline">
            プロフィールで設定する
          </Link>
        </div>
      </div>
    );
  }

  if (!profile?.area_id) {
    return (
      <div className="mx-auto max-w-lg px-4 py-8">
        <Link to="/records" className="text-sm underline">
          ← 記録一覧に戻る
        </Link>
        <div className="mt-8 text-center">
          <p className="text-lg font-medium">エリアが設定されていません</p>
          <p className="mt-1 text-sm text-muted-foreground">
            プロフィールでエリアを設定すると、同じエリアのユーザーが表示されます
          </p>
          <Link to="/profile/edit" className="mt-4 inline-block text-sm text-blue-600 underline">
            プロフィールを編集する
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/records" className="text-sm underline">
        ← 記録一覧に戻る
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="text-xl font-bold">同じエリアのユーザー</h1>
        <Link to="/matches" className="text-sm text-pink-600 underline">
          マッチ一覧
        </Link>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        {profile.areas?.name}
      </p>

      {matchedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative mx-4 w-full max-w-sm rounded-2xl bg-white p-6 text-center shadow-lg">
            <button
              onClick={() => setMatchedUser(null)}
              className="absolute right-3 top-3 rounded-full p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>

            <Heart className="mx-auto h-12 w-12 fill-pink-500 text-pink-500" />

            <p className="mt-3 text-xl font-bold text-pink-600">
              マッチしました！
            </p>

            <div className="mt-4 flex flex-col items-center gap-2">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                {matchedUser.avatar_url ? (
                  <img
                    src={matchedUser.avatar_url}
                    alt="avatar"
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <User className="h-8 w-8" />
                )}
              </div>
              <p className="text-lg font-bold">{matchedUser.nickname}</p>
              {matchedUser.home_pool && (
                <p className="text-sm text-muted-foreground">{matchedUser.home_pool}</p>
              )}
            </div>

            <p className="mt-4 text-sm text-pink-500">
              同じエリアのプールで会ってみよう
            </p>

            <button
              onClick={() => setMatchedUser(null)}
              className="mt-5 w-full rounded-lg bg-pink-500 py-2 text-sm font-medium text-white hover:bg-pink-600"
            >
              閉じる
            </button>
          </div>
        </div>
      )}

      {users.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          同じエリアにマッチング中のユーザーはいません
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {users.map((u) => (
            <li key={u.id} className="rounded-lg border p-4">
              <Link
                to={`/users/${u.user_id}`}
                className="hover:bg-gray-50 block"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    {u.avatar_url ? (
                      <img
                        src={u.avatar_url}
                        alt="avatar"
                        className="h-12 w-12 rounded-full object-cover"
                      />
                    ) : (
                      <User className="h-6 w-6" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium">{u.nickname}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.areas?.name}{u.home_pool && ` / ${u.home_pool}`}
                    </p>
                    <SwimBadge monthlyCount={u.monthlyCount} size="sm" />
                  </div>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <div className="rounded bg-gray-50 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">累計距離</p>
                    <p className="text-sm font-bold">
                      {((u.stats.total_distance ?? 0) / 1000).toFixed(1)} km
                    </p>
                  </div>
                  <div className="rounded bg-gray-50 px-3 py-2 text-center">
                    <p className="text-xs text-muted-foreground">累計回数</p>
                    <p className="text-sm font-bold">
                      {u.stats.total_count ?? 0} 回
                    </p>
                  </div>
                </div>
              </Link>
              {isMatched(u.user_id) ? (
                <div className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg bg-pink-50 border border-pink-200 py-2 text-sm font-medium text-pink-600">
                  <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
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
                  className="mt-3 flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-sm font-medium transition-colors hover:bg-gray-50"
                >
                  <Heart
                    className={`h-4 w-4 ${isLiked(u.user_id) ? "fill-red-500 text-red-500" : "text-gray-400"}`}
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
