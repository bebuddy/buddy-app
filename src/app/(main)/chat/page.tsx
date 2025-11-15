// src/app/(main)/chat/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import BottomNav from "@/components/BottomNav";
import { RoomViewDto } from "@/types/chat.dto";

import ChatTabs, { ChatTabType } from "@/components/ChatTabs";
import ChatRoomList from "@/components/ChatRoomList";
import { MOCK_CHAT_ROOMS } from "./mock-chat-list";

export default function ChatPage() {
  const [activeTab, setActiveTab] = useState<ChatTabType>("ALL");
  const [rooms, setRooms] = useState<RoomViewDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      setRooms(MOCK_CHAT_ROOMS.data);
      setIsLoading(false);
    }, 500);
  }, []);

  const filteredRooms = useMemo(() => {
    if (activeTab === "ALL") {
      return rooms;
    }
    return rooms.filter((room) => room.parentEntityType === activeTab);
  }, [rooms, activeTab]);

  return (
    <>
      <div
        className="px-4 py-6"
        style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}
      >
        {/* 상단 '대화' 헤더와 오른쪽 아이콘 */}
        <div className="flex justify-between items-center mb-4"> {/* flex 추가 */}
          <div className="text-[28px] font-bold text-gray-900">대화</div> {/* 폰트 크기, 볼드 변경 */}
          <div className="w-8 h-8 rounded-full bg-gray-200"></div> {/* 오른쪽 상단 동그라미 아이콘 */}
        </div>
        
        <ChatTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {isLoading ? (
          <div className="text-center text-gray-500 mt-20">
            대화 목록을 불러오는 중...
          </div>
        ) : (
          <ChatRoomList rooms={filteredRooms} />
        )}
      </div>

      <BottomNav />
    </>
  );
}