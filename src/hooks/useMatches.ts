import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { Profile } from "../types";

export type MatchedProfile = Profile & { monthlyCount: number };

export function useMatches() {
  const { user } = useAuth();
  const [matches, setMatches] = useState<MatchedProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    async function fetchMatches() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase.rpc("get_matched_users_with_stats");

      if (ignore) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      setMatches((data as MatchedProfile[]) ?? []);
      setLoading(false);
    }

    fetchMatches();

    return () => {
      ignore = true;
    };
  }, [user]);

  const removeMatch = useCallback(
    async (targetUserId: string) => {
      if (!user) return;

      // 楽観的UI更新: リストから即削除
      setMatches((prev) => prev.filter((m) => m.user_id !== targetUserId));

      // 自分のいいねを削除 → 相互いいねが崩れてマッチ解除
      const { error: err } = await supabase
        .from("likes")
        .delete()
        .eq("from_user_id", user.id)
        .eq("to_user_id", targetUserId);

      if (err) {
        // 失敗時はリロードで復元
        setError("マッチ解除に失敗しました");
      }
    },
    [user]
  );

  return { matches, loading, error, removeMatch };
}
