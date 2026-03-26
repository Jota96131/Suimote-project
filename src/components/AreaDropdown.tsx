import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Area } from "../types";

type Props = {
  areas: Area[];
  value: string;
  onChange: (areaId: string) => void;
  className?: string;
};

export default function AreaDropdown({ areas, value, onChange, className }: Props) {
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

  const selectedArea = areas.find((a) => a.id === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`${className} flex items-center justify-between text-left`}
      >
        <span>{selectedArea?.name ?? "未選択"}</span>
        <ChevronDown
          className={`h-4 w-4 text-[#8892A8] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 max-h-60 overflow-y-auto rounded-xl border border-[#1E2640] bg-[#131829] shadow-lg shadow-black/40">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
            }}
            className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
              !value
                ? "bg-[#00D4FF]/10 font-bold text-[#00D4FF]"
                : "text-[#8892A8] hover:bg-[#1E2640]"
            }`}
          >
            <span>未選択</span>
            {!value && <Check className="h-4 w-4" />}
          </button>
          {areas.map((area) => {
            const selected = area.id === value;
            return (
              <button
                key={area.id}
                type="button"
                onClick={() => {
                  onChange(area.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between px-4 py-3 text-sm transition ${
                  selected
                    ? "bg-[#00D4FF]/10 font-bold text-[#00D4FF]"
                    : "text-[#F0F0F0] hover:bg-[#1E2640]"
                }`}
              >
                <span>{area.name}</span>
                {selected && <Check className="h-4 w-4" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
