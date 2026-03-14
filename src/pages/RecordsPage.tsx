import { Link } from "react-router-dom";
import PracticeList from "../components/PracticeList";

export default function RecordsPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <h1>練習記録</h1>
        <Link
          to="/records/new"
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white"
        >
          ＋ 追加
        </Link>
      </div>
      <PracticeList />
    </>
  );
}
