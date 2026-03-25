import { usePracticeRecords } from "../hooks/usePracticeRecords";
import PracticeRecordTable from "./PracticeRecordTable";
import PracticeTableSkeleton from "./PracticeTableSkeleton";

export default function PracticeList() {
  const { records, loading, error } = usePracticeRecords();

  if (loading) return <PracticeTableSkeleton />;
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#FF3B8B]">エラーが発生しました</p>
        <p className="mt-1 text-sm text-[#8892A8]">{error}</p>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#8892A8]">練習記録がありません</p>
        <p className="mt-1 text-sm text-[#8892A8]">記録を追加すると、ここに表示されます。</p>
      </div>
    );
  }

  return <PracticeRecordTable records={records} />;
}
