// src/app/(main)/junior/register/page.tsx
"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import RegisterActionBar from "@/components/RegisterActionBar";
import Disclosure from "@/components/Disclosure";
import LabeledInput from "@/components/LabeledInput";
import LabeledTextarea from "@/components/LabeledTextarea";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";
import PhotoUpload from "@/components/PhotoUpload";

// (백엔드 연동은 나중에 붙일 예정이므로 타입만 지역 선언)
type Unit = "시간" | "건당";

const BRAND = "#6163FF";

// 옵션들
const LEVELS = ["입문", "초보", "심화"] as const;
const MENTOR_GENDER = ["남자 선배님", "여자 선배님", "상관없음"] as const;
const MENTOR_TYPES = [
  "실무 경험 풍부한", "전문 지식", "협업인", "문제 해결", "다방면에 능통한", "친절한",
  "배려심 깊은", "솔직한", "믿음직한", "열정적인", "유머러스한", "현실적인",
  "차분한", "꼼꼼한 피드백", "든든한 조력자", "인생 선배", "롤모델", "치어리더",
] as const;

const MEET_PREF = ["대면이 좋아요", "비대면이 좋아요", "상관없어요"] as const;

const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";
const DAYS = ["월", "화", "수", "목", "금", "토", "일", DAY_AGREE] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)",
  "오전 (10:00 ~ 12:00)",
  "오후 (12:00 ~ 18:00)",
  "저녁 (18:00 ~ 22:00)",
  "야간 (22:00 이후)",
  TIME_AGREE,
] as const;

// 상세 페이지에서 기대하는 최소 형태(프리뷰용)
type PreviewPost = {
  id: string;
  title: string;
  category: string | null;
  createdAt: number;
  imageUrls: string[];
  priceKRW: number;
  unit: string | null;
  timeNote: string;
  paragraphs: string[];
  mentorTypes: string[];
  meetPref: string | null;
  author: { name: string; age: string | number; gender: string };
};

