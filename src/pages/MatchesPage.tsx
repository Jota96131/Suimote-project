import { Link } from "react-router-dom";
import { User, Heart } from "lucide-react";
import { useMatches } from "../hooks/useMatches";
import SwimBadge from "../components/SwimBadge";

export default function MatchesPage() {
  const { matches, loading, error } = useMatches();

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

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold text-[#F0F0F0]">マッチしたユーザー</h1>

      {matches.length === 0 ? (
        <p className="mt-8 text-center text-sm text-[#8892A8]">
          まだマッチしたユーザーはいません
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {matches.map((m) => (
            <li key={m.id}>
              <Link
                to={`/users/${m.user_id}`}
                className="flex items-center gap-3 rounded-2xl border border-[#1E2640] bg-[#131829] p-4 transition hover:border-[#FF3B8B]/40"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#00D4FF]/10">
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt="avatar"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6 text-[#00D4FF]" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-[#F0F0F0]">{m.nickname}</p>
                  {m.home_pool && (
                    <p className="text-xs text-[#8892A8]">{m.home_pool}</p>
                  )}
                  <SwimBadge monthlyCount={m.monthlyCount} size="sm" />
                </div>
                <Heart className="h-4 w-4 fill-[#FF3B8B] text-[#FF3B8B]" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
