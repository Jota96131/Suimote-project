import { Skeleton } from "./ui/skeleton";

export default function PracticeTableSkeleton() {
  return (
    <div>
      <Skeleton className="mb-4 h-7 w-40" />
      <table className="w-full">
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
          {Array.from({ length: 5 }).map((_, i) => (
            <tr key={i}>
              <td><Skeleton className="h-4 w-24" /></td>
              <td><Skeleton className="h-4 w-16" /></td>
              <td><Skeleton className="h-4 w-20" /></td>
              <td><Skeleton className="h-4 w-16" /></td>
              <td><Skeleton className="h-4 w-28" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
