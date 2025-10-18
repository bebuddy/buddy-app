// 관심분야 ON/OFF

"use client";

export default function InterestToggle({
  value,
  onChange,
  color = "primary",
}: {
  value: boolean;
  onChange: (v: boolean) => void;
  color?: "primary" | "secondary";
}) {
  return (
    <button
      className="font-medium-18 text-black"
      onClick={() => onChange(!value)}
    >
      관심 분야{" "}
      <span className={`${color==="primary"?'text-primary-500':'text-secondary-500'} hover:opacity-80`}>
        {value ? "ON" : "OFF"}
      </span>
    </button>
  );
}
