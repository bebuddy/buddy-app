// src/components/ChatRoomItem.tsx
"use client";

import { RoomViewDto } from "@/types/chat.dto";
import Link from "next/link";

interface ChatRoomItemProps {
  room: RoomViewDto;
}

export default function ChatRoomItem({ room }: ChatRoomItemProps) {
  const lastMessage = room.lastMessage?.message || "대화 내용이 없습니다.";
  const lastMessageTime = room.lastMessage?.elapsedCreatedDate || "";

  return (
    <Link href={`/chat/${room.uuid}`} className="flex items-center py-3 px-1 hover:bg-gray-50 transition-colors">
      {/* 1. 프로필 (ChatHeader와 동일한 로직, 크기 조정) */}
      <div className="flex-shrink-0 w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center mr-4">
        <span className="text-gray-600 font-semibold text-lg">
          {room.partner.name[0]}
        </span>
      </div>

      {/* 2. 이름 + 마지막 메시지 */}
      <div className="flex-1 min-w-0">
        <span className="font-semibold block text-lg text-gray-800 truncate mb-1">{room.partner.name}</span>
        <p className="text-sm text-gray-500 truncate">{lastMessage}</p>
      </div>

      {/* 3. 시간 + 안 읽은 개수 (오른쪽 상단에 배치) */}
      <div className="flex flex-col items-end ml-2 flex-shrink-0 self-start"> {/* self-start로 상단 정렬 */}
        <span className="text-xs text-gray-400 mb-1">{lastMessageTime}</span>
        {room.unreadCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 bg-red-500 text-white text-xs rounded-full font-bold"> {/* 빨간색 원으로 변경 */}
            {room.unreadCount}
          </span>
        )}
      </div>
    </Link>
  );
}