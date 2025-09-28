// 관심분야 ON/OFF

"use client";

export default function InterestToggle({
  value,
  onChange,
  brand = "#6163FF",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  brand?: string;
}) {
  return (
    <button
      className="text-[18px] font-semibold text-black"
      onClick={() => onChange(!value)}
    >
      관심 분야{" "}
      <span style={{ color: brand }}>
        {value ? "ON" : "OFF"}
      </span>
    </button>
  );
}
