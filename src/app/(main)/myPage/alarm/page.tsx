// src/app/(main)/myPage/alarm/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { UserNotificationViewDto } from "@/types/notification.dto"; // DTO 경로
import { MOCK_ALARM_LIST } from "./mock-alarm"; // Mock Data 임포트
import AlarmItem from "@/components/AlarmItem"; // 방금 만든 컴포넌트

export default function AlarmPage() {
  const router = useRouter();
  const [alarms, setAlarms] = useState<UserNotificationViewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 1. Mock Data 로드
  useEffect(() => {
    // 실제로는 UserNotificationPaginationRequestDto로 API 호출
    setIsLoading(true);
    setTimeout(() => {
      setAlarms(MOCK_ALARM_LIST.data);
      setIsLoading(false);
    }, 300); // 가짜 로딩
  }, []);

  // 2. 알림 클릭 시 '읽음' 처리 (상태 업데이트)
  const handleMarkAsRead = (uuid: string) => {
    // 실제로는 UserNotificationEditDto API 호출 후,
    // 응답 성공 시 setAlarms(..) 실행
    
    setAlarms((prevAlarms) =>
      prevAlarms.map((alarm) =>
        alarm.uuid === uuid ? { ...alarm, isRead: true } : alarm
      )
    );
  };
  
  return (
    <div
      className="px-4 pt-4 pb-6"
      style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
    >
      {/* 상단 Back */}
      <div className="flex items-center gap-2 mb-4">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={() => router.back()}
          className="p-1 -ml-1 rounded-full active:scale-95"
        >
          <ChevronLeft size={28} />
        </button>
        <div className="text-[18px] font-semibold">알림</div>
      </div>

      {/* 2. 알림 목록 */}
      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-gray-500">
          알림을 불러오는 중...
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto">
          {alarms.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-gray-500 pt-20">
              표시할 알림이 없습니다.
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {alarms.map((item) => (
                <AlarmItem
                  key={item.uuid}
                  item={item}
                  onMarkAsRead={handleMarkAsRead}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}