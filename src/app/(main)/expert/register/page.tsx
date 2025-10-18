// src/app/(main)/expert/register/page.tsx
"use client";

import { useMemo, useState } from "react";
import RegisterActionBar from "@/components/RegisterActionBar";
import Disclosure from "@/components/Disclosure";
import LabeledInput from "@/components/LabeledInput";
import LabeledTextarea from "@/components/LabeledTextarea";
import ChipGroup from "@/components/ChipGroup";
import PriceInput from "@/components/PriceInput";
import PhotoUpload from "@/components/PhotoUpload";
import { useRouter } from "next/navigation";

const LEVELS = ["고수", "초고수", "신"] as const;
const GENDER_PREF = ["여자 후배님", "남자 후배님", "상관없음"] as const;
const MENTOR_TYPES = [
  "의지가 강한", "성장 욕구가 있는", "현업을 꿈꾸는", "깊이 고민하는", "다양한 시도", "예의 바른",
  "협력적인", "피드백에 유연한", "신뢰할 수 있는", "적극적인", "밝고 유쾌한", "실행력 있는",
  "꾸준한", "수용적인", "공감능력", "열려있는", "밝은",
] as const;
const ORANGE = "#FF883F";

const DAY_AGREE = "요일 협의";
const TIME_AGREE = "시간대 협의";

const MEET_PREF = ["대면이 좋아요", "비대면이 좋아요", "상관없어요"] as const;
const DAYS = ["월", "화", "수", "목", "금", "토", "일", "요일 협의"] as const;
const TIMES = [
  "아침 (06:00 ~ 10:00)",
  "오전 (10:00 ~ 12:00)",
  "오후 (12:00 ~ 18:00)",
  "저녁 (18:00 ~ 22:00)",
  "야간 (22:00 이후)",
  "시간대 협의"
] as const;

type Unit = "시간" | "건당";

