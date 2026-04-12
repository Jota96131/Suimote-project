import { Link } from "react-router-dom";
import { Plus } from "lucide-react";
import PracticeList from "../components/PracticeList";
import MonthlyChart from "../components/MonthlyChart";

export default function RecordsPage() {
  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-[#F0F0F0]">練習記録</h1>
        <Link
          to="/records/new"
          className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] px-4 py-2 text-sm font-bold text-[#0A0E1A] transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          追加
        </Link>
      </div>
      <div className="mt-4">
        <MonthlyChart />
      </div>
      <div className="mt-4">
        <PracticeList />
      </div>
    </div>
  );
}
