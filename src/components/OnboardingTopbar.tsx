// src/components/OnboardingTopbar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo } from "react";

type Flow = "signup" | "onboarding";

export default function OnboardingTopbar({
  flow,
  progress = 0,
  showSkip = false,
  onSkip,
  barColor,
  bottomGap = 0,            // ⬅️ 추가: 하단 여백(px)
}: {
  flow: Flow;
  progress?: number;
  showSkip?: boolean;
  onSkip?: () => void;
  barColor?: string;
  bottomGap?: number;       // ⬅️ 추가
}) {
  const pct = useMemo(() => {
    if (Number.isNaN(progress)) return 0;
    return Math.max(0, Math.min(1, progress));
  }, [progress]);

  return (
    <>
      <div className="sticky top-0 z-40 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <div className="h-20 relative flex items-center justify-center px-4">
          <Link href="/" aria-label="홈으로">
            <Image src="/logo.svg" alt="Logo" width={40} height={12} priority />
          </Link>

          {showSkip && (
            <button
              type="button"
              onClick={onSkip}
              className="absolute top-1/2 -translate-y-1/2 text-[14px] text-neutral-600"
              style={{ right: `calc(16px + env(safe-area-inset-right))` }}
            >
              나중에 하기
            </button>
          )}
        </div>

        <div className="h-1 w-full bg-neutral-100">
          <div
            className="h-full transition-all duration-300"
            data-flow={flow}
            style={{
              width: `${pct * 100}%`,
              backgroundColor: barColor ?? "#6163FF",
            }}
            aria-label={`${Math.round(pct * 100)}% 진행됨`}
          />
        </div>
      </div>

      {/* ⬇️ 진행바 아래 여백 */}
      {bottomGap > 0 && <div style={{ height: bottomGap }} aria-hidden />}
    </>
  );
}
