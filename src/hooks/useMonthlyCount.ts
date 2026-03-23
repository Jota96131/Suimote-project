import { useEffect, useState } from "react";
import { supabase } from "../supabase";

export function useMonthlyCount(userId: string | undefined) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    let ignore = false;

    async function fetch() {
      setLoading(true);
      const { data } = await supabase.rpc("get_monthly_practice_count", {
        target_user_id: userId,
      });

      if (ignore) return;

      setCount((data as number) ?? 0);
      setLoading(false);
    }

    fetch();

    return () => {
      ignore = true;
    };
  }, [userId]);

  return { count, loading };
}
