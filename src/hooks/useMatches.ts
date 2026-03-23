import { useEffect, useState } from "react";
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

      const { data, error: err } = await supabase.rpc("get_matched_users");

      if (ignore) return;

      if (err) {
        setError(err.message);
        setLoading(false);
        return;
      }

      const profiles = (data as Profile[]) ?? [];

      const withMonthly = await Promise.all(
        profiles.map(async (p) => {
          const { data: countData } = await supabase.rpc("get_monthly_practice_count", {
            target_user_id: p.user_id,
          });
          return { ...p, monthlyCount: (countData as number) ?? 0 };
        })
      );

      setMatches(withMonthly);
      setLoading(false);
    }

    fetchMatches();

    return () => {
      ignore = true;
    };
  }, [user]);

  return { matches, loading, error };
}
