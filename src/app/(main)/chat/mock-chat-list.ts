// src/app/(main)/chat/mock-chat-list.ts

import { 
    RoomNewPaginationResultDto, 
    SimpleUserDto, 
    UserMessageViewDto 
  } from "@/types/chat.dto";
  
  // Mock 파트너 1 (선배)
  const MOCK_PARTNER_1: SimpleUserDto = {
    uuid: "partner-uuid-456",
    name: "열정적인 선배",
    schoolName: "버디대학교",
    createdBy: "system",
    createdDate: "2025-10-01T10:00:00Z",
    elapsedCreatedDate: "한 달 전",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-10-20T11:00:00Z",
  };
  
  // Mock 파트너 2 (후배)
  const MOCK_PARTNER_2: SimpleUserDto = {
    uuid: "partner-uuid-789",
    name: "엉뚱한 후배",
    schoolName: "버디대학교",
    createdBy: "system",
    createdDate: "2025-10-05T14:00:00Z",
    elapsedCreatedDate: "3주 전",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-11-01T18:00:00Z",
  };
  
  // Mock 채팅방 목록 데이터 (RoomNewPaginationResultDto DTO 기준)
  export const MOCK_CHAT_ROOMS: RoomNewPaginationResultDto = {
    cursor: null,
    page: 1,
    totalCount: 2,
    data: [
      // 1. 선배와의 채팅방
      {
        uuid: "room-123", // 1:1 채팅방의 roomUuid (동적 경로와 일치)
        partner: MOCK_PARTNER_1,
        lastMessage: {
          uuid: "msg-5",
          message: "앗 맞아요. 정확히는 투영 변환 쪽이 헷갈립니다.",
          sender: { uuid: "my-uuid-123" } as SimpleUserDto, // '나'의 정보 (간략화)
          receiver: MOCK_PARTNER_1,
          createdDate: "2025-11-15T13:34:00Z",
          elapsedCreatedDate: "10분 전",
          isRead: false,
          // ... DTO 나머지 필드
          createdBy: "my-uuid-123",
          entityStatus: "ACTIVE",
          isAnonymous: false,
          lastModifiedBy: "my-uuid-123",
          lastModifiedDate: "2025-11-15T13:34:00Z",
          roomUuid: "room-123",
        },
        unreadCount: 2,
        parentEntityType: "SENIOR", // ★ '선배' 탭과 연결
        // ... DTO 나머지 필드
        createdBy: "system",
        createdDate: "2025-11-15T13:30:00Z",
        entityStatus: "ACTIVE",
        entityType: "ROOM",
        isAnonymous: false,
        isReportedByMe: false,
        lastModifiedBy: "system",
        lastModifiedDate: "2025-11-15T13:34:00Z",
        parentEntityUuid: "parent-senior-uuid",
        receiverIdExist: 1,
        senderIdExist: 1,
      },
      // 2. 후배와의 채팅방
      {
        uuid: "room-456",
        partner: MOCK_PARTNER_2,
        lastMessage: {
          uuid: "msg-b-1",
          message: "선배님! 혹시 시간 되실 때 커피 한잔하실 수 있나요?",
          sender: MOCK_PARTNER_2, 
          receiver: { uuid: "my-uuid-123" } as SimpleUserDto,
          createdDate: "2025-11-14T18:00:00Z",
          elapsedCreatedDate: "어제",
          isRead: true,
          // ... DTO 나머지 필드
          createdBy: MOCK_PARTNER_2.uuid,
          entityStatus: "ACTIVE",
          isAnonymous: false,
          lastModifiedBy: MOCK_PARTNER_2.uuid,
          lastModifiedDate: "2025-11-14T18:00:00Z",
          roomUuid: "room-456",
        },
        unreadCount: 0,
        parentEntityType: "JUNIOR", // ★ '후배' 탭과 연결
         // ... DTO 나머지 필드
         createdBy: "system",
         createdDate: "2025-11-14T18:00:00Z",
         entityStatus: "ACTIVE",
         entityType: "ROOM",
         isAnonymous: false,
         isReportedByMe: false,
         lastModifiedBy: "system",
         lastModifiedDate: "2025-11-14T18:00:00Z",
         parentEntityUuid: "parent-junior-uuid",
         receiverIdExist: 1,
         senderIdExist: 1,
      },
    ],
  };