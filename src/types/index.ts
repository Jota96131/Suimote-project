/** 泳法の種類 */
export type Stroke = "クロール" | "平泳ぎ" | "背泳ぎ" | "バタフライ" | "個人メドレー";

/** practice_records テーブルに対応する型 */
export type PracticeRecord = {
  id: string;
  date: string;           // YYYY-MM-DD
  distance: number;       // 距離 (m)
  time: string;           // タイム (秒数)
  stroke: Stroke;         // 泳法
  facility: string;       // 施設名（テキスト）
  memo: string | null;    // メモ（任意）
  created_at: string;     // Supabase 自動生成 (ISO 8601)
};

export type PracticeRecordWithFacility = PracticeRecord;

/** areas マスタテーブルに対応する型 */
export type Area = {
  id: string;
  name: string;         // エリア名（例: "渋谷・新宿"）
};

/** profiles テーブルに対応する型 */
export type Profile = {
  id: string;
  user_id: string;
  nickname: string;
  avatar_url: string | null;
  bio: string | null;
  home_pool: string | null;
  area_id: string | null;
  matching_opt_in: boolean;
  created_at: string;
  areas?: Area | null;  // join時に含まれるエリア情報
};

/** 累計記録の型 */
export type MyStats = {
  total_distance: number;  // 累計距離 (m)
  total_count: number;     // 累計回数
};
