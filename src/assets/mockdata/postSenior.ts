import { userProfiles } from "./user";

export interface UserProfile {
  name: string;
  age: number;
  gender: string;
  location?: string;
}

export interface PostType {
  id: string;
  user_id: string;
  user: UserProfile;
  title: string; // ✅ 추가된 필드
  category: string;
  level: string;
  junior_type: string[];
  senior_info: {
    class_num: number;
    response_rate: number;
    review_num: number;
  };
  class_type: string;
  days: string[];
  times: string[];
  created_at: string;
  updated_at: string;
  content: string;
  status: string;
  image_url_l?: string;
  reviewList: Review[];
}

export type Review = {
  title: string;
  content: string[];
};

// 🌹 장미야 (식물)
export const postSeniorRose: PostType = {
  id: "1",
  user_id: "8",
  user: userProfiles["8"],
  title: "정성껏 가르치는 식물 전문가, 장미 박사",
  category: "식물",
  level: "신",
  junior_type: ["성장 욕구가 있는", "깊이 고민하는", "다양한 시도를 즐기는"],
  senior_info: { class_num: 7, response_rate: 92, review_num: 3 },
  class_type: "대면이 좋아요",
  days: ["화", "목", "금"],
  times: ["오전 (10:00 ~ 12:00)", "오후 (12:00 ~ 18:00)"],
  created_at: "2025-10-18T09:00:00+09:00",
  updated_at: "2025-10-18T09:00:00+09:00",
  content: `장미 박사 장미야입니다. 다육식물과 분갈이, 식물 관리 전반을 가르칩니다.`,
  status: "DONE",
  image_url_l: "/mockimage/rose_senior.png",
  reviewList: [
    { title: "😊 좋은 점", content: ["식물을 세심하게 다뤄요", "이해하기 쉽게 설명해줘요", "실습 중심이라 재미있어요"] },
    { title: "🤔 아쉬운 점", content: ["준비물이 조금 많아요", "수업 시간이 짧게 느껴져요"] },
    { title: "🗣 후기 코멘트", content: ["식물을 돌보는 게 훨씬 쉬워졌어요", "집에서도 바로 응용할 수 있어요", "선생님이 매우 친절하세요"] },
  ],
};

// 🐶 스누피 (프랑스어)
export const postSeniorSnoopy: PostType = {
  id: "2",
  user_id: "9",
  user: userProfiles["9"],
  title: "8년 거주 경험의 프랑스어 실전 강사",
  category: "프랑스어",
  level: "신",
  junior_type: ["성장 욕구가 있는", "밝고 유쾌한", "꾸준한"],
  senior_info: { class_num: 5, response_rate: 92, review_num: 3 },
  class_type: "대면이 좋아요",
  days: ["화", "목", "금"],
  times: ["오전 (10:00 ~ 12:00)", "오후 (12:00 ~ 18:00)"],
  created_at: "2025-10-18T09:00:00+09:00",
  updated_at: "2025-10-18T09:00:00+09:00",
  content: `프랑스에서 8년간 거주한 경험을 바탕으로 회화, 발음 교정, DELF 대비를 지도합니다.`,
  status: "DONE",
  image_url_l: "/mockimage/snoopy_senior.png",
  reviewList: [
    { title: "😊 좋은 점", content: ["발음을 세세히 교정해줘요", "수업 분위기가 밝고 편안해요", "실제 대화 예시가 풍부해요"] },
    { title: "🤔 아쉬운 점", content: ["숙제가 많아서 복습이 어려워요", "수업 시간이 짧아요"] },
    { title: "🗣 후기 코멘트", content: ["프랑스 여행에서 바로 써먹었어요", "선생님 발음이 완전 현지 같아요", "동기부여가 잘 돼요"] },
  ],
};

// 🪚 목왕자 (목공)
export const postSeniorWoodKing: PostType = {
  id: "3",
  user_id: "10",
  user: userProfiles["10"],
  title: "실전 제작 중심의 목공 장인 수업",
  category: "목공",
  level: "고수",
  junior_type: ["성장 욕구가 있는", "깊이 고민하는", "다양한 시도를 즐기는"],
  senior_info: { class_num: 7, response_rate: 92, review_num: 3 },
  class_type: "대면이 좋아요",
  days: ["화", "목", "금"],
  times: ["오전 (10:00 ~ 12:00)", "오후 (12:00 ~ 18:00)"],
  created_at: "2025-10-18T09:00:00+09:00",
  updated_at: "2025-10-18T09:00:00+09:00",
  content: `2단 락커, 장식장 등 맞춤 목공 제작 및 수리 방법을 가르칩니다.`,
  status: "DONE",
  image_url_l: "/mockimage/woodking_senior.png",
  reviewList: [
    { title: "😊 좋은 점", content: ["도구 사용법을 꼼꼼히 알려줘요", "작업 과정에서 실습 위주예요", "결과물이 만족스러워요"] },
    { title: "🤔 아쉬운 점", content: ["공구 소리가 커서 집중이 어렵기도 해요", "초보자에게는 약간 어렵게 느껴져요"] },
    { title: "🗣 후기 코멘트", content: ["직접 만든 선반이 너무 예뻐요", "현장감 있는 수업이었어요", "배운 걸 바로 활용했어요"] },
  ],
};

