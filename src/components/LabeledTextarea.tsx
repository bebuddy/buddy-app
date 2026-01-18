"use client";

import { AppTextarea } from "@/components/a11y/AppInput";

export default function LabeledTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
  description,
  error,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
  description?: string;
  error?: string;
}) {
  return (
    <AppTextarea
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={rows}
      description={description}
      error={error}
      labelClassName="text-[20px] font-bold text-neutral-900"
      inputClassName="w-full rounded-lg border border-neutral-300 px-4 py-3.5 text-[17px] outline-none placeholder:text-neutral-400 focus:border-neutral-400 resize-none"
    />
  );
}
