// src/components/AlarmItem.tsx
"use client";

import { UserNotificationViewDto } from "@/types/notification.dto"; // DTO 경로
import { useRouter } from "next/navigation";
import { MessageSquareText, Bell } from "lucide-react"; // 아이콘 임포트

// DTO의 NotificationType (Enum)
type NotificationType = "COMMNET" | "MESSAGE" | "MESSAGE_UNREAD";
const PURPLE = "#6163FF";

interface AlarmItemProps {
  item: UserNotificationViewDto;
  onMarkAsRead: (uuid: string) => void; // 읽음 처리 함수
}

/**
 * 알림 타입에 따라 적절한 아이콘을 반환합니다.
 */
function getNotificationIcon(type: NotificationType) {
  switch (type) {
    case "COMMNET":
      return <MessageSquareText size={28} color="white" fill={PURPLE} />;
    case "MESSAGE":
    case "MESSAGE_UNREAD":
      return <Bell size={28} color="white" fill={PURPLE} />;
    default:
      return <Bell size={28} color="white" fill={PURPLE} />;
  }
}

export default function AlarmItem({ item, onMarkAsRead }: AlarmItemProps) {
  const router = useRouter();
  const noti = item.notification; // 편의를 위해 알림 객체 분리

  const handleClick = () => {
    // 1. 읽음 상태로 변경 (부모 상태 업데이트)
    if (!item.isRead) {
      onMarkAsRead(item.uuid);
      // 실제로는 여기에 UserNotificationEditDto API 호출
    }
    
    // 2. 알림에 연결된 링크로 이동
    if (noti.actionUrl) {
      router.push(noti.actionUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full p-4 transition-colors ${
        item.isRead ? "bg-white" : "bg-purple-50" // ★ 읽음/안읽음 배경색
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 1. 아이콘 */}
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(noti.notificationType as NotificationType)}
        </div>
        
        {/* 2. 텍스트 내용 */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-base font-semibold text-gray-800">
              {noti.title}
            </span>
            <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
              {noti.elapsedCreatedDate}
            </span>
          </div>
          <p className="text-base text-gray-700 truncate">
            {noti.content}
          </p>
        </div>
      </div>
    </button>
  );
}