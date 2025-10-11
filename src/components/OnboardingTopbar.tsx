// components/OnboardingTopbar.tsx
"use client";
export default function OnboardingTopbar({ onSkip }: { onSkip: () => void }) {
  return (
    <div className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="h-12 flex items-center justify-end px-4">
        <button onClick={onSkip} className="text-[14px] text-neutral-600">나중에 하기</button>
      </div>
    </div>
  );
}
