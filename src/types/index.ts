/** 泳法の種類 */
export type Stroke = "クロール" | "平泳ぎ" | "背泳ぎ" | "バタフライ" | "個人メドレー";

/** facilities テーブルに対応する型 */
export type Facility = {
  id: string;
  name: string;           // 施設名
};

/** practice_records テーブルに対応する型 */
export type PracticeRecord = {
  id: string;
  user_id: string;        // ログインユーザーID
  date: string;           // YYYY-MM-DD
  distance: number;       // 距離 (m)
  time: string;           // タイム (MM:SS)
  stroke: Stroke;         // 泳法
  facility_id: string;    // facilities テーブルへの外部キー
  memo: string | null;    // メモ（任意）
  created_at: string;     // Supabase 自動生成 (ISO 8601)
};

/** practice_records + facilities をJOINした結果の型 */
export type PracticeRecordWithFacility = PracticeRecord & {
  facilities: Facility;
};
