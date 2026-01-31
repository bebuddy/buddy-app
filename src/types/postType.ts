/////////////////////////post front-end////////////////////////
export type FeedItem = {
    id: string;
    category: string;
    location: string;
    title: string;
    content: string;
    hasImage?: boolean;
};

export type ArticleRandomRes = {
    category: string;
    title: string;
    location: string;
    name?: string;
    birth_date?: string;   // "1970-01-01"
    imageUrlL?: string;
};


/////////////////////////post back-end////////////////////////
export const LevelType = {
    "입문": "입문",
    "초보": "초보",
    "심화": "심화"
} as const
export type LevelType = keyof typeof LevelType

export type DayType = "월" | "화" | "수" | "목" | "금" | "토" | "일"
export const TimeType = {
    "아침 (06:00 ~ 10:00)": "아침",
    "오전 (10:00 ~ 12:00)": "오전",
    "오후 (12:00 ~ 18:00)": "오후",
    "저녁 (18:00 ~ 22:00)": "저녁",
    "야간 (22:00 이후)": "야간",
} as const;

// 각 key/value 타입 추출
export type TimeKey = keyof typeof TimeType;   // "아침 (06:00 ~ 10:00)" | "오전 ..." ...
export type TimeValue = (typeof TimeType)[TimeKey]; // "아침" | "오전" | "오후" | "저녁" | "야간"

interface DayAndTime {
    day: DayType[] | '요일 협의',
    time: TimeValue[] | '시간대 협의'
}

export const SeniorType = {
    "실무 경험 풍부한": "실무 경험 풍부한",
    "전문 지식": "전문 지식",
    "협업인": "협업인",
    "문제 해결": "문제 해결",
    "다방면에 능통한": "다방면에 능통한",
    "친절한": "친절한",
    "배려심 깊은": "배려심 깊은",
    "솔직한": "솔직한",
    "믿음직한": "믿음직한",
    "열정적인": "열정적인",
    "유머러스한": "유머러스한",
    "현실적인": "현실적인",
    "차분한": "차분한",
    "꼼꼼한 피드백": "꼼꼼한 피드백",
    "든든한 조력자": "든든한 조력자",
    "인생 선배": "인생 선배",
    "롤모델": "롤모델",
    "치어리더": "치어리더",
} as const;

export type SeniorKey = keyof typeof SeniorType;       // "실무 경험 풍부한" | "전문 지식" | ...
export type SeniorValue = (typeof SeniorType)[SeniorKey]; // "실무 경험 풍부한" | "전문 지식" | ...


export const ClassType = {
    "대면이 좋아요": "대면",
    "비대면이 좋아요": "비대면",
    "상관없어요": "상관없음"
} as const
export type ClassKey = keyof typeof ClassType;
export type ClassValue = (typeof ClassType)[ClassKey]


export const BudgetType = {
    "시간": "시간",
    "건당": "건당",
    "협의해요": "협의",
} as const;

export type BudgetKey = keyof typeof BudgetType;      // "시간" | "건당" | "협의해요"
export type BudgetValue = (typeof BudgetType)[BudgetKey]; // "시간" | "건당" | "협의"


export const GenderType = {
    "남자 선배님": "남성",
    "여자 선배님": "여성",
    "상관없음": "상관없음",
} as const;

export type GenderKey = keyof typeof GenderType;       // "남자 선배님" | "여자 선배님" | "상관없음"
export type GenderValue = (typeof GenderType)[GenderKey]; // "남자" | "여자" | "상관없음"


export interface RegisterJuniorReq {
    category: string;
    title: string;
    content: string;
    level: LevelType;
    datesTimes: DayAndTime;
    seniorType: SeniorValue[];
    classType: ClassValue;
    budget: number | null;
    budgetType: BudgetValue;
    seniorGender: GenderValue;
    fileKeys: string[]
}

export const SeniorLevelType = {
    "고수": "고수",
    "초고수": "초고수",
    "신": "신"
} as const
export type SeniorLevelType = keyof typeof SeniorLevelType

export const JuniorType = {
    "의지가 강한": "의지가 강한",
    "성장 욕구가 있는": "성장 욕구가 있는",
    "현업을 꿈꾸는": "현업을 꿈꾸는",
    "깊이 고민하는": "깊이 고민하는",
    "다양한 시도": "다양한 시도",
    "예의 바른": "예의 바른",
    "협력적인": "협력적인",
    "피드백에 유연한": "피드백에 유연한",
    "신뢰할 수 있는": "신뢰할 수 있는",
    "적극적인": "적극적인",
    "밝고 유쾌한": "밝고 유쾌한",
    "실행력 있는": "실행력 있는",
    "꾸준한": "꾸준한",
    "수용적인": "수용적인",
    "공감능력": "공감능력",
    "열려있는": "열려있는",
    "밝은": "밝은",
} as const;

export type JuniorKey = keyof typeof JuniorType;
export type JuniorValue = (typeof JuniorType)[JuniorKey];

export const JuniorGenderType = {
    "남자 후배님": "남성",
    "여자 후배님": "여성",
    "상관없음": "상관없음",
} as const;

export type JuniorGenderKey = keyof typeof JuniorGenderType;
export type JuniorGenderValue = (typeof JuniorGenderType)[JuniorGenderKey];

export interface RegisterSeniorReq {
    category: string;
    title: string;
    content: string;
    level: SeniorLevelType;
    datesTimes: DayAndTime;
    juniorType: JuniorValue[];
    classType: ClassValue;
    budget: number | null;
    budgetType: BudgetValue;
    juniorGender: JuniorGenderValue;
    fileKeys: string[]
}