export default function WritePage() {
  const router = useRouter();

  // 폼 상태
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null);
  const [mentorGender, setMentorGender] = useState<(typeof MENTOR_GENDER)[number] | null>(null);
  const [mentorTypes, setMentorTypes] = useState<(typeof MENTOR_TYPES)[number][]>([]);
  const [meetPref, setMeetPref] = useState<(typeof MEET_PREF)[number] | null>(null);
  const [days, setDays] = useState<(typeof DAYS)[number][]>([]);
  const [times, setTimes] = useState<(typeof TIMES)[number][]>([]);

  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);

  const [fileKeys, setFileKeys] = useState<string[]>([]);

  // 협의 선택 로직
  function handleDaysChange(next: string[]) {
    if (next.includes(DAY_AGREE)) {
      setDays([DAY_AGREE]);
    } else {
      setDays(next.filter((d) => d !== DAY_AGREE) as (typeof DAYS)[number][]);
    }
  }
  function handleTimesChange(next: string[]) {
    if (next.includes(TIME_AGREE)) {
      setTimes([TIME_AGREE]);
    } else {
      setTimes(next.filter((t) => t !== TIME_AGREE) as (typeof TIMES)[number][]);
    }
  }

  // 비활성 칩 계산
  const dayDisabled = useMemo(
    () => (days.includes(DAY_AGREE) ? (DAYS as readonly string[]).filter((d) => d !== DAY_AGREE) : []),
    [days]
  );
  const timeDisabled = useMemo(
    () => (times.includes(TIME_AGREE) ? (TIMES as readonly string[]).filter((t) => t !== TIME_AGREE) : []),
    [times]
  );

  // 유효성
  const isValid = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDesc = desc.trim().length > 0;
    const hasMeet = !!meetPref;
    const hasPrice = negotiable || (price.trim().length > 0 && /^\d+$/.test(price));
    return hasTitle && hasDesc && hasMeet && hasPrice;
  }, [title, desc, meetPref, price, negotiable]);

  // 제출: 로컬 프리뷰 저장 후 /junior/post/preview 이동
  async function handleSubmit() {
    if (!isValid) return;

    const preview: PreviewPost = {
      id: "preview",
      title,
      category: null,
      createdAt: Date.now(),
      imageUrls: fileKeys.map((k) => `/api/files/${k}`), // TODO: 실제 URL 변환 로직 연결
      priceKRW: negotiable ? 0 : Number(price || 0),
      unit: negotiable ? null : (unit || "시간"),
      timeNote: times.includes(TIME_AGREE) ? "시간대 협의" : times.join(", "),
      paragraphs: [desc],
      mentorTypes,
      meetPref,
      author: { name: "익명", age: "-", gender: "-" },
    };

    try {
      localStorage.setItem("postPreview", JSON.stringify(preview));
    } catch {
      // 로컬스토리지 실패해도 그냥 진행
    }
    router.push("/junior/post/preview");

    // (옵션) 백엔드 연동은 나중에 이어붙이기
    // void (async () => {
    //   try {
    //     await createJuniorPostAction(...);
    //     // 성공하면 생성 id로 replace
    //     // router.replace(`/junior/post/${newId}`);
    //   } catch {}
    // })();
  }

  return (
    <>
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <RegisterActionBar isValid={isValid} onSubmit={handleSubmit} brand={BRAND} />
      </div>
      <div className="px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>

        {/* 카테고리(접이식) */}
        <Disclosure title="배우고 싶은 주제를 선택해주세요.">
          <div className="text-[15px] text-neutral-600">(주제 목록은 추후 연결)</div>
        </Disclosure>

        <div className="h-5" />

        {/* 제목 */}
        <LabeledInput
          label="배우고 싶은 내용을 한 문장으로 표현해주세요!"
          largeLabel
          value={title}
          onChange={setTitle}
          placeholder="예) 스트레칭 루틴을 익히고 싶어요" />

        <div className="h-5" />

        {/* 상세 설명 */}
        <LabeledTextarea
          label="수업을 통해 달성하고 싶은 목표, 선배님께 바라는 점 등을 입력해주세요."
          value={desc}
          onChange={setDesc}
          placeholder="예) 허리 통증 완화, 주 2회 대면 수업 등"
          rows={4} />

        <div className="my-6 border-t border-neutral-200" />

        {/* 현재 배움 정도 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">후배님의 현재 배움의 정도를 선택해주세요.</div>
          <ChipGroup
            options={LEVELS as unknown as string[]}
            value={level}
            onChange={(v) => setLevel(v as typeof level)}
            multiple={false}
            brand={BRAND} />
        </div>

        {/* 선호 성별 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">선호하는 선배님 성별이 있으신가요?</div>
          <ChipGroup
            options={MENTOR_GENDER as unknown as string[]}
            value={mentorGender}
            onChange={(v) => setMentorGender(v as typeof mentorGender)}
            multiple={false}
            brand={BRAND} />
        </div>

        {/* 선배 유형 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">어떤 선배님을 만나고 싶으신가요?</div>
          <ChipGroup
            options={MENTOR_TYPES as unknown as string[]}
            value={mentorTypes}
            onChange={(v) => setMentorTypes(v as typeof mentorTypes)}
            multiple
            brand={BRAND} />
        </div>

        {/* 활동 방식 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">활동은 어떤 방식이 좋으세요?</div>
          <ChipGroup
            options={MEET_PREF as unknown as string[]}
            value={meetPref}
            onChange={(v) => setMeetPref(v as typeof meetPref)}
            multiple={false}
            brand={BRAND} />
        </div>

        {/* 가능한 요일/시간대 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">가능한 요일 · 시간대를 알려주세요.</div>

          <ChipGroup
            options={DAYS as unknown as string[]}
            value={days}
            onChange={(v) => handleDaysChange(v as typeof days)}
            multiple
            brand={BRAND}
            disabledOptions={dayDisabled} />

          <ChipGroup
            options={TIMES as unknown as string[]}
            value={times}
            onChange={(v) => handleTimesChange(v as typeof times)}
            multiple
            brand={BRAND}
            disabledOptions={timeDisabled} />
        </div>

        {/* 과외비 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">과외비 한도를 입력해주세요.</div>
          <PriceInput
            value={price}
            onChange={setPrice}
            unit={unit}
            onUnitChange={setUnit}
            negotiable={negotiable}
            onToggleNegotiable={() => setNegotiable((v) => !v)}
            brand={BRAND} />
        </div>

        {/* 사진 업로드 */}
        <div className="mt-7">
          <PhotoUpload brand={BRAND} onChange={setFileKeys} />
        </div>

        <div className="h-8" />
      </div>
    </>
  );
}
