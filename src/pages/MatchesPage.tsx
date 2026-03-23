import { Link } from "react-router-dom";
import { User, Heart } from "lucide-react";
import { useMatches } from "../hooks/useMatches";
import SwimBadge from "../components/SwimBadge";

export default function MatchesPage() {
  const { matches, loading, error } = useMatches();

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

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/records" className="text-sm underline">
        ← 記録一覧に戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold">マッチしたユーザー</h1>

      {matches.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          まだマッチしたユーザーはいません
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {matches.map((m) => (
            <li key={m.id}>
              <Link
                to={`/users/${m.user_id}`}
                className="flex items-center gap-3 rounded-lg border p-4 hover:bg-gray-50"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt="avatar"
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-6 w-6" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{m.nickname}</p>
                  {m.home_pool && (
                    <p className="text-xs text-muted-foreground">{m.home_pool}</p>
                  )}
                  <SwimBadge monthlyCount={m.monthlyCount} size="sm" />
                </div>
                <Heart className="h-4 w-4 fill-pink-500 text-pink-500" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
