// src/components/MessageList.tsx
"use client";

import { UserMessageViewDto } from "@/types/chat.dto";
// ❗️ MY_USER_ID import 제거
import { useMemo, useRef, useEffect } from "react";

interface MessageListProps {
  messages: UserMessageViewDto[];
  myUserId: string; // ★ Prop으로 받도록 추가
}

// 헬퍼 함수 (날짜별 그룹화 - 변경 없음)
const groupMessagesByDate = (messages: UserMessageViewDto[]) => {
  const groups: { date: string; messages: UserMessageViewDto[] }[] = [];
  let currentDate = "";

  messages.forEach(msg => {
    const msgDate = new Date(msg.createdDate).toLocaleString("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groups.push({ date: currentDate, messages: [] });
    }
    groups[groups.length - 1].messages.push(msg);
  });
  return groups;
};


export default function MessageList({ messages, myUserId }: MessageListProps) { // ★ Prop 받기
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // '읽음' 로직이 'myUserId' prop을 사용하도록 변경
  const lastReadMessageUuid = useMemo(() => {
    const myReadMessages = messages
      .filter((msg) => msg.sender.uuid === myUserId && msg.isRead) // ★ 수정됨
      .sort((a, b) => new Date(a.createdDate).getTime() - new Date(b.createdDate).getTime());
    
    return myReadMessages.length > 0
      ? myReadMessages[myReadMessages.length - 1].uuid
      : null;
  }, [messages, myUserId]); // ★ myUserId 의존성 추가

  const groupedMessages = groupMessagesByDate(messages);

  return (
    <div className="flex-1 p-4 space-y-4 overflow-y-auto bg-white">
      {groupedMessages.map((group, groupIndex) => (
        <div key={group.date || `group-${groupIndex}`}>
          
          {group.messages.map((msg, index) => {
            const isMyMessage = msg.sender.uuid === myUserId; // ★ 수정됨
            const showReadStatus = msg.uuid === lastReadMessageUuid;
            const timeString = new Date(msg.createdDate).toLocaleTimeString("ko-KR", {
              hour: "2-digit",
              minute: "2-digit",
              hour12: true,
            });

            const TimeReadComponent = (
              <div className="text-xs text-gray-500 mb-1 flex-shrink-0 mx-2">
                {isMyMessage && showReadStatus && (
                  <span className="text-purple-600 font-semibold block text-right">읽음</span>
                )}
                <span className="block text-right">{timeString}</span>
              </div>
            );

            const BubbleComponent = (
              <div
                className={`px-4 py-2 break-words
                  ${isMyMessage
                    ? "bg-gray-100 text-black rounded-2xl"
                    : "bg-white text-black border border-gray-200 rounded-2xl"
                  }
                `}
              >
                {msg.message}
              </div>
            );

            return (
              <div
                key={msg.uuid}
                className={`flex ${isMyMessage ? "justify-end" : "justify-start"} mb-2`}
              >
                <div className="flex items-end max-w-[70%]">
                  {isMyMessage ? (
                    <>
                      {TimeReadComponent}
                      {BubbleComponent}
                    </>
                  ) : (
                    <>
                      {BubbleComponent}
                      {TimeReadComponent}
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
}