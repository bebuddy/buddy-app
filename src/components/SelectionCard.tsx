"use client";

interface Props {
  label: string;
  description?: string;
  isSelected: boolean;
  onClick: () => void;
  // 역할별 색상을 받을 수 있도록 props 추가
  bgColor?: string;
  selectedColor?: string;
}

export default function SelectionCard({
  label,
  description,
  isSelected,
  onClick,
  bgColor = "bg-neutral-100", // 기본값
  selectedColor = "brand-bg", // 기본값
}: Props) {
  // 선택되었을 때와 아닐 때의 스타일을 정의합니다.
  const selectedClasses = `ring-2 ring-[var(--brand)] ${selectedColor} text-white`;
  const baseClasses = `border border-neutral-200 ${bgColor} text-neutral-800`;

  return (
    <button
      onClick={onClick}
      className={`w-full p-5 rounded-lg text-left transition-all duration-200 ${
        isSelected ? selectedClasses : baseClasses
      }`}
    >
      <div className={`font-extrabold text-lg ${isSelected ? 'text-white' : 'text-neutral-900'}`}>{label}</div>
      {description && <div className={`mt-1 ${isSelected ? 'text-white/80' : 'text-neutral-600'}`}>{description}</div>}
    </button>
  );
}

