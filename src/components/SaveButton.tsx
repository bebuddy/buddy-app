"use client";

import { useState, useEffect } from "react";

// 저장된 포스트 ID를 localStorage에서 관리하기 위한 키
const SAVED_ITEMS_KEY = "savedPostIds";

export default function SaveButton({ itemId }: { itemId: string }) {
  const [isSaved, setIsSaved] = useState(false);

  // 컴포넌트 마운트 시, localStorage에서 저장 상태를 불러옵니다.
  useEffect(() => {
    const savedIds: string[] = JSON.parse(
      localStorage.getItem(SAVED_ITEMS_KEY) || "[]"
    );
    setIsSaved(savedIds.includes(itemId));
  }, [itemId]);

  // 저장 버튼 클릭 시 상태를 토글하고 localStorage를 업데이트합니다.
  const toggleSave = (e: React.MouseEvent) => {
    // 이벤트 버블링을 막아, 버튼 클릭이 카드 클릭으로 이어지지 않게 합니다.
    e.stopPropagation();

    const savedIds: string[] = JSON.parse(
      localStorage.getItem(SAVED_ITEMS_KEY) || "[]"
    );
    let newSavedIds: string[];

    if (isSaved) {
      // 이미 저장된 경우: ID 제거
      newSavedIds = savedIds.filter((id) => id !== itemId);
    } else {
      // 저장되지 않은 경우: ID 추가
      newSavedIds = [...savedIds, itemId];
    }

    // localStorage 업데이트
    localStorage.setItem(SAVED_ITEMS_KEY, JSON.stringify(newSavedIds));
    // 상태 업데이트
    setIsSaved(!isSaved);
  };

  return (
    <button
      onClick={toggleSave}
      aria-label={isSaved ? "저장 취소" : "저장"}
      className="p-1" // 클릭 영역 확보
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21L12 18L5 21Z"
          fill={isSaved ? "#6163FF" : "none"} // brand 색상 또는 원하는 색상
          stroke={isSaved ? "#6163FF" : "#6b7280"} // neutral-500
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}
