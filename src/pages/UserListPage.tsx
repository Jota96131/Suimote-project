import { Link } from "react-router-dom";
import { User } from "lucide-react";
import { useAreaUsers } from "../hooks/useAreaUsers";
import { useMyProfile } from "../hooks/useMyProfile";

export default function UserListPage() {
  const { profile } = useMyProfile();
  const { users, loading, error } = useAreaUsers();

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

      <h1 className="mt-4 text-xl font-bold">同じエリアのユーザー</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        {profile.areas?.name}
      </p>

      {users.length === 0 ? (
        <p className="mt-8 text-center text-sm text-muted-foreground">
          同じエリアにマッチング中のユーザーはいません
        </p>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {users.map((u) => (
            <li key={u.id}>
              <Link
                to={`/users/${u.user_id}`}
                className="rounded-lg border p-4 hover:bg-gray-50 block"
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
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
