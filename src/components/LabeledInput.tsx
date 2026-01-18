"use client";

import { AppInput } from "@/components/a11y/AppInput";

export default function LabeledInput({
  label,
  placeholder,
  value,
  onChange,
  largeLabel = false,
  description,
  error,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  largeLabel?: boolean;
  description?: string;
  error?: string;
}) {
  return (
    <AppInput
      label={label}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      description={description}
      error={error}
      labelClassName={`${largeLabel ? "text-[22px]" : "text-[19px]"} font-bold text-neutral-900`}
      inputClassName="w-full rounded-lg border border-neutral-300 px-4 py-3.5 text-[17px] outline-none placeholder:text-neutral-400 focus:border-neutral-400"
    />
  );
}
