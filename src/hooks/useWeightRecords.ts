import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { WeightRecord } from "../types";

export function useWeightRecords() {
  const { user } = useAuth();
  const [records, setRecords] = useState<WeightRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);

    const { data, error: queryError } = await supabase
      .from("weight_records")
      .select("*")
      .order("date", { ascending: false })
      .limit(90); // 直近約3ヶ月分

    if (queryError) {
      setError(queryError.message);
    } else {
      setRecords((data as WeightRecord[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    (async () => {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from("weight_records")
        .select("*")
        .order("date", { ascending: false })
        .limit(90);

      if (ignore) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setRecords((data as WeightRecord[]) ?? []);
      }
      setLoading(false);
    })();

    return () => { ignore = true; };
  }, [user]);

  async function addWeight(date: string, weight: number) {
    if (!user) return;
    setError(null);

    const { error: insertError } = await supabase
      .from("weight_records")
      .upsert(
        { user_id: user.id, date, weight },
        { onConflict: "user_id,date" }
      );

    if (insertError) {
      setError(insertError.message);
      return false;
    }

    await fetchRecords();
    return true;
  }

  async function deleteWeight(id: string) {
    setError(null);

    const { error: deleteError } = await supabase
      .from("weight_records")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return false;
    }

    setRecords((prev) => prev.filter((r) => r.id !== id));
    return true;
  }

  return { records, loading, error, addWeight, deleteWeight, refetch: fetchRecords };
}
