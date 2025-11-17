// src/app/(main)/chat/[roomUuid]/mock-data.ts

import { SimpleUserDto, UserMessageViewDto } from "@/types/chat.dto";

// --- '나'의 정보 ---
export const MY_USER_ID = "my-uuid-123";
export const MY_USER: SimpleUserDto = {
  uuid: MY_USER_ID,
  name: "활발한 후배",
  schoolName: "버디대학교",
  age: 23,
  region: "서울시 마포구",
  introduction: "궁금한 게 많은 후배입니다.",
  profileImageUrl: null,
  createdBy: MY_USER_ID,
  createdDate: "2025-09-15T09:00:00Z",
  elapsedCreatedDate: "두 달 전",
  entityStatus: "ACTIVE",
  lastModifiedBy: MY_USER_ID,
  lastModifiedDate: "2025-11-10T14:00:00Z",
};

// --- 파트너 1 (Room 123) "열정적인 선배" ---
export const MOCK_PARTNER_1: SimpleUserDto = {
  uuid: "partner-uuid-456",
  name: "김미르",
  schoolName: "버디대학교",
  age: 25,
  region: "서울시 서초구",
  introduction: "AI 사용 전문가",
  profileImageUrl: null,
  createdBy: "system",
  createdDate: "2025-10-01T10:00:00Z",
  elapsedCreatedDate: "한 달 전",
  entityStatus: "ACTIVE",
  lastModifiedBy: "system",
  lastModifiedDate: "2025-10-20T11:00:00Z",
};

// --- 파트너 2 (Room 456) "엉뚱한 후배" ---
export const MOCK_PARTNER_2: SimpleUserDto = {
  uuid: "partner-uuid-789",
  name: "용용용",
  schoolName: "버디대학교",
  age: 21,
  region: "서울시 강남구",
  introduction: "목공을 배워보고 싶은 60대입니다.",
  profileImageUrl: null,
  createdBy: "system",
  createdDate: "2025-10-05T14:00:00Z",
  elapsedCreatedDate: "3주 전",
  entityStatus: "ACTIVE",
  lastModifiedBy: "system",
  lastModifiedDate: "2025-11-01T18:00:00Z",
};

// --- ROOM 123 ("열정적인 선배") 메시지 ---
export const MOCK_MESSAGES_123: UserMessageViewDto[] = [
  {
    uuid: "msg-1",
    message: "안녕하세요! 선배님께 AI 관련 강습을 받고 싶어서 연락드렸습니다.",
    sender: MY_USER,
    receiver: MOCK_PARTNER_1,
    createdDate: "2025-11-15T13:30:00Z",
    elapsedCreatedDate: "10분 전",
    isRead: true,
    roomUuid: "room-123",
    createdBy: MY_USER_ID,
    entityStatus: "ACTIVE", isAnonymous: false, lastModifiedBy: MY_USER_ID, lastModifiedDate: "2025-11-15T13:30:00Z",
  },
  {
    uuid: "msg-2",
    message: "네, 안녕하세요. AI 관련해서 무엇을 중점적으로 배우고 싶으신가요?",
    sender: MOCK_PARTNER_1,
    receiver: MY_USER,
    createdDate: "2025-11-15T13:31:00Z",
    elapsedCreatedDate: "9분 전",
    isRead: true,
    roomUuid: "room-123",
    createdBy: MOCK_PARTNER_1.uuid,
    entityStatus: "ACTIVE", isAnonymous: false, lastModifiedBy: MOCK_PARTNER_1.uuid, lastModifiedDate: "2025-11-15T13:31:00Z",
  },
  {
    uuid: "msg-5",
    message: "아 저는 AI 이미지 생성에 관심이 많습니다!",
    sender: MY_USER,
    receiver: MOCK_PARTNER_1,
    createdDate: "2025-11-15T13:34:00Z",
    elapsedCreatedDate: "6분 전",
    isRead: false,
    roomUuid: "room-123",
    createdBy: MY_USER_ID,
    entityStatus: "ACTIVE", isAnonymous: false, lastModifiedBy: MY_USER_ID, lastModifiedDate: "2025-11-15T13:34:00Z",
  },
];

// --- ROOM 456 ("엉뚱한 후배") 메시지 ---
export const MOCK_MESSAGES_456: UserMessageViewDto[] = [
  {
    uuid: "msg-b-1",
    message: "선배님! 혹시 목공 관련해서 수업 가능하실까요?",
    sender: MOCK_PARTNER_2,
    receiver: MY_USER,
    createdDate: "2025-11-14T18:00:00Z",
    elapsedCreatedDate: "어제",
    isRead: true,
    roomUuid: "room-456",
    createdBy: MOCK_PARTNER_2.uuid,
    entityStatus: "ACTIVE", isAnonymous: false, lastModifiedBy: MOCK_PARTNER_2.uuid, lastModifiedDate: "2025-11-14T18:00:00Z",
  },
  {
    uuid: "msg-b-2",
    message: "좋아요! 이번 달 중에는 언제가 괜찮으세요?",
    sender: MY_USER,
    receiver: MOCK_PARTNER_2,
    createdDate: "2025-11-14T18:05:00Z",
    elapsedCreatedDate: "어제",
    isRead: true,
    roomUuid: "room-456",
    createdBy: MY_USER_ID,
    entityStatus: "ACTIVE", isAnonymous: false, lastModifiedBy: MY_USER_ID, lastModifiedDate: "2025-11-14T18:05:00Z",
  },
  {
    uuid: "msg-b-3",
    message: "저는 화목이 편합니다.",
    sender: MOCK_PARTNER_2,
    receiver: MY_USER,
    createdDate: "2025-11-14T18:10:00Z",
    elapsedCreatedDate: "어제",
    isRead: false,
    roomUuid: "room-456",
    createdBy: MOCK_PARTNER_2.uuid,
    entityStatus: "ACTIVE", isAnonymous: false, lastModifiedBy: MOCK_PARTNER_2.uuid, lastModifiedDate: "2025-11-14T18:10:00Z",
  },
];