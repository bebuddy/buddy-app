"use client";

export default function LabeledInput({
  label,
  placeholder,
  value,
  onChange,
  largeLabel = false,
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChange: (v: string) => void;
  largeLabel?: boolean; // "한 줄로 표현" 타이틀용
}) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <div className={`${largeLabel ? "text-[22px]" : "text-[19px]"} font-bold text-neutral-900`}>
          {label}
        </div>
      )}
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-neutral-300 px-4 py-3.5 text-[17px] outline-none
                   placeholder:text-neutral-400 focus:border-neutral-400"
      />
    </div>
  );
}
