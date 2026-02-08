"use client";

import { useEffect, useRef, useState } from "react";
import { useVoiceCallStore } from "@/lib/voiceCallStore";

interface VoiceCallScreenProps {
  audioLevel: number;
  onEndCall: () => void;
}

const TOTAL_FIELDS = 10;

function countFilledFields(draft: Record<string, unknown>): number {
  const fields = [
    "category", "title", "content", "level",
    "days", "daysNegotiable", "times", "timesNegotiable",
    "seniorType", "juniorType", "classType",
    "budget", "budgetType",
    "seniorGender", "juniorGender",
  ];
  // Group days+daysNegotiable as one, times+timesNegotiable as one, budget+budgetType as one
  let count = 0;
  if (draft.category) count++;
  if (draft.title) count++;
  if (draft.content) count++;
  if (draft.level) count++;
  if (draft.seniorGender || draft.juniorGender) count++;
  if ((Array.isArray(draft.seniorType) && draft.seniorType.length > 0) ||
      (Array.isArray(draft.juniorType) && draft.juniorType.length > 0)) count++;
  if (draft.classType) count++;
  if ((Array.isArray(draft.days) && draft.days.length > 0) || draft.daysNegotiable) count++;
  if ((Array.isArray(draft.times) && draft.times.length > 0) || draft.timesNegotiable) count++;
  if (draft.budget !== undefined || draft.budgetType) count++;
  // Ignore fields not counted
  void fields;
  return count;
}

export default function VoiceCallScreen({ audioLevel, onEndCall }: VoiceCallScreenProps) {
  const transcript = useVoiceCallStore((s) => s.transcript);
  const draft = useVoiceCallStore((s) => s.draft);

  const [elapsed, setElapsed] = useState(0);
  const startRef = useRef(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Timer
  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Auto-scroll transcript
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcript]);

  const minutes = String(Math.floor(elapsed / 60)).padStart(2, "0");
  const seconds = String(elapsed % 60).padStart(2, "0");
  const filled = countFilledFields(draft);

  // Pulsing ring scale based on audio level
  const ringScale = 1 + audioLevel * 0.5;

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col"
      style={{
        background: "linear-gradient(180deg, #0f0c29 0%, #302b63 50%, #24243e 100%)",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
      {/* Top section: Avatar + Timer */}
      <div className="flex flex-col items-center pt-12 pb-4">
        {/* Pulsing rings */}
        <div className="relative w-24 h-24 mb-4">
          <div
            className="absolute inset-0 rounded-full bg-indigo-500/20 transition-transform duration-100"
            style={{ transform: `scale(${ringScale + 0.3})` }}
          />
          <div
            className="absolute inset-0 rounded-full bg-indigo-500/30 transition-transform duration-100"
            style={{ transform: `scale(${ringScale + 0.15})` }}
          />
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="22" />
            </svg>
          </div>
        </div>

        <p className="text-white font-semibold text-lg">AI 상담원</p>
        <p className="text-gray-400 text-sm mt-1 font-mono">{minutes}:{seconds}</p>

        {/* Progress */}
        <div className="mt-3 px-4 py-1.5 rounded-full bg-white/10">
          <span className="text-white/80 text-xs">
            {filled}/{TOTAL_FIELDS} 항목 완료
          </span>
        </div>
      </div>

      {/* Transcript panel */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-4"
        style={{ scrollBehavior: "smooth" }}
      >
        {transcript.length === 0 && (
          <p className="text-center text-gray-500 text-sm mt-8">
            대화가 시작되면 여기에 표시됩니다...
          </p>
        )}
        {transcript.map((entry, i) => (
          <div
            key={i}
            className={`mb-3 flex ${entry.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                entry.role === "user"
                  ? "bg-indigo-500 text-white rounded-br-md"
                  : "bg-white/15 text-white/90 rounded-bl-md"
              }`}
            >
              {entry.text}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom: Hang up button */}
      <div className="pb-6 pt-4 flex justify-center">
        <button
          onClick={onEndCall}
          className="w-16 h-16 rounded-full bg-red-500 flex items-center justify-center active:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
        >
          <svg width="28" height="28" viewBox="0 0 24 24" fill="white">
            <path d="M12 9c-1.6 0-3.15.25-4.6.72v3.1c0 .39-.23.74-.56.9-.98.49-1.87 1.12-2.66 1.85-.18.18-.43.28-.7.28-.28 0-.53-.11-.71-.29L.29 13.08a.956.956 0 0 1-.29-.7c0-.28.11-.53.29-.71C3.34 8.78 7.46 7 12 7s8.66 1.78 11.71 4.67c.18.18.29.43.29.71 0 .28-.11.53-.29.71l-2.48 2.48c-.18.18-.43.29-.71.29-.27 0-.52-.11-.7-.28a11.27 11.27 0 0 0-2.67-1.85.996.996 0 0 1-.56-.9v-3.1C15.15 9.25 13.6 9 12 9z" />
          </svg>
        </button>
      </div>
    </div>
  );
}
