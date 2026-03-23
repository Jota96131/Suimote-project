import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import { useMyProfile } from "./useMyProfile";
import type { Profile, MyStats } from "../types";

export type ProfileWithStats = Profile & { stats: MyStats; monthlyCount: number };

export function useAreaUsers() {
  const { user } = useAuth();
  const { profile } = useMyProfile();
  const [users, setUsers] = useState<ProfileWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canFetch = Boolean(user && profile?.area_id);

  useEffect(() => {
    if (!canFetch) return;

    async function fetch() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("profiles")
        .select("*, areas(id, name)")
        .eq("area_id", profile!.area_id!)
        .eq("matching_opt_in", true)
        .neq("user_id", user!.id);

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const profiles = (data as Profile[]) ?? [];

      // 各ユーザーの累計記録を取得
      const withStats = await Promise.all(
        profiles.map(async (p) => {
          const [statsRes, monthlyRes] = await Promise.all([
            supabase.rpc("get_user_stats", { target_user_id: p.user_id }),
            supabase.rpc("get_monthly_practice_count", { target_user_id: p.user_id }),
          ]);
          return {
            ...p,
            stats: (statsRes.data as MyStats) ?? { total_distance: 0, total_count: 0 },
            monthlyCount: (monthlyRes.data as number) ?? 0,
          };
        })
      );

      setUsers(withStats);
      setLoading(false);
    }

    fetch();
  }, [canFetch, user, profile]);

  return { users, loading, error };
}
