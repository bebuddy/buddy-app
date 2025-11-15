// src/components/ChatRoomList.tsx
"use client";

import { RoomViewDto } from "@/types/chat.dto";
import ChatRoomItem from "./ChatRoomItem";

interface ChatRoomListProps {
  rooms: RoomViewDto[];
}

export default function ChatRoomList({ rooms }: ChatRoomListProps) {
  if (rooms.length === 0) {
    return (
      <div className="text-center text-gray-500 mt-20">
        대화방이 없습니다.
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {rooms.map((room) => (
        <ChatRoomItem key={room.uuid} room={room} />
      ))}
    </div>
  );
}