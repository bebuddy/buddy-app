"use client";

import { useEffect, useId, useMemo, useState } from "react";
import AppButton from "@/components/a11y/AppButton";

export type AppCarouselItem = {
  id: string;
  label?: string;
  content: React.ReactNode;
};

export type AppCarouselProps = {
  items: AppCarouselItem[];
  ariaLabel?: string;
  autoPlay?: boolean;
  intervalMs?: number;
  className?: string;
  onIndexChange?: (index: number) => void;
};

export default function AppCarousel({
  items,
  ariaLabel = "콘텐츠 캐러셀",
  autoPlay = false,
  intervalMs = 6000,
  className,
  onIndexChange,
}: AppCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const statusId = useId();
  const hasItems = items.length > 0;

  const currentLabel = useMemo(() => {
    if (!hasItems) {
      return "";
    }
    return `${activeIndex + 1} / ${items.length}`;
  }, [activeIndex, hasItems, items.length]);

  useEffect(() => {
    onIndexChange?.(activeIndex);
  }, [activeIndex, onIndexChange]);

  useEffect(() => {
    if (!isPlaying || items.length <= 1) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % items.length);
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, isPlaying, items.length]);

  const goTo = (nextIndex: number) => {
    if (!hasItems) {
      return;
    }
    const normalized = (nextIndex + items.length) % items.length;
    setActiveIndex(normalized);
  };

  const handlePrev = () => {
    setIsPlaying(false);
    goTo(activeIndex - 1);
  };

  const handleNext = () => {
    setIsPlaying(false);
    goTo(activeIndex + 1);
  };

  const togglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  if (!hasItems) {
    return null;
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label={ariaLabel}
      className={`relative w-full ${className ?? ""}`}
    >
      <div className="sr-only" id={statusId} aria-live={isPlaying ? "off" : "polite"}>
        현재 위치 {currentLabel}
      </div>
      <div className="overflow-hidden rounded-2xl">
        {items.map((item, index) => {
          const isActive = index === activeIndex;
          return (
            <div
              key={item.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${index + 1} / ${items.length}${item.label ? `, ${item.label}` : ""}`}
              aria-describedby={statusId}
              hidden={!isActive}
            >
              {item.content}
            </div>
          );
        })}
      </div>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-[14px] text-neutral-700" aria-hidden="true">
          {currentLabel}
        </div>
        <div className="flex items-center gap-2">
          <AppButton ariaLabel="이전 슬라이드" onClick={handlePrev} minSize={36}>
            이전
          </AppButton>
          <AppButton
            ariaLabel={isPlaying ? "자동 재생 정지" : "자동 재생 시작"}
            onClick={togglePlay}
            minSize={36}
          >
            {isPlaying ? "정지" : "재생"}
          </AppButton>
          <AppButton ariaLabel="다음 슬라이드" onClick={handleNext} minSize={36}>
            다음
          </AppButton>
        </div>
      </div>
    </section>
  );
}