// 🧶 대신뽑아드려요 (뜨개)
export const postSeniorCrochet: PostType = {
  id: "4",
  user_id: "11",
  user: userProfiles["11"],
  title: "뜨개 12년 경력의 감성 공예 멘토",
  category: "뜨개",
  level: "신",
  junior_type: ["성장 욕구가 있는", "깊이 고민하는", "다양한 시도를 즐기는"],
  senior_info: { class_num: 7, response_rate: 92, review_num: 3 },
  class_type: "대면이 좋아요",
  days: ["화", "목", "금"],
  times: ["오전 (10:00 ~ 12:00)", "오후 (12:00 ~ 18:00)"],
  created_at: "2025-10-18T09:00:00+09:00",
  updated_at: "2025-10-18T09:00:00+09:00",
  content: `12년 경력의 뜨개 전문가로, 도안 제작부터 응용까지 지도합니다.`,
  status: "DONE",
  image_url_l: "/mockimage/crochet_senior.png",
  reviewList: [
    { title: "😊 좋은 점", content: ["기본부터 차근차근 알려줘요", "색상 조합 감각이 뛰어나요", "실수해도 친절히 도와줘요"] },
    { title: "🤔 아쉬운 점", content: ["초반 속도가 약간 빨라요", "복잡한 도안은 조금 어려웠어요"] },
    { title: "🗣 후기 코멘트", content: ["내가 직접 만든 가방 완성!", "수업이 따뜻하고 차분해요", "시간 가는 줄 몰랐어요"] },
  ],
};

// 🔮 이한길 (타로)
export const postSeniorTarot: PostType = {
  id: "5",
  user_id: "12",
  user: userProfiles["12"],
  title: "70대 타로 고수의 인생 상담",
  category: "타로",
  level: "고수",
  junior_type: ["성장 욕구가 있는", "깊이 고민하는", "다양한 시도를 즐기는"],
  senior_info: { class_num: 7, response_rate: 92, review_num: 3 },
  class_type: "대면이 좋아요",
  days: ["화", "목", "금"],
  times: ["오전 (10:00 ~ 12:00)", "오후 (12:00 ~ 18:00)"],
  created_at: "2025-10-18T09:00:00+09:00",
  updated_at: "2025-10-18T09:00:00+09:00",
  content: `70대 인생 고수가 타로 오라클을 통해 인생 방향을 함께 봐드립니다.`,
  status: "DONE",
  image_url_l: "/mockimage/tarot_senior.png",
  reviewList: [
    { title: "😊 좋은 점", content: ["경험에서 우러나는 조언이에요", "말이 따뜻하고 위로가 돼요", "카드 해석이 명확해요"] },
    { title: "🤔 아쉬운 점", content: ["예약이 빨리 마감돼요", "카페가 다소 시끄러웠어요"] },
    { title: "🗣 후기 코멘트", content: ["진심 어린 상담이었어요", "힘들 때 도움이 됐어요", "다시 상담받고 싶어요"] },
  ],
};

// 🧺 이촌댁 (청소)
export const postSeniorClean: PostType = {
  id: "6",
  user_id: "13",
  user: userProfiles["13"],
  title: "35년차 주부의 정리·수납 노하우 클래스",
  category: "청소",
  level: "초고수",
  junior_type: ["성장 욕구가 있는", "깊이 고민하는", "다양한 시도를 즐기는"],
  senior_info: { class_num: 7, response_rate: 92, review_num: 3 },
  class_type: "대면이 좋아요",
  days: ["화", "목", "금"],
  times: ["오전 (10:00 ~ 12:00)", "오후 (12:00 ~ 18:00)"],
  created_at: "2025-10-18T09:00:00+09:00",
  updated_at: "2025-10-18T09:00:00+09:00",
  content: `35년차 주부의 옷·신발·생활용품 정리 노하우를 전수합니다.  
다이소 정리템 추천부터 공간 분리 팁까지!`,
  status: "DONE",
  image_url_l: "/mockimage/clean_senior.png",
  reviewList: [
    { title: "😊 좋은 점", content: ["정리 동선이 체계적이에요", "생활 속에서 바로 적용 가능해요", "깔끔하고 실용적인 수업이에요"] },
    { title: "🤔 아쉬운 점", content: ["사진 자료가 조금 더 있었으면 해요", "준비물이 생각보다 많아요"] },
    { title: "🗣 후기 코멘트", content: ["집 분위기가 완전히 달라졌어요", "정리 습관이 생겼어요", "가족이 놀랐어요, 너무 깔끔해졌다고"] },
  ],
};

// ✅ 전체 배열
export const MOCKSENIORLIST: PostType[] = [
  postSeniorRose,
  postSeniorSnoopy,
  postSeniorWoodKing,
  postSeniorCrochet,
  postSeniorTarot,
  postSeniorClean,
];
