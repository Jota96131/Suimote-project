import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { PracticeRecordWithFacility } from "../types";

export function usePracticeRecords() {
  const [records, setRecords] = useState<PracticeRecordWithFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      const { data, error: queryError } = await supabase
        .from("practice_records")
        .select("*")
        .order("date", { ascending: false });

      if (queryError) {
        setError(queryError.message);
      } else {
        setRecords((data as PracticeRecordWithFacility[]) ?? []);
      }
      setLoading(false);
    }

    fetchRecords();
  }, []);

  return { records, loading, error };
}
