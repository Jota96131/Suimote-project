import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useAddRecord } from "../hooks/useAddRecord";

const STROKES = ["クロール", "平泳ぎ", "背泳ぎ", "バタフライ", "個人メドレー"] as const;

const inputClass =
  "rounded-xl border border-[#1E2640] bg-[#0A0E1A] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#8892A8] outline-none focus:border-[#00D4FF] transition";

export default function AddRecordPage() {
  const navigate = useNavigate();
  const { form, loading, error, handleChange, handleSubmit } = useAddRecord();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleSubmit(() => navigate("/records"));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link to="/records" className="flex items-center gap-1 text-sm text-[#8892A8] hover:text-[#00D4FF] transition">
        <ArrowLeft className="h-4 w-4" />
        一覧に戻る
      </Link>
      <h1 className="mt-4 text-xl font-bold text-[#F0F0F0]">練習記録を追加</h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-sm font-medium text-[#8892A8]">
            日付
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="distance" className="text-sm font-medium text-[#8892A8]">
            距離 (m)
          </label>
          <input
            id="distance"
            type="number"
            name="distance"
            value={form.distance}
            onChange={handleChange}
            min={1}
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="time" className="text-sm font-medium text-[#8892A8]">
            タイム (秒)
          </label>
          <input
            id="time"
            type="number"
            name="time"
            value={form.time}
            onChange={handleChange}
            min={0}
            step="0.01"
            required
            className={inputClass}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stroke" className="text-sm font-medium text-[#8892A8]">
            泳法
          </label>
          <select
            id="stroke"
            name="stroke"
            value={form.stroke}
            onChange={handleChange}
            className={inputClass}
          >
            {STROKES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="facility" className="text-sm font-medium text-[#8892A8]">
            施設名
          </label>
          <input
            id="facility"
            type="text"
            name="facility"
            value={form.facility}
            onChange={handleChange}
            required
            className={inputClass}
            placeholder="例: 渋谷区スポーツセンター"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="memo" className="text-sm font-medium text-[#8892A8]">
            メモ（任意）
          </label>
          <textarea
            id="memo"
            name="memo"
            value={form.memo}
            onChange={handleChange}
            rows={3}
            className={inputClass}
            placeholder="フォーム意識、セット内容など"
          />
        </div>

        {error && (
          <p className="rounded-lg bg-[#FF3B8B]/10 px-3 py-2 text-sm text-[#FF3B8B]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="mt-2 rounded-xl bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] px-4 py-3 text-sm font-bold text-[#0A0E1A] transition hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
