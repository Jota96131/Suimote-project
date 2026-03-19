import { useNavigate, Link } from "react-router-dom";
import { useAddRecord } from "../hooks/useAddRecord";

const STROKES = ["クロール", "平泳ぎ", "背泳ぎ", "バタフライ", "個人メドレー"] as const;

export default function AddRecordPage() {
  const navigate = useNavigate();
  const { form, loading, error, handleChange, handleSubmit } = useAddRecord();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await handleSubmit(() => navigate("/records"));
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-8">
      <Link to="/records" className="text-sm underline">
        ← 一覧に戻る
      </Link>
      <h1 className="mt-4 text-xl font-bold">練習記録を追加</h1>

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="date" className="text-sm font-medium">
            日付
          </label>
          <input
            id="date"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="distance" className="text-sm font-medium">
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
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="time" className="text-sm font-medium">
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
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="stroke" className="text-sm font-medium">
            泳法
          </label>
          <select
            id="stroke"
            name="stroke"
            value={form.stroke}
            onChange={handleChange}
            className="rounded border px-3 py-2 text-sm"
          >
            {STROKES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="facility" className="text-sm font-medium">
            施設名
          </label>
          <input
            id="facility"
            type="text"
            name="facility"
            value={form.facility}
            onChange={handleChange}
            required
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="memo" className="text-sm font-medium">
            メモ（任意）
          </label>
          <textarea
            id="memo"
            name="memo"
            value={form.memo}
            onChange={handleChange}
            rows={3}
            className="rounded border px-3 py-2 text-sm"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="rounded bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-gray-400"
        >
          {loading ? "保存中..." : "保存する"}
        </button>
      </form>
    </div>
  );
}
