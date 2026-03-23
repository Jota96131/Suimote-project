import { getBadge } from "../utils/badge";

type Props = {
  monthlyCount: number;
  size?: "sm" | "md";
};

export default function SwimBadge({ monthlyCount, size = "md" }: Props) {
  const badge = getBadge(monthlyCount);
  if (!badge) return null;

  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-3 py-1";

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border font-medium ${badge.color} ${sizeClass}`}>
      {badge.icon} {badge.label}
    </span>
  );
}
