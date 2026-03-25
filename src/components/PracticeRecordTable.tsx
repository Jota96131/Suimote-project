import { useNavigate } from "react-router-dom";
import { Waves, MapPin, ChevronRight } from "lucide-react";
import type { PracticeRecord } from "../types";
import { formatTime } from "../utils/formatTime";

type Props = {
  records: PracticeRecord[];
};

export default function PracticeRecordTable({ records }: Props) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-3">
      {records.map((record) => (
        <div
          key={record.id}
          onClick={() => navigate(`/records/${record.id}`)}
          className="flex cursor-pointer items-center gap-4 rounded-2xl border border-[#1E2640] bg-[#131829] p-4 transition hover:border-[#00D4FF]/40"
        >
          {/* 左: 泳法アイコン */}
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#00D4FF]/10">
            <Waves className="h-5 w-5 text-[#00D4FF]" />
          </div>

          {/* 中央: 情報 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#F0F0F0]">{record.stroke}</span>
              <span className="rounded-md bg-[#1E2640] px-2 py-0.5 text-xs text-[#00D4FF]">
                {record.distance}m
              </span>
            </div>
            <div className="mt-1 flex items-center gap-3 text-xs text-[#8892A8]">
              <span>{record.date}</span>
              <span>{formatTime(Number(record.time))}</span>
            </div>
            {record.facility && (
              <div className="mt-1 flex items-center gap-1 text-xs text-[#8892A8]">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{record.facility}</span>
              </div>
            )}
          </div>

          {/* 右: 矢印 */}
          <ChevronRight className="h-5 w-5 shrink-0 text-[#8892A8]" />
        </div>
      ))}
    </div>
  );
}
