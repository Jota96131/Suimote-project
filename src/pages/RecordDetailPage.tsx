import { Link, useParams } from "react-router-dom";
import { useRecordDetail } from "../hooks/useRecordDetail";
import { formatTime } from "../utils/formatTime";

export default function RecordDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { record, loading, error } = useRecordDetail(id ?? "");

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-muted-foreground">読み込み中...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-destructive">エラーが発生しました</p>
        <p className="mt-1 text-sm text-muted-foreground">{error}</p>
        <Link to="/records" className="mt-4 text-sm underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  if (!record) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground">
        <p className="text-lg font-medium">記録が見つかりません</p>
        <Link to="/records" className="mt-4 text-sm underline">
          一覧に戻る
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link to="/records" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <h1>練習記録詳細</h1>
      <dl>
        <div>
          <dt>日付</dt>
          <dd>{record.date}</dd>
        </div>
        <div>
          <dt>距離</dt>
          <dd>{record.distance} m</dd>
        </div>
        <div>
          <dt>タイム</dt>
          <dd>{formatTime(Number(record.time))}</dd>
        </div>
        <div>
          <dt>泳法</dt>
          <dd>{record.stroke}</dd>
        </div>
        <div>
          <dt>プール施設</dt>
          <dd>{record.facility}</dd>
        </div>
        {record.memo && (
          <div>
            <dt>メモ</dt>
            <dd>{record.memo}</dd>
          </div>
        )}
      </dl>
    </div>
  );
}
