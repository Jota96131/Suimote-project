import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { MyStats } from "../types";

export function useMyStats() {
  const { user } = useAuth();
  const [stats, setStats] = useState<MyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    async function fetch() {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase.rpc("get_my_stats", {
        p_user_id: user!.id,
      });

      if (err) {
        setError(err.message);
      } else {
        setStats(data as MyStats);
      }

      setLoading(false);
    }

    fetch();
  }, [user]);

  return { stats, loading, error };
}
