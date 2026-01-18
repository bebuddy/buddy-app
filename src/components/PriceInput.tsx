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
  label = "수업비",
  showLabel = false,
  description,
  error,
  inputAriaLabel = "금액 입력",
  unitLabel = "요금 단위",
}: {
  value: string;
  onChange: (v: string) => void;
  unit: Unit | null;
  onUnitChange: (u: Unit | null) => void;
  negotiable: boolean;
  onToggleNegotiable: () => void;
  brand?: string;
  label?: string;
  showLabel?: boolean;
  description?: string;
  error?: string;
  inputAriaLabel?: string;
  unitLabel?: string;
}) {
  const checkboxId = useId();
  const inputId = useId();
  const descriptionId = description ? `${inputId}-description` : undefined;
  const errorId = error ? `${inputId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  const disabled = negotiable;

  function handleChange(v: string) {
    const digits = v.replace(/[^\d]/g, "");
    onChange(digits);
  }

  return (
    <fieldset className="flex flex-col gap-3">
      <legend className={showLabel ? "text-[18px] font-semibold text-neutral-900" : "sr-only"}>
        {label}
      </legend>
      {description ? (
        <p id={descriptionId} className="text-[14px] text-neutral-600">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-[14px] text-red-600" role="status" aria-live="polite">
          {error}
        </p>
      ) : null}

      {/* 시간/건당 칩 */}
      <div className="flex gap-2" role="radiogroup" aria-label={unitLabel}>
        {UNITS.map((u) => {
          const selected = unit === u;
          const active = selected && !disabled;
          return (
            <button
              key={u}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => !disabled && onUnitChange(selected ? null : u)}
              disabled={disabled}
              aria-disabled={disabled}
              className={`px-4 py-2 rounded-full text-[16px] font-semibold border transition-opacity ${
                disabled ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
              style={{
                backgroundColor: active ? brand : "transparent",
                color: active ? "#fff" : "#111827",
                borderColor: active ? brand : "#CBD5E1",
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
          id={inputId}
          inputMode="numeric"
          pattern="[0-9]*"
          value={value}
          onChange={(e) => handleChange(e.target.value)}
          disabled={disabled}
          aria-label={inputAriaLabel}
          aria-describedby={describedBy}
          aria-invalid={error ? "true" : undefined}
          className={`w-full rounded-lg border border-neutral-300 px-4 pr-12 py-3.5 text-[17px] outline-none focus:border-neutral-400 ${
            disabled ? "bg-neutral-100 cursor-not-allowed opacity-60" : "bg-white"
          }`}
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
    </fieldset>
  );
}
