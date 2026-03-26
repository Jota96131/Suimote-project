import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

const STROKES = ["クロール", "平泳ぎ", "背泳ぎ", "バタフライ", "個人メドレー"] as const;

type Props = {
  value: string;
  onChange: (stroke: string) => void;
  className?: string;
};

export default function StrokeDropdown({ value, onChange, className }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${className} flex items-center justify-between text-left`}
      >
        <span>{value}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#8892A8] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[#1E2640] bg-[#131829] shadow-lg shadow-black/40">
          {STROKES.map((s) => {
            const selected = s === value;
            return (
              <button
                key={s}
                type="button"
                onClick={() => {
                  onChange(s);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
                  selected
                    ? "bg-[#00D4FF]/10 font-bold text-[#00D4FF]"
                    : "text-[#F0F0F0] hover:bg-[#1E2640]"
                }`}
              >
                <span>{s}</span>
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
