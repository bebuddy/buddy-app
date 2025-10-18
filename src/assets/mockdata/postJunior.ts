export interface PostType {
    id: string;
    user_id: string;
    category: string;
    level: string;
    senior_type: string[];
    class_type: string;
    days: string[];
    times: string[];
    budget?: number;
    budget_type: string;
    created_at: string;
    updated_at: string;
    title: string;
    content: string;
    senior_gender: string;
    status: string;
    image_url_m?: string;
}

export const postJuniorRose = {
  id: "1", // uuid (PK)
  user_id: "1", // uuid (작성자 FK 예상)
  category: "식물", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다방면에 능통한", "든든한 조력자", "실무 경험 풍부한"],
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["월", "화", "수"],
  times: ["시간대 협의"],
  budget: 30000, // numeric (예산)
  budget_type: "건당", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "장미 가지치기 알려주실 분", // text (제목)
  content: `단독주택 장미 가지치기를 예쁘게 하고 싶은데 매번 죽어버리거나 모양이 이상하게 나와요. 

전지용 가위, 소독제, 보호용 손장갑은 구비되어 있습니다. 

장미 말고도 다른 식물들도 잘 가꾸시는 분이면 좋겠어요.

저는 후암시장 근처에 살아서, 이쪽까지 와주시면 좋겠어요.

연락 기다리겠습니다~`, 
  image_url_m: "/mockimage/rose.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorPaint = {
  id: "2", // uuid (PK)
  user_id: "2", // uuid (작성자 FK 예상)
  category: "기타 시공", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다방면에 능통한", "친절한", "믿음직한"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["요일 협의"],
  times: ["시간대 협의"],
//   budget: , // numeric (예산)
  budget_type: "협의", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "현관문 페인트칠 혹은 필름지", // text (제목)
  content: `조금 오래된 집이라서 현관문이 더러워요. 

페인트칠 혹은 필름지로 안과 밖에 깔끔하게 시공하고 싶어요. 
어떤 방법이 좋을지 선배님들께 문의드립니다.`, // text (내용)
  image_url_m: "/mockimage/paint.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorStudy = {
  id: "3", // uuid (PK)
  user_id: "3", // uuid (작성자 FK 예상)
  category: "스터디", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다양한 시도", "든든한 조력자", "적극적인"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["월, 금, 토"],
  times: ["시간대 협의"],
  budget: 50000, // numeric (예산)
  budget_type: "건당", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "ai 툴 + 바이브코딩", // text (제목)
  content: `러버블이나 구글 앱스크립트 써서 업무 자동화 시키고 싶은데, 비전공자고 베이스가 전혀 없어서 혹시 알려주실 분이 있으실까 글 작성해봅니다. 

책을 많이 읽는데다가 요즘 재테크 공부중이라 이런걸 좀 정리하고 싶은데 아날로그로만 정리하다보니 ai로 자동화시켜보면 어떨까 해서요. 30대초에 법조계 종사중(변호사는 아닙니다)인데 이것저것 바이브코딩 같이 해봐주실 메이트같은 선배님 ㅎ 구해봅니다!`, // text (내용)
//   image_url_m: "/mockimage/paint.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorValve = {
  id: "4", // uuid (PK)
  user_id: "4", // uuid (작성자 FK 예상)
  category: "기타 시공", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다양한 능통한", "든든한 조력자", "실무 경험 풍부한"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["요일 협의"],
  times: ["시간대 협의"],
//   budget: 50000, // numeric (예산)
  budget_type: "협의", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "필밸브 부품 및 교체", // text (제목)
  content: `필밸브 부품 가지고 있고 + 교체해주실 수 있는 선배님 계신가요? 변기에서 물소리가 졸졸 나고 휘파람 소리도 나서  뚜껑 열어보니 필밸브 문제라고 하네요. 부품+교체 부탁드리고 싶습니다

견적이 얼마나 나올지 몰라서 비용도 제시해주시면 감사하겠습니다`, // text (내용)
//   image_url_m: "/mockimage/paint.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorKnit = {
  id: "5", // uuid (PK)
  user_id: "5", // uuid (작성자 FK 예상)
  category: "뜨개", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["친절한", "든든한 조력자", "치어리더"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["월, 화, 수"],
  times: ["시간대 협의"],
  budget: 30000, // numeric (예산)
  budget_type: "시간당", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "뜨개질 하는 법 알려주실 분", // text (제목)
  content: `한시간에 3만원 생각하고 있구 평일시간대 오전 2시간 정도 배우고 싶어요

왕초보고 코바늘 대바늘 실도 있는데 잘 모르겠어요 ㅠ

유튜브로 코스터 만들기 따라해봤는데 너무 어려워서 만나서 알려주실 선배님 구해요`, // text (내용)
//   image_url_m: "/mockimage/paint.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorKimchi = {
  id: "6", // uuid (PK)
  user_id: "6", // uuid (작성자 FK 예상)
  category: "음식", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다방면에 능통한", "든든한 조력자", "실무 경험 풍부한"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["토"],
  times: ["시간대 협의"],
  budget: 40000, // numeric (예산)
  budget_type: "건당", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "겉절이 김치 담그는 법", // text (제목)
  content: `엄마가 해주시던 수육에 겉절이 김치가 너무 먹고 싶은데 제가 원하는 맛이 안나서요 .. 만들어먹던지 어떻게 레시피라도 수소문해보고 싶은데 전라도식 겉절이 김치 잘 하시는 분 있을까요 시원 칼칼한 맛에 짭짤했으면 좋겠어요 단맛은 싫어해서 ㅠ`, // text (내용)
//   image_url_m: "/mockimage/paint.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorKnit2 = {
  id: "7", // uuid (PK)
  user_id: "7", // uuid (작성자 FK 예상)
  category: "뜨개", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다방면에 능통한", "든든한 조력자", "실무 경험 풍부한"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["요일 협의"],
  times: ["시간대 협의"],
  budget: 30000, // numeric (예산)
  budget_type: "건당", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "신촌~이대 뜨개질 고인물 ", // text (제목)
  content: `바늘이야기에서 베레모 패키지 사서 동영상 보면서 잘 뜨다가 마지막 정수리 꼭지부분에서 뭔가 잘못했는데 뭘 잘못했는지 모르겠어요 ㅜㅜ
풀어서 해보려다가 코를 놓쳐서 ..... 어떻게 보이는 구멍에 대충 바늘 꽂아서 더 이상 풀리지는 않게 해놨는데 저는 이걸 해결할 능력이 없습니다 .......

해결해주실 수 있는 분 ㅠㅠㅠㅠ 선배님 찾습니다 간절해요 오늘 저녁 동네에 도착합니다 살려주세요 ....`, // text (내용)
  image_url_m: "/mockimage/knit.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorInterview = {
  id: "8", // uuid (PK)
  user_id: "7", // uuid (작성자 FK 예상)
  category: "뜨개", // category_type (카테고리 enum)
  level: "초보", // junior_level (주니어 레벨 enum)
  senior_type: ["다방면에 능통한", "든든한 조력자", "실무 경험 풍부한"], // text[] (선배 유형)
  class_type: "대면이 좋아요", // mentoring_way (멘토링 방식 enum)
  days: ["요일 협의"],
  times: ["시간대 협의"],
  budget: 50000, // numeric (예산)
  budget_type: "건당", // budget_type (예산 유형 enum)
//   goal: "", // junior_goal (멘토링 목표)
  created_at: "2025-10-18T18:00:00+09:00", // timestamptz (생성 시각)
  updated_at: "2025-10-18T18:00:00+09:00", // timestamptz (수정 시각)
  title: "중요한 면접만  남겨놓고..", // text (제목)
  content: `안녕하세요 취준생 입니다! 중요한 면접만 남은 상황에서 혼자 하기에는 너무 부족한 것 같아 봐주실 분이 있으면 좋겠는데 학원은 어디가 좋은지 모르겠고 비용도 너무 부담되어서 면접 특화로 봐주실 선배님 계실까해서 글 올려봅니다..

대기업 (삼슼현) 중 한곳 마케팅 직무 면접이고 모의면접 형식으로 진행하고 싶습니다 해당 기업에서 근무해보셨던 분이라면 정말 좋을 것 같아요.`, // text (내용)
//   image_url_m: "/mockimage/knit.png", // text (썸네일/중간 이미지 URL)
//   image_url_l: "", // text (큰 이미지 URL)
  senior_gender: "상관 없음", // gender_type
  status: "DONE", // poststatus_type (게시글 상태 enum)
};

export const postJuniorList:PostType[] = [postJuniorRose, postJuniorPaint, postJuniorStudy, postJuniorValve, postJuniorKnit, postJuniorKimchi, postJuniorKnit2, postJuniorInterview]