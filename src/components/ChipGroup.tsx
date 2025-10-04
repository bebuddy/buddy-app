"use client";
import React from "react";

export default function ChipGroup<T extends string>({
  options,
  value,
  onChange,
  multiple = false,
  brand = "#33AF83",                // ✅ 추가
}: {
  options: T[];
  value: T[] | T | null;
  onChange: (next: T[] | T | null) => void;
  multiple?: boolean;
  brand?: string;                   // ✅ 추가
}) {
  const selectedSet = new Set(
    (multiple ? (value as T[] | null) : (value ? [value as T] : [])) || []
  );

  function toggle(opt: T) {
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
        return (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            className="px-3 py-1.5 rounded-full text-[16px] font-semibold border transition-colors"
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
