// src/components/AlarmItem.tsx
"use client";

import { useRouter } from "next/navigation";
import { MessageSquareText, Bell } from "lucide-react"; // 아이콘 임포트

type NotificationType = "COMMENT" | "MESSAGE" | "MESSAGE_UNREAD";

type NotificationItem = {
  id: string;
  isRead: boolean;
  createdAt: string;
  notificationId?: string;
  title?: string;
  content?: string;
  actionUrl?: string;
  data?: string;
  type?: NotificationType;
  sentAt?: string;
};
const PURPLE = "#6163FF";

interface AlarmItemProps {
  item: NotificationItem;
  onMarkAsRead: (id: string) => void; // 읽음 처리 함수
}

/**
 * 알림 타입에 따라 적절한 아이콘을 반환합니다.
 */
function getNotificationIcon(type?: NotificationType) {
  switch (type) {
    case "COMMENT":
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

  const handleClick = () => {
    if (!item.isRead) {
      onMarkAsRead(item.id);
    }

    if (item.actionUrl) {
      router.push(item.actionUrl);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`w-full p-4 transition-colors ${
        item.isRead ? "bg-white" : "bg-purple-50"
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getNotificationIcon(item.type)}
        </div>
        
        <div className="flex-1 text-left min-w-0">
          <div className="flex justify-between items-center mb-1">
            <span className="text-base font-semibold text-gray-800">
              {item.title ?? "알림"}
            </span>
            <span className="text-sm text-gray-500 flex-shrink-0 ml-2">
              {formatTimeAgo(item.sentAt ?? item.createdAt)}
            </span>
          </div>
          <p className="text-base text-gray-700 truncate">
            {item.content ?? ""}
          </p>
        </div>
      </div>
    </button>
  );
}

function formatTimeAgo(iso?: string) {
  if (!iso) return "";
  const date = new Date(iso);
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "방금 전";
  if (diffMin < 60) return `${diffMin}분 전`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}시간 전`;
  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}일 전`;
  const diffWeek = Math.floor(diffDay / 7);
  if (diffWeek < 5) return `${diffWeek}주 전`;
  const diffMonth = Math.floor(diffDay / 30);
  if (diffMonth < 12) return `${diffMonth}개월 전`;
  const diffYear = Math.floor(diffDay / 365);
  return `${diffYear}년 전`;
}
