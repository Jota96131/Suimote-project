import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { PracticeRecord } from "../types";

export function useRecordDetail(id: string) {
  const [record, setRecord] = useState<PracticeRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecord() {
      const { data, error: queryError } = await supabase
        .from("practice_records")
        .select("*")
        .eq("id", id)
        .single();

      if (queryError) {
        setError(queryError.message);
      } else {
        setRecord(data as PracticeRecord);
      }
      setLoading(false);
    }

    fetchRecord();
  }, [id]);

  return { record, loading, error };
}
