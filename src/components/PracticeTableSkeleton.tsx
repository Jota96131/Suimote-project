import { Skeleton } from "./ui/skeleton";

export default function PracticeTableSkeleton() {
  return (
    <div className="flex flex-col gap-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 rounded-2xl border border-[#1E2640] bg-[#131829] p-4"
        >
          <Skeleton className="h-11 w-11 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="mt-2 h-3 w-48" />
          </div>
        </div>
      ))}
    </div>
  );
}
