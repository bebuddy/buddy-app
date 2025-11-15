// src/app/(main)/chat/[roomUuid]/page.tsx
"use client";

import { useState, useEffect } from "react";
import { SimpleUserDto, UserMessageViewDto } from "@/types/chat.dto";
import {
  // ★ 수정된 mock-data import
  MY_USER_ID,
  MY_USER,
  MOCK_PARTNER_1,
  MOCK_MESSAGES_123,
  MOCK_PARTNER_2,
  MOCK_MESSAGES_456,
} from "./mock-data";

// 컴포넌트 임포트
import ChatHeader from "@/components/ChatHeader";
import ChatProfileHeader from "@/components/ChatProfileHeader";
import MessageList from "@/components/MessageList";
import MessageInput from "@/components/MessageInput";

// --- 1. 'params' prop 받기 위한 interface ---
interface ChatRoomPageProps {
  params: { roomUuid: string };
}

export default function ChatRoomPage({ params }: ChatRoomPageProps) { // ★ params 받기
  const [messages, setMessages] = useState<UserMessageViewDto[]>([]);
  // --- 2. 'partnerInfo' 초기 상태 null로 변경 ---
  const [partnerInfo, setPartnerInfo] = useState<SimpleUserDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFirstMessage, setIsFirstMessage] = useState(false);

  // --- 3. 'useEffect'에서 'params.roomUuid' 사용 ---
  useEffect(() => {
    setIsLoading(true);
    
    // 가짜 로딩
    setTimeout(() => {
      let partner: SimpleUserDto | null = null;
      let messageList: UserMessageViewDto[] = [];
      
      // ★ URL의 roomUuid에 따라 다른 Mock Data 선택
      if (params.roomUuid === "room-123") {
        partner = MOCK_PARTNER_1;
        messageList = MOCK_MESSAGES_123;
      } else if (params.roomUuid === "room-456") {
        partner = MOCK_PARTNER_2;
        messageList = MOCK_MESSAGES_456;
      } else {
        // 일치하는 방이 없을 경우 (예: 새 채팅방)
        messageList = [];
        // partner = (API로 찾아온 파트너 정보); // 새 채팅방 파트너 정보 설정
      }

      setPartnerInfo(partner);
      setMessages(messageList);

      // '첫 메시지' 여부 판단
      if (messageList.length === 0) {
        setIsFirstMessage(true);
      } else {
        setIsFirstMessage(false);
      }
      
      setIsLoading(false);
    }, 500); // 0.5초 로딩
  }, [params.roomUuid]); // ★ 'roomUuid'가 바뀔 때마다 이 effect가 다시 실행됨

  const handleSendMessage = (newMessageText: string) => {
    if (isFirstMessage) {
      setIsFirstMessage(false);
    }
    
    if (!partnerInfo) return; // 파트너 정보가 없으면 전송 불가

    const newMessageMock: UserMessageViewDto = {
      uuid: `msg-${Math.random()}`,
      message: newMessageText,
      sender: MY_USER,
      receiver: partnerInfo, // 현재 'partnerInfo' 상태 사용
      roomUuid: params.roomUuid, // URL 파라미터의 roomUuid 사용
      createdDate: new Date().toISOString(),
      elapsedCreatedDate: "방금",
      isRead: false,
      createdBy: MY_USER_ID,
      entityStatus: "ACTIVE",
      isAnonymous: false,
      lastModifiedBy: MY_USER_ID,
      lastModifiedDate: new Date().toISOString(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessageMock]);
  };

  // --- 4. 로딩 및 'partnerInfo'가 없을 때 처리 ---
  if (isLoading || !partnerInfo) {
    return <div className="flex h-screen items-center justify-center">채팅방을 불러오는 중...</div>;
  }

  return (
    <div className="flex flex-col h-screen bg-white">
      <ChatHeader partnerName={partnerInfo.name} />

      {isFirstMessage && (
        <ChatProfileHeader partner={partnerInfo} />
      )}

      {/* --- 5. 'myUserId' prop 전달 --- */}
      <MessageList messages={messages} myUserId={MY_USER_ID} />

      <MessageInput onSendMessage={handleSendMessage} />
    </div>
  );
}