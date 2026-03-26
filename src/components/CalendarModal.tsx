import { useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

type Props = {
  open: boolean;
  value: string; // YYYY-MM-DD
  onSelect: (date: string) => void;
  onClose: () => void;
};

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toDateStr(y: number, m: number, d: number) {
  return `${y}-${pad(m + 1)}-${pad(d)}`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function startDayOfWeek(year: number, month: number) {
  return new Date(year, month, 1).getDay();
}

export default function CalendarModal({ open, value, onSelect, onClose }: Props) {
  const today = new Date();
  const todayStr = toDateStr(today.getFullYear(), today.getMonth(), today.getDate());

  const parsed = value ? new Date(value) : today;
  const [viewYear, setViewYear] = useState(parsed.getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed.getMonth());

  function prevMonth() {
    setViewMonth((m) => {
      if (m === 0) {
        setViewYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  }

  function nextMonth() {
    setViewMonth((m) => {
      if (m === 11) {
        setViewYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  }

  if (!open) return null;

  const days = daysInMonth(viewYear, viewMonth);
  const offset = startDayOfWeek(viewYear, viewMonth);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
      onClick={onClose}
    >
      <div
        className="w-[340px] rounded-2xl border border-[#1E2640] bg-[#111827] p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevMonth}
            className="rounded-lg p-1.5 text-[#8892A8] hover:bg-[#1E2640] hover:text-[#F0F0F0] transition"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-sm font-bold text-[#F0F0F0]">
            {viewYear}年 {viewMonth + 1}月
          </span>
          <button
            type="button"
            onClick={nextMonth}
            className="rounded-lg p-1.5 text-[#8892A8] hover:bg-[#1E2640] hover:text-[#F0F0F0] transition"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Weekday row */}
        <div className="mt-4 grid grid-cols-7 text-center text-xs font-medium text-[#8892A8]">
          {WEEKDAYS.map((w) => (
            <span key={w} className="py-1">
              {w}
            </span>
          ))}
        </div>

        {/* Day grid */}
        <div className="mt-1 grid grid-cols-7 gap-1 text-center text-sm">
          {Array.from({ length: offset }).map((_, i) => (
            <span key={`blank-${i}`} />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const d = i + 1;
            const dateStr = toDateStr(viewYear, viewMonth, d);
            const isSelected = dateStr === value;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={d}
                type="button"
                onClick={() => {
                  onSelect(dateStr);
                  onClose();
                }}
                className={`rounded-lg py-2 transition ${
                  isSelected
                    ? "bg-gradient-to-r from-[#00D4FF] to-[#7B61FF] font-bold text-[#0A0E1A]"
                    : isToday
                      ? "border border-[#00D4FF] text-[#00D4FF]"
                      : "text-[#F0F0F0] hover:bg-[#1E2640]"
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className="mt-4 flex w-full items-center justify-center gap-1 rounded-xl border border-[#1E2640] py-2.5 text-sm text-[#8892A8] hover:bg-[#1E2640] hover:text-[#F0F0F0] transition"
        >
          <X className="h-4 w-4" />
          閉じる
        </button>
      </div>
    </div>
  );
}
