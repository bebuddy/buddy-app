"use client";

export default function LabeledTextarea({
  label,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  rows?: number;
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && <div className="text-[20px] font-bold text-neutral-900">{label}</div>}
      <textarea
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-4 py-3.5 text-[17px] outline-none
                   placeholder:text-neutral-400 focus:border-neutral-400 resize-none"
      />
    </div>
  );
}
