import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { Profile, MyStats } from "../types";

export function useUserProfile(userId: string | undefined) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;

    async function fetch() {
      setLoading(true);
      setError(null);

      // まずプロフィールを取得（RLSでmatching_opt_in=falseは取得不可）
      const profileRes = await supabase
        .from("profiles")
        .select("*, areas(id, name)")
        .eq("user_id", userId!)
        .single();

      if (profileRes.error || !profileRes.data) {
        // プロフィールが見つからない = 非公開 or 存在しない
        setProfile(null);
        setLoading(false);
        return;
      }

      setProfile(profileRes.data as Profile);

      // プロフィールが取得できた場合のみ累計記録を取得
      const statsRes = await supabase.rpc("get_user_stats", {
        target_user_id: userId!,
      });

      if (!statsRes.error) {
        setStats(statsRes.data as MyStats);
      }

      setLoading(false);
    }

    fetch();
  }, [userId]);

  return { profile, stats, loading, error };
}
