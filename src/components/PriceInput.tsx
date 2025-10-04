"use client";
import { useId } from "react";

const UNITS = ["시간", "건당"] as const;
type Unit = typeof UNITS[number];

export default function PriceInput({
  value,
  onChange,
  unit,
  onUnitChange,
  negotiable,
  onToggleNegotiable,
  brand = "#33AF83",               // ✅ 추가
}: {
  value: string;
  onChange: (v: string) => void;
  unit: Unit | null;
  onUnitChange: (u: Unit | null) => void;
  negotiable: boolean;
  onToggleNegotiable: () => void;
  brand?: string;                  // ✅ 추가
}) {
  const checkboxId = useId();

  function handleChange(v: string) {
    const digits = v.replace(/[^\d]/g, "");
    onChange(digits);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 시간/건당 칩 */}
      <div className="flex gap-2">
        {UNITS.map((u) => {
          const selected = unit === u;
          return (
            <button
              key={u}
              onClick={() => onUnitChange(selected ? null : u)}
              className="px-4 py-2 rounded-full text-[16px] font-semibold border transition-colors"
              style={{
                backgroundColor: selected ? brand : "transparent",
                color: selected ? "#fff" : "#111827",
                borderColor: selected ? brand : "#CBD5E1",
              }}
            >
              {u}
            </button>
          );
        })}
      </div>

      {/* 숫자 입력 + '원' */}
      <div className="relative">
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-4 pr-12 py-3.5 text-[17px] outline-none focus:border-neutral-400 bg-white"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-neutral-700">
          원
        </span>
      </div>

      {/* 체크박스 + 협의해요 */}
      <label htmlFor={checkboxId} className="flex items-center gap-2 cursor-pointer select-none">
        <input
          id={checkboxId}
          type="checkbox"
          checked={negotiable}
          onChange={onToggleNegotiable}
          className="h-5 w-5"
          style={{ accentColor: brand }}
        />
        <span className="text-[16px] text-neutral-900">협의해요</span>
      </label>
    </div>
  );
}
