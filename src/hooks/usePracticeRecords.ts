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
    let ignore = false;

    async function load() {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from("practice_records")
        .select("*")
        .order("date", { ascending: false });

      if (ignore) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        setRecords((data as PracticeRecord[]) ?? []);
      }
      setLoading(false);
    }

    load();

    return () => {
      ignore = true;
    };
  }, []);

  return { records, loading, error, refetch: fetchRecords };
}
