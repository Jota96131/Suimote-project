/** 泳法の種類 */
export type Stroke = "クロール" | "平泳ぎ" | "背泳ぎ" | "バタフライ" | "個人メドレー";

/** practice_records テーブルに対応する型 */
export type PracticeRecord = {
  id: string;
  date: string;           // YYYY-MM-DD
  distance: number;       // 距離 (m)
  time: string;           // タイム (MM:SS)
  stroke: Stroke;         // 泳法
  facility: string;       // プール施設名
  memo: string | null;    // メモ（任意）
  created_at: string;     // Supabase 自動生成 (ISO 8601)
};
