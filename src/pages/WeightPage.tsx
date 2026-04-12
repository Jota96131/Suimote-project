import { useState } from "react";
import { Trash2 } from "lucide-react";
import { useWeightRecords } from "../hooks/useWeightRecords";
import WeightChart from "../components/WeightChart";
import CalendarModal from "../components/CalendarModal";
import { Calendar } from "lucide-react";

const inputClass =
  "rounded-xl border border-[#1E2640] bg-[#0A0E1A] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#8892A8] outline-none focus:border-[#00D4FF] transition";

const today = () => new Date().toISOString().split("T")[0];

export default function WeightPage() {
  const { records, loading, error, addWeight, deleteWeight } = useWeightRecords();
  const [date, setDate] = useState(today());
  const [weight, setWeight] = useState("");
  const [saving, setSaving] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!weight) return;
    setSaving(true);
    const ok = await addWeight(date, Number(weight));
    if (ok) {
      setWeight("");
      setDate(today());
    }
    setSaving(false);
  }

  async function handleDelete(id: string) {
    const ok = window.confirm("この記録を削除しますか？");
    if (!ok) return;
    await deleteWeight(id);
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <h1 className="text-xl font-bold text-[#F0F0F0]">体重記録</h1>

      {/* 入力フォーム */}
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-3">
        <div className="flex gap-3">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-xs font-medium text-[#8892A8]">日付</label>
            <button
              type="button"
              onClick={() => setCalendarOpen(true)}
              className={`${inputClass} flex items-center justify-between text-left`}
            >
              <span className="truncate">{date}</span>
              <Calendar className="h-4 w-4 shrink-0 text-[#8892A8]" />
            </button>
            <CalendarModal
              key={String(calendarOpen)}
              open={calendarOpen}
              value={date}
              onSelect={(d) => setDate(d)}
              onClose={() => setCalendarOpen(false)}
            />
          </div>
          <div className="flex w-28 flex-col gap-1">
            <label htmlFor="weight" className="text-xs font-medium text-[#8892A8]">
              体重 (kg)
            </label>
            <input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              min={20}
              max={300}
              step="0.1"
              required
              placeholder="65.0"
              className={inputClass}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={saving}
          className="rounded-xl bg-gradient-to-r from-[#7B61FF] to-[#00D4FF] px-4 py-3 text-sm font-bold text-[#0A0E1A] transition hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "保存中..." : "記録する"}
        </button>
      </form>

      {error && (
        <p className="mt-3 rounded-lg bg-[#FF3B8B]/10 px-3 py-2 text-sm text-[#FF3B8B]">
          {error}
        </p>
      )}

      {/* グラフ */}
      <div className="mt-6">
        <WeightChart records={records} />
      </div>

      {/* 記録一覧 */}
      <div className="mt-6">
        <p className="mb-2 text-sm font-medium text-[#8892A8]">記録一覧</p>
        {loading ? (
          <p className="py-4 text-center text-sm text-[#8892A8]">読み込み中...</p>
        ) : records.length === 0 ? (
          <p className="py-4 text-center text-sm text-[#8892A8]">
            まだ記録がありません
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {records.map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-xl border border-[#1E2640] bg-[#131829] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-[#F0F0F0]">{r.date}</p>
                </div>
                <div className="flex items-center gap-3">
                  <p className="text-lg font-bold text-[#7B61FF]">{r.weight} kg</p>
                  <button
                    onClick={() => handleDelete(r.id)}
                    className="rounded-lg p-1.5 text-[#8892A8] transition hover:bg-[#FF3B8B]/10 hover:text-[#FF3B8B]"
                    aria-label="削除"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
