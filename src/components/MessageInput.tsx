// src/components/MessageInput.tsx
"use client";

import { useState } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      onSendMessage(trimmedMessage);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // --- 1. '한글 입력기' 버그 수정 ---
    // '조합 중' (isComposing)일 때는 Enter를 눌러도 전송(handleSend)이 실행되지 않도록 함
    if (e.nativeEvent.isComposing) {
      return;
    }
    
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isInputEmpty = message.trim() === "";

  return (
    <div className="flex items-center p-4 bg-white sticky bottom-0">
      {/* '+' 버튼 (임시 아이콘) */}
      <button className="mr-3 p-2 text-gray-500 hover:text-gray-700">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
      </button>

      {/* 메시지 입력창 */}
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyDown} // 수정된 핸들러 연결
        placeholder="메시지를 입력하세요."
        className="flex-1 px-4 py-2 bg-gray-100 rounded-full mr-2 focus:outline-none focus:ring-1 focus:ring-gray-300 text-gray-800"
      />
      
      {/* --- 2. 전송 버튼 (아이콘, 색상 수정) --- */}
      <button
        onClick={handleSend}
        disabled={isInputEmpty}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors
          ${isInputEmpty
            ? 'bg-gray-300 text-gray-500' // 비활성화
            : 'bg-[#6163FF] hover:bg-[#5052D9] text-white' // ★ 활성화 색상 (#6163FF)
          }
        `}
      >
        {/* ★ 위쪽 화살표(arrow_upward) SVG로 변경 */}
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24" stroke="none">
          <path d="M4 12l1.41 1.41L11 7.83V20h2V7.83l5.59 5.58L20 12l-8-8-8 8z"/>
        </svg>
      </button>
    </div>
  );
}