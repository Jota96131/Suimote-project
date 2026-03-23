export type Badge = {
  label: string;
  icon: string;
  color: string;
};

/** 月間練習回数からバッジを判定する */
export function getBadge(monthlyCount: number): Badge | null {
  if (monthlyCount >= 20) {
    return { label: "プラチナスイマー", icon: "🏆", color: "text-purple-600 bg-purple-50 border-purple-200" };
  }
  if (monthlyCount >= 10) {
    return { label: "ゴールドスイマー", icon: "🥇", color: "text-yellow-600 bg-yellow-50 border-yellow-200" };
  }
  if (monthlyCount >= 5) {
    return { label: "シルバースイマー", icon: "🥈", color: "text-gray-600 bg-gray-50 border-gray-200" };
  }
  return null;
}
