import { useState, useMemo } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useRecordDetail } from "../hooks/useRecordDetail";
import { useEditRecord, recordToForm } from "../hooks/useEditRecord";
import type { EditRecordForm } from "../hooks/useEditRecord";

const STROKES = ["クロール", "平泳ぎ", "背泳ぎ", "バタフライ", "個人メドレー"] as const;

const inputClass =
  "rounded-xl border border-[#1E2640] bg-[#0A0E1A] px-4 py-3 text-sm text-[#F0F0F0] placeholder-[#8892A8] outline-none focus:border-[#00D4FF] transition";

export default function EditRecordPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { record, loading: fetching, error: fetchError } = useRecordDetail(id ?? "");
  const { loading, error, updateRecord } = useEditRecord(id ?? "");

  const initialForm = useMemo(
    () => (record ? recordToForm(record) : null),
    [record]
  );
  const [form, setForm] = useState<EditRecordForm | null>(null);

  if (initialForm && !form) {
    setForm(initialForm);
  }

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) {
    const { name, value } = e.target;
    setForm((prev) => prev ? { ...prev, [name]: value } : prev);
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    await updateRecord(form, () => navigate(`/records/${id}`));
  }

  if (fetching) {
    return (
      <div className="flex items-center justify-center py-16">
        <p className="text-[#8892A8]">読み込み中...</p>
      </div>
    );
  }

  if (fetchError || !record) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <p className="text-lg font-medium text-[#FF3B8B]">記録が見つかりません</p>
        <Link to="/records" className="mt-4 text-sm text-[#00D4FF]">
          一覧に戻る
        </Link>
      </div>
    );
  }

  if (!form) return null;

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      <Link to={`/records/${id}`} className="flex items-center gap-1 text-sm text-[#8892A8] hover:text-[#00D4FF] transition">
        <ArrowLeft className="h-4 w-4" />
        詳細に戻る
      </Link>
      <h1 className="mt-4 text-xl font-bold text-[#F0F0F0]">練習記録を編集</h1>

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
            タイム (秒)（任意）
          </label>
          <input
            id="time"
            type="number"
            name="time"
            value={form.time}
            onChange={handleChange}
            min={0}
            step="0.01"
            className={inputClass}
            placeholder="例: 1230"
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
            施設名（任意）
          </label>
          <input
            id="facility"
            type="text"
            name="facility"
            value={form.facility}
            onChange={handleChange}
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
          {loading ? "保存中..." : "更新する"}
        </button>
      </form>
    </div>
  );
}
