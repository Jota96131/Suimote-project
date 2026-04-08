import { useCallback, useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { PracticeRecord } from "../types";

const PAGE_SIZE = 20;
const LIST_COLUMNS = "id, date, distance, time, stroke, facility";

export function usePracticeRecords() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const fetchRecords = useCallback(async (offset: number = 0) => {
    setLoading(true);
    const { data, error: queryError } = await supabase
      .from("practice_records")
      .select(LIST_COLUMNS)
      .order("date", { ascending: false })
      .range(offset, offset + PAGE_SIZE - 1);

    if (queryError) {
      setError(queryError.message);
    } else {
      const fetched = (data as PracticeRecord[]) ?? [];
      setHasMore(fetched.length === PAGE_SIZE);
      if (offset === 0) {
        setRecords(fetched);
      } else {
        setRecords((prev) => [...prev, ...fetched]);
      }
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    let ignore = false;

    (async () => {
      setLoading(true);
      const { data, error: queryError } = await supabase
        .from("practice_records")
        .select(LIST_COLUMNS)
        .order("date", { ascending: false })
        .range(0, PAGE_SIZE - 1);

      if (ignore) return;

      if (queryError) {
        setError(queryError.message);
      } else {
        const fetched = (data as PracticeRecord[]) ?? [];
        setHasMore(fetched.length === PAGE_SIZE);
        setRecords(fetched);
      }
      setLoading(false);
    })();

    return () => { ignore = true; };
  }, []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchRecords(records.length);
    }
  }, [loading, hasMore, records.length, fetchRecords]);

  return { records, loading, error, hasMore, loadMore, refetch: () => fetchRecords(0) };
}
