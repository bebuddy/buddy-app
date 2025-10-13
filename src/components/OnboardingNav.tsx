"use client";

interface Props {
  onBack: () => void;
  onNext: () => void;
  isNextDisabled?: boolean;
  isFirstStep?: boolean;
  nextLabel?: string;
  /** 기본값은 기존 보라색 */
  brandColor?: string;
}

export default function OnboardingNav({
  onBack,
  onNext,
  isNextDisabled = false,
  isFirstStep = false,
  nextLabel = "다음",
  brandColor = "#6163FF", // ← 기본 보라
}: Props) {
  const enabledStyle = isNextDisabled ? undefined : { backgroundColor: brandColor };

  return (
    <nav className="fixed bottom-0 z-50 left-1/2 -translate-x-1/2 w-full max-w-[440px]">
      <div
        className="bg-white flex items-center justify-center gap-3 p-4"
        style={{ paddingBottom: "calc(25px + env(safe-area-inset-bottom))" }}
      >
        {!isFirstStep && (
          <button
            onClick={onBack}
            className="h-[52px] px-6 rounded-lg bg-neutral-200 text-neutral-700 font-bold"
          >
            이전
          </button>
        )}
        <button
          onClick={onNext}
          disabled={isNextDisabled}
          style={enabledStyle}
          className={`flex-1 h-[52px] rounded-lg font-bold text-white transition-opacity
            ${isNextDisabled ? "bg-neutral-300 cursor-not-allowed" : "hover:opacity-90"}`}
        >
          {nextLabel}
        </button>
      </div>
    </nav>
  );
}
