// src/components/ChipGroup.tsx
"use client";
import React from "react";

export default function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
  brand = "#6163FF",
  disabledOptions = [],
}: {
  options: T[];
  value: T[] | T | null;
  onChange: (next: T[] | T | null) => void;
  multiple?: boolean;
  brand?: string;
  disabledOptions?: T[];
}) {
  // ⚙️ 경고 제거: 중간 변수로 분리
  const initialSelected: T[] =
    (multiple ? ((value as T[] | null) ?? []) : value ? [value as T] : []) as T[];

  const selectedSet = new Set<T>(initialSelected);

  function toggle(opt: T) {
    if (disabledOptions.includes(opt)) return;

    if (multiple) {
      const next = new Set(selectedSet);
      if (next.has(opt)) {
        next.delete(opt);
      } else {
        next.add(opt);
      }
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
              "px-3 py-1.5 rounded-full text-[18px] font-semibold border transition-colors",
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
