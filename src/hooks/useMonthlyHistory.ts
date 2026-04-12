import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import { useAuth } from "./useAuth";
import type { MonthlyHistory } from "../types";

/**
 * 過去6ヶ月分の月別練習日数を取得する
 */
export function useMonthlyHistory() {
  const { user } = useAuth();
  const [history, setHistory] = useState<MonthlyHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    let ignore = false;

    async function fetch() {
      setLoading(true);

      // 6ヶ月前の月初を算出
      const now = new Date();
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const fromDate = sixMonthsAgo.toISOString().split("T")[0];

      const { data, error } = await supabase
        .from("practice_records")
        .select("date")
        .gte("date", fromDate)
        .order("date", { ascending: true });

      if (ignore) return;

      if (error || !data) {
        setLoading(false);
        return;
      }

      // 月ごとにユニーク日数を集計
      const monthMap = new Map<string, Set<string>>();

      // 先に6ヶ月分のキーを作っておく（データがない月も0で表示）
      for (let i = 0; i < 6; i++) {
        const d = new Date(now.getFullYear(), now.getMonth() - 5 + i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
        monthMap.set(key, new Set());
      }

      for (const row of data) {
        const month = (row as { date: string }).date.slice(0, 7); // YYYY-MM
        const existing = monthMap.get(month);
        if (existing) {
          existing.add((row as { date: string }).date);
        }
      }

      const result: MonthlyHistory[] = [];
      for (const [month, dates] of monthMap) {
        result.push({ month, days: dates.size });
      }

      setHistory(result);
      setLoading(false);
    }

    fetch();

    return () => {
      ignore = true;
    };
  }, [user]);

  return { history, loading };
}
