import { useEffect, useState } from "react";
import { supabase } from "../../supabase";
import type { PracticeRecord } from "../types";

export default function PracticeList() {
  const [records, setRecords] = useState<PracticeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecords() {
      const { data, error } = await supabase
        .from("practice_records")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        setError(error.message);
      } else {
        setRecords(data ?? []);
      }
      setLoading(false);
    }

    fetchRecords();
  }, []);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;
  if (records.length === 0) return <p>練習記録がありません。</p>;

  return (
    <div>
      <h2>練習記録一覧</h2>
      <table>
        <thead>
          <tr>
            <th>日付</th>
            <th>距離 (m)</th>
            <th>タイム</th>
            <th>泳法</th>
            <th>プール施設</th>
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              <td>{record.date}</td>
              <td>{record.distance}</td>
              <td>{record.time}</td>
              <td>{record.stroke}</td>
              <td>{record.facility}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
