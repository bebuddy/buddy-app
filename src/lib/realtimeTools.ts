import type { RealtimeToolDef } from "@/types/realtimeTypes";

const CATEGORIES = [
  "식물", "음식", "목공", "뜨개", "자수", "공예", "인테리어", "기타시공", "타로",
  "글쓰기", "그림", "사진", "음악",
  "건강", "운동", "청소", "루틴 관리", "마음", "수면",
  "면접", "포트폴리오", "커리어 설계", "직무 멘토링", "자격증", "스터디",
  "영어", "일본어", "중국어", "불어", "스페인어",
];

const SENIOR_TYPES = [
  "실무 경험 풍부한", "전문 지식", "협업인", "문제 해결", "다방면에 능통한",
  "친절한", "배려심 깊은", "솔직한", "믿음직한", "열정적인", "유머러스한",
  "현실적인", "차분한", "꼼꼼한 피드백", "든든한 조력자", "인생 선배", "롤모델", "치어리더",
];

const JUNIOR_TYPES = [
  "의지가 강한", "성장 욕구가 있는", "현업을 꿈꾸는", "깊이 고민하는", "다양한 시도",
  "예의 바른", "협력적인", "피드백에 유연한", "신뢰할 수 있는", "적극적인",
  "밝고 유쾌한", "실행력 있는", "꾸준한", "수용적인", "공감능력", "열려있는", "밝은",
];

function buildUpdateDraftParams(postType: "junior" | "senior"): Record<string, unknown> {
  const personTypes = postType === "junior" ? SENIOR_TYPES : JUNIOR_TYPES;
  const personTypeField = postType === "junior" ? "seniorType" : "juniorType";
  const genderField = postType === "junior" ? "seniorGender" : "juniorGender";
  const levelEnum = postType === "junior" ? ["입문", "초보", "심화"] : ["고수", "초고수", "신"];
  const genderEnum =
    postType === "junior"
      ? ["남성", "여성", "상관없음"]
      : ["남성", "여성", "상관없음"];

  return {
    type: "object",
    properties: {
      category: {
        type: "string",
        enum: CATEGORIES,
        description: "배우고 싶은/가르칠 수 있는 주제 카테고리",
      },
      title: {
        type: "string",
        description: "게시글 제목 (한 문장)",
      },
      content: {
        type: "string",
        description: "게시글 상세 설명",
      },
      level: {
        type: "string",
        enum: levelEnum,
        description: "현재 배움/내공 수준",
      },
      days: {
        type: "array",
        items: { type: "string", enum: ["월", "화", "수", "목", "금", "토", "일"] },
        description: "가능한 요일 목록",
      },
      daysNegotiable: {
        type: "boolean",
        description: "요일 협의 가능 여부 (true면 days 무시)",
      },
      times: {
        type: "array",
        items: { type: "string", enum: ["아침", "오전", "오후", "저녁", "야간"] },
        description: "가능한 시간대 목록",
      },
      timesNegotiable: {
        type: "boolean",
        description: "시간대 협의 가능 여부 (true면 times 무시)",
      },
      [personTypeField]: {
        type: "array",
        items: { type: "string", enum: personTypes },
        description:
          postType === "junior"
            ? "원하는 선배님 유형 (복수 선택)"
            : "원하는 후배님 유형 (복수 선택)",
      },
      classType: {
        type: "string",
        enum: ["대면", "비대면", "상관없음"],
        description: "활동 방식",
      },
      budget: {
        type: "number",
        description: "과외비 금액 (원 단위, 협의이면 생략)",
      },
      budgetType: {
        type: "string",
        enum: ["시간", "건당", "협의"],
        description: "과외비 단위",
      },
      [genderField]: {
        type: "string",
        enum: genderEnum,
        description:
          postType === "junior"
            ? "선호하는 선배님 성별"
            : "선호하는 후배님 성별",
      },
    },
    required: [],
    additionalProperties: false,
  };
}

export function buildToolDefinitions(postType: "junior" | "senior"): RealtimeToolDef[] {
  return [
    {
      type: "function",
      name: "update_post_draft",
      description:
        "게시글 초안의 일부 필드를 업데이트합니다. 확인된 정보만 포함하여 호출하세요. 여러 필드를 한 번에 업데이트할 수 있습니다.",
      parameters: buildUpdateDraftParams(postType),
    },
    {
      type: "function",
      name: "get_draft_status",
      description:
        "현재까지 채워진 게시글 초안 상태를 확인합니다. 어떤 필드가 채워졌고 비어있는지 반환합니다.",
      parameters: {
        type: "object",
        properties: {},
        required: [],
        additionalProperties: false,
      },
    },
  ];
}
