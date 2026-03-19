import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { PracticeRecord } from "../types";

export function usePracticeRecords() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("practice_records")
      .select("*")
      .order("date", { ascending: false });

    if (queryError) {
      setError(queryError.message);
    } else {
      setRecords((data as PracticeRecord[]) ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  return { records, loading, error, refetch: fetchRecords };
}
