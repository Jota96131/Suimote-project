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
  const canFetch = Boolean(user && profile?.area_id);
  const [loading, setLoading] = useState(canFetch);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canFetch) return;

    async function fetch() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase.rpc("get_area_users_with_stats", {
        p_area_id: profile!.area_id!,
        p_exclude_user_id: user!.id,
      });

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const result = (data as ProfileWithStats[]) ?? [];
      setUsers(result);
      setLoading(false);
    }

    fetch();
  }, [canFetch, user, profile]);

  return { users, loading, error };
}
