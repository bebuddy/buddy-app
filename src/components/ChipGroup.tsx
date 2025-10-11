"use client";
import React from "react";

/**
 * 제네릭 ChipGroup
 * - multiple: 다중 선택
 * - brand: 선택 칩 배경/테두리 색상
 * - disabledOptions: 전달된 옵션은 비활성화(클릭 불가)
 */
export default function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
  brand = "#33AF83",
  disabledOptions = [],
}: {
  options: T[];
  value: T[] | T | null;
  onChange: (next: T[] | T | null) => void;
  multiple?: boolean;
  brand?: string;
  disabledOptions?: T[]; // 🔹 추가
}) {
  // 현재 선택값을 Set으로 관리(토글 계산 편의)
  const selectedSet = new Set(
    (multiple ? (value as T[] | null) : (value ? [value as T] : [])) || []
  );

  function toggle(opt: T) {
    // 비활성화된 칩은 클릭 무시
    if (disabledOptions.includes(opt)) return;

    if (multiple) {
      const next = new Set(selectedSet);
      next.has(opt) ? next.delete(opt) : next.add(opt);
      onChange(Array.from(next) as T[]);
    } else {
      onChange(selectedSet.has(opt) ? null : (opt as T));
    }
  }

  return (
    <div className="flex flex-wrap gap-x-2 gap-y-2">
      {options.map((opt) => {
        const selected = selectedSet.has(opt);
        const disabled = disabledOptions.includes(opt);

        return (
          <button
            key={opt}
            type="button"
            onClick={() => toggle(opt)}
            aria-pressed={selected}
            aria-disabled={disabled}
            disabled={disabled}
            className={[
              "px-3 py-1.5 rounded-full text-[16px] font-semibold border transition-colors",
              disabled ? "opacity-40 pointer-events-none" : "",
            ].join(" ")}
            style={{
              backgroundColor: selected ? brand : "transparent",
              color: selected ? "#fff" : "#111827",
              borderColor: selected ? brand : "#CBD5E1",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
