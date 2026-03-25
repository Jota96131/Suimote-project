import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Calendar, Ruler, Timer, Waves, MapPin, FileText } from "lucide-react";
import { useRecordDetail } from "../hooks/useRecordDetail";
import { formatTime } from "../utils/formatTime";

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { record, loading, error } = useRecordDetail(id ?? "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#8892A8]">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#FF3B8B]">エラーが発生しました</p>
        <p className="mt-1 text-sm text-[#8892A8]">{error}</p>
        <Link to="/records" className="mt-4 text-sm text-[#00D4FF]">
          一覧に戻る
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#8892A8]">記録が見つかりません</p>
        <Link to="/records" className="mt-4 text-sm text-[#00D4FF]">
          一覧に戻る
        </Link>
      </div>
    );
  }

  const items = [
    { icon: Calendar, label: "日付", value: record.date },
    { icon: Ruler, label: "距離", value: `${record.distance} m` },
    { icon: Timer, label: "タイム", value: formatTime(Number(record.time)) },
    { icon: Waves, label: "泳法", value: record.stroke },
    { icon: MapPin, label: "施設", value: record.facility },
    ...(record.memo ? [{ icon: FileText, label: "メモ", value: record.memo }] : []),
  ];

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link to="/records" className="flex items-center gap-1 text-sm text-[#8892A8] hover:text-[#00D4FF] transition">
        <ArrowLeft className="h-4 w-4" />
        一覧に戻る
      </Link>

      <h1 className="mt-4 text-xl font-bold text-[#F0F0F0]">練習記録詳細</h1>

      <div className="mt-4 flex flex-col gap-3">
        {items.map(({ icon: Icon, label, value }) => (
          <div
            key={label}
            className="flex items-center gap-4 rounded-2xl border border-[#1E2640] bg-[#131829] p-4"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#00D4FF]/10">
              <Icon className="h-5 w-5 text-[#00D4FF]" />
            </div>
            <div>
              <p className="text-xs text-[#8892A8]">{label}</p>
              <p className="font-medium text-[#F0F0F0]">{value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
