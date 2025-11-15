// src/app/(main)/myPage/alarm/mock-alarm.ts

import { 
    UserNotificationPaginationResultDto, 
    SimpleUserDto,
    NotificationViewDto,
    UserNotificationViewDto
  } from "@/types/notification.dto"; // DTO 경로는 실제 위치에 맞게 수정해주세요.
  
  // --- Mock Data 용 공통 객체 ---
  const MOCK_SENDER: SimpleUserDto = {
    // SimpleUserDto는 chat.dto.ts에 정의된 것을 재사용하거나
    // notification.dto.ts에 별도 정의된 것을 사용해야 합니다.
    // 여기서는 chat.dto.ts의 정의를 따른다고 가정합니다.
    uuid: "sender-uuid-123",
    name: "알림보낸이",
    schoolName: "버디대학교",
    createdBy: "system",
    createdDate: "2025-11-10T10:00:00Z",
    elapsedCreatedDate: "5일 전",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-11-10T10:00:00Z",
  };
  
  const MOCK_MY_USER: SimpleUserDto = {
    uuid: "my-uuid-456",
    name: "장미야",
    schoolName: "버디대학교",
    createdBy: "system",
    createdDate: "2025-10-01T10:00:00Z",
    elapsedCreatedDate: "1달 전",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-10-01T10:00:00Z",
  };
  
  
  // --- 개별 알림 (NotificationViewDto) ---
  const NOTIFICATION_1: NotificationViewDto = {
    uuid: "noti-1",
    notificationType: "COMMNET", // DTO Enum 오타 수정 (COMMNET -> COMMENT 가정)
    title: "새로운 댓글",
    content: "“고수는 아니지만 연락주세요!”",
    actionUrl: "/expert/post/123", // 예시 링크
    elapsedCreatedDate: "2일전",
    sender: MOCK_SENDER,
    // ... DTO 나머지 필드
    createdBy: "system",
    createdDate: "2025-11-13T10:00:00Z",
    data: "{}",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-11-13T10:00:00Z",
  };
  
  const NOTIFICATION_2: NotificationViewDto = {
    uuid: "noti-2",
    notificationType: "COMMNET",
    title: "새로운 댓글",
    content: "“주말 오후에 잠시 도와드릴 수 있을 것 같아요~”",
    actionUrl: "/junior/post/456",
    elapsedCreatedDate: "2일전",
    sender: MOCK_SENDER,
    // ... DTO 나머지 필드
    createdBy: "system",
    createdDate: "2025-11-13T09:00:00Z",
    data: "{}",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-11-13T09:00:00Z",
  };
  
  const NOTIFICATION_3: NotificationViewDto = {
    uuid: "noti-3",
    notificationType: "COMMNET",
    title: "새로운 댓글",
    content: "“멋지네요 ㅎㅎ”",
    actionUrl: "/expert/post/123",
    elapsedCreatedDate: "2일전",
    sender: MOCK_SENDER,
    // ... DTO 나머지 필드
    createdBy: "system",
    createdDate: "2025-11-13T08:00:00Z",
    data: "{}",
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-11-13T08:00:00Z",
  };
  
  const NOTIFICATION_4: NotificationViewDto = {
    uuid: "noti-4",
    notificationType: "MESSAGE_UNREAD",
    title: "미확인 대화",
    content: "장미야님이 아직 확인하지 않은 연락 3건이 있어요!",
    actionUrl: "/chat", // 채팅방 목록으로 이동
    elapsedCreatedDate: "2일전",
    sender: MOCK_SENDER, // 이 경우 sender가 시스템일 수 있음
    // ... DTO 나머지 필드
    createdBy: "system",
    createdDate: "2025-11-13T07:00:00Z",
    data: '{"unreadCount": 3}',
    entityStatus: "ACTIVE",
    lastModifiedBy: "system",
    lastModifiedDate: "2025-11-13T07:00:00Z",
  };
  
  
  // --- 유저 알림 목록 (UserNotificationViewDto) ---
  const USER_NOTIFICATIONS_DATA: UserNotificationViewDto[] = [
    // 1. 안읽은 알림 (보라색 배경)
    {
      uuid: "user-noti-1",
      isRead: false,
      notification: NOTIFICATION_1,
      user: MOCK_MY_USER,
      // ... DTO 나머지 필드
      createdBy: "system",
      createdDate: "2025-11-13T10:00:00Z",
      entityStatus: "ACTIVE",
      lastModifiedBy: "system",
      lastModifiedDate: "2025-11-13T10:00:00Z",
    },
    // 2. 안읽은 알림 (보라색 배경)
    {
      uuid: "user-noti-2",
      isRead: false,
      notification: NOTIFICATION_2,
      user: MOCK_MY_USER,
      // ... DTO 나머지 필드
      createdBy: "system",
      createdDate: "2025-11-13T09:00:00Z",
      entityStatus: "ACTIVE",
      lastModifiedBy: "system",
      lastModifiedDate: "2025-11-13T09:00:00Z",
    },
    // 3. 읽은 알림 (흰색 배경)
    {
      uuid: "user-noti-3",
      isRead: true,
      notification: NOTIFICATION_3,
      user: MOCK_MY_USER,
      // ... DTO 나머지 필드
      createdBy: "system",
      createdDate: "2025-11-13T08:00:00Z",
      entityStatus: "ACTIVE",
      lastModifiedBy: "system",
      lastModifiedDate: "2025-11-13T08:00:00Z",
    },
      // 4. 안읽은 알림 (보라색 배경)
    {
      uuid: "user-noti-4",
      isRead: false,
      notification: NOTIFICATION_4,
      user: MOCK_MY_USER,
      // ... DTO 나머지 필드
      createdBy: "system",
      createdDate: "2025-11-13T07:00:00Z",
      entityStatus: "ACTIVE",
      lastModifiedBy: "system",
      lastModifiedDate: "2025-11-13T07:00:00Z",
    },
  ];
  
  // --- 최종 Mock List (Response DTO) ---
  export const MOCK_ALARM_LIST: UserNotificationPaginationResultDto = {
    cursor: null,
    page: 1,
    totalCount: 4,
    data: USER_NOTIFICATIONS_DATA,
  };