// src/types/chat.dto.ts

// --- 공용 Enum 타입 ---

/**
 * 엔티티 상태 (공통)
 * (Enum: [ACTIVE, BLOCKED, DELETED, INVALID, SEARCHABLE])
 */
export type EntityStatus = "ACTIVE" | "BLOCKED" | "DELETED" | "INVALID" | "SEARCHABLE";

/**
 * 엔티티 타입 (RoomViewDto)
 * (Enum: [SENIOR, ROOM, JUNIOR])
 */
export type EntityType = "SENIOR" | "ROOM" | "JUNIOR";

/**
 * 부모 엔티티 타입 (UserMessageRegisterDto)
 * (Enum: [SENIOR, JUNIOR, ROOM])
 */
export type ParentEntityType = "SENIOR" | "JUNIOR" | "ROOM";


// --- 공용 DTO ---

/**
 * Pagination 요청 DTO (공통)
 */
export interface PaginationRequestDto {
  count: number; // integer($int32)*
  cursor?: string; // string (nullable)
  page?: number; // integer($int32)
}

/**
 * 사용자 기본 정보 DTO (팀원이 새로 제공한 버전)
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
    
    // --- ★ 여기에 새 필드들을 추가해야 합니다 ---
    age?: number;
    region?: string;
    introduction?: string;
    profileImageUrl?: string | null;
  }


// --- [채팅방] 관련 DTO ---

/**
 * 채팅방 리스트 조회 (Request)
 */
export interface RoomFetchDto {
  entityStatus?: EntityStatus; // (Enum: [ACTIVE, BLOCKED, DELETED, INVALID, SEARCHABLE])
  paginationRequestDto: PaginationRequestDto;
  userUuid?: string;
}

/**
 * 채팅방 1개의 DTO (Response)
 */
export interface RoomViewDto {
  createdBy: string;
  createdDate: string; // string($date-time)
  entityStatus: EntityStatus;
  entityType: EntityType;
  isAnonymous: boolean;
  isReportedByMe: boolean;
  lastMessage: UserMessageViewDto | null; // 메시지가 없을 수 있으므로 null 허용
  lastModifiedBy: string;
  lastModifiedDate: string; // string($date-time)
  parentEntityType: string; // ParentEntityType과 동일할 것으로 보이나 명세상 string
  parentEntityUuid: string;
  partner: SimpleUserDto;
  receiverIdExist: number; // integer($int64)
  senderIdExist: number; // integer($int64)
  unreadCount: number; // integer($int32)
  uuid: string;
}

/**
 * 채팅방 리스트 목록 조회 (Response)
 */
export interface RoomNewPaginationResultDto {
  cursor: string | null;
  data: RoomViewDto[];
  page: number; // integer($int64)
  totalCount: number; // integer($int64)
}


// --- [채팅 메시지] 관련 DTO ---

/**
 * 메시지 1개에 대한 DTO (Response)
 */
export interface UserMessageViewDto {
  createdBy: string;
  createdDate: string; // string($date-time)
  elapsedCreatedDate: string;
  entityStatus: EntityStatus;
  isAnonymous: boolean;
  isRead: boolean;
  lastModifiedBy: string;
  lastModifiedDate: string; // string($date-time)
  message: string;
  receiver: SimpleUserDto;
  roomUuid: string;
  sender: SimpleUserDto;
  uuid: string;
}

/**
 * 메시지 읽음 상태 변경 (Request)
 */
export interface UserMessageEditDto {
  uuid: string; // *
  changeLog?: string;
  entityStatus?: EntityStatus;
  isRead?: boolean;
}

/**
 * 메시지 전송 (Request)
 */
export interface UserMessageRegisterDto {
  message: string; // *
  parentEntityType: ParentEntityType; // * (Enum: [SENIOR, JUNIOR, ROOM])
  parentEntityUuid: string; // *
  entityStatus?: EntityStatus;
}

/**
 * 메시지 목록 조회 (Request)
 */
export interface UserMessageFetchDto {
  paginationRequestDto: PaginationRequestDto;
  roomUuid?: string;
  entityStatus?: EntityStatus;
}