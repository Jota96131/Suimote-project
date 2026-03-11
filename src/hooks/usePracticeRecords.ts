import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import type { PracticeRecordWithFacility } from "../types";

export function usePracticeRecords() {
  const [records, setRecords] = useState<PracticeRecordWithFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      // ログインユーザーを取得
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("ログインしてください。");
        setLoading(false);
        return;
      }

      // practice_records + facilities をJOINして取得
      const { data, error: queryError } = await supabase
        .from("practice_records")
        .select("*, facilities(*)")
        .eq("user_id", user.id)
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
