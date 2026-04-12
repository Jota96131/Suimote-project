import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { WeightRecord } from "../types";

type Props = {
  records: WeightRecord[];
};

export default function WeightChart({ records }: Props) {
  if (records.length === 0) {
    return null;
  }

  // 日付昇順に並べる
  const sorted = [...records].sort((a, b) => a.date.localeCompare(b.date));

  const data = sorted.map((r) => ({
    date: r.date.slice(5), // "MM-DD"
    weight: r.weight,
  }));

  // Y軸の範囲を適切に設定
  const weights = sorted.map((r) => r.weight);
  const minW = Math.floor(Math.min(...weights) - 2);
  const maxW = Math.ceil(Math.max(...weights) + 2);

  return (
    <div className="rounded-2xl border border-[#1E2640] bg-[#131829] p-4">
      <p className="mb-3 text-sm font-medium text-[#8892A8]">体重推移</p>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#1E2640" />
          <XAxis
            dataKey="date"
            tick={{ fill: "#8892A8", fontSize: 11 }}
            axisLine={{ stroke: "#1E2640" }}
            tickLine={false}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={[minW, maxW]}
            tick={{ fill: "#8892A8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            unit="kg"
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#131829",
              border: "1px solid #1E2640",
              borderRadius: "0.75rem",
              color: "#F0F0F0",
              fontSize: 13,
            }}
            formatter={(value) => [`${value ?? 0} kg`, "体重"]}
          />
          <Line
            type="monotone"
            dataKey="weight"
            stroke="#7B61FF"
            strokeWidth={2}
            dot={{ fill: "#7B61FF", r: 3 }}
            activeDot={{ r: 5, fill: "#00D4FF" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