export default function ExpertRegisterPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");

  const [level, setLevel] = useState<(typeof LEVELS)[number] | null>(null);
  const [gender, setGender] = useState<(typeof GENDER_PREF)[number] | null>(null);
  const [mentorTypes, setMentorTypes] = useState<(typeof MENTOR_TYPES)[number][]>([]);
  const [meetPref, setMeetPref] = useState<(typeof MEET_PREF)[number] | null>(null);
  const [days, setDays] = useState<(typeof DAYS)[number][]>([]);
  const [times, setTimes] = useState<(typeof TIMES)[number][]>([]);

  const [price, setPrice] = useState("");
  const [unit, setUnit] = useState<Unit | null>(null);
  const [negotiable, setNegotiable] = useState(false);
  const [fileKeys, setFileKeys] = useState<string[]>([]);

  const isValid = useMemo(() => {
    const hasTitle = title.trim().length > 0;
    const hasDesc = desc.trim().length > 0;
    const hasLevel = !!level;
    const hasMeet = !!meetPref;
    const hasPrice = negotiable || (price.trim().length > 0 && /^\d+$/.test(price));
    return hasTitle && hasDesc && hasLevel && hasMeet && hasPrice;
  }, [title, desc, level, meetPref, price, negotiable]);


  // 협의 선택 로직
  function handleDaysChange(next: string[]) {
    if (next.includes(DAY_AGREE)) {
      setDays([DAY_AGREE]);
    } else {
      setDays(next.filter(d => d !== DAY_AGREE) as (typeof DAYS)[number][]);
    }
  }
  function handleTimesChange(next: string[]) {
    if (next.includes(TIME_AGREE)) {
      setTimes([TIME_AGREE]);
    } else {
      setTimes(next.filter(t => t !== TIME_AGREE) as (typeof TIMES)[number][]);
    }
  }

  async function handleSubmit() {
    if (!isValid) return;

    // 1) 상세 페이지가 기대하는 모양으로 프리뷰 데이터 만들기
    const preview = {
      id: "preview",
      title,
      category: null as string | null,
      createdAt: Date.now(),
      imageUrls: fileKeys.map(k => `/api/files/${k}`), // presigned redirect 라우트 사용
      priceKRW: negotiable ? 0 : Number(price || 0),
      unit: negotiable ? null : (unit || "시간"),
      timeNote: times.includes("시간대 협의") ? "시간대 협의" : times.join(", "),
      paragraphs: [desc],
      mentorTypes,
      meetPref,
      author: { name: "익명", age: "-", gender: "-" },
    };

    // 2) 로컬 저장 + 프리뷰 상세로 이동 (백엔드 없어도 즉시 화면 확인)
    try {
      localStorage.setItem("postPreview", JSON.stringify(preview));
    } catch { }
    router.push("/expert/post/preview");

    // 3) (선택) 백엔드 호출은 비동기로 시도 — 화면 전환과 무관
    void (async () => {
      // await createJuniorPostAction(req, mockUserId);
    })();
  }

  // ✅ 비활성 칩 계산
  const dayDisabled = useMemo(
    () => days.includes(DAY_AGREE)
      ? (DAYS as readonly string[]).filter(d => d !== DAY_AGREE)
      : [],
    [days]
  );
  const timeDisabled = useMemo(
    () => times.includes(TIME_AGREE)
      ? (TIMES as readonly string[]).filter(t => t !== TIME_AGREE)
      : [],
    [times]
  );

  return (
    <>
      <div className="sticky top-0 z-50 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/70">
        <RegisterActionBar isValid={isValid} onSubmit={handleSubmit} brand={ORANGE} />
      </div>
      <div className="px-4" style={{ paddingBottom: "calc(16px + env(safe-area-inset-bottom))" }}>


        {/* 주제(접이식) */}
        <Disclosure title="가르치고 싶은 주제를 선택해주세요.">
          <div className="text-[16px] text-neutral-700">(주제 목록은 추후 연결)</div>
        </Disclosure>

        <div className="h-5" />

        {/* 한 줄 소개 */}
        <LabeledInput
          label="나와 내 전문 분야에 대해 한 줄로 표현해주세요!"
          largeLabel
          value={title}
          onChange={setTitle}
          placeholder="예) 30년 경력의 장미 가지치기 고수" />

        <div className="h-5" />

        {/* 상세 소개 */}
        <LabeledTextarea
          label="본인의 경력 / 이력 / 자격증 등 ... 서술해주세요"
          value={desc}
          onChange={setDesc}
          placeholder="예) 조경기사 자격 보유, 단독주택 관리 10년 등"
          rows={4} />

        <div className="my-6 border-t border-neutral-200" />

        {/* 내공(단일) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            선배님의 현재 내공의 정도를 선택해주세요.
          </div>
          <ChipGroup
            options={LEVELS as unknown as string[]}
            value={level}
            onChange={(v) => setLevel(v as typeof level)}
            multiple={false}
            brand={ORANGE} />
        </div>

        {/* 선호 성별(단일) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            선호하는 후배님 성별이 있으신가요?
          </div>
          <ChipGroup
            options={GENDER_PREF as unknown as string[]}
            value={gender}
            onChange={(v) => setGender(v as typeof gender)}
            multiple={false}
            brand={ORANGE} />
        </div>

        {/* 원하는 후배(다중) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            어떤 후배님을 만나고 싶으신가요?
          </div>
          <ChipGroup
            options={MENTOR_TYPES as unknown as string[]}
            value={mentorTypes}
            onChange={(v) => setMentorTypes(v as typeof mentorTypes)}
            multiple
            brand={ORANGE} />
        </div>

        {/* 활동 방식(단일) */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            활동은 어떤 방식이 좋으세요?
          </div>
          <ChipGroup
            options={MEET_PREF as unknown as string[]}
            value={meetPref}
            onChange={(v) => setMeetPref(v as typeof meetPref)}
            multiple={false}
            brand={ORANGE} />
        </div>

        {/* 가능한 요일/시간대 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">가능한 요일 · 시간대를 알려주세요.</div>

          <ChipGroup
            options={DAYS as unknown as string[]}
            value={days}
            onChange={(v) => handleDaysChange(v as typeof days)}
            multiple
            brand={ORANGE}
            disabledOptions={dayDisabled} />

          <ChipGroup
            options={TIMES as unknown as string[]}
            value={times}
            onChange={(v) => handleTimesChange(v as typeof times)}
            multiple
            brand={ORANGE}
            disabledOptions={timeDisabled} />
        </div>

        {/* 가격 섹션 */}
        <div className="flex flex-col gap-3 mt-7">
          <div className="text-[18px] font-extrabold text-neutral-900">
            과외비 하한을 입력해주세요.
          </div>

          <PriceInput
            value={price}
            onChange={setPrice}
            unit={unit}
            onUnitChange={setUnit}
            negotiable={negotiable}
            onToggleNegotiable={() => setNegotiable((prev) => {
              const next = !prev;
              if (next) { // ✅ 협의해요 ON 시 값/단가 리셋
                setPrice("");
                setUnit(null);
              }
              return next;
            })}
            brand={ORANGE} // 색상 통일
          />
        </div>

        {/* 사진 등록 */}
        <div className="mt-7">
          <PhotoUpload brand={ORANGE} onChange={setFileKeys} />
        </div>

        {/* 하단 빈칸 최소화 */}
        <div className="h-8" />
      </div></>
  );
}
