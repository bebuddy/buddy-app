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
  brand = "#33AF83",
}: {
  value: string;
  onChange: (v: string) => void;
  unit: Unit | null;
  onUnitChange: (u: Unit | null) => void;
  negotiable: boolean;
  onToggleNegotiable: () => void;
  brand?: string;
}) {
  const checkboxId = useId();

  const isDisabled = negotiable; // ✅ 협의해요 ON이면 비활성화

  function handleChange(v: string) {
    if (isDisabled) return;                // ✅ 입력 막기
    const digits = v.replace(/[^\d]/g, "");
    onChange(digits);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* 시간/건당 칩 */}
      <div className="flex gap-2">
        {UNITS.map((u) => {
          const selected = unit === u;
          const base =
            "px-4 py-2 rounded-full text-[16px] font-semibold border transition-colors";
          const activeStyle = selected ? { backgroundColor: brand, color: "#fff", borderColor: brand } : {};
          const disabledCls = isDisabled ? "opacity-40 pointer-events-none" : ""; // ✅ 비활성 + 회색
          return (
            <button
              key={u}
              type="button"
              onClick={() => !isDisabled && onUnitChange(selected ? null : u)} // ✅ 클릭 차단
              className={`${base} ${selected ? "border-transparent" : "border-[#CBD5E1] text-[#111827] bg-transparent"} ${disabledCls}`}
              style={activeStyle}
              disabled={isDisabled}
            >
              {u}
            </button>
          );
        })}
      </div>

      {/* 숫자 입력 + '원' */}
      <div
        className={[
          "relative rounded-lg border px-4 pr-12",
          isDisabled ? "border-neutral-300 bg-neutral-200" : "border-neutral-300 bg-white",
        ].join(" ")}
      >
        <input
          inputMode="numeric"
          pattern="[0-9]*"
          value={isDisabled ? "" : value}              // ✅ 회색일 땐 표시 비우기(원하면 유지로 바꿔도 됨)
          onChange={(e) => handleChange(e.target.value)}
          className={[
            "w-full py-3.5 text-[17px] outline-none bg-transparent",
            isDisabled ? "text-neutral-400 pointer-events-none caret-transparent" : "text-neutral-900",
          ].join(" ")}
          disabled={isDisabled}                         // ✅ 입력 불가
        />
        <span
          className={[
            "absolute right-4 top-1/2 -translate-y-1/2 text-[16px]",
            isDisabled ? "text-neutral-400" : "text-neutral-700",
          ].join(" ")}
        >
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
