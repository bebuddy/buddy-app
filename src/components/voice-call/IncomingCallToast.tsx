"use client";

import { useState } from "react";

interface IncomingCallToastProps {
  onAccept: () => void;
  onDecline: () => void;
}

export default function IncomingCallToast({ onAccept, onDecline }: IncomingCallToastProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className="mx-4 mt-3 rounded-2xl p-4 shadow-lg animate-slideDown"
      style={{ background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)" }}
    >
      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes ring {
          0%, 100% { transform: rotate(0deg); }
          10% { transform: rotate(14deg); }
          20% { transform: rotate(-8deg); }
          30% { transform: rotate(14deg); }
          40% { transform: rotate(-4deg); }
          50% { transform: rotate(10deg); }
          60% { transform: rotate(0deg); }
        }
        .animate-slideDown {
          animation: slideDown 0.4s ease-out;
        }
        .animate-ring {
          animation: ring 1.5s ease-in-out infinite;
        }
      `}</style>

      <div className="flex items-center gap-3">
        {/* AI icon with ring animation */}
        <div className="relative flex-shrink-0">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center animate-ring">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </div>
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-indigo-500 opacity-30 animate-ping" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white font-semibold text-lg">AI 상담원</p>
          <p className="text-gray-300 text-base mt-0.5">
            AI가 대화로 게시글을 작성해드릴까요?
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {/* Decline */}
          <button
            onClick={() => { setDismissed(true); onDecline(); }}
            className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center active:bg-red-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          {/* Accept */}
          <button
            onClick={onAccept}
            className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center active:bg-green-600 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
