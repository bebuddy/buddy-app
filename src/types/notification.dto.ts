// src/types/notification.dto.ts

// --- 공용 Enum 타입 ---

/**
 * 엔티티 상태 (공통)
 */
export type EntityStatus = "ACTIVE" | "BLOCKED" | "DELETED" | "INVALID" | "SEARCHABLE";

/**
 * 알림 타입 (NotificationViewDto)
 */
export type NotificationType = "COMMENT" | "MESSAGE" | "MESSAGE_UNREAD";


// --- 공용 DTO (chat.dto.ts와 중복) ---

/**
 * 사용자 기본 정보 DTO
 * (참고: chat.dto.ts에도 동일한 정의가 있습니다. 
 * 나중에 src/types/common.dto.ts 같은 공통 파일로 옮기면 좋습니다.)
 */
export interface SimpleUserDto {
  uuid: string;
  createdBy: string;
  createdDate: string; // "string($date-time)"
  elapsedCreatedDate: string;
  entityStatus: EntityStatus;
  lastModifiedBy: string;
  lastModifiedDate: string; // "string($date-time)"
  name: string;
  schoolName: string;
  
  // 채팅방에서 추가했던 필드 (Optional)
  age?: number; 
  region?: string; 
  introduction?: string; 
  profileImageUrl?: string | null; 
}


// --- [알림] 관련 DTO ---

/**
 * Notification 알림 1개에 대한 dto (Response)
 */
export interface NotificationViewDto {
  actionUrl: string;
  content: string;
  createdBy: string;
  createdDate: string; // string($date-time)
  data: string;
  elapsedCreatedDate: string;
  entityStatus: EntityStatus;
  lastModifiedBy: string;
  lastModifiedDate: string; // string($date-time)
  notificationType: NotificationType; // (Enum: [COMMNET, MESSAGE, MESSAGE_UNREAD])
  sender: SimpleUserDto;
  title: string;
  uuid: string;
}

/**
 * user 기준 notification dto (Response)
 */
export interface UserNotificationViewDto {
  createdBy: string;
  createdDate: string; // string($date-time)
  entityStatus: EntityStatus;
  isRead: boolean;
  lastModifiedBy: string;
  lastModifiedDate: string; // string($date-time)
  notification: NotificationViewDto;
  user: SimpleUserDto;
  uuid: string;
}

/**
 * 유저 알림 목록에 대한 리스트 응답 (Response)
 */
export interface UserNotificationPaginationResultDto {
  cursor: string | null;
  data: UserNotificationViewDto[];
  page: number; // integer($int64)
  totalCount: number; // integer($int64)
}

/**
 * 알림 읽음 상태 수정 (Request)
 */
export interface UserNotificationEditDto {
  uuid: string; // *
  changeLog?: string;
  entityStatus?: EntityStatus;
  isRead?: boolean;
}

/**
 * Pagination 기반 유저 알림 목록 불러오기 (Request)
 */
export interface UserNotificationPaginationRequestDto {
  count: number; // integer($int32)*
  cursor?: string;
  page?: number; // integer($int32)
}
