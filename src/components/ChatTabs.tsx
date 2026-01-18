// src/components/ChatTabs.tsx
"use client";

export type ChatTabType = "ALL" | "SENIOR" | "JUNIOR";

interface ChatTabsProps {
  activeTab: ChatTabType;
  onTabChange: (tab: ChatTabType) => void;
}

const TABS: { key: ChatTabType; label: string }[] = [
  { key: "ALL", label: "전체" },
  { key: "JUNIOR", label: "후배" }, // 후배 탭이 먼저 나옵니다
  { key: "SENIOR", label: "선배" },
];

export default function ChatTabs({ activeTab, onTabChange }: ChatTabsProps) {
  return (
    <nav className="flex space-x-2 mt-4 mb-4" aria-label="채팅 필터">
      {TABS.map((tab) => (
        <button
          key={tab.key}
          onClick={() => onTabChange(tab.key)}
          type="button"
          aria-pressed={activeTab === tab.key}
          className={`px-4 py-2 rounded-full font-semibold transition-colors
            ${
              activeTab === tab.key
                ? "bg-gray-900 text-white" // 선택 시 검은색 배경, 흰색 글씨
                : "bg-gray-100 text-gray-700 hover:bg-gray-200" // 미선택 시 회색 배경, 회색 글씨
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </nav>
  );
}
