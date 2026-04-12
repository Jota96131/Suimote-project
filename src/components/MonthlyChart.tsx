import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useMonthlyHistory } from "../hooks/useMonthlyHistory";

export default function MonthlyChart() {
  const { history, loading } = useMonthlyHistory();

  if (loading) {
    return (
      <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4">
        <p className="text-sm text-[#8892A8]">グラフを読み込み中...</p>
      </div>
    );
  }

  if (history.length === 0) {
    return null;
  }

  const data = history.map((h) => ({
    month: h.month.slice(5) + "月", // "01" → "1月"
    days: h.days,
  }));

  return (
    <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4">
      <p className="mb-3 text-sm font-medium text-[#8892A8]">月別練習日数</p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
          <XAxis
            dataKey="month"
            tick={{ fill: "#8892A8", fontSize: 12 }}
            axisLine={{ stroke: "#1E2640" }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#8892A8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#131829",
              border: "1px solid #1E2640",
              borderRadius: "0.75rem",
              color: "#F0F0F0",
              fontSize: 13,
            }}
            formatter={(value) => [`${value ?? 0} 日`, "練習日数"]}
          />
          <Bar
            dataKey="days"
            fill="#00D4FF"
            radius={[6, 6, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
